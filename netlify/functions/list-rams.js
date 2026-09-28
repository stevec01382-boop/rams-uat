import { ramsStore, json, readIndex } from './lib/shared.js'
import { requireUser } from './lib/auth.js'

export default async (req) => {
  const auth = await requireUser(req)
  if (!auth.ok) return json(auth.status, { message: auth.message })

  const url = new URL(req.url)
  const q = (url.searchParams.get('q') || '').toLowerCase().trim()
  const store = ramsStore()
  const list = await readIndex(store)

  const items = q
    ? list.filter(r =>
        [r.clientName, r.jobRef, r.siteName].some(f => (f || '').toLowerCase().includes(q))
      )
    : list

  return json(200, { items })
}
