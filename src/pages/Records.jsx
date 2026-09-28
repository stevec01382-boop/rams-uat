import React, { useEffect, useState, useCallback } from 'react'
import { listRams, resendRams, openRamsPdf } from '../lib/api.js'
import { useAuth } from '../auth/AuthProvider.jsx'

export default function Records() {
  const { getAccessToken, devMode } = useAuth()
  const [query, setQuery] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [resendState, setResendState] = useState({})
  const [viewState, setViewState] = useState({})

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const token = devMode ? null : await getAccessToken()
    const res = await listRams(token, query)
    setLoading(false)
    if (res.ok) {
      setRows(res.body.items || [])
    } else {
      setError(res.body?.message || 'Could not load records.')
    }
  }, [getAccessToken, devMode, query])

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleResend(id) {
    setResendState(s => ({ ...s, [id]: 'sending' }))
    const token = devMode ? null : await getAccessToken()
    const res = await resendRams(id, token)
    setResendState(s => ({ ...s, [id]: res.ok ? 'sent' : 'error' }))
  }

  async function handleView(id) {
    setViewState(s => ({ ...s, [id]: 'opening' }))
    try {
      const token = devMode ? null : await getAccessToken()
      await openRamsPdf(id, token)
      setViewState(s => ({ ...s, [id]: null }))
    } catch (e) {
      setViewState(s => ({ ...s, [id]: 'error' }))
    }
  }

  return (
    <div className="page">
      <h2>Records</h2>
      <div className="records-toolbar">
        <input
          placeholder="Search by client, job ref or site..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && load()}
        />
        <button className="btn btn-secondary btn-sm" onClick={load}>Search</button>
      </div>

      {error && <div className="banner error">{error}</div>}
      {loading && <p className="card-help">Loading…</p>}

      {!loading && !error && rows.length === 0 && <p className="card-help">No stored RAMS match your search.</p>}

      {rows.length > 0 && (
        <table className="simple">
          <thead>
            <tr>
              <th>Client / Project</th><th>Job Ref</th><th>Site</th><th>Issue Date</th><th>Status</th><th>Signed by</th><th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>{r.clientName}</td>
                <td>{r.jobRef}</td>
                <td>{r.siteName}</td>
                <td>{r.issueDate}</td>
                <td><span className={`badge ${r.status === 'completed' ? 'complete' : 'draft'}`}>{r.status}</span></td>
                <td>{r.signedCount} operative(s){r.reviewerSigned ? ' + QA' : ''}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleView(r.id)} disabled={viewState[r.id] === 'opening'}>
                    {viewState[r.id] === 'opening' ? 'Opening…' : viewState[r.id] === 'error' ? 'Failed — retry' : 'View PDF'}
                  </button>{' '}
                  <button className="btn btn-secondary btn-sm" onClick={() => handleResend(r.id)} disabled={resendState[r.id] === 'sending'}>
                    {resendState[r.id] === 'sending' ? 'Sending…' : resendState[r.id] === 'sent' ? 'Sent ✓' : resendState[r.id] === 'error' ? 'Failed — retry' : 'Resend email'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
