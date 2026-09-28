import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import { HUTCHI_LOGO_PNG } from '../assets/logoBase64.js'
import { riskBand } from './riskBand.js'
import { PPE_STANDARDS } from '../data/defaults.js'

// pdfmake's vfs_fonts.js has changed its export shape across versions --
// handle all of them defensively so a dependency bump doesn't silently
// break PDF generation.
const vfs = pdfFonts?.pdfMake?.vfs || pdfFonts?.vfs || pdfFonts
if (vfs) pdfMake.vfs = vfs

const BLUE = '#3777FF'
const MIDNIGHT = '#140D1C'
const MUTED = '#5B5866'
const BORDER = '#E1E3EC'
const GREEN = '#1f6d54'
const YELLOW = '#6b6300'
const RED = '#b7341f'

function fmtDate(d) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('en-GB')
  } catch {
    return d
  }
}
function fmtDateTime(d) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleString('en-GB')
  } catch {
    return d
  }
}

function bandColor(score) {
  const b = riskBand(score)
  if (b === 'low') return GREEN
  if (b === 'medium') return YELLOW
  return RED
}

function rule() {
  return { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: BORDER }], margin: [0, 4, 0, 12] }
}

function h1(numberLabel, title) {
  return {
    stack: [
      { text: [numberLabel ? { text: numberLabel + '  ', color: BLUE } : '', title], style: 'h1' },
      rule(),
    ],
    margin: [0, 18, 0, 0],
  }
}

function h2(title) {
  return { text: title, style: 'h2', margin: [0, 10, 0, 6] }
}

function kv(rows, widths) {
  return {
    table: {
      widths: widths || ['35%', '65%'],
      body: rows.map(([k, v]) => [{ text: k, style: 'kvKey' }, { text: v || '—', style: 'kvVal' }]),
    },
    layout: 'lightHorizontalLines',
    margin: [0, 0, 0, 10],
  }
}

function bodyPara(text) {
  return { text: text || '—', style: 'body', margin: [0, 0, 0, 10] }
}

function riskCell(s, l) {
  const score = Number(s || 0) * Number(l || 0)
  return { text: `${s}×${l}=${score}\n${riskBand(score).toUpperCase()}`, color: bandColor(score), bold: true, alignment: 'center', fontSize: 8 }
}

function hazardTable(hazards) {
  return {
    table: {
      headerRows: 1,
      widths: ['16%', '16%', '10%', '32%', '10%', '16%'],
      body: [
        [
          { text: 'Hazard', style: 'th' }, { text: 'Risk', style: 'th' }, { text: 'Initial S×L', style: 'th' },
          { text: 'Control measures', style: 'th' }, { text: 'Residual S×L', style: 'th' }, { text: 'Notes', style: 'th' },
        ],
        ...hazards.map(h => [
          { text: h.hazard || '—', style: 'td' },
          { text: h.risk || '—', style: 'td' },
          riskCell(h.s, h.l),
          { text: h.control || '—', style: 'td' },
          riskCell(h.rs, h.rl),
          { text: h.notes || '—', style: 'td' },
        ]),
      ],
    },
    layout: 'lightHorizontalLines',
    margin: [0, 4, 0, 14],
  }
}

function signatureBlock(person, roleLabel) {
  const sig = person.signature
  return {
    columns: [
      { width: '35%', text: [{ text: roleLabel + '\n', style: 'kvKey' }, { text: person.name || '—', style: 'body' }] },
      { width: '35%', stack: sig ? [{ image: sig.dataUrl, width: 140 }] : [{ text: 'Not signed', italics: true, color: MUTED }] },
      { width: '30%', text: [{ text: 'Date signed\n', style: 'kvKey' }, { text: sig ? fmtDateTime(sig.capturedAt) : '—', style: 'body' }] },
    ],
    margin: [0, 6, 0, 10],
  }
}

