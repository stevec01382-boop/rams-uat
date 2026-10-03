import React, { useEffect, useState } from 'react'
import { SectionCard, Text, TextArea } from '../components/Fields.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'
import { TEMPLATE_STEPS } from '../state/templateSteps.js'
import { blankTemplateContent } from '../state/initialData.js'
import { fetchTemplates, fetchTemplate, saveTemplate, deleteTemplate } from '../lib/api.js'

import ScopeStep from '../steps/ScopeStep.jsx'
import RiskAssessmentsStep from '../steps/RiskAssessmentsStep.jsx'
import CoshhStep from '../steps/CoshhStep.jsx'
import GenericPracticesStep from '../steps/GenericPracticesStep.jsx'
import WorkAtHeightStep from '../steps/WorkAtHeightStep.jsx'
import PlantMaterialsStep from '../steps/PlantMaterialsStep.jsx'
import PermitsStep from '../steps/PermitsStep.jsx'
import TrainingStep from '../steps/TrainingStep.jsx'
import PpeStep from '../steps/PpeStep.jsx'
import EmergencyStep from '../steps/EmergencyStep.jsx'
import CommunicationStep from '../steps/CommunicationStep.jsx'
import MethodStatementStep from '../steps/MethodStatementStep.jsx'

const STEP_COMPONENTS = {
  scope: ScopeStep,
  riskAssessments: RiskAssessmentsStep,
  coshh: CoshhStep,
  genericPractices: GenericPracticesStep,
  workAtHeight: WorkAtHeightStep,
  plantMaterials: PlantMaterialsStep,
  permits: PermitsStep,
  training: TrainingStep,
  ppe: PpeStep,
  emergency: EmergencyStep,
  communication: CommunicationStep,
  methodStatement: MethodStatementStep,
}

export default function AdminTemplates() {
  const { getAccessToken, devMode } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null) // { id, isNew, name, description, content, stepIdx }
  const [loadingEdit, setLoadingEdit] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState({})

  async function withToken() {
    return devMode ? null : await getAccessToken()
  }

  async function load() {
    setLoading(true)
    setError('')
    const token = await withToken()
    const res = await fetchTemplates(token)
    setLoading(false)
    if (res.ok) setItems(res.body.items || [])
    else setError(res.body?.message || 'Could not load templates.')
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function startNew() {
    setError('')
    setEditing({ id: null, isNew: true, name: '', description: '', content: blankTemplateContent(), stepIdx: 0 })
  }

  async function startEdit(summary) {
    setError('')
    setLoadingEdit(true)
    const token = await withToken()
    const res = await fetchTemplate(summary.id, token)
    setLoadingEdit(false)
    if (!res.ok) { setError(res.body?.message || 'Could not load this template.'); return }
    const t = res.body.template
    setEditing({ id: t.id, isNew: false, name: t.name, description: t.description || '', content: { ...blankTemplateContent(), ...t.content }, stepIdx: 0 })
  }

  function cancelEdit() {
    setEditing(null)
    setError('')
  }

  function patch(section, patchObj) {
    setEditing(e => ({ ...e, content: { ...e.content, [section]: { ...e.content[section], ...patchObj } } }))
  }
  function setSection(section, value) {
    setEditing(e => ({ ...e, content: { ...e.content, [section]: value } }))
  }

  async function handleSave() {
    if (!editing.name.trim()) { setError('Give the template a name first.'); return }
    setSaving(true)
    setError('')
    try {
      const token = await withToken()
      const res = await saveTemplate({ id: editing.id, name: editing.name, description: editing.description, content: editing.content, token })
      if (!res.ok) throw new Error(res.body?.message || `Server returned ${res.status}`)
      setEditing(null)
      await load()
    } catch (e) {
      setError(e.message || 'Failed to save template.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(summary) {
    if (!window.confirm(`Delete the "${summary.name}" template? This can't be undone.`)) return
    setDeleting(s => ({ ...s, [summary.id]: true }))
    const token = await withToken()
    const res = await deleteTemplate(summary.id, token)
    setDeleting(s => ({ ...s, [summary.id]: false }))
    if (res.ok) await load()
    else setError(res.body?.message || 'Could not delete this template.')
  }

  if (editing) {
    const step = TEMPLATE_STEPS[editing.stepIdx]
    const StepComponent = STEP_COMPONENTS[step.id]
    const goto = (i) => setEditing(e => ({ ...e, stepIdx: Math.max(0, Math.min(TEMPLATE_STEPS.length - 1, i)) }))

    return (
      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>{editing.isNew ? 'New template' : `Editing: ${editing.name || '(untitled)'}`}</h2>
          <button className="btn btn-secondary btn-sm" onClick={cancelEdit}>✕ cancel</button>
        </div>

        {error && <div className="banner error">{error}</div>}

        <SectionCard title="Template details" help="This is what admins and users see when choosing a template — not printed on the RAMS itself.">
          <div className="row">
            <Text label="Template name" value={editing.name} onChange={v => setEditing(e => ({ ...e, name: v }))} placeholder="e.g. New Build, Refurb, Access Control Gate Install" />
            <Text label="Description (optional)" value={editing.description} onChange={v => setEditing(e => ({ ...e, description: v }))} placeholder="One line explaining when to use it" />
          </div>
        </SectionCard>

        <div className="layout-with-rail">
          <div className="rail">
            {TEMPLATE_STEPS.map((s, i) => (
              <button key={s.id} className={`rail-item ${i === editing.stepIdx ? 'active' : ''}`} onClick={() => goto(i)}>
                <span className="dot">{s.num || i + 1}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          <div>
            <StepComponent data={editing.content} patch={patch} setSection={setSection} setData={() => {}} />

            <div className="actions-footer">
              <button className="btn btn-secondary" disabled={editing.stepIdx === 0} onClick={() => goto(editing.stepIdx - 1)}>← Back</button>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{step.num} {step.label}</div>
              <button className="btn btn-secondary" disabled={editing.stepIdx === TEMPLATE_STEPS.length - 1} onClick={() => goto(editing.stepIdx + 1)}>Next →</button>
            </div>

            <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" disabled={saving || loadingEdit} onClick={handleSave}>{saving ? 'Saving…' : 'Save template'}</button>
              <button className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <h2>Templates admin</h2>
      <p className="card-help">
        Templates let anyone start a new RAMS from a curated job type (new build, refurb, access control gate
        install, ...) with the scope, risk assessments, COSHH, method statement and other working sections already
        filled in. Build one from scratch here, or use <strong>Save as template</strong> on an existing RAMS in
        Records. Only admins can create, edit or delete templates; any signed-in user can use one.
      </p>

      {error && <div className="banner error">{error}</div>}

      <SectionCard
        title="Templates"
        right={<button className="btn btn-secondary btn-sm" onClick={startNew}>+ New template</button>}
      >
        {loading && <p className="card-help">Loading…</p>}
        {!loading && items.length === 0 && <p className="card-help">No templates yet.</p>}
        {items.map(t => (
          <div key={t.id} className="entry-row">
            <div>
              <div className="lib-title">{t.name}</div>
              <div className="lib-meta">
                {t.description || 'No description'}
                {t.updatedAt && ` · Last updated ${new Date(t.updatedAt).toLocaleDateString('en-GB')}${t.updatedBy?.name ? ` by ${t.updatedBy.name}` : ''}`}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => startEdit(t)} disabled={loadingEdit}>Edit</button>
              <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(t)} disabled={deleting[t.id]}>
                {deleting[t.id] ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </SectionCard>
    </div>
  )
}
