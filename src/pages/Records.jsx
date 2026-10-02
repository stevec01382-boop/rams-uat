import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { listRams, resendRams, openRamsPdf, fetchRamsData } from '../lib/api.js'
import { useAuth } from '../auth/AuthProvider.jsx'
import { createRevisionDraft } from '../state/initialData.js'

function groupByLineage(rows) {
  const byLineage = new Map()
  for (const r of rows) {
    const key = r.lineageId || r.id
    if (!byLineage.has(key)) byLineage.set(key, [])
    byLineage.get(key).push(r)
  }
  const groups = []
  for (const [key, items] of byLineage) {
    const sorted = items.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    const latest = items.find(i => !i.supersededBy) || sorted[0]
    const history = sorted.filter(i => i.id !== latest.id)
    groups.push({ key, latest, history })
  }
  groups.sort((a, b) => new Date(b.latest.createdAt) - new Date(a.latest.createdAt))
  return groups
}

function StatusBadge({ r }) {
  return (
    <>
      <span className={`badge ${r.status === 'completed' ? 'complete' : 'draft'}`}>{r.status}</span>
      {r.revision && <span className="pill" style={{ marginLeft: 6 }}>{r.revision}</span>}
    </>
  )
}

export default function Records({ onCreateRevision }) {
  const { getAccessToken, devMode } = useAuth()
  const [query, setQuery] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [resendState, setResendState] = useState({})
  const [viewState, setViewState] = useState({})
  const [revisionState, setRevisionState] = useState({})
  const [expanded, setExpanded] = useState({})

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

  const groups = useMemo(() => groupByLineage(rows), [rows])

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

  async function handleCreateRevision(id) {
    setRevisionState(s => ({ ...s, [id]: 'loading' }))
    setError('')
    try {
      const token = devMode ? null : await getAccessToken()
      const res = await fetchRamsData(id, token)
      if (!res.ok) throw new Error(res.body?.message || `Server returned ${res.status}`)
      const draft = createRevisionDraft(res.body.data)
      onCreateRevision(draft)
    } catch (e) {
      setRevisionState(s => ({ ...s, [id]: 'error' }))
      setError(e.message || 'Could not load this RAMS to create a revision.')
    }
  }

  function toggleExpanded(key) {
    setExpanded(s => ({ ...s, [key]: !s[key] }))
  }

  function rowActions(r, { allowRevision }) {
    return (
      <td style={{ whiteSpace: 'nowrap' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => handleView(r.id)} disabled={viewState[r.id] === 'opening'}>
          {viewState[r.id] === 'opening' ? 'Opening…' : viewState[r.id] === 'error' ? 'Failed — retry' : 'View PDF'}
        </button>{' '}
        <button className="btn btn-secondary btn-sm" onClick={() => handleResend(r.id)} disabled={resendState[r.id] === 'sending'}>
          {resendState[r.id] === 'sending' ? 'Sending…' : resendState[r.id] === 'sent' ? 'Sent ✓' : resendState[r.id] === 'error' ? 'Failed — retry' : 'Resend email'}
        </button>{' '}
        {allowRevision && (
          <button className="btn btn-primary btn-sm" onClick={() => handleCreateRevision(r.id)} disabled={revisionState[r.id] === 'loading'}>
            {revisionState[r.id] === 'loading' ? 'Loading…' : revisionState[r.id] === 'error' ? 'Failed — retry' : 'Create revision'}
          </button>
        )}
      </td>
    )
  }

  return (
    <div className="page">
      <h2>Records</h2>
      <p className="card-help">
        Each row is the latest issue of a RAMS. If it's since been superseded, use <strong>Create revision</strong> to
        open a new copy pre-filled with everything from the previous issue — just review what's changed and get it
        re-signed, rather than rebuilding it from scratch.
      </p>
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

      {!loading && !error && groups.length === 0 && <p className="card-help">No stored RAMS match your search.</p>}

      {groups.length > 0 && (
        <table className="simple">
          <thead>
            <tr>
              <th>Client / Project</th><th>Job Ref</th><th>Site</th><th>Issue Date</th><th>Status</th><th>Signed by</th><th></th>
            </tr>
          </thead>
          <tbody>
            {groups.map(({ key, latest, history }) => (
              <React.Fragment key={key}>
                <tr>
                  <td>{latest.clientName}</td>
                  <td>{latest.jobRef}</td>
                  <td>{latest.siteName}</td>
                  <td>{latest.issueDate}</td>
                  <td><StatusBadge r={latest} /></td>
                  <td>{latest.signedCount} operative(s){latest.reviewerSigned ? ' + QA' : ''}</td>
                  {rowActions(latest, { allowRevision: true })}
                </tr>
                {history.length > 0 && (
                  <tr>
                    <td colSpan={7} style={{ paddingTop: 0, paddingBottom: 0 }}>
                      <button className="btn-ghost" style={{ fontSize: '0.78rem' }} onClick={() => toggleExpanded(key)}>
                        {expanded[key] ? '▾' : '▸'} {history.length} earlier revision{history.length > 1 ? 's' : ''}
                      </button>
                    </td>
                  </tr>
                )}
                {expanded[key] && history.map(r => (
                  <tr key={r.id} style={{ opacity: 0.75 }}>
                    <td>↳ {r.clientName}</td>
                    <td>{r.jobRef}</td>
                    <td>{r.siteName}</td>
                    <td>{r.issueDate}</td>
                    <td><StatusBadge r={r} /></td>
                    <td>{r.signedCount} operative(s){r.reviewerSigned ? ' + QA' : ''}</td>
                    {rowActions(r, { allowRevision: false })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
