# Hutchi RAMS Builder

An interactive, branded rebuild of the **Hutchi Master RAMS Template** as a web app: fill in a
project-specific Risk Assessment & Method Statement section by section, pick from a library of
Risk Assessments / COSHH sheets / Method Statements (or add project-specific ones), get it signed
on screen by every operative and the internal QA reviewer, then generate a branded PDF that's
emailed out and saved to a searchable record.

Sign-in is via **Microsoft Entra ID**, with two roles:

- **User** — full access to the builder, sign-off, records and PDF/email as described below.
- **Admin** — everything a User can do, plus a **Library** page to add, edit, replace and archive
  the Risk Assessment / COSHH / Method Statement entries that every RAMS is built from, with an
  attached "approved source document" per entry and a full change history (who changed what, and
  when).

Built as a static React app (Vite) plus a small set of Netlify Functions for storage, auth
verification and email — no separate backend/database to run.

## What's in here

- `src/` — the React app (multi-step form, PDF generation, signature capture, auth, admin library
  editor).
- `src/auth/` — the MSAL (Entra ID) sign-in wrapper (`AuthProvider.jsx`, `msalConfig.js`).
- `src/state/LibraryContext.jsx` — loads the live Risk Assessment / COSHH / Method Statement
  library from the backend (falling back to seed content if the backend can't be reached) and
  makes it available to every step via `useLibrary()`.
- `src/data/seedLibrary.js` — the 11 Risk Assessments, 7 COSHH sheets and 4 Method Statements
  carried over from the Master RAMS Template's index, written out in full with realistic
  UK-compliant hazard/control content (see the note at the top of that file for the regulatory
  reference points used — EH40 silica WEL, Work at Height Regs 2005, Control of Noise/Vibration at
  Work Regs 2005, etc). This is used only to **seed** the live library the first time the app runs
  on a fresh site — after that, the editable copy lives in Netlify Blobs and is managed from the
  in-app Library page, not from this file. **Have your SHEQ manager/competent person review this
  content before relying on it for live jobs** — it's a strong first draft written to match the
  template's structure, not a substitute for sign-off, exactly as the original template's own "how
  to use this appendix" notes require.
- `src/pages/AdminLibrary.jsx` — the Admin-only Library management page.
- `netlify/functions/` —
  - `submit-rams` / `list-rams` / `get-rams` / `resend-rams` — the RAMS records store and Records
    page, all requiring a signed-in User or Admin.
  - `get-library` — the live library, requiring a signed-in User or Admin.
  - `admin-save-library` / `admin-library-history` / `get-library-file` — Admin-only library
    editing, change history and attached source-document downloads.
  - `lib/auth.js` — verifies the Entra ID access token sent with every request and checks the
    caller's App Role.
  - `lib/shared.js` / `lib/library.js` — storage and email helpers.

## Local development

Without any Entra ID environment variables set, the app runs in an unauthenticated **dev mode**:
everyone gets full Admin access, and a yellow banner makes clear this isn't real access control.
This is the fastest way to work on the UI.

```bash
npm install
npm run dev        # app only, at http://localhost:5173 — storage/email calls will fail (no functions)
```

To run the Netlify Functions locally too (so Send & Save, Records and the Library editor work
end-to-end):

```bash
npm install -g netlify-cli   # if you don't have it already
netlify link                 # first time only, links this folder to your Netlify site
netlify dev                  # runs the app + functions together, with local Blobs emulation
```

To test real Entra ID sign-in locally, set the four `VITE_ENTRA_*` / `ENTRA_*` variables in a
local `.env` file (see `.env.example`) with a redirect URI of `http://localhost:8888` (the default
`netlify dev` port), and add that URI to the app registration's redirect URIs.

## Entra ID setup

Each environment (production `rams`, and the UAT site `rams-uat`) needs its **own** Entra ID app
registration — don't reuse one across sites, since redirect URIs and role assignments are
environment-specific. This mirrors the same pattern used for the Order & Stock Reserve Tool.

### 1. Create the app registration

In the [Entra admin center](https://entra.microsoft.com) → **App registrations → New
registration**:

- Name: `Hutchi RAMS` (production) or `Hutchi RAMS (UAT)`.
- Supported account types: **Accounts in this organizational directory only** (single tenant).
- Redirect URI: type **Single-page application (SPA)**, value = your Netlify site URL (e.g.
  `https://rams-uat.netlify.app` or your custom domain). You can add more than one (e.g. also
  `http://localhost:8888` for local testing).
- Note the **Application (client) ID** and **Directory (tenant) ID** from the Overview page — you'll
  need both.

### 2. Expose an API + define App Roles

Still in the app registration:

- **Expose an API** → **Add a scope**. Accept the default Application ID URI
  (`api://<client-id>`), scope name `access_as_user`, admin + user consent, and enable it.
- **App roles** → **Create app role** (twice):
  - Display name `Admin`, value `Admin`, allowed member types **Users/Groups**, description
    "Full access, including the RAMS library editor."
  - Display name `User`, value `User`, allowed member types **Users/Groups**, description
    "Standard access to the RAMS builder."
- **Authentication** → under the SPA platform, confirm **Access tokens** and **ID tokens** are
  both ticked (needed for the implicit/hybrid bits MSAL uses under the hood even with the
  redirect-based Authorization Code + PKCE flow this app uses).

### 3. Create security groups and assign roles

Rather than assigning roles to individual users one at a time, create two Entra security groups
(e.g. `RAMS-Admins` and `RAMS-Users`) and assign each group to the matching App Role:

- **Enterprise applications** → find this app (same name as the registration) → **Users and
  groups** → **Add user/group** → pick the `RAMS-Admins` group, assign role `Admin`; repeat for
  `RAMS-Users` → role `User`.
- Add people to the `RAMS-Admins` / `RAMS-Users` groups in Entra (or via Microsoft 365 group
  management) to grant/revoke access going forward — no app changes needed.
- Anyone signed in but in neither group sees a plain "access not set up yet" screen with a sign-out
  button, rather than being let into the app.

### 4. Set the environment variables

In Netlify → **Site settings → Environment variables** (see `.env.example` for the full list):

| Variable | Where it's used | Value |
|---|---|---|
| `VITE_ENTRA_TENANT_ID` | frontend build | Directory (tenant) ID |
| `VITE_ENTRA_CLIENT_ID` | frontend build | Application (client) ID |
| `VITE_ENTRA_REDIRECT_URI` | frontend build | optional — defaults to the site's own origin |
| `ENTRA_TENANT_ID` | Netlify Functions | same tenant ID as above |
| `ENTRA_CLIENT_ID` | Netlify Functions | same client ID as above |

Redeploy after setting these — Netlify only picks up env var changes on the next build.

## Deploying (GitHub → Netlify)

1. Push this folder to a new GitHub repo:
   ```bash
   git remote add origin git@github.com:<your-org>/<repo-name>.git
   git push -u origin main
   ```
   For the UAT environment, this is a **separate** repo (e.g. `rams-uat`) so it can be tested
   independently before the same changes are merged into the production `rams` repo/site.
2. In Netlify: **Add new site → Import an existing project**, pick the repo. Build command
   `npm run build`, publish directory `dist` (already set in `netlify.toml`, so Netlify should
   pick these up automatically).
3. Netlify Blobs needs no setup — it's automatically available to functions on a deployed Netlify
   site. The first request to `get-library` on a fresh site seeds the live library from
   `src/data/seedLibrary.js`; every edit after that is stored in Blobs and survives redeploys.
4. Follow **Entra ID setup** above for this site's own app registration, then set all the env vars
   listed there plus:
   - `RESEND_API_KEY` and `RESEND_FROM_EMAIL` — from [resend.com](https://resend.com). Verify a
     sending domain there first, or the "from" address won't be accepted. Without these set, the
     app still saves every RAMS to Records; it just won't email the PDF (the UI tells the user
     this rather than failing silently).
5. Redeploy after setting env vars.

## How signing works

Each operative and the QA reviewer sign directly on the device running the app — draw with a
mouse/finger or type their name (rendered as a cursive signature image). Nothing is sent
anywhere until you hit **Send & save**, at which point the finished PDF (with every signature
embedded) is generated in the browser, then uploaded once to be stored and emailed. There's no
separate remote-signing-link flow in this version — if you later want to let an off-site client
contact sign without being handed the device, that would mean adding a Netlify Function that
emails a unique link and a second, cut-down view of the sign-off step; the current data model
(everything keyed by the RAMS's `meta.id`) is already set up to support that if you want it added
later.

## Records / storage

Every RAMS sent via **Send & save** is stored in Netlify Blobs (the PDF plus the full form data)
and listed on `/records`, visible to every signed-in User and Admin, searchable by client, job
reference or site name, with a **Resend email** action per row. There's no automatic deletion — if
you need a data retention policy (the stored data includes names and signature images, so UK GDPR
applies), that's worth deciding and either enforcing manually or adding a scheduled cleanup
function for.

### Revisions

When a RAMS needs to be reissued (a scope change, an updated risk assessment, a new review date),
use **Create revision** on its row in Records instead of rebuilding it from the blank builder.
This loads every section of the previous issue — scope, RA/COSHH/method statement selections,
PPE, emergency arrangements, everything — straight back into the builder, so only what's actually
changed needs updating. The new copy gets its own id and an auto-incremented label (`Rev0` →
`Rev1` → ...), linked back to the original, and every signature is cleared, since a new issue
needs its own sign-off even when most of the content is unchanged.

Records groups every issue of the same RAMS together and shows only the latest by default, with a
collapsible history of earlier revisions underneath. Once a revision is sent, the issue it
replaces is marked as superseded rather than left as an unrelated row, and the generated PDF's
cover page records which earlier issue it supersedes for audit purposes.

If a revision was created by mistake, expand **earlier revisions** on that row and use
**Reinstate as latest** on the one that should be active again — it doesn't delete anything, it
just swaps which issue in that history is shown as the current one.

### Duplicate as new RAMS

Revisions are for reissuing the *same* job (same client, same site) with updates. For a different
situation — the same type of job carried out again for a different client, or the same client at a
different site — use **Duplicate as new RAMS** instead, available on every row in Records (both
the latest issue and any entry in its revision history).

Duplicating carries over everything that describes the *work*: scope, risk assessment and COSHH
selections, the method statement, generic practices, PPE, emergency arrangements, permits,
training and communication arrangements. It clears everything that identifies *who and where*:
client name, job reference, site name, location, start date/time, project manager details,
personnel list, and every signature (operatives, QA reviewer, client rep) — all reset ready for
fresh entry, with the revision label reset to `Rev0`.

Unlike a revision, a duplicate has **no link back to the source RAMS** — it doesn't appear in that
record's history, doesn't mark anything as superseded, and the generated PDF carries no reference
to where it came from. It's a completely independent record from the moment it's created, which is
the point: it's a new job for a new client/site, not a new issue of the old one.

## Library management (Admin)

Signed-in Admins see a **Library** link in the top bar leading to three editable libraries (Risk
Assessments, COSHH Sheets, Method Statements) plus a change history tab:

- **Add new entry** opens a structured editor matching the same fields used elsewhere in the app
  (hazard/risk/control rows for RAs, classification/health-risk/control fields for COSHH,
  step-by-step sequences for Method Statements), so entries render in the generated PDF exactly
  like the built-in library content.
- Each entry can optionally have an **approved source document** attached (e.g. the signed-off
  Safety Data Sheet or Word method statement the entry was written from) — this is stored
  alongside the entry and downloadable by any signed-in user as an audit trail, and is replaced
  (not deleted) each time a new file is attached.
- **Archive** removes an entry from the picker for new RAMS while keeping it visible — with a
  warning — on any existing RAMS that already reference it, so past submissions still render
  correctly. **Restore** brings it back into the active picker.
- Every add/edit/archive/restore is logged in **Change history** with who made the change and
  when.

## Customising

- **Branding**: colours and fonts are CSS custom properties at the top of `src/styles.css`
  (`--midnight`, `--blue`, etc, matching the Hutchi brand palette) and reused in `src/lib/pdf.js`
  for the PDF. The app currently loads Inter from Google Fonts as a stand-in for Graphik — swap
  the `@import` in `styles.css` and the `--font-heading`/`--font-body` values, and the `font:`
  reference in `pdf.js`, if you get Graphik web fonts licensed and want the PDF/UI to match exactly.
- **Library content**: once deployed, edit it in-app via the Admin **Library** page — that's the
  live source of truth. `src/data/seedLibrary.js` only matters for the very first run on a brand
  new site (or if you ever want to reset a library back to the shipped defaults by hand).
- **Form text / default wording**: `src/data/defaults.js`.
