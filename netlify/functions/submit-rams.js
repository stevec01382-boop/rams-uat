import { ramsStore, json, summarize, readIndex, writeIndex, sendRamsEmail } from './lib/shared.js'
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

  const { data, pdfBase64, recipients, message } = body || {}
  if (!data || !pdfBase64) return json(400, { message: 'Missing data or pdfBase64' })

  const id = data?.meta?.id || `rams-${Date.now()}`
  const store = ramsStore()

  try {
    const pdfBuffer = Buffer.from(pdfBase64, 'base64')
    await store.set(`pdf-${id}`, pdfBuffer, { metadata: { contentType: 'application/pdf' } })

    const finalData = {
      ...data,
      meta: { ...data.meta, id, status: 'completed', submittedBy: { name: auth.name, email: auth.email } },
      distribution: { ...data.distribution, recipients: (recipients || []).join(', ') },
    }
    await store.setJSON(`data-${id}`, finalData)

    const list = await readIndex(store)
    const summary = summarize(finalData, id)
    const filtered = list.filter(r => r.id !== id)
    filtered.unshift(summary)
    await writeIndex(store, filtered)

    const emailResult = await sendRamsEmail({ recipients, message, pdfBase64, data })

    return json(200, { id, saved: true, ...emailResult })
  } catch (e) {
    return json(500, { message: 'Failed to save/send RAMS: ' + (e?.message || String(e)) })
  }
}
