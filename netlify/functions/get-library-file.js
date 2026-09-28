import { json } from './lib/shared.js'
import { requireUser } from './lib/auth.js'
import { libraryStore } from './lib/library.js'

// Streams back a source document that an admin attached to a library entry
// (the "approved source document" for audit trail). Any signed-in user can
// view it -- it's the same evidence trail the RAMS itself is built from.
export default async (req) => {
  const auth = await requireUser(req)
  if (!auth.ok) return json(auth.status, { message: auth.message })

  const url = new URL(req.url)
  const key = url.searchParams.get('key')
  if (!key || !key.startsWith('library-file-')) return json(400, { message: 'Missing or invalid key' })

  const store = libraryStore()
  const blob = await store.get(key, { type: 'arrayBuffer' })
  if (!blob) return json(404, { message: 'File not found' })

  const meta = await store.getMetadata(key).catch(() => null)
  const contentType = meta?.metadata?.contentType || 'application/octet-stream'

  return new Response(blob, {
    status: 200,
    headers: {
      'content-type': contentType,
      'content-disposition': 'inline',
    },
  })
}
