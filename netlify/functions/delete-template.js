import { json } from './lib/shared.js'
import { requireAdmin } from './lib/auth.js'
import { templateStore, readTemplateIndex, writeTemplateIndex } from './lib/templates.js'

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

  const { id } = body || {}
  if (!id) return json(400, { message: 'Missing id' })

  const store = templateStore()
  await store.delete(`tmpl-${id}`)

  const list = await readTemplateIndex(store)
  await writeTemplateIndex(store, list.filter(t => t.id !== id))

  return json(200, { ok: true })
}
