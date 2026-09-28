// Pure S x L risk-scoring helper, shared by the hazard editor, the RA/COSHH
// step views and the PDF generator. No data lives here -- see
// src/data/seedLibrary.js for the seed content and src/state/LibraryContext
// for the live, admin-editable copy.
export function riskBand(score) {
  if (score <= 6) return 'low'
  if (score <= 12) return 'medium'
  return 'high'
}

export const REVIEW_MONTHS_DEFAULT = 12