export function buildDocDefinition(data, library) {
  const { project, scope, riskAssessments, coshh, genericPractices, workAtHeight, plantMaterials, permits, training, ppe, emergency, communication, methodStatement, signOff } = data
  const findRA = ref => library?.riskAssessments?.find(r => r.ref === ref)
  const findCOSHH = ref => library?.coshhSheets?.find(r => r.ref === ref)
  const findMS = ref => library?.methodStatements?.find(r => r.ref === ref)

  const allRA = [
    ...riskAssessments.selected.map(s => ({ ...findRA(s.ref), reviewDate: s.reviewDate })),
    ...riskAssessments.custom,
  ].filter(Boolean)

  const allCoshh = [
    ...coshh.selected.map(s => ({ ...findCOSHH(s.ref), reviewDate: s.reviewDate })),
    ...coshh.custom,
  ].filter(Boolean)

  const allMS = [
    ...methodStatement.selected.map(ref => findMS(ref)),
    ...methodStatement.custom,
  ].filter(Boolean)

  const content = []

  // ---- Cover / header band ----
  content.push({
    table: {
      widths: ['*'],
      body: [[{
        stack: [
          { columns: [{ image: HUTCHI_LOGO_PNG, width: 46 }, {
            width: '*',
            stack: [
              { text: 'RISK ASSESSMENT & METHOD STATEMENT', style: 'coverTitle' },
              { text: 'Hutchi UK — By Hutchison Technologies', style: 'coverSub' },
            ],
            margin: [12, 2, 0, 0],
          }] },
        ],
        fillColor: MIDNIGHT,
        margin: [16, 16, 16, 16],
      }]],
    },
    layout: { hLineWidth: () => 0, vLineWidth: () => 0, paddingLeft: () => 0, paddingRight: () => 0, paddingTop: () => 0, paddingBottom: () => 0 },
    margin: [0, 0, 0, 4],
  })

  content.push({
    text: 'Hutchi UK is a trading name of Hutchison Technologies Ltd, registered in Scotland No. SC176095. Registered office: Innovation Centre, 1 Harrison Road, Dundee, DD2 3SN.',
    style: 'small',
    margin: [0, 0, 0, 14],
  })

  content.push(kv([
    ['Client / Project', project.clientName],
    ['Job Reference', project.jobRef],
    ['Revision', project.revision],
    ['Issue Date', fmtDate(project.issueDate)],
    ['Client / Site Name', project.siteName],
    ['Exact Location', project.location],
    ['Proposed Start', `${fmtDate(project.startDate)} ${project.startTime || ''}`.trim()],
    ['Project Manager', `${project.pmName || '—'}  |  ${project.pmPhone || '—'}  |  ${project.pmEmail || '—'}`],
  ]))

  content.push(h2('Personnel Named on This Job'))
  content.push({
    table: {
      headerRows: 1,
      widths: ['10%', '45%', '45%'],
      body: [
        [{ text: 'No.', style: 'th' }, { text: 'Name', style: 'th' }, { text: 'Role / Competency', style: 'th' }],
        ...project.personnel.map((p, i) => [String(i + 1), p.name || '—', p.role || '—']),
      ],
    },
    layout: 'lightHorizontalLines',
    margin: [0, 4, 0, 10],
  })
  content.push(kv([
    ['Internal QA Reviewer', project.qaReviewerName],
    ['QA Review Date', fmtDate(project.qaReviewDate)],
  ]))

  // ---- 1.0 Scope ----
  content.push(h1('1.0', 'Scope of Works'))
  content.push(bodyPara(scope.description))

  // ---- 2.0 Risk Assessments ----
  content.push(h1('2.0', 'Risk Assessments Attached'))
  content.push({
    table: {
      headerRows: 1,
      widths: ['14%', '46%', '20%', '20%'],
      body: [
        [{ text: 'RA Ref', style: 'th' }, { text: 'Title', style: 'th' }, { text: 'Review Due', style: 'th' }, { text: 'Status', style: 'th' }],
        ...allRA.map(r => {
          const expired = r.reviewDate && new Date(r.reviewDate) < new Date()
          return [r.ref, r.title, fmtDate(r.reviewDate), { text: expired ? 'EXPIRED — REASSESS' : 'Current', color: expired ? RED : GREEN, bold: true }]
        }),
      ],
    },
    layout: 'lightHorizontalLines',
    margin: [0, 4, 0, 12],
  })
  allRA.forEach(r => {
    content.push(h2(`${r.ref} — ${r.title}`))
    content.push({ text: `Persons affected: ${(r.personsAffected || []).join(', ') || '—'}`, style: 'small', margin: [0, 0, 0, 4] })
    content.push(hazardTable(r.hazards))
  })

  // ---- 2.1 COSHH ----
  content.push(h1('2.1', 'COSHH Risk Assessments Attached'))
  content.push({
    table: {
      headerRows: 1,
      widths: ['14%', '46%', '20%', '20%'],
      body: [
        [{ text: 'Ref', style: 'th' }, { text: 'Product', style: 'th' }, { text: 'Review Due', style: 'th' }, { text: 'Status', style: 'th' }],
        ...allCoshh.map(r => {
          const expired = r.reviewDate && new Date(r.reviewDate) < new Date()
          return [r.ref, r.product, fmtDate(r.reviewDate), { text: expired ? 'EXPIRED — REASSESS' : 'Current', color: expired ? RED : GREEN, bold: true }]
        }),
      ],
    },
    layout: 'lightHorizontalLines',
    margin: [0, 4, 0, 12],
  })
  allCoshh.forEach(r => {
    content.push(h2(`${r.ref} — ${r.product}`))
    content.push(kv([
      ['Manufacturer', r.manufacturer],
      ['Classification', (r.classifications || []).join(', ')],
      ['Activity / process', r.activity],
      ['Persons at risk', (r.personsAtRisk || []).join(', ')],
      ['Health risks', r.healthRisks],
      ['Controls / PPE / first aid', r.controls],
      ['First aid', r.firstAid],
      ['Storage', r.storage],
      ['Disposal', r.disposal],
    ], ['30%', '70%']))
  })

  // ---- 2.2-2.6 Generic Practices ----
  content.push(h1('2.2-2.6', 'Generic Working Practices'))
  content.push(h2('2.2 Manual Handling')); content.push(bodyPara(genericPractices.manualHandling))
  content.push(h2('2.3 Hand-Arm Vibration')); content.push(bodyPara(genericPractices.havs))
  content.push(h2('2.4 Noise')); content.push(bodyPara(genericPractices.noise))
  content.push(h2('2.5 Radiation / Lasers')); content.push(bodyPara(genericPractices.radiation))
  content.push(h2('2.6 Access / Egress')); content.push(bodyPara(genericPractices.accessEgress))

  // ---- 3.0-3.1 Work at Height ----
  content.push(h1('3.0-3.1', 'Work at Height, Plant & Site Controls'))
  content.push(h2('3.0 Work at Height')); content.push(bodyPara(workAtHeight.hierarchy))
  content.push(h2('3.1 Falling Objects Prevention')); content.push(bodyPara(workAtHeight.fallingObjects))

  // ---- 4.0-4.5 ----
  content.push(h2('4.0 Plant / Equipment / Tools')); content.push(bodyPara(plantMaterials.plant))
  content.push(h2('4.1 Materials')); content.push(bodyPara(plantMaterials.materials))
  content.push(h2('4.2 Technical Information')); content.push(bodyPara(plantMaterials.technicalInfo))
  content.push(h2('4.3 Waste Removal')); content.push(bodyPara(plantMaterials.waste))
  content.push(h2('4.4 Housekeeping and Storage')); content.push(bodyPara(plantMaterials.housekeeping))
  content.push(h2('4.5 Prevention of Leaks and Spills')); content.push(bodyPara(plantMaterials.spills))

  // ---- 5.0 Permits ----
  content.push(h1('5.0', 'Permits & Training'))
  content.push(h2('5.0 Permits Required'))
  content.push(kv([
    ['Permit required?', permits.required === 'yes' ? 'Yes' : 'No'],
    ['Type', permits.type || '—'],
    ['Issued by', permits.issuedBy || '—'],
  ]))
  content.push(bodyPara(permits.note))

  // ---- 6.0 Training ----
  content.push(h2('6.0 Training'))
  content.push(bodyPara(training))

  // ---- 7.0 PPE ----
  content.push(h1('7.0', 'Personal Protective Equipment (PPE)'))
  content.push(bodyPara(ppe.taskSpecific))
  const ppeList = (title, items) => { content.push(h2(title)); content.push({ ul: items, style: 'body', margin: [0, 0, 0, 8] }) }
  ppeList('7.1.1 Hand Protection', PPE_STANDARDS.hand)
  ppeList('7.1.2 Ear Protection', PPE_STANDARDS.ear)
  ppeList('7.1.3 RPE', PPE_STANDARDS.rpe)
  ppeList('7.1.4 Safety Helmets', PPE_STANDARDS.helmet)
  ppeList('7.1.5 Foot Protection', PPE_STANDARDS.foot)
  ppeList('7.1.6 Eye Protection', PPE_STANDARDS.eye)
  ppeList('7.1.7 Harness and Lanyard', PPE_STANDARDS.harness)

  // ---- 8.0 Emergency ----
  content.push(h1('8.0', 'Emergency Arrangements'))
  content.push(kv([
    ['First Aid Kits', emergency.firstAidKits],
    ['Confined Space', emergency.confinedSpace],
    ['Falls from Height', emergency.fallsFromHeight],
    ['Isolated Work Areas', emergency.isolatedWorkAreas],
  ], ['32%', '68%']))
  if (emergency.mewpApplicable) {
    content.push(h2('8.1 Rescue from MEWP')); content.push(bodyPara(emergency.mewpRescue))
  }
  content.push(h2('8.2 Accident Reporting')); content.push(bodyPara(emergency.accidentReporting))
  content.push(h2('8.3 First Aid on Site')); content.push(bodyPara(emergency.firstAidOnSite))
  content.push(h2('8.4 Pedestrian / Traffic Route Arrangements')); content.push(bodyPara(emergency.pedestrianTraffic))
  content.push(h2('8.5 Fire Safety Arrangements')); content.push(bodyPara(emergency.fireSafety))
  content.push(h2('8.6 Task Lighting')); content.push(bodyPara(emergency.taskLighting))

  // ---- 9.0 Communication ----
  content.push(h1('9.0', 'Communication, Monitoring & Review'))
  content.push(h2('9.0 Communicating to the Operatives')); content.push(bodyPara(communication.briefing))
  content.push(h2('9.1 Persons Responsible for Monitoring')); content.push(bodyPara(communication.monitoring))
  content.push(h2('9.2 Review Dates')); content.push(bodyPara(communication.reviewDates))
  content.push(h2('9.3 Amendments Authorised By & Communicated To')); content.push(bodyPara(communication.amendments))

  // ---- 11.0 Method Statement ----
  content.push(h1('11.0', 'Method Statement / Sequence of Operations'))
  allMS.forEach(m => {
    content.push(h2(`${m.ref} — ${m.activity}`))
    content.push({ ol: m.steps, style: 'body', margin: [0, 0, 0, 6] })
    const refs = [
      m.relatedRA?.length ? `RA: ${m.relatedRA.join(', ')}` : '',
      m.relatedCOSHH?.length ? `COSHH: ${m.relatedCOSHH.join(', ')}` : '',
    ].filter(Boolean).join('  |  ')
    if (refs) content.push({ text: refs, style: 'small', margin: [0, 0, 0, 10] })
  })
  if (methodStatement.sequenceNotes) {
    content.push(h2('Additional notes')); content.push(bodyPara(methodStatement.sequenceNotes))
  }

  // ---- Sign-off ----
  content.push(h1('', 'Sign-off'))
  content.push({ text: 'Operatives’ confirmation that they have read, understood and will comply with the details outlined in this RAMS.', style: 'small', margin: [0, 0, 0, 8] })
  signOff.operatives.filter(o => o.name).forEach(o => content.push(signatureBlock(o, 'Operative')))
  content.push(signatureBlock(signOff.reviewer, 'Internal QA Reviewer'))
  if (signOff.clientRep.enabled && signOff.clientRep.name) {
    content.push(signatureBlock(signOff.clientRep, 'Client Representative'))
  }

  return {
    pageMargins: [40, 40, 40, 50],
    footer: (currentPage, pageCount) => ({
      columns: [
        { text: `${project.clientName || 'Hutchi UK'} — ${project.jobRef || ''}`, style: 'footer', margin: [40, 0, 0, 0] },
        { text: `Page ${currentPage} of ${pageCount}`, style: 'footer', alignment: 'right', margin: [0, 0, 40, 0] },
      ],
    }),
    content,
    styles: {
      coverTitle: { fontSize: 16, bold: true, color: '#FFFFFF' },
      coverSub: { fontSize: 9, color: '#C9C6E0', margin: [0, 2, 0, 0] },
      h1: { fontSize: 14, bold: true, color: MIDNIGHT },
      h2: { fontSize: 11.5, bold: true, color: BLUE },
      kvKey: { fontSize: 9, bold: true, color: MUTED },
      kvVal: { fontSize: 9.5, color: MIDNIGHT },
      body: { fontSize: 9.5, color: MIDNIGHT, lineHeight: 1.25 },
      small: { fontSize: 8, color: MUTED },
      th: { fontSize: 8.5, bold: true, color: '#FFFFFF', fillColor: MIDNIGHT },
      td: { fontSize: 8.5, color: MIDNIGHT },
      footer: { fontSize: 7.5, color: MUTED },
    },
    defaultStyle: { font: 'Roboto' },
  }
}

export function createPdf(data, library) {
  return pdfMake.createPdf(buildDocDefinition(data, library))
}

export function downloadPdf(data, library, filename) {
  createPdf(data, library).download(filename || 'RAMS.pdf')
}

export function getPdfBase64(data, library) {
  return new Promise((resolve, reject) => {
    try {
      createPdf(data, library).getBase64((base64) => resolve(base64))
    } catch (e) {
      reject(e)
    }
  })
}
