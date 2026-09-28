// Thin client for the Netlify Functions backend. All calls are same-origin
// (Netlify serves /.netlify/functions/* alongside the static site) so no
// base URL configuration is needed once deployed.
//
// Every call takes a `token` -- the Entra ID access token from
// useAuth().getAccessToken() -- sent as a bearer token. In local dev
// without Entra configured (devMode), token is null and the functions
// running under `netlify dev` will reject with 500 (env vars not set);
// that's expected -- storage/email/library calls need the real backend.

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function asJson(res) {
  const text = await res.text()
  try {
    return { ok: res.ok, status: res.status, body: text ? JSON.parse(text) : {} }
  } catch {
    return { ok: res.ok, status: res.status, body: { message: text } }
  }
}

export async function submitRams({ data, pdfBase64, recipients, message, token }) {
  const res = await fetch('/.netlify/functions/submit-rams', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ data, pdfBase64, recipients, message }),
  })
  return asJson(res)
}

export async function listRams(token, query) {
  const res = await fetch(`/.netlify/functions/list-rams?q=${encodeURIComponent(query || '')}`, {
    headers: authHeaders(token),
  })
  return asJson(res)
}

// Fetches the stored PDF with the auth header attached (a plain <a href>
// can't carry a bearer token) and opens it in a new tab as a blob URL.
export async function openRamsPdf(id, token) {
  const res = await fetch(`/.netlify/functions/get-rams?id=${encodeURIComponent(id)}`, {
    headers: authHeaders(token),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || `Server returned ${res.status}`)
  }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
}

export async function resendRams(id, token, recipients) {
  const res = await fetch('/.netlify/functions/resend-rams', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ id, recipients }),
  })
  return asJson(res)
}

// ---- Library (admin) ----

export async function fetchLibrary(token) {
  const res = await fetch('/.netlify/functions/get-library', { headers: authHeaders(token) })
  return asJson(res)
}

export async function saveLibraryEntry({ kind, entry, sourceFileBase64, sourceFileName, sourceFileContentType, token }) {
  const res = await fetch('/.netlify/functions/admin-save-library', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ kind, entry, sourceFileBase64, sourceFileName, sourceFileContentType, action: 'save' }),
  })
  return asJson(res)
}

export async function setLibraryEntryArchived({ kind, ref, archived, token }) {
  const res = await fetch('/.netlify/functions/admin-save-library', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ kind, entry: { ref }, action: archived ? 'archive' : 'unarchive' }),
  })
  return asJson(res)
}

export async function fetchLibraryHistory(token) {
  const res = await fetch('/.netlify/functions/admin-library-history', { headers: authHeaders(token) })
  return asJson(res)
}

export async function openLibraryFile(fileKey, token) {
  const res = await fetch(`/.netlify/functions/get-library-file?key=${encodeURIComponent(fileKey)}`, {
    headers: authHeaders(token),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || `Server returned ${res.status}`)
  }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
}
