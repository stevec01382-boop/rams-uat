import { json } from './lib/shared.js'
import { requireAdmin } from './lib/auth.js'
import { libraryStore, readLibraryList, writeLibraryList, appendHistory, sourceFileKey } from './lib/library.js'

const KIND_LABELS = { ra: 'Risk Assessment', coshh: 'COSHH sheet', ms: 'Method Statement' }

export default async (req) => {
  if (req.method !== 'POST') return json(405, { message: 'Method not allowed' })

  const auth = await requireAdmin(req)
  if (!auth.ok) return json(auth.status, { message: auth.message })

  let body
  try {
    body = await req.json()
  } catch {
    return json(400, { message: 'Invalid JSON body' })
  }

  const { kind, entry, sourceFileBase64, sourceFileName, sourceFileContentType, action } = body || {}
  if (!KIND_LABELS[kind]) return json(400, { message: 'kind must be one of "ra", "coshh", "ms"' })
  if (!entry?.ref) return json(400, { message: 'entry.ref is required' })

  const store = libraryStore()
  const list = await readLibraryList(store, kind)
  const idx = list.findIndex(item => item.ref === entry.ref)

  if (action === 'archive' || action === 'unarchive') {
    if (idx === -1) return json(404, { message: `No ${KIND_LABELS[kind]} found with ref ${entry.ref}` })
    list[idx] = { ...list[idx], archived: action === 'archive' }
    await writeLibraryList(store, kind, list)
    await appendHistory(store, {
      kind, ref: entry.ref, action, changedBy: auth.name, changedByEmail: auth.email,
      summary: `${action === 'archive' ? 'Archived' : 'Restored'} ${KIND_LABELS[kind]} ${entry.ref}`,
    })
    return json(200, { ok: true, entry: list[idx] })
  }

  // Upsert (create or replace) a library entry.
  let sourceFile = idx > -1 ? list[idx].sourceFile : null
  if (sourceFileBase64) {
    const key = sourceFileKey(kind, entry.ref, sourceFileName)
    const buffer = Buffer.from(sourceFileBase64, 'base64')
    await store.set(key, buffer, { metadata: { contentType: sourceFileContentType || 'application/octet-stream' } })
    sourceFile = { key, filename: sourceFileName || 'document', contentType: sourceFileContentType || 'application/octet-stream', uploadedAt: new Date().toISOString() }
  }

  const nextEntry = {
    ...entry,
    archived: idx > -1 ? list[idx].archived : false,
    sourceFile,
    updatedAt: new Date().toISOString(),
    updatedBy: { name: auth.name, email: auth.email },
  }

  const nextList = idx > -1 ? list.map((item, i) => (i === idx ? nextEntry : item)) : [...list, nextEntry]
  await writeLibraryList(store, kind, nextList)
  await appendHistory(store, {
    kind, ref: entry.ref, action: idx > -1 ? 'update' : 'create', changedBy: auth.name, changedByEmail: auth.email,
    summary: `${idx > -1 ? 'Updated' : 'Added'} ${KIND_LABELS[kind]} ${entry.ref}${sourceFileBase64 ? ' (with attached source document)' : ''}`,
  })

  return json(200, { ok: true, entry: nextEntry })
}
