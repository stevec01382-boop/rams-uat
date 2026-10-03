import React from 'react'
import { SectionCard, Text, TextArea } from '../components/Fields.jsx'
import { newId } from '../state/initialData.js'

export default function ProjectStep({ data, patch, setSection }) {
  const p = data.project

  function setP(field, value) {
    patch('project', { [field]: value })
  }

  function updatePersonnel(id, field, value) {
    setSection('project', {
      ...p,
      personnel: p.personnel.map(row => (row.id === id ? { ...row, [field]: value } : row)),
    })
  }
  function addPersonnel() {
    setSection('project', { ...p, personnel: [...p.personnel, { id: newId(), name: '', role: '' }] })
  }
  function removePersonnel(id) {
    setSection('project', { ...p, personnel: p.personnel.filter(row => row.id !== id) })
  }

  return (
    <>
      {data.meta.previousId && (
        <div className="banner info" style={{ marginBottom: 16 }}>
          This is <strong>{p.revision}</strong>, a new revision of a previously issued RAMS ({data.meta.previousRevisionLabel || 'earlier issue'}).
          Every section below has been carried over from that issue — review and update anything that's changed, then every
          operative and the QA reviewer will need to sign again before this revision can be sent.
        </div>
      )}
      {data.meta.startedFromTemplate && (
        <div className="banner info" style={{ marginBottom: 16 }}>
          This RAMS was started from the <strong>{data.meta.startedFromTemplate.name}</strong> template. The scope,
          risk assessments, COSHH, method statement and other working sections have been pre-filled from that
          template — check they still match this job, then fill in the client, site, project manager and personnel
          details below.
        </div>
      )}
      {data.meta.duplicatedFrom && (
        <div className="banner info" style={{ marginBottom: 16 }}>
          This RAMS was duplicated from an earlier job{data.meta.duplicatedFrom.jobRef ? ` (${data.meta.duplicatedFrom.jobRef})` : ''}
          {data.meta.duplicatedFrom.siteName ? ` at ${data.meta.duplicatedFrom.siteName}` : ''}. The scope, risk assessments, COSHH,
          method statement and other working sections have been carried over as a starting point — this is a separate, independent
          RAMS, not linked to that job, so fill in the client, site, project manager and personnel details below, and check the
          scope and selections still fit before sending.
        </div>
      )}
      <SectionCard
        title="Project Details"
        help='Complete every field below before this RAMS is issued. Do not leave location, phone or email blank or generic (e.g. "as per proposal") — these were flagged as non-conformances in previous internal audits.'
      >
        <div className="row">
          <Text label="Client / Project name" value={p.clientName} onChange={v => setP('clientName', v)} placeholder="e.g. David Lloyd Leisure — Client Name" />
          <Text label="Job reference" value={p.jobRef} onChange={v => setP('jobRef', v)} placeholder="e.g. HUTQ107348" />
        </div>
        <div className="row">
          <Text label="Revision" value={p.revision} onChange={v => setP('revision', v)} />
          <Text label="Issue date" type="date" value={p.issueDate} onChange={v => setP('issueDate', v)} />
        </div>
        <div className="row">
          <Text label="Client / site name" value={p.siteName} onChange={v => setP('siteName', v)} placeholder="e.g. David Lloyd Sevilla" />
        </div>
        <TextArea
          label="Exact location"
          hint="Full site address / exact location. Do not leave as generic."
          value={p.location}
          onChange={v => setP('location', v)}
          placeholder="Full site address, including postcode / country"
        />
        <div className="row">
          <Text label="Proposed start date" type="date" value={p.startDate} onChange={v => setP('startDate', v)} />
          <Text label="Proposed start time" type="time" value={p.startTime} onChange={v => setP('startTime', v)} />
        </div>
      </SectionCard>

      <SectionCard title="Project Manager">
        <div className="row">
          <Text label="Name" value={p.pmName} onChange={v => setP('pmName', v)} />
          <Text label="Telephone" type="tel" value={p.pmPhone} onChange={v => setP('pmPhone', v)} />
        </div>
        <Text label="Email" type="email" value={p.pmEmail} onChange={v => setP('pmEmail', v)} placeholder="valid, monitored email address" />
      </SectionCard>

      <SectionCard title="No. of Personnel / Names on Job" help="Add every operative expected on site for this scope of work — they'll each get a signature slot later.">
        <table className="simple" style={{ marginBottom: 12 }}>
          <thead><tr><th style={{ width: 40 }}>No.</th><th>Name</th><th>Role / Competency</th><th style={{ width: 40 }} /></tr></thead>
          <tbody>
            {p.personnel.map((row, i) => (
              <tr key={row.id}>
                <td>{i + 1}</td>
                <td><input value={row.name} onChange={e => updatePersonnel(row.id, 'name', e.target.value)} /></td>
                <td><input value={row.role} onChange={e => updatePersonnel(row.id, 'role', e.target.value)} placeholder="e.g. Lead Engineer, PASMA" /></td>
                <td>{p.personnel.length > 1 && <button className="btn-ghost" onClick={() => removePersonnel(row.id)}>✕</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="btn btn-secondary btn-sm" onClick={addPersonnel}>+ Add person</button>
      </SectionCard>

      <SectionCard title="Internal QA Review" help="Recorded here for the document control table; the reviewer signs formally in the Sign-off section.">
        <div className="row">
          <Text label="Reviewed by (for Hutchi)" value={p.qaReviewerName} onChange={v => setP('qaReviewerName', v)} />
          <Text label="Review date" type="date" value={p.qaReviewDate} onChange={v => setP('qaReviewDate', v)} />
        </div>
      </SectionCard>
    </>
  )
}
