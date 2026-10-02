import { ramsStore, json } from './lib/shared.js'
import { requireUser } from './lib/auth.js'

// Returns the full stored form data (not just the PDF) for a previously
// submitted RAMS -- used by the "Create revision" action on Records to load
// an existing RAMS back into the builder so it can be updated and re-issued
// without re-keying every section.
export default async (req) => {
  const auth = await requireUser(req)
  if (!auth.ok) return json(auth.status, { message: auth.message })

  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return json(400, { message: 'Missing id' })

  const store = ramsStore()
  const data = await store.get(`data-${id}`, { type: 'json' })
  if (!data) return json(404, { message: 'Not found' })

  return json(200, { data })
}
