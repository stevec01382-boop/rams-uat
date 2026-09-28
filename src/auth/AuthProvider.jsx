import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { PublicClientApplication, InteractionRequiredAuthError } from '@azure/msal-browser'
import { MsalProvider, useMsal, useIsAuthenticated } from '@azure/msal-react'
import { msalConfig, loginRequest, authConfigured, ADMIN_ROLE, USER_ROLE } from './msalConfig.js'

const msalInstance = authConfigured ? new PublicClientApplication(msalConfig) : null

const AuthContext = createContext(null)

function InnerAuthProvider({ children }) {
  const { instance, accounts, inProgress } = useMsal()
  const isAuthenticated = useIsAuthenticated()
  const account = accounts[0]

  const roles = account?.idTokenClaims?.roles || []
  const isAdmin = roles.includes(ADMIN_ROLE)
  const isKnownUser = isAdmin || roles.includes(USER_ROLE)

  const login = useCallback(() => instance.loginRedirect(loginRequest), [instance])
  const logout = useCallback(() => instance.logoutRedirect({ account }), [instance, account])

  const getAccessToken = useCallback(async () => {
    if (!account) return null
    try {
      const result = await instance.acquireTokenSilent({ ...loginRequest, account })
      return result.accessToken
    } catch (e) {
      if (e instanceof InteractionRequiredAuthError) {
        await instance.acquireTokenRedirect(loginRequest)
      }
      return null
    }
  }, [instance, account])

  useEffect(() => {
    if (inProgress === 'none' && !isAuthenticated) {
      instance.loginRedirect(loginRequest)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inProgress, isAuthenticated])

  const value = useMemo(() => ({
    isAuthenticated,
    account,
    name: account?.name || account?.username || '',
    email: account?.username || '',
    roles,
    isAdmin,
    isKnownUser,
    login,
    logout,
    getAccessToken,
    inProgress,
    devMode: false,
  }), [isAuthenticated, account, roles, isAdmin, isKnownUser, login, logout, getAccessToken, inProgress])

  if (!isAuthenticated) {
    return (
      <div className="auth-gate">
        <div className="auth-gate-card">
          <p>Redirecting you to sign in with Microsoft…</p>
        </div>
      </div>
    )
  }

  if (!isKnownUser) {
    return (
      <div className="auth-gate">
        <div className="auth-gate-card">
          <h3>Access not set up yet</h3>
          <p>
            You're signed in as <strong>{account?.username}</strong>, but your account hasn't been
            added to the RAMS-Users or RAMS-Admins group in Entra ID yet. Ask an admin to add you,
            then reload this page.
          </p>
          <button className="btn btn-secondary" onClick={logout}>Sign out</button>
        </div>
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function AuthProvider({ children }) {
  const [ready, setReady] = useState(!authConfigured)

  useEffect(() => {
    if (!authConfigured) return
    msalInstance.initialize().then(() => msalInstance.handleRedirectPromise()).then(() => setReady(true))
  }, [])

  if (!authConfigured) {
    // No Entra env vars set -- e.g. local dev without auth wired up yet.
    // Fall back to a permissive dev mode (everyone is an admin) so the app
    // stays usable, with a visible banner so nobody mistakes this for real
    // access control.
    const value = {
      isAuthenticated: true,
      account: null,
      name: 'Local dev',
      email: '',
      roles: [ADMIN_ROLE, USER_ROLE],
      isAdmin: true,
      isKnownUser: true,
      login: () => {},
      logout: () => {},
      getAccessToken: async () => null,
      devMode: true,
    }
    return (
      <AuthContext.Provider value={value}>
        <div className="dev-mode-banner">
          Entra ID isn't configured (VITE_ENTRA_TENANT_ID / VITE_ENTRA_CLIENT_ID missing) — running
          in unauthenticated dev mode with full admin access.
        </div>
        {children}
      </AuthContext.Provider>
    )
  }

  if (!ready) {
    return (
      <div className="auth-gate">
        <div className="auth-gate-card"><p>Loading…</p></div>
      </div>
    )
  }

  return (
    <MsalProvider instance={msalInstance}>
      <InnerAuthProvider>{children}</InnerAuthProvider>
    </MsalProvider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
