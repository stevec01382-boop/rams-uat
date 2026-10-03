import { getStore } from '@netlify/blobs'

export function templateStore() {
  return getStore('rams-templates')
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
