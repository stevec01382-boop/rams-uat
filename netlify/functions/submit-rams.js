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

    const previousId = finalData.meta?.previousId

    // If this is a new revision of an earlier RAMS, mark that earlier one as
    // superseded -- both in its own stored record (so get-rams-data still
    // shows the full lineage) and in the index summary (so Records can hide
    // it from the default view and show it under "revision history" instead).
    if (previousId) {
      const prevData = await store.get(`data-${previousId}`, { type: 'json' })
      if (prevData) {
        await store.setJSON(`data-${previousId}`, { ...prevData, meta: { ...prevData.meta, supersededBy: id } })
      }
    }

    const list = await readIndex(store)
    const summary = summarize(finalData, id)
    let next = list.filter(r => r.id !== id)
    if (previousId) {
      next = next.map(r => (r.id === previousId ? { ...r, supersededBy: id } : r))
    }
    next.unshift(summary)
    await writeIndex(store, next)

    const emailResult = await sendRamsEmail({ recipients, message, pdfBase64, data })

    return json(200, { id, saved: true, ...emailResult })
  } catch (e) {
    return json(500, { message: 'Failed to save/send RAMS: ' + (e?.message || String(e)) })
  }
}
