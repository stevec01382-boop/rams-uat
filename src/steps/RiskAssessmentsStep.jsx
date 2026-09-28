import React from 'react'
import { SectionCard, Text } from '../components/Fields.jsx'
import { useLibrary } from '../state/LibraryContext.jsx'
import { blankCustomRA, newId, today } from '../state/initialData.js'
import HazardEditor from '../components/HazardEditor.jsx'
import RiskPill from '../components/RiskPill.jsx'

function addMonths(dateStr, months) {
  const d = new Date(dateStr)
  d.setMonth(d.getMonth() + months)
  return d.toISOString().slice(0, 10)
}

export default function RiskAssessmentsStep({ data, setSection }) {
  const ra = data.riskAssessments
  const { riskAssessments: RISK_ASSESSMENTS, findRA } = useLibrary()
  const activeLibrary = RISK_ASSESSMENTS.filter(item => !item.archived)

  function toggleLibrary(ref) {
    const exists = ra.selected.find(s => s.ref === ref)
    if (exists) {
      setSection('riskAssessments', { ...ra, selected: ra.selected.filter(s => s.ref !== ref) })
    } else {
      setSection('riskAssessments', {
        ...ra,
        selected: [...ra.selected, { ref, reviewDate: addMonths(today(), 12) }],
      })
    }
  }

  function updateSelected(ref, field, value) {
    setSection('riskAssessments', {
      ...ra,
      selected: ra.selected.map(s => (s.ref === ref ? { ...s, [field]: value } : s)),
    })
  }

  function addCustom() {
    setSection('riskAssessments', { ...ra, custom: [...ra.custom, { ...blankCustomRA(), ref: `RA-CUSTOM-${ra.custom.length + 1}` }] })
  }
  function updateCustom(id, field, value, idx) {
    const next = ra.custom.slice()
    next[idx] = { ...next[idx], [field]: value }
    setSection('riskAssessments', { ...ra, custom: next })
  }
  function removeCustom(idx) {
    setSection('riskAssessments', { ...ra, custom: ra.custom.filter((_, i) => i !== idx) })
  }

  const isExpired = (dateStr) => dateStr && new Date(dateStr) < new Date()

  return (
    <>
      <SectionCard
        title="2.0 Risk Assessments Attached"
        help="Select only the RAs relevant to the actual scope of work from the Hutchi library, or add a project-specific one below. Check the review date — an expired RA must be reassessed before it's attached, not attached as-is."
      >
        <div className="lib-grid">
          {activeLibrary.map(item => {
            const sel = ra.selected.find(s => s.ref === item.ref)
            const expired = sel && isExpired(sel.reviewDate)
            return (
              <div key={item.ref} className={`lib-item ${sel ? 'selected' : ''}`} onClick={() => toggleLibrary(item.ref)}>
                <input type="checkbox" checked={Boolean(sel)} onChange={() => toggleLibrary(item.ref)} onClick={e => e.stopPropagation()} />
                <div className="lib-body">
                  <div className="lib-title">{item.ref} — {item.title}</div>
                  <div className="lib-meta">{item.hazards.length} hazard(s) covered · {item.personsAffected.join(', ')}</div>
                  {sel && (
                    <div onClick={e => e.stopPropagation()} style={{ marginTop: 8, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      <label style={{ margin: 0, fontSize: '0.75rem' }}>Review due date</label>
                      <input type="date" value={sel.reviewDate} onChange={e => updateSelected(item.ref, 'reviewDate', e.target.value)} style={{ width: 160 }} />
                      {expired && <span className="expired">Past due — reassess before attaching</span>}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </SectionCard>

      {ra.selected.length > 0 && (
        <SectionCard title="Attached library Risk Assessments — detail" help="This is what will print in the PDF for each selected RA.">
          {ra.selected.map(sel => {
            const item = findRA(sel.ref)
            if (!item) return null
            return (
              <div key={sel.ref} className="selected-card" style={{ marginBottom: 12 }}>
                <div className="lib-title">
                  {item.ref} — {item.title}
                  {item.archived && <span className="expired" style={{ marginLeft: 8 }}>Archived by admin — check whether it's still appropriate</span>}
                </div>
                <table className="simple" style={{ marginTop: 8 }}>
                  <thead><tr><th>Hazard</th><th>Risk</th><th>Initial</th><th>Control measures</th><th>Residual</th></tr></thead>
                  <tbody>
                    {item.hazards.map((h, i) => (
                      <tr key={i}>
                        <td>{h.hazard}</td>
                        <td>{h.risk}</td>
                        <td><RiskPill s={h.s} l={h.l} /></td>
                        <td>{h.control}</td>
                        <td><RiskPill s={h.rs} l={h.rl} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          })}
        </SectionCard>
      )}

      <SectionCard
        title="Project-specific Risk Assessments"
        help="If an activity on this project isn't covered by an existing library RA, draft one here using the blank pro-forma."
        right={<button className="btn btn-secondary btn-sm" onClick={addCustom}>+ Add custom RA</button>}
      >
        {ra.custom.length === 0 && <p className="card-help">No custom risk assessments added.</p>}
        {ra.custom.map((c, idx) => (
          <div key={idx} className="selected-card" style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <strong>Custom Risk Assessment {idx + 1}</strong>
              <button className="btn-ghost" onClick={() => removeCustom(idx)}>✕ remove</button>
            </div>
            <div className="row">
              <Text label="RA reference" value={c.ref} onChange={v => updateCustom(c.ref, 'ref', v, idx)} />
              <Text label="Title" value={c.title} onChange={v => updateCustom(c.ref, 'title', v, idx)} />
            </div>
            <div className="row">
              <Text label="Review due date" type="date" value={c.reviewDate} onChange={v => updateCustom(c.ref, 'reviewDate', v, idx)} />
            </div>
            <HazardEditor hazards={c.hazards} onChange={hz => updateCustom(c.ref, 'hazards', hz, idx)} />
          </div>
        ))}
      </SectionCard>
    </>
  )
}
