import React from 'react'
import { SectionCard, Text, TextArea } from '../components/Fields.jsx'
import { useLibrary } from '../state/LibraryContext.jsx'
import { blankCustomCOSHH } from '../state/initialData.js'

function addMonths(dateStr, months) {
  const d = new Date(dateStr)
  d.setMonth(d.getMonth() + months)
  return d.toISOString().slice(0, 10)
}
function today() { return new Date().toISOString().slice(0, 10) }

export default function CoshhStep({ data, setSection }) {
  const c = data.coshh
  const { coshhSheets: COSHH_SHEETS, findCOSHH } = useLibrary()
  const activeLibrary = COSHH_SHEETS.filter(item => !item.archived)
  const isExpired = (dateStr) => dateStr && new Date(dateStr) < new Date()

  function toggleLibrary(ref) {
    const exists = c.selected.find(s => s.ref === ref)
    if (exists) {
      setSection('coshh', { ...c, selected: c.selected.filter(s => s.ref !== ref) })
    } else {
      setSection('coshh', { ...c, selected: [...c.selected, { ref, reviewDate: addMonths(today(), 12) }] })
    }
  }
  function updateSelected(ref, field, value) {
    setSection('coshh', { ...c, selected: c.selected.map(s => (s.ref === ref ? { ...s, [field]: value } : s)) })
  }
  function addCustom() {
    setSection('coshh', { ...c, custom: [...c.custom, { ...blankCustomCOSHH(), ref: `COSHH-CUSTOM-${c.custom.length + 1}` }] })
  }
  function updateCustom(idx, field, value) {
    const next = c.custom.slice()
    next[idx] = { ...next[idx], [field]: value }
    setSection('coshh', { ...c, custom: next })
  }
  function removeCustom(idx) {
    setSection('coshh', { ...c, custom: c.custom.filter((_, i) => i !== idx) })
  }

  return (
    <>
      <SectionCard
        title="2.1 COSHH Risk Assessments Attached"
        help="List only the substances actually used on this job. Check the review date before attaching — an expired COSHH sheet must be reassessed against the current manufacturer's Safety Data Sheet, not copied from a similar product with just the date changed."
      >
        <div className="lib-grid">
          {activeLibrary.map(item => {
            const sel = c.selected.find(s => s.ref === item.ref)
            const expired = sel && isExpired(sel.reviewDate)
            return (
              <div key={item.ref} className={`lib-item ${sel ? 'selected' : ''}`} onClick={() => toggleLibrary(item.ref)}>
                <input type="checkbox" checked={Boolean(sel)} onChange={() => toggleLibrary(item.ref)} onClick={e => e.stopPropagation()} />
                <div className="lib-body">
                  <div className="lib-title">{item.ref} — {item.product}</div>
                  <div className="lib-meta">{item.classifications.join(' · ')}</div>
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

      {c.selected.length > 0 && (
        <SectionCard title="Attached library COSHH sheets — detail">
          {c.selected.map(sel => {
            const item = findCOSHH(sel.ref)
            if (!item) return null
            return (
              <div key={sel.ref} className="selected-card" style={{ marginBottom: 12 }}>
                <div className="lib-title">
                  {item.ref} — {item.product}
                  {item.archived && <span className="expired" style={{ marginLeft: 8 }}>Archived by admin — check whether it's still appropriate</span>}
                </div>
                <table className="simple" style={{ marginTop: 8 }}>
                  <tbody>
                    <tr><th style={{ width: 180 }}>Classification</th><td>{item.classifications.join(', ')}</td></tr>
                    <tr><th>Activity</th><td>{item.activity}</td></tr>
                    <tr><th>Health risks</th><td>{item.healthRisks}</td></tr>
                    <tr><th>Controls / PPE</th><td>{item.controls}</td></tr>
                    <tr><th>First aid</th><td>{item.firstAid}</td></tr>
                    <tr><th>Storage</th><td>{item.storage}</td></tr>
                    <tr><th>Disposal</th><td>{item.disposal}</td></tr>
                  </tbody>
                </table>
              </div>
            )
          })}
        </SectionCard>
      )}

      <SectionCard
        title="Project-specific COSHH sheets"
        help="If a substance used on this project isn't covered by an existing library sheet, draft one here and obtain the current manufacturer's Safety Data Sheet."
        right={<button className="btn btn-secondary btn-sm" onClick={addCustom}>+ Add custom COSHH sheet</button>}
      >
        {c.custom.length === 0 && <p className="card-help">No custom COSHH sheets added.</p>}
        {c.custom.map((item, idx) => (
          <div key={idx} className="selected-card" style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <strong>Custom COSHH sheet {idx + 1}</strong>
              <button className="btn-ghost" onClick={() => removeCustom(idx)}>✕ remove</button>
            </div>
            <div className="row">
              <Text label="Reference" value={item.ref} onChange={v => updateCustom(idx, 'ref', v)} />
              <Text label="Product name" value={item.product} onChange={v => updateCustom(idx, 'product', v)} />
            </div>
            <div className="row">
              <Text label="Manufacturer" value={item.manufacturer} onChange={v => updateCustom(idx, 'manufacturer', v)} />
              <Text label="Review due date" type="date" value={item.reviewDate} onChange={v => updateCustom(idx, 'reviewDate', v)} />
            </div>
            <TextArea label="Activity / work process" value={item.activity} onChange={v => updateCustom(idx, 'activity', v)} rows={2} />
            <Text label="Classifications (comma-separated)" value={item.classifications.join(', ')} onChange={v => updateCustom(idx, 'classifications', v.split(',').map(s => s.trim()).filter(Boolean))} placeholder="e.g. Flammable, Harmful/Irritant" />
            <TextArea label="Risks to health" value={item.healthRisks} onChange={v => updateCustom(idx, 'healthRisks', v)} rows={2} />
            <TextArea label="Control measures / PPE / first aid / storage / disposal" value={item.controls} onChange={v => updateCustom(idx, 'controls', v)} rows={3} />
          </div>
        ))}
      </SectionCard>
    </>
  )
}
