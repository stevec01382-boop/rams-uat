import { getStore } from '@netlify/blobs'
import { RISK_ASSESSMENTS as SEED_RA, COSHH_SHEETS as SEED_COSHH, METHOD_STATEMENTS as SEED_MS } from '../../../src/data/seedLibrary.js'

const KEYS = {
  ra: 'library-risk-assessments',
  coshh: 'library-coshh',
  ms: 'library-method-statements',
}

const SEEDS = {
  ra: SEED_RA,
  coshh: SEED_COSHH,
  ms: SEED_MS,
}

export function libraryStore() {
  return getStore('rams-library')
}

function seedEntry(item) {
  return { ...item, archived: false, updatedAt: null, updatedBy: null, sourceFile: null }
}

// Reads one of the three library lists, seeding it from src/data/seedLibrary.js
// the first time this site is ever asked for it. From then on the Blobs
// copy is the source of truth -- redeploying the app never overwrites it.
export async function readLibraryList(store, kind) {
  const key = KEYS[kind]
  if (!key) throw new Error(`Unknown library kind: ${kind}`)
  const existing = await store.get(key, { type: 'json' })
  if (Array.isArray(existing)) return existing
  const seeded = SEEDS[kind].map(seedEntry)
  await store.setJSON(key, seeded)
  return seeded
}

export async function writeLibraryList(store, kind, list) {
  const key = KEYS[kind]
  if (!key) throw new Error(`Unknown library kind: ${kind}`)
  await store.setJSON(key, list)
}

export async function readAllLibraries(store) {
  const [riskAssessments, coshhSheets, methodStatements] = await Promise.all([
    readLibraryList(store, 'ra'),
    readLibraryList(store, 'coshh'),
    readLibraryList(store, 'ms'),
  ])
  return { riskAssessments, coshhSheets, methodStatements }
}

export async function appendHistory(store, entry) {
  const list = (await store.get('library-history', { type: 'json' })) || []
  list.unshift({ ...entry, at: new Date().toISOString() })
  await store.setJSON('library-history', list.slice(0, 500))
}

export async function readHistory(store) {
  const list = await store.get('library-history', { type: 'json' })
  return Array.isArray(list) ? list : []
}

export function sourceFileKey(kind, ref, filename) {
  const safeName = String(filename || 'file').replace(/[^a-zA-Z0-9._-]/g, '_')
  return `library-file-${kind}-${ref}-${Date.now()}-${safeName}`
}
