import React, { useState } from 'react'
import { SectionCard, Text, TextArea } from '../components/Fields.jsx'
import { overallReadiness } from '../lib/validate.js'
import { downloadPdf, getPdfBase64 } from '../lib/pdf.js'
import { submitRams } from '../lib/api.js'
import { useLibrary } from '../state/LibraryContext.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'

export default function ReviewStep({ data, patch, setData }) {
  const issues = overallReadiness(data)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null) // { ok, message }
  const [downloading, setDownloading] = useState(false)
  const library = useLibrary()
  const { getAccessToken, devMode } = useAuth()

  const filename = `RAMS-${(data.project.jobRef || 'draft').replace(/\s+/g, '_')}-${data.project.revision || 'Rev0'}.pdf`

  async function handleDownload() {
    setDownloading(true)
    try {
      downloadPdf(data, library, filename)
    } finally {
      setDownloading(false)
    }
  }

  async function handleSend() {
    setSending(true)
    setResult(null)
    try {
      const pdfBase64 = await getPdfBase64(data, library)
      const recipients = data.distribution.recipients.split(',').map(s => s.trim()).filter(Boolean)
      const token = devMode ? null : await getAccessToken()
      const res = await submitRams({ data, pdfBase64, recipients, message: data.distribution.message, token })
      if (res.ok) {
        setData(prev => ({ ...prev, meta: { ...prev.meta, status: 'completed', submittedAt: new Date().toISOString(), storedId: res.body.id } }))
        setResult({ ok: true, message: res.body.emailed ? 'Saved to records and emailed to the recipients below.' : 'Saved to records. Email was not sent — check the message below.' , detail: res.body.emailError })
      } else {
        setResult({ ok: false, message: res.body?.message || `Server returned ${res.status}.` })
      }
    } catch (e) {
      setResult({ ok: false, message: 'Could not reach the server. ' + (e?.message || '') })
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <SectionCard title="Readiness check">
        {issues.length === 0 ? (
          <div className="banner ok">Looks complete — every RA/COSHH is in date and at least one operative plus the QA reviewer have signed.</div>
        ) : (
          <div className="banner info">
            <strong>{issues.length} thing(s) to check before issuing:</strong>
            <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
              {issues.map((i, idx) => <li key={idx}>{i}</li>)}
            </ul>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Generate PDF">
        <p className="card-help">Produces the full branded RAMS document, including every signature captured so far.</p>
        <button className="btn btn-secondary" disabled={downloading} onClick={handleDownload}>
          {downloading ? 'Generating…' : '⬇ Download PDF'}
        </button>
      </SectionCard>

      <SectionCard title="Send & save" help="Emails the PDF to the addresses below and saves a copy to your records for later reference/search.">
        <Text
          label="Recipients (comma-separated email addresses)"
          value={data.distribution.recipients}
          onChange={v => patch('distribution', { recipients: v })}
          placeholder="client@example.com, pm@hutchi.tech"
        />
        <TextArea
          label="Note to include in the email (optional)"
          value={data.distribution.message}
          onChange={v => patch('distribution', { message: v })}
          rows={3}
        />
        <button className="btn btn-primary" disabled={sending} onClick={handleSend}>
          {sending ? 'Sending…' : 'Send & save this RAMS'}
        </button>
        {result && (
          <div className={`banner ${result.ok ? 'ok' : 'error'}`} style={{ marginTop: 14 }}>
            {result.message}
            {result.detail && <div style={{ marginTop: 4, fontSize: '0.78rem' }}>{result.detail}</div>}
          </div>
        )}
        {data.meta.status === 'completed' && (
          <div style={{ marginTop: 10, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Marked complete and saved to records{data.meta.submittedAt ? ` on ${new Date(data.meta.submittedAt).toLocaleString('en-GB')}` : ''}.
          </div>
        )}
      </SectionCard>
    </>
  )
}
