import { json } from './lib/shared.js'
import { requireAdmin } from './lib/auth.js'
import { templateStore, readTemplateIndex, writeTemplateIndex, summarizeTemplate } from './lib/templates.js'

// Creates or updates a job-type template -- either built from scratch in the
// admin Templates editor, or saved from an existing RAMS via "Save as
// template" in Records. Admin only: templates are a curated, shared list.
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

  const { id, name, description, content } = body || {}
  if (!name?.trim()) return json(400, { message: 'Template name is required' })
  if (!content) return json(400, { message: 'Missing template content' })

  const store = templateStore()
  const templateId = id || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  const existing = await store.get(`tmpl-${templateId}`, { type: 'json' })

  const template = {
    id: templateId,
    name: name.trim(),
    description: description || '',
    content,
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: { name: auth.name, email: auth.email },
  }
  await store.setJSON(`tmpl-${templateId}`, template)

  const list = await readTemplateIndex(store)
  const next = [...list.filter(t => t.id !== templateId), summarizeTemplate(template)]
  await writeTemplateIndex(store, next)

  return json(200, { ok: true, template })
}
