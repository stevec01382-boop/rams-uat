import React, { useEffect, useState } from 'react'
import { SectionCard, Text, TextArea } from '../components/Fields.jsx'
import HazardEditor from '../components/HazardEditor.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'
import { useLibrary } from '../state/LibraryContext.jsx'
import { saveLibraryEntry, setLibraryEntryArchived, fetchLibraryHistory, openLibraryFile } from '../lib/api.js'

function today() { return new Date().toISOString().slice(0, 10) }
function addMonths(dateStr, months) {
  const d = new Date(dateStr)
  d.setMonth(d.getMonth() + months)
  return d.toISOString().slice(0, 10)
}

const TABS = [
  { key: 'ra', label: 'Risk Assessments' },
  { key: 'coshh', label: 'COSHH Sheets' },
  { key: 'ms', label: 'Method Statements' },
  { key: 'history', label: 'Change history' },
]

function blankFor(kind) {
  if (kind === 'ra') {
    return { ref: '', title: '', personsAffected: [], hazards: [{ hazard: '', risk: '', s: 1, l: 1, control: '', rs: 1, rl: 1, notes: '' }], reviewDate: addMonths(today(), 12) }
  }
  if (kind === 'coshh') {
    return { ref: '', product: '', manufacturer: '', activity: '', personsAtRisk: [], classifications: [], healthRisks: '', controls: '', firstAid: '', storage: '', disposal: '', reviewDate: addMonths(today(), 12) }
  }
  return { ref: '', activity: '', relatedRA: [], relatedCOSHH: [], steps: [''] }
}

function libraryKeyFor(kind) {
  return kind === 'ra' ? 'riskAssessments' : kind === 'coshh' ? 'coshhSheets' : 'methodStatements'
}

