// Lightweight per-step completeness check, purely to drive the rail's
// status dots and the final review checklist. Nothing here blocks
// navigation -- Steven can jump around freely, same as filling in a paper
// form out of order.

function filled(v) {
  return typeof v === 'string' ? v.trim().length > 0 : Boolean(v)
}

export function stepStatus(id, data) {
  switch (id) {
    case 'project': {
      const p = data.project
      const required = [p.jobType, p.clientName, p.jobRef, p.siteName, p.location, p.pmName, p.pmPhone, p.pmEmail]
      if (p.jobType === 'project' && p.hasPrincipalContractor) required.push(p.principalContractor)
      const okCount = required.filter(filled).length
      if (okCount === required.length) return 'done'
      if (okCount === 0) return 'empty'
      return 'warn'
    }
    case 'scope':
      return filled(data.scope.description) ? 'done' : 'empty'
    case 'riskAssessments':
      return (data.riskAssessments.selected.length + data.riskAssessments.custom.length) > 0 ? 'done' : 'warn'
    case 'coshh':
      return (data.coshh.selected.length + data.coshh.custom.length) >= 0 ? (
        (data.coshh.selected.length + data.coshh.custom.length) > 0 ? 'done' : 'warn'
      ) : 'empty'
    case 'genericPractices':
      return Object.values(data.genericPractices).every(filled) ? 'done' : 'warn'
    case 'workAtHeight':
      return Object.values(data.workAtHeight).every(filled) ? 'done' : 'warn'
    case 'plantMaterials': {
      const m = data.plantMaterials
      return filled(m.plant) && filled(m.materials) ? 'done' : 'warn'
    }
    case 'permits':
      return data.permits.required === 'no' || (filled(data.permits.type) && filled(data.permits.issuedBy)) ? 'done' : 'warn'
    case 'training':
      return filled(data.training) ? 'done' : 'warn'
    case 'ppe':
      return filled(data.ppe.taskSpecific) ? 'done' : 'warn'
    case 'emergency':
      return filled(data.emergency.firstAidKits) ? 'done' : 'warn'
    case 'communication':
      return filled(data.communication.briefing) ? 'done' : 'warn'
    case 'methodStatement':
      return (data.methodStatement.selected.length + data.methodStatement.custom.length) > 0 ? 'done' : 'warn'
    case 'signoff': {
      const ops = data.signOff.operatives
      const anySigned = ops.some(o => o.name && o.signature)
      const reviewerSigned = Boolean(data.signOff.reviewer.name && data.signOff.reviewer.signature)
      if (anySigned && reviewerSigned) return 'done'
      if (anySigned || reviewerSigned) return 'warn'
      return 'empty'
    }
    case 'review':
      return 'empty'
    default:
      return 'empty'
  }
}

export function overallReadiness(data) {
  const issues = []
  if (!data.project.clientName || !data.project.jobRef) issues.push('Project/client name and job reference are required.')
  if (!data.project.jobType) issues.push('Select whether this RAMS is for a Service call or a Project.')
  if (data.project.jobType === 'project' && data.project.hasPrincipalContractor && !(data.project.principalContractor || '').trim()) {
    issues.push('A principal contractor is ticked but no name has been entered.')
  }
  if (!data.scope.description) issues.push('Scope of works has not been described.')
  if (data.riskAssessments.selected.length + data.riskAssessments.custom.length === 0) {
    issues.push('No Risk Assessments attached -- select at least one from the library or add a custom one.')
  }
  const expired = [...data.riskAssessments.selected, ...data.riskAssessments.custom].filter(
    r => r.reviewDate && new Date(r.reviewDate) < new Date()
  )
  if (expired.length) issues.push(`${expired.length} attached Risk Assessment(s) are past their review date.`)
  const expiredCoshh = [...data.coshh.selected, ...data.coshh.custom].filter(
    r => r.reviewDate && new Date(r.reviewDate) < new Date()
  )
  if (expiredCoshh.length) issues.push(`${expiredCoshh.length} attached COSHH sheet(s) are past their review date.`)
  if (data.methodStatement.selected.length + data.methodStatement.custom.length === 0) {
    issues.push('No Method Statement selected for the activities being carried out.')
  }
  const signedOperatives = data.signOff.operatives.filter(o => o.name && o.signature)
  if (signedOperatives.length === 0) issues.push('No operatives have signed the document yet.')
  if (!data.signOff.reviewer.signature) issues.push('Internal QA reviewer has not signed off.')
  return issues
}
