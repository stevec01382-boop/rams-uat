import React, { useEffect, useState } from 'react'
import { fetchTemplates, fetchTemplate } from '../lib/api.js'
import { useAuth } from '../auth/AuthProvider.jsx'
import { createDraftFromTemplate } from '../state/initialData.js'

export default function Templates({ onBack, onUseTemplate }) {
  const { getAccessToken, devMode, isAdmin } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [using, setUsing] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      const token = devMode ? null : await getAccessToken()
      const res = await fetchTemplates(token)
      if (cancelled) return
      setLoading(false)
      if (res.ok) setItems(res.body.items || [])
      else setError(res.body?.message || 'Could not load templates.')
    }
    load()
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleUse(summary) {
    setUsing(summary.id)
    setError('')
    try {
      const token = devMode ? null : await getAccessToken()
      const res = await fetchTemplate(summary.id, token)
      if (!res.ok) throw new Error(res.body?.message || `Server returned ${res.status}`)
      const draft = createDraftFromTemplate(res.body.template)
      onUseTemplate(draft)
    } catch (e) {
      setUsing(null)
      setError(e.message || 'Could not load this template.')
    }
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Start from a template</h2>
        <button className="btn btn-secondary btn-sm" onClick={onBack}>← Back</button>
      </div>
      <p className="card-help">
        Pick a job type below to start a new RAMS with its scope, risk assessments, COSHH, method statement and
        other working sections already filled in. You'll only need to add the client, site, project manager and
        personnel details for this job — nothing here links back to another record.
        {isAdmin && <> Admins can add or edit templates under <strong>Templates admin</strong>.</>}
      </p>

      {error && <div className="banner error">{error}</div>}
      {loading && <p className="card-help">Loading…</p>}
      {!loading && !error && items.length === 0 && (
        <p className="card-help">
          No templates have been set up yet.{isAdmin ? ' Add one under Templates admin, or save an existing RAMS as a template from Records.' : ' Ask an admin to add one.'}
        </p>
      )}

      <div className="lib-grid">
        {items.map(t => (
          <div key={t.id} className="lib-item" style={{ cursor: 'default' }}>
            <div className="lib-body">
              <div className="lib-title">{t.name}</div>
              {t.description && <div className="lib-meta">{t.description}</div>}
              {t.updatedAt && (
                <div className="lib-meta">
                  Last updated {new Date(t.updatedAt).toLocaleDateString('en-GB')}{t.updatedBy?.name ? ` by ${t.updatedBy.name}` : ''}
                </div>
              )}
              <button
                className="btn btn-primary btn-sm"
                style={{ marginTop: 10 }}
                disabled={using === t.id}
                onClick={() => handleUse(t)}
              >
                {using === t.id ? 'Loading…' : 'Use this template'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