export default function AdminLibrary() {
  const { getAccessToken, devMode } = useAuth()
  const library = useLibrary()
  const [tab, setTab] = useState('ra')
  const [editing, setEditing] = useState(null) // { kind, entry, isNew }
  const [sourceFile, setSourceFile] = useState(null) // { base64, name, contentType }
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [actionState, setActionState] = useState({})

  async function withToken() {
    return devMode ? null : await getAccessToken()
  }

  useEffect(() => {
    if (tab !== 'history') return
    let cancelled = false
    setHistoryLoading(true)
    withToken().then(token => fetchLibraryHistory(token)).then(res => {
      if (cancelled) return
      setHistoryLoading(false)
      if (res.ok) setHistory(res.body.items || [])
      else setError(res.body?.message || 'Could not load history.')
    })
    return () => { cancelled = true }
  }, [tab]) // eslint-disable-line react-hooks/exhaustive-deps

  function startEdit(kind, entry) {
    setError('')
    setSourceFile(null)
    setEditing({ kind, entry: { ...entry }, isNew: false })
  }
  function startNew(kind) {
    setError('')
    setSourceFile(null)
    setEditing({ kind, entry: blankFor(kind), isNew: true })
  }
  function cancelEdit() {
    setEditing(null)
    setSourceFile(null)
    setError('')
  }

  function updateField(field, value) {
    setEditing(e => ({ ...e, entry: { ...e.entry, [field]: value } }))
  }

  function handleFilePick(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result || ''
      const base64 = String(result).split(',').pop()
      setSourceFile({ base64, name: file.name, contentType: file.type || 'application/octet-stream' })
    }
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    if (!editing) return
    if (!editing.entry.ref?.trim()) { setError('A reference is required.'); return }
    setSaving(true)
    setError('')
    try {
      const token = await withToken()
      const res = await saveLibraryEntry({
        kind: editing.kind,
        entry: editing.entry,
        sourceFileBase64: sourceFile?.base64,
        sourceFileName: sourceFile?.name,
        sourceFileContentType: sourceFile?.contentType,
        token,
      })
      if (!res.ok) throw new Error(res.body?.message || `Server returned ${res.status}`)
      await library.refresh()
      setEditing(null)
      setSourceFile(null)
    } catch (e) {
      setError(e.message || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  async function handleArchiveToggle(kind, ref, archived) {
    setActionState(s => ({ ...s, [ref]: 'working' }))
    const token = await withToken()
    const res = await setLibraryEntryArchived({ kind, ref, archived, token })
    setActionState(s => ({ ...s, [ref]: res.ok ? null : 'error' }))
    if (res.ok) await library.refresh()
  }

  async function handleOpenFile(fileKey) {
    const token = await withToken()
    try {
      await openLibraryFile(fileKey, token)
    } catch (e) {
      setError(e.message || 'Could not open file.')
    }
  }

  const list = tab !== 'history' ? library[libraryKeyFor(tab)] : []

  return (
    <div className="page">
      <h2>Library management</h2>
      <p className="card-help">
        Add, update or archive the Risk Assessment, COSHH and Method Statement entries that feed every new RAMS.
        Archiving keeps an entry visible to anyone who already attached it, with a warning, but removes it from
        the picker for new work. Every change is logged below with who made it and when, and you can attach the
        approved source document (e.g. the signed-off SDS or method statement Word doc) as evidence for an entry.
      </p>

      <div className="tabs" style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            className={`btn btn-sm ${tab === t.key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setTab(t.key); cancelEdit() }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <div className="banner error">{error}</div>}

      {tab === 'history' ? (
        <SectionCard title="Change history" help="Most recent changes first.">
          {historyLoading && <p className="card-help">Loading…</p>}
          {!historyLoading && history.length === 0 && <p className="card-help">No changes logged yet.</p>}
          {history.map((h, i) => (
            <div key={i} className="history-item">
              <div><strong>{h.summary}</strong></div>
              <div className="lib-meta">{h.changedBy} ({h.changedByEmail}) · {new Date(h.at).toLocaleString('en-GB')}</div>
            </div>
          ))}
        </SectionCard>
      ) : (
        <>
          <SectionCard
            title={TABS.find(t => t.key === tab).label}
            right={<button className="btn btn-secondary btn-sm" onClick={() => startNew(tab)}>+ Add new entry</button>}
          >
            {list.length === 0 && <p className="card-help">Nothing in this library yet.</p>}
            {list.map(item => (
              <div key={item.ref} className={`entry-row ${item.archived ? 'archived' : ''}`}>
                <div>
                  <div className="lib-title">
                    {item.ref} — {item.title || item.product || item.activity}
                    {item.archived && <span className="expired" style={{ marginLeft: 8 }}>Archived</span>}
                  </div>
                  <div className="lib-meta">
                    {item.updatedAt ? `Last updated ${new Date(item.updatedAt).toLocaleDateString('en-GB')} by ${item.updatedBy?.name || 'unknown'}` : 'Seed content — not yet edited'}
                    {item.sourceFile && (
                      <>
                        {' · '}
                        <button className="file-chip" onClick={() => handleOpenFile(item.sourceFile.key)}>
                          📎 {item.sourceFile.filename}
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => startEdit(tab, item)}>Edit</button>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={actionState[item.ref] === 'working'}
                    onClick={() => handleArchiveToggle(tab, item.ref, !item.archived)}
                  >
                    {actionState[item.ref] === 'working' ? 'Working…' : item.archived ? 'Restore' : 'Archive'}
                  </button>
                </div>
              </div>
            ))}
          </SectionCard>

          {editing && editing.kind === tab && (
            <SectionCard
              title={editing.isNew ? 'Add new entry' : `Editing ${editing.entry.ref}`}
              right={<button className="btn-ghost" onClick={cancelEdit}>✕ cancel</button>}
            >
              {tab === 'ra' && (
                <>
                  <div className="row">
                    <Text label="RA reference" value={editing.entry.ref} onChange={v => updateField('ref', v)} />
                    <Text label="Title" value={editing.entry.title} onChange={v => updateField('title', v)} />
                  </div>
                  <div className="row">
                    <Text label="Persons affected (comma-separated)" value={(editing.entry.personsAffected || []).join(', ')} onChange={v => updateField('personsAffected', v.split(',').map(s => s.trim()).filter(Boolean))} />
                    <Text label="Review due date" type="date" value={editing.entry.reviewDate} onChange={v => updateField('reviewDate', v)} />
                  </div>
                  <HazardEditor hazards={editing.entry.hazards} onChange={hz => updateField('hazards', hz)} />
                </>
              )}

              {tab === 'coshh' && (
                <>
                  <div className="row">
                    <Text label="Reference" value={editing.entry.ref} onChange={v => updateField('ref', v)} />
                    <Text label="Product name" value={editing.entry.product} onChange={v => updateField('product', v)} />
                  </div>
                  <div className="row">
                    <Text label="Manufacturer" value={editing.entry.manufacturer} onChange={v => updateField('manufacturer', v)} />
                    <Text label="Review due date" type="date" value={editing.entry.reviewDate} onChange={v => updateField('reviewDate', v)} />
                  </div>
                  <TextArea label="Activity / work process" value={editing.entry.activity} onChange={v => updateField('activity', v)} rows={2} />
                  <TextArea label="Classifications (comma-separated)" value={(editing.entry.classifications || []).join(', ')} onChange={v => updateField('classifications', v.split(',').map(s => s.trim()).filter(Boolean))} placeholder="e.g. Flammable, Harmful/Irritant" rows={3} />
                  <TextArea label="Persons at risk (comma-separated)" value={(editing.entry.personsAtRisk || []).join(', ')} onChange={v => updateField('personsAtRisk', v.split(',').map(s => s.trim()).filter(Boolean))} rows={1} />
                  <TextArea label="Risks to health" value={editing.entry.healthRisks} onChange={v => updateField('healthRisks', v)} rows={2} />
                  <TextArea label="Control measures / PPE" value={editing.entry.controls} onChange={v => updateField('controls', v)} rows={3} />
                  <TextArea label="First aid" value={editing.entry.firstAid} onChange={v => updateField('firstAid', v)} rows={2} />
                  <div className="row">
                    <TextArea label="Storage" value={editing.entry.storage} onChange={v => updateField('storage', v)} rows={3} />
                    <TextArea label="Disposal" value={editing.entry.disposal} onChange={v => updateField('disposal', v)} rows={3} />
                  </div>
                </>
              )}

              {tab === 'ms' && (
                <>
                  <div className="row">
                    <Text label="Reference" value={editing.entry.ref} onChange={v => updateField('ref', v)} />
                    <Text label="Activity name" value={editing.entry.activity} onChange={v => updateField('activity', v)} />
                  </div>
                  <div className="row">
                    <Text label="Related RA refs (comma-separated)" value={(editing.entry.relatedRA || []).join(', ')} onChange={v => updateField('relatedRA', v.split(',').map(s => s.trim()).filter(Boolean))} />
                    <Text label="Related COSHH refs (comma-separated)" value={(editing.entry.relatedCOSHH || []).join(', ')} onChange={v => updateField('relatedCOSHH', v.split(',').map(s => s.trim()).filter(Boolean))} />
                  </div>
                  <label>Sequence of operation</label>
                  {(editing.entry.steps || []).map((s, si) => (
                    <div key={si} className="row" style={{ marginBottom: 6, alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <input
                          value={s}
                          onChange={e => {
                            const steps = editing.entry.steps.slice()
                            steps[si] = e.target.value
                            updateField('steps', steps)
                          }}
                          placeholder={`Step ${si + 1}`}
                        />
                      </div>
                      {editing.entry.steps.length > 1 && (
                        <button className="btn-ghost" onClick={() => updateField('steps', editing.entry.steps.filter((_, i) => i !== si))}>✕</button>
                      )}
                    </div>
                  ))}
                  <button className="btn btn-secondary btn-sm" onClick={() => updateField('steps', [...(editing.entry.steps || []), ''])}>+ Add step</button>
                </>
              )}

              <div className="field" style={{ marginTop: 16 }}>
                <label>Attach approved source document (optional)</label>
                <input type="file" onChange={handleFilePick} />
                {sourceFile && <div className="hint">Will attach: {sourceFile.name}</div>}
                {!sourceFile && editing.entry.sourceFile && <div className="hint">Currently attached: {editing.entry.sourceFile.filename} (choose a new file to replace it)</div>}
              </div>

              <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" disabled={saving} onClick={handleSave}>{saving ? 'Saving…' : 'Save entry'}</button>
                <button className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>
              </div>
            </SectionCard>
          )}
        </>
      )}
    </div>
  )
}
