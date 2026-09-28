import React, { useEffect, useState, useCallback } from 'react'
import Topbar from './components/Topbar.jsx'
import Home from './pages/Home.jsx'
import Builder from './pages/Builder.jsx'
import Records from './pages/Records.jsx'
import AdminLibrary from './pages/AdminLibrary.jsx'
import { createInitialData } from './state/initialData.js'
import { LibraryProvider } from './state/LibraryContext.jsx'
import { useAuth } from './auth/AuthProvider.jsx'

const DRAFT_KEY = 'hutchi-rams-draft-v1'

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.warn('Could not read saved draft', e)
  }
  return null
}

function getRoute() {
  const hash = window.location.hash.replace(/^#\/?/, '')
  return hash || 'home'
}

export default function App() {
  const [route, setRoute] = useState(getRoute())
  const [data, setData] = useState(() => loadDraft() || createInitialData())
  const [saveState, setSaveState] = useState('idle')
  const { isAdmin } = useAuth()

  useEffect(() => {
    const onHash = () => setRoute(getRoute())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    setSaveState('saving')
    const t = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(data))
        setSaveState('saved')
      } catch (e) {
        setSaveState('error')
      }
    }, 400)
    return () => clearTimeout(t)
  }, [data])

  const navigate = useCallback((path) => {
    window.location.hash = path
  }, [])

  const resetDraft = useCallback(() => {
    const fresh = createInitialData()
    setData(fresh)
    navigate('/new')
  }, [navigate])

  let body
  if (route === 'home' || route === '') {
    body = <Home onStart={() => navigate('/new')} onRecords={() => navigate('/records')} hasDraft={Boolean(data?.meta?.id)} data={data} />
  } else if (route === 'records') {
    body = <Records onBack={() => navigate('/')} />
  } else if (route === 'admin/library') {
    body = isAdmin
      ? <AdminLibrary />
      : <Home onStart={() => navigate('/new')} onRecords={() => navigate('/records')} hasDraft={Boolean(data?.meta?.id)} data={data} />
  } else {
    body = <Builder data={data} setData={setData} onExit={() => navigate('/')} onNewDraft={resetDraft} />
  }

  return (
    <LibraryProvider>
      <div className="app-shell" style={{ flexDirection: 'column', width: '100%' }}>
        <Topbar route={route} navigate={navigate} saveState={route.startsWith('new') || route.startsWith('edit') ? saveState : null} />
        {body}
      </div>
    </LibraryProvider>
  )
}
