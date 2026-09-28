import { json } from './lib/shared.js'
import { requireAdmin } from './lib/auth.js'
import { libraryStore, readHistory } from './lib/library.js'

export default async (req) => {
  const auth = await requireAdmin(req)
  if (!auth.ok) return json(auth.status, { message: auth.message })

  const store = libraryStore()
  const history = await readHistory(store)
  return json(200, { items: history })
}
