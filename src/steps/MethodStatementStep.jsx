import React from 'react'
import { SectionCard, Text, TextArea } from '../components/Fields.jsx'
import { useLibrary } from '../state/LibraryContext.jsx'
import { blankCustomMS } from '../state/initialData.js'

export default function MethodStatementStep({ data, setSection, patch }) {
  const ms = data.methodStatement
  const { methodStatements: METHOD_STATEMENTS, findMS } = useLibrary()
  const activeLibrary = METHOD_STATEMENTS.filter(item => !item.archived)

  function toggleLibrary(ref) {
    const exists = ms.selected.includes(ref)
    setSection('methodStatement', {
      ...ms,
      selected: exists ? ms.selected.filter(r => r !== ref) : [...ms.selected, ref],
    })
  }

  function addCustom() {
    setSection('methodStatement', { ...ms, custom: [...ms.custom, { ...blankCustomMS(), ref: `MS-CUSTOM-${ms.custom.length + 1}` }] })
  }
  function updateCustom(idx, field, value) {
    const next = ms.custom.slice()
    next[idx] = { ...next[idx], [field]: value }
    setSection('methodStatement', { ...ms, custom: next })
  }
  function removeCustom(idx) {
    setSection('methodStatement', { ...ms, custom: ms.custom.filter((_, i) => i !== idx) })
  }
  function updateStep(idx, stepIdx, value) {
    const next = ms.custom.slice()
    const steps = next[idx].steps.slice()
    steps[stepIdx] = value
    next[idx] = { ...next[idx], steps }
    setSection('methodStatement', { ...ms, custom: next })
  }
  function addStep(idx) {
    const next = ms.custom.slice()
    next[idx] = { ...next[idx], steps: [...next[idx].steps, ''] }
    setSection('methodStatement', { ...ms, custom: next })
  }
  function removeStep(idx, stepIdx) {
    const next = ms.custom.slice()
    next[idx] = { ...next[idx], steps: next[idx].steps.filter((_, i) => i !== stepIdx) }
    setSection('methodStatement', { ...ms, custom: next })
  }

  return (
    <>
      <SectionCard
        title="11.0 Method Statement / Sequence of Operations"
        help="Select the relevant method statement(s) from the library for the activities actually being carried out on this project, or draft a bespoke sequence below."
      >
        <div className="lib-grid">
          {activeLibrary.map(item => {
            const sel = ms.selected.includes(item.ref)
            return (
              <div key={item.ref} className={`lib-item ${sel ? 'selected' : ''}`} onClick={() => toggleLibrary(item.ref)}>
                <input type="checkbox" checked={sel} onChange={() => toggleLibrary(item.ref)} onClick={e => e.stopPropagation()} />
                <div className="lib-body">
                  <div className="lib-title">{item.ref} — {item.activity}</div>
                  <div className="lib-meta">{item.steps.length} steps · refs {item.relatedRA.join(', ')}</div>
                </div>
              </div>
            )
          })}
        </div>
      </SectionCard>

      {ms.selected.length > 0 && (
        <SectionCard title="Selected library method statements — detail">
          {ms.selected.map(ref => {
            const item = findMS(ref)
            if (!item) return null
            return (
              <div key={ref} className="selected-card" style={{ marginBottom: 12 }}>
                <div className="lib-title">
                  {item.ref} — {item.activity}
                  {item.archived && <span className="expired" style={{ marginLeft: 8 }}>Archived by admin — check whether it's still appropriate</span>}
                </div>
                <ol style={{ paddingLeft: 20, marginTop: 8 }}>
                  {item.steps.map((s, i) => <li key={i} style={{ marginBottom: 4 }}>{s}</li>)}
                </ol>
                <div className="lib-meta">Cross-refers: RA {item.relatedRA.join(', ') || '—'}{item.relatedCOSHH.length ? `; COSHH ${item.relatedCOSHH.join(', ')}` : ''}</div>
              </div>
            )
          })}
        </SectionCard>
      )}

      <SectionCard
        title="Project-specific method statement"
        help="If the activity isn't in the library, draft a bespoke sequence of operations here."
        right={<button className="btn btn-secondary btn-sm" onClick={addCustom}>+ Add custom method statement</button>}
      >
        {ms.custom.length === 0 && <p className="card-help">No custom method statement added.</p>}
        {ms.custom.map((item, idx) => (
          <div key={idx} className="selected-card" style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <strong>Custom method statement {idx + 1}</strong>
              <button className="btn-ghost" onClick={() => removeCustom(idx)}>✕ remove</button>
            </div>
            <div className="row">
              <Text label="Reference" value={item.ref} onChange={v => updateCustom(idx, 'ref', v)} />
              <Text label="Activity name" value={item.activity} onChange={v => updateCustom(idx, 'activity', v)} />
            </div>
            <label>Sequence of operation</label>
            {item.steps.map((s, si) => (
              <div key={si} className="row" style={{ marginBottom: 6, alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <input value={s} onChange={e => updateStep(idx, si, e.target.value)} placeholder={`Step ${si + 1}`} />
                </div>
                {item.steps.length > 1 && <button className="btn-ghost" onClick={() => removeStep(idx, si)}>✕</button>}
              </div>
            ))}
            <button className="btn btn-secondary btn-sm" onClick={() => addStep(idx)}>+ Add step</button>
          </div>
        ))}
      </SectionCard>

      <SectionCard title="Additional notes">
        <TextArea label="Any further notes for Section 11.0" value={ms.sequenceNotes} onChange={v => patch('methodStatement', { sequenceNotes: v })} rows={3} />
      </SectionCard>
    </>
  )
}
