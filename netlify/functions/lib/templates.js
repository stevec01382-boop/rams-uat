import { getStore } from '@netlify/blobs'

// Strong consistency: Netlify Blobs reads are "eventually consistent" by
// default, meaning a read within ~60 seconds of a write can return the
// previous copy. This app reads a list, changes it and writes it back, and
// refreshes straight after saving, so stale reads made newly saved entries
// seem to vanish (and could let a second save overwrite the first).
export function templateStore() {
  return getStore({ name: 'rams-templates', consistency: 'strong' })
}

export async function readTemplateIndex(store) {
  const idx = await store.get('index', { type: 'json' })
  return Array.isArray(idx) ? idx : []
}

export async function writeTemplateIndex(store, list) {
  await store.setJSON('index', list)
}

export function summarizeTemplate(t) {
  return {
    id: t.id,
    name: t.name,
    description: t.description || '',
    updatedAt: t.updatedAt,
    updatedBy: t.updatedBy || null,
  }
}
