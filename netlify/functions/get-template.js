import { json } from './lib/shared.js'
import { requireUser } from './lib/auth.js'
import { templateStore } from './lib/templates.js'

export default async (req) => {
  const auth = await requireUser(req)
  if (!auth.ok) return json(auth.status, { message: auth.message })

  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return json(400, { message: 'Missing id' })

  const store = templateStore()
  const template = await store.get(`tmpl-${id}`, { type: 'json' })
  if (!template) return json(404, { message: 'Template not found' })

  return json(200, { template })
}
