import { ramsStore, json } from './lib/shared.js'
import { requireUser } from './lib/auth.js'

export default async (req) => {
  const auth = await requireUser(req)
  if (!auth.ok) return json(auth.status, { message: auth.message })

  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return json(400, { message: 'Missing id' })

  const store = ramsStore()
  const pdf = await store.get(`pdf-${id}`, { type: 'arrayBuffer' })
  if (!pdf) return json(404, { message: 'Not found' })

  return new Response(pdf, {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `inline; filename="RAMS-${id}.pdf"`,
    },
  })
}
