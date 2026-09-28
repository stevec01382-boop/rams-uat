import { json } from './lib/shared.js'
import { requireUser } from './lib/auth.js'
import { libraryStore, readAllLibraries } from './lib/library.js'

export default async (req) => {
  const auth = await requireUser(req)
  if (!auth.ok) return json(auth.status, { message: auth.message })

  const store = libraryStore()
  const library = await readAllLibraries(store)
  return json(200, library)
}
