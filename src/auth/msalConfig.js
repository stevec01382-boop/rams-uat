// Entra ID (Azure AD) configuration for the RAMS Builder.
//
// All three values come from the app registration you create in the Entra
// admin centre (see README.md -> "Entra ID setup") and are supplied as
// Vite build-time env vars, so nothing secret ever ends up in this file:
//   VITE_ENTRA_TENANT_ID   - Directory (tenant) ID
//   VITE_ENTRA_CLIENT_ID   - Application (client) ID
//   VITE_ENTRA_REDIRECT_URI - usually just the site's own URL, e.g.
//                             https://rams-uat.netlify.app
//
// This is a public client (SPA) app registration -- there is no client
// secret, which is correct and expected for a browser app using the
// authorization-code-with-PKCE flow.

const tenantId = import.meta.env.VITE_ENTRA_TENANT_ID
const clientId = import.meta.env.VITE_ENTRA_CLIENT_ID
const redirectUri = import.meta.env.VITE_ENTRA_REDIRECT_URI || (typeof window !== 'undefined' ? window.location.origin : undefined)

export const authConfigured = Boolean(tenantId && clientId)

export const msalConfig = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri,
    postLogoutRedirectUri: redirectUri,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
}

// Scope requested at sign-in. `openid`/`profile` get us the ID token and
// its `roles` claim; the api:// scope below lets the app also acquire an
// access token to send to our own Netlify Functions. If you haven't
// exposed a custom API scope on the app registration yet, MSAL will fall
// back to a token that still verifies fine for our purposes (App Roles
// live on the ID token regardless) -- see README for the exact "Expose an
// API" steps if you want a dedicated scope.
export const loginRequest = {
  scopes: ['openid', 'profile', `api://${clientId}/access_as_user`],
}

export const ADMIN_ROLE = 'Admin'
export const USER_ROLE = 'User'
