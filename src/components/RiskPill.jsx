import React from 'react'
import { riskBand } from '../lib/riskBand.js'

export function scoreOf(s, l) { return Number(s || 0) * Number(l || 0) }

export default function RiskPill({ s, l }) {
  const score = scoreOf(s, l)
  const band = riskBand(score)
  const cls = band === 'low' ? 'risk-low' : band === 'medium' ? 'risk-med' : 'risk-high'
  return <span className={`pill ${cls}`}>{score} · {band.toUpperCase()}</span>
}
