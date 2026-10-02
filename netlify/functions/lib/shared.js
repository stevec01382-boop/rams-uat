import { getStore } from '@netlify/blobs'

export function ramsStore() {
  return getStore('rams-submissions')
}

export function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

export function summarize(data, id) {
  const ops = data?.signOff?.operatives || []
  return {
    id,
    clientName: data?.project?.clientName || '(untitled)',
    jobRef: data?.project?.jobRef || '',
    siteName: data?.project?.siteName || '',
    issueDate: data?.project?.issueDate || '',
    revision: data?.project?.revision || '',
    status: data?.meta?.status || 'draft',
    signedCount: ops.filter(o => o.signature).length,
    reviewerSigned: Boolean(data?.signOff?.reviewer?.signature),
    createdAt: data?.meta?.createdAt || new Date().toISOString(),
    submittedAt: new Date().toISOString(),
    // Revision lineage -- lets the Records page group every issue of "the
    // same" RAMS together and show history instead of unrelated rows.
    lineageId: data?.meta?.lineageId || id,
    previousId: data?.meta?.previousId || null,
    supersededBy: data?.meta?.supersededBy || null,
  }
}

export async function readIndex(store) {
  const idx = await store.get('index', { type: 'json' })
  return Array.isArray(idx) ? idx : []
}

export async function writeIndex(store, list) {
  await store.setJSON('index', list)
}

export function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

export async function sendRamsEmail({ recipients, message, pdfBase64, data }) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL
  if (!apiKey || !from) {
    return { emailed: false, emailError: 'RESEND_API_KEY / RESEND_FROM_EMAIL not set on this site — PDF was saved but not emailed.' }
  }
  if (!recipients || recipients.length === 0) {
    return { emailed: false, emailError: 'No recipients were specified.' }
  }

  const jobLabel = [data?.project?.clientName, data?.project?.jobRef].filter(Boolean).join(' — ') || 'Hutchi RAMS'
  const filename = `RAMS-${(data?.project?.jobRef || 'draft').replace(/\s+/g, '_')}.pdf`

  const html = `
    <p>The signed Risk Assessment &amp; Method Statement for <strong>${escapeHtml(jobLabel)}</strong> is attached.</p>
    <p><strong>Site:</strong> ${escapeHtml(data?.project?.siteName || '—')}<br/>
    <strong>Location:</strong> ${escapeHtml(data?.project?.location || '—')}<br/>
    <strong>Proposed start:</strong> ${escapeHtml(data?.project?.startDate || '—')} ${escapeHtml(data?.project?.startTime || '')}</p>
    ${message ? `<p>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>` : ''}
    <p style="color:#5B5866;font-size:12px;">Sent automatically by the Hutchi RAMS Builder.</p>
  `

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: recipients,
      subject: `RAMS — ${jobLabel}`,
      html,
      attachments: [{ filename, content: pdfBase64 }],
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    return { emailed: false, emailError: `Email provider returned ${res.status}: ${text.slice(0, 300)}` }
  }
  return { emailed: true }
}
