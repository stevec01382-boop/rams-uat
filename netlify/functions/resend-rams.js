import { ramsStore, json, sendRamsEmail } from './lib/shared.js'
import { requireUser } from './lib/auth.js'

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

  const { id, recipients } = body || {}
  if (!id) return json(400, { message: 'Missing id' })

  const store = ramsStore()
  const data = await store.get(`data-${id}`, { type: 'json' })
  const pdfBuffer = await store.get(`pdf-${id}`, { type: 'arrayBuffer' })
  if (!data || !pdfBuffer) return json(404, { message: 'RAMS not found' })

  const pdfBase64 = Buffer.from(pdfBuffer).toString('base64')
  const toList = recipients && recipients.length
    ? recipients
    : (data.distribution?.recipients || '').split(',').map(s => s.trim()).filter(Boolean)

  const result = await sendRamsEmail({ recipients: toList, message: data.distribution?.message, pdfBase64, data })
  return json(result.emailed ? 200 : 502, result)
}
