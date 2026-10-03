import { STEPS } from './steps.js'

// A template only covers "what the job is" -- it has no project/client
// details and nothing to sign, so it skips the project and sign-off/review
// steps and walks through the rest of the same sections a real RAMS does.
export const TEMPLATE_STEPS = STEPS.filter(s => !['project', 'signoff', 'review'].includes(s.id))
