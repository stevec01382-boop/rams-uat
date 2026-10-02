import { ramsStore, json, readIndex, writeIndex } from './lib/shared.js'
import { requireUser } from './lib/auth.js'

// Undoes "supersession": brings an earlier revision (or the original) back
// to being the active/latest record shown on Records, moving whichever
// record currently holds that spot back into the revision history instead.
// This is the undo for an accidental "Create revision" -- it doesn't delete
// anything, it just moves which record in the lineage is "latest".
export default async (req) => {
  if (req.method !== 'POST') return json(405, { message: 'Method not allowed' })

  const auth = await requireUser(req)
  if (!auth.ok) return json(auth.status, { message: auth.message })

  let body
  try {
    body = await req.json()
  } catch {
    return json(400, { message: 'Invalid JSON body' })
  }

  const { id } = body || {}
  if (!id) return json(400, { message: 'Missing id' })

  const store = ramsStore()
  const targetData = await store.get(`data-${id}`, { type: 'json' })
  if (!targetData) return json(404, { message: 'RAMS not found' })

  const lineageId = targetData.meta?.lineageId || targetData.meta?.id || id

  const list = await readIndex(store)
  const next = await Promise.all(list.map(async (r) => {
    const rLineage = r.lineageId || r.id
    if (rLineage !== lineageId) return r
    if (r.id === id) return { ...r, supersededBy: null }
    if (!r.supersededBy) {
      // This was the current latest in the lineage -- it now gets superseded
      // by the record being reinstated, so exactly one record stays "latest".
      const otherData = await store.get(`data-${r.id}`, { type: 'json' })
      if (otherData) {
        await store.setJSON(`data-${r.id}`, { ...otherData, meta: { ...otherData.meta, supersededBy: id } })
      }
      return { ...r, supersededBy: id }
    }
    return r
  }))
  await writeIndex(store, next)

  await store.setJSON(`data-${id}`, { ...targetData, meta: { ...targetData.meta, supersededBy: null } })

  return json(200, { ok: true })
}
