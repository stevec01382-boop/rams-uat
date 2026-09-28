import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from '../auth/AuthProvider.jsx'
import { RISK_ASSESSMENTS as SEED_RA, COSHH_SHEETS as SEED_COSHH, METHOD_STATEMENTS as SEED_MS } from '../data/seedLibrary.js'

function seedAsEntries(list) {
  return list.map(item => ({ ...item, archived: false, updatedAt: null, updatedBy: null, sourceFile: null }))
}

const LibraryContext = createContext(null)

// Fetches the live, admin-editable RA/COSHH/Method Statement library from
// the get-library Netlify Function (which itself lazily seeds Netlify
// Blobs from src/data/seedLibrary.js the first time it's called). If the
// function can't be reached -- most commonly local dev with plain `vite`
// instead of `netlify dev` -- this falls back to the bundled seed content
// so the builder itself stays fully usable; only the admin Library page
// needs the real backend.
export function LibraryProvider({ children }) {
  const { getAccessToken, devMode } = useAuth()
  const [state, setState] = useState({
    riskAssessments: seedAsEntries(SEED_RA),
    coshhSheets: seedAsEntries(SEED_COSHH),
    methodStatements: seedAsEntries(SEED_MS),
    loading: true,
    error: null,
    source: 'seed',
  })

  const load = useCallback(async () => {
    setState(s => ({ ...s, loading: true }))
    try {
      const token = devMode ? null : await getAccessToken()
      const res = await fetch('/.netlify/functions/get-library', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) throw new Error(`Server returned ${res.status}`)
      const body = await res.json()
      setState({
        riskAssessments: body.riskAssessments || [],
        coshhSheets: body.coshhSheets || [],
        methodStatements: body.methodStatements || [],
        loading: false,
        error: null,
        source: 'server',
      })
    } catch (e) {
      setState(s => ({ ...s, loading: false, error: e.message, source: 'seed-fallback' }))
    }
  }, [getAccessToken, devMode])

  useEffect(() => { load() }, [load])

  const findRA = useCallback(ref => state.riskAssessments.find(r => r.ref === ref), [state.riskAssessments])
  const findCOSHH = useCallback(ref => state.coshhSheets.find(r => r.ref === ref), [state.coshhSheets])
  const findMS = useCallback(ref => state.methodStatements.find(r => r.ref === ref), [state.methodStatements])

  return (
    <LibraryContext.Provider value={{ ...state, refresh: load, findRA, findCOSHH, findMS }}>
      {children}
    </LibraryContext.Provider>
  )
}

export function useLibrary() {
  const ctx = useContext(LibraryContext)
  if (!ctx) throw new Error('useLibrary must be used within LibraryProvider')
  return ctx
}
