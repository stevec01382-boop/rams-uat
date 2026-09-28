import { createRemoteJWKSet, jwtVerify } from 'jose'

const tenantId = process.env.ENTRA_TENANT_ID
const clientId = process.env.ENTRA_CLIENT_ID

let jwks
function getJwks() {
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`))
  }
  return jwks
}

// Verifies the bearer token Entra ID issued to the signed-in user and
// returns their roles/name/email, or an { ok: false } result explaining
// why the call is rejected. Every Netlify Function that touches RAMS data
// or the library calls this instead of the old shared passcode.
export async function verifyRequest(req) {
  if (!tenantId || !clientId) {
    return { ok: false, status: 500, message: 'ENTRA_TENANT_ID / ENTRA_CLIENT_ID are not set on this site yet.' }
  }

  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  if (!token) return { ok: false, status: 401, message: 'Missing bearer token — sign in again.' }

  try {
    const { payload } = await jwtVerify(token, getJwks(), {
      issuer: [
        `https://login.microsoftonline.com/${tenantId}/v2.0`,
        `https://sts.windows.net/${tenantId}/`,
      ],
    })

    const validAudience = payload.aud === clientId || payload.aud === `api://${clientId}`
    if (!validAudience) {
      return { ok: false, status: 401, message: 'Token was not issued for this app.' }
    }

    const roles = payload.roles || []
    return {
      ok: true,
      roles,
      isAdmin: roles.includes('Admin'),
      isUser: roles.includes('Admin') || roles.includes('User'),
      name: payload.name || payload.preferred_username || payload.upn || 'Unknown',
      email: payload.preferred_username || payload.upn || payload.email || '',
      sub: payload.sub,
    }
  } catch (e) {
    return { ok: false, status: 401, message: 'Invalid or expired sign-in — please sign in again. (' + (e?.message || String(e)) + ')' }
  }
}

export async function requireUser(req) {
  const result = await verifyRequest(req)
  if (!result.ok) return result
  if (!result.isUser) return { ok: false, status: 403, message: 'Your account is not assigned to the RAMS Users or Admins group yet.' }
  return result
}

export async function requireAdmin(req) {
  const result = await verifyRequest(req)
  if (!result.ok) return result
  if (!result.isAdmin) return { ok: false, status: 403, message: 'This action requires the Admin role.' }
  return result
}
