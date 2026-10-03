import React from 'react'
import logo from '../assets/hutchi-logo.png'
import { useAuth } from '../auth/AuthProvider.jsx'

export default function Topbar({ route, navigate, saveState }) {
  const { name, isAdmin, logout, devMode } = useAuth()

  return (
    <div className="topbar">
      <img src={logo} alt="Hutchi" />
      <div className="brand">
        RAMS Builder
        <small>Hutchi UK — By Hutchison Technologies</small>
      </div>
      <nav>
        <a href="#/" className={route === 'home' || route === '' ? 'active' : ''}>Home</a>
        <a href="#/records" className={route === 'records' ? 'active' : ''}>Records</a>
        <a href="#/templates" className={route === 'templates' ? 'active' : ''}>Templates</a>
        {isAdmin && (
          <a href="#/admin/library" className={route === 'admin/library' ? 'active' : ''}>Library</a>
        )}
        {isAdmin && (
          <a href="#/admin/templates" className={route === 'admin/templates' ? 'active' : ''}>Templates admin</a>
        )}
        <button className={route.startsWith('new') || route.startsWith('edit') ? 'active' : ''} onClick={() => navigate('/new')}>
          New RAMS
        </button>
      </nav>
      {saveState && (
        <span style={{ fontSize: '0.72rem', color: '#C9C6E0', marginLeft: 4 }}>
          {saveState === 'saving' ? 'Saving draft…' : saveState === 'saved' ? 'Draft saved on this device' : 'Could not save draft'}
        </span>
      )}
      <div className="user-chip">
        {isAdmin && <span className="role-badge">Admin</span>}
        <span>{name}</span>
        {!devMode && <button className="btn-ghost" style={{ color: '#C9C6E0' }} onClick={logout}>Sign out</button>}
      </div>
    </div>
  )
}
