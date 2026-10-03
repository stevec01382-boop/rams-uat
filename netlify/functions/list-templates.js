import { json } from './lib/shared.js'
import { requireUser } from './lib/auth.js'
import { templateStore, readTemplateIndex } from './lib/templates.js'

// Any signed-in user can see and use the saved job-type templates -- only
// creating/editing them is restricted to Admins (see save-template.js).
export default async (req) => {
  const auth = await requireUser(req)
  if (!auth.ok) return json(auth.status, { message: auth.message })

  const store = templateStore()
  const list = await readTemplateIndex(store)
  list.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  return json(200, { items: list })
}
