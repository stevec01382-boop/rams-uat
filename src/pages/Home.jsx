import React from 'react'

export default function Home({ onStart, onRecords, onTemplates, hasDraft, data }) {
  const draftLabel = hasDraft && data?.project?.clientName
    ? `Continue draft: ${data.project.clientName}${data.project.jobRef ? ' (' + data.project.jobRef + ')' : ''}`
    : 'Continue saved draft'

  return (
    <div className="page">
      <div className="hero">
        <h1>Interactive RAMS builder</h1>
        <p>
          Build a project-specific Risk Assessment &amp; Method Statement from Hutchi's Master RAMS
          Template, get it signed electronically on site by every operative and the QA reviewer, and
          issue a branded PDF -- without re-keying anything into Word.
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 22, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={onStart}>Start a new RAMS</button>
          {onTemplates && (
            <button className="btn btn-secondary" style={{ background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} onClick={onTemplates}>
              Start from a template
            </button>
          )}
          {hasDraft && (
            <button className="btn btn-secondary" style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} onClick={onStart}>
              {draftLabel}
            </button>
          )}
          <button className="btn btn-secondary" style={{ background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} onClick={onRecords}>
            View records
          </button>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-tile"><div className="num">11</div><div className="label">Risk Assessments in library</div></div>
        <div className="stat-tile"><div className="num">7</div><div className="label">COSHH sheets in library</div></div>
        <div className="stat-tile"><div className="num">4</div><div className="label">Method Statements in library</div></div>
        <div className="stat-tile"><div className="num">15</div><div className="label">Guided sections, mirroring the paper template</div></div>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h3>How it works</h3>
        <ol style={{ color: 'var(--text-muted)', lineHeight: 1.7, paddingLeft: 20 }}>
          <li>Work through the sections -- project details, scope, risk assessments/COSHH (pick from the library or add project-specific ones), method statement, PPE, emergency arrangements and so on.</li>
          <li>Every operative on the job signs on screen (typed or drawn signature), along with the internal QA reviewer.</li>
          <li>Generate the branded PDF, which is emailed to the parties you specify and saved to your records for later reference.</li>
        </ol>
      </div>
    </div>
  )
}
