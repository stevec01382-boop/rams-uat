// Hutchi Master RAMS - seed content for the Risk Assessment / COSHH /
// Method Statement libraries.
//
// This file is used ONLY to seed the Netlify Blobs-backed library the
// first time the app runs on a fresh site (see netlify/functions/lib/
// library.js) -- from that point on, the live/editable copy lives in
// Blobs and admins manage it from the in-app Library page, not here.
// Re-deploying the app does not overwrite what's in Blobs.
//
// Content is realistic, UK-compliant starting content written to match the
// index in the Hutchi Master RAMS Template (RA refs, COSHH refs and MS refs
// below are carried over unchanged from that template so this library slots
// straight into the existing numbering scheme). It reflects current UK
// regulatory reference points as of 2026, including:
//   - Management of Health and Safety at Work Regulations 1999 (reg 3)
//   - CDM 2015 (reg 12, construction phase plan)
//   - Work at Height Regulations 2005
//   - COSHH 2002 (as amended) and HSE EH40 workplace exposure limits --
//     respirable crystalline silica (RCS) WEL 0.1 mg/m3 (8-hr TWA), one of
//     the most stringent WELs in EH40 -- FFP3 (or better) RPE plus on-tool
//     extraction/water suppression as the primary control for any dust-
//     generating cutting, drilling or chasing work
//   - Control of Noise at Work Regulations 2005 (lower/upper exposure
//     action values 80/85 dB LEP,d)
//   - Control of Vibration at Work Regulations 2005 (HAVS exposure action
//     value 2.5 m/s^2 A(8))
//   - Manual Handling Operations Regulations 1992 (as amended)
//   - PUWER 1998 and LOLER 1998
//   - Electricity at Work Regulations 1989
//   - RIDDOR 2013 reporting
//
// Treat this as a strong first draft, not a substitute for sign-off by a
// competent person / SHEQ manager before live use -- exactly as the
// original template's "How to use this appendix" notes require.

// ---------------------------------------------------------------------------
// Appendix A -- Risk Assessment Library
// ---------------------------------------------------------------------------
export const RISK_ASSESSMENTS = [
  {
    ref: 'RA02',
    title: 'Working in Occupied Areas',
    personsAffected: ['Employees', 'Contractors', 'Client Employees', 'Public'],
    hazards: [
      {
        hazard: 'Members of the public / club members / other trades in close proximity to the work area',
        risk: 'Collision, trip, or injury to a third party; disruption to a live, trading venue',
        s: 3, l: 3,
        control: 'Work area physically cordoned off with barriers/signage before starting. Where full segregation is not possible (e.g. gym floor, reception), works are scheduled outside opening hours or coordinated with venue duty manager. Tools and leads never left unattended in a walkway.',
        rs: 3, rl: 1,
        notes: 'Coordinate access windows with the David Lloyd / Aspria club duty manager in advance.'
      },
      {
        hazard: 'Trailing cables/leads across occupied floor space',
        risk: 'Trip hazard to members, staff or other contractors',
        s: 2, l: 3,
        control: 'Cable protectors / matting used across any pedestrian route; cables run at high level or behind barriers wherever practicable; area re-inspected at end of each session.',
        rs: 2, rl: 1,
      },
      {
        hazard: 'Noise/dust disturbance to a trading club environment',
        risk: 'Nuisance to members; complaint escalation affecting client relationship',
        s: 1, l: 3,
        control: 'Noisy/dusty activities (drilling, chasing) scheduled for low-occupancy periods and agreed in advance with the client; dust screens used around the work area.',
        rs: 1, rl: 1,
      },
    ],
  },
  {
    ref: 'RA03',
    title: 'Manual Handling',
    personsAffected: ['Employees', 'Contractors'],
    hazards: [
      {
        hazard: 'Lifting/carrying cable drums, containment, cabinets, AV equipment and tool bags',
        risk: 'Musculoskeletal injury (back, shoulder) from lifting, twisting or repetitive handling',
        s: 3, l: 3,
        control: 'TILE (Task, Individual, Load, Environment) assessment carried out before any lift. Mechanical aids (sack trucks, trolleys) used wherever possible. Team lifts for items over single-person safe limits. Manual handling training refreshed per company schedule (in accordance with the Manual Handling Operations Regulations 1992, as amended).',
        rs: 3, rl: 1,
      },
      {
        hazard: 'Awkward postures in ceiling voids / risers / under-floor spaces',
        risk: 'Strain injury from sustained or repeated poor posture',
        s: 2, l: 3,
        control: 'Task rotation between operatives; regular breaks; materials pre-positioned close to point of use to minimise carry distance.',
        rs: 2, rl: 2,
      },
    ],
  },
  {
    ref: 'RA04',
    title: 'Pulling Cable',
    personsAffected: ['Employees', 'Contractors'],
    hazards: [
      {
        hazard: 'Working at height to feed/pull cable through ceiling voids, risers and containment',
        risk: 'Fall from height; falling tools/materials onto persons below',
        s: 4, l: 2,
        control: 'Access equipment selected per the site Work at Height hierarchy (see RA/Section 3.0 general access scaffold > tower > podium > stepladder). Exclusion zone maintained below the work area. Tools tethered where working above 2m.',
        rs: 4, rl: 1,
      },
      {
        hazard: 'Manual handling of cable drums and pulling tension',
        risk: 'Musculoskeletal injury; cable snap-back',
        s: 2, l: 3,
        control: 'Cable pulled by hand in a controlled, communicated sequence (not machine-winched unless a specific lift plan is in place); gloves worn; second operative positioned to call stop if resistance is felt.',
        rs: 2, rl: 1,
      },
      {
        hazard: 'Entanglement / other trades working in the same void or riser',
        risk: 'Struck by cable under tension; conflict with other trades\' works',
        s: 2, l: 2,
        control: 'Void/riser access coordinated with principal contractor before entry; permit or sign-in system used where the site operates one.',
        rs: 2, rl: 1,
      },
    ],
  },
  {
    ref: 'RA06',
    title: 'Soldering',
    personsAffected: ['Employees', 'Contractors'],
    hazards: [
      {
        hazard: 'Contact with soldering iron tip (typically 300-400C)',
        risk: 'Burns to skin',
        s: 2, l: 3,
        control: 'Iron holstered in a stand when not in hand; iron switched off/unplugged when unattended; work area kept clear of flammable materials.',
        rs: 2, rl: 1,
      },
      {
        hazard: 'Inhalation of rosin-based flux fume',
        risk: 'Respiratory/eye irritation; occupational asthma with prolonged exposure',
        s: 2, l: 2,
        control: 'Local extraction (fume arm) used where soldering is repeated/prolonged; otherwise well-ventilated work area. See COSHH Ref09 (99SC Lead-Free Solder).',
        rs: 2, rl: 1,
      },
      {
        hazard: 'Fire from hot iron / solder splash',
        risk: 'Minor fire; burns',
        s: 2, l: 1,
        control: 'Heatproof mat used under iron; no soldering near flammable materials or in atmospheres where flammable vapours may be present.',
        rs: 2, rl: 1,
      },
    ],
  },
  {
    ref: 'RA07',
    title: 'Step Ladders / Ladders',
    personsAffected: ['Employees', 'Contractors'],
    hazards: [
      {
        hazard: 'Fall from a ladder/stepladder',
        risk: 'Fall from height resulting in injury',
        s: 4, l: 2,
        control: 'Used only for low-risk, short-duration tasks in line with the Work at Height Regulations 2005 hierarchy (see Section 3.0) -- scaffold/tower/podium preferred where practicable. Three points of contact maintained at all times. Pre-use visual check of the ladder each time (feet, stiles, locking mechanism). Only Class EN131 (professional/industrial) or equivalent ladders used.',
        rs: 4, rl: 1,
      },
      {
        hazard: 'Falling objects while working above others',
        risk: 'Injury to persons below',
        s: 3, l: 2,
        control: 'Tools carried in a pouch/holster, not pockets; exclusion zone at the base of the ladder; small items not left on top of steps.',
        rs: 3, rl: 1,
      },
      {
        hazard: 'Proximity to live electrical parts / overhead services while positioning a ladder',
        risk: 'Electric shock/arc flash',
        s: 4, l: 1,
        control: 'Area surveyed before positioning; non-conductive (fibreglass) ladder used near any electrical hazard; isolation confirmed where working near exposed live parts.',
        rs: 4, rl: 1,
      },
      {
        hazard: 'Uneven ground / wet weather (external use)',
        risk: 'Ladder instability, slip',
        s: 3, l: 2,
        control: 'Ladder only used on firm, level ground with feet secured; external use suspended in high wind/wet conditions; levelling accessories used where the ground is uneven.',
        rs: 3, rl: 1,
      },
    ],
  },
  {
    ref: 'RA08',
    title: 'Use of Hand Tools',
    personsAffected: ['Employees', 'Contractors'],
    hazards: [
      {
        hazard: 'Cuts/bodily injury from screwdrivers, cutters, crimpers, knives',
        risk: 'Laceration, puncture wound',
        s: 2, l: 3,
        control: 'Correct tool used for the task (no improvised tools); cutting tools directed away from the body; retractable-blade knives used for cable stripping where practicable; tools inspected before use and any damaged tool taken out of service.',
        rs: 2, rl: 1,
      },
      {
        hazard: 'Eye injury from swarf, sprung fixings or cable off-cuts',
        risk: 'Eye injury',
        s: 3, l: 2,
        control: 'Safety eyewear worn per Section 7.1.6 for any task with a projectile risk.',
        rs: 3, rl: 1,
      },
      {
        hazard: 'Dropped tools while working above ground level',
        risk: 'Injury to persons below',
        s: 3, l: 2,
        control: 'Tools tethered or holstered when working at height; drop zone maintained; hand tools stored in a closed bag when not in use.',
        rs: 3, rl: 1,
      },
    ],
  },
  {
    ref: 'RA10',
    title: 'Noise, Dust & Vibration',
    personsAffected: ['Employees', 'Contractors', 'Public'],
    hazards: [
      {
        hazard: 'Noise from drills, cut saws and other powered tools',
        risk: 'Noise-induced hearing loss',
        s: 3, l: 3,
        control: 'Hearing protection (min. SNR 35 dB, EN352-2) issued and worn above the lower exposure action value (80 dB LEP,d) per the Control of Noise at Work Regulations 2005; noisy tools used in short bursts; low-noise tooling specified where available.',
        rs: 3, rl: 1,
      },
      {
        hazard: 'Hand-Arm Vibration (HAVS) from powered hand tools',
        risk: 'Vibration white finger, HAVS, carpal tunnel syndrome',
        s: 3, l: 2,
        control: 'Low-vibration tools specified (bought or hired); exposure kept below the HAVS exposure action value of 2.5 m/s^2 A(8) per the Control of Vibration at Work Regulations 2005 through job rotation and limited trigger time; tool manufacturer vibration data checked before extended use.',
        rs: 3, rl: 1,
      },
      {
        hazard: 'Respirable Crystalline Silica (RCS) and other construction dust from drilling/chasing masonry, concrete or tile',
        risk: 'Silicosis and other respiratory disease from dust inhalation',
        s: 4, l: 3,
        control: 'Hierarchy of control applied: on-tool extraction or water suppression as the primary control (visible dust is treated as exceeding the RCS workplace exposure limit of 0.1 mg/m3 8-hr TWA per HSE EH40); minimum FFP3 (or better) RPE where extraction/suppression alone cannot control exposure; RPE face-fit tested to the wearer per HSG53.',
        rs: 4, rl: 1,
        notes: 'See also COSHH library for specific dust-generating products/materials on this project.'
      },
    ],
  },
  {
    ref: 'RA13',
    title: 'Slips / Trips & Falls -- Good Housekeeping',
    personsAffected: ['Employees', 'Contractors', 'Client Employees', 'Public'],
    hazards: [
      {
        hazard: 'Trailing cables, tools, off-cuts and packaging left in walkways',
        risk: 'Slip, trip or fall on the level',
        s: 2, l: 3,
        control: 'Work area kept tidy throughout the shift, not just at the end; waste bagged/binned as it is generated; cables run tidily and protected on pedestrian routes; spot-check by supervisor.',
        rs: 2, rl: 1,
      },
      {
        hazard: 'Spillages (water, adhesive, lubricant)',
        risk: 'Slip on a contaminated surface',
        s: 2, l: 2,
        control: 'Spill kit available; spillages cleared and, where necessary, cordoned/signed immediately. See COSHH sheets for spillage procedure for specific products.',
        rs: 2, rl: 1,
      },
    ],
  },
  {
    ref: 'RA20',
    title: 'Electricity at Work',
    personsAffected: ['Employees', 'Contractors'],
    hazards: [
      {
        hazard: 'Contact with live conductors, hidden or mis-identified cabling',
        risk: 'Electric shock, burns, arcing injury',
        s: 5, l: 2,
        control: 'Safe isolation procedure followed for all work on fixed wiring in accordance with the Electricity at Work Regulations 1989: prove test equipment on a known live source, isolate, lock off/tag out, prove dead before touching. Existing services located (drawings/CAT & Genny scan) before any chasing, drilling or coring.',
        rs: 5, rl: 1,
      },
      {
        hazard: 'Use of 230V hand tools / extension leads on site',
        risk: 'Electric shock; fire from damaged leads',
        s: 4, l: 2,
        control: '110V equipment used on construction sites wherever available; all leads/tools visually checked before use and PAT tested per schedule; RCD protection used where 230V supply is unavoidable.',
        rs: 4, rl: 1,
      },
      {
        hazard: 'Working near existing live distribution boards / risers',
        risk: 'Arc flash, electric shock',
        s: 5, l: 1,
        control: 'Appropriate PPE and exclusion distance maintained; permit to work obtained where the site/client requires one for work near live LV distribution; only competent, authorised persons work on or near exposed live parts.',
        rs: 5, rl: 1,
      },
    ],
  },
  {
    ref: 'RA22',
    title: 'Moving Objects on Site',
    personsAffected: ['Employees', 'Contractors', 'Public'],
    hazards: [
      {
        hazard: 'Vehicle movements during delivery/unloading',
        risk: 'Collision with pedestrians/operatives',
        s: 4, l: 2,
        control: 'Deliveries banked in by a trained banksman where reversing is required; pedestrian/vehicle routes separated per the site traffic management plan; hi-vis worn at all times in vehicle movement areas.',
        rs: 4, rl: 1,
      },
      {
        hazard: 'Poor housekeeping / poor lighting around moving materials',
        risk: 'Collision, trip, crush injury',
        s: 3, l: 2,
        control: 'Materials stored clear of walkways/fire routes; task lighting provided where natural light is insufficient (see Section 8.6).',
        rs: 3, rl: 1,
      },
    ],
  },
  {
    ref: 'RA27',
    title: 'Using Power Tools (incl. cut saw)',
    personsAffected: ['Employees', 'Contractors', 'Public'],
    hazards: [
      {
        hazard: 'Contact with moving blade/bit; kickback',
        risk: 'Laceration, amputation-level injury',
        s: 5, l: 2,
        control: 'All power tools used per PUWER 1998 and the manufacturer\'s instructions only, by trained operatives; guards never removed or defeated; correct blade/disc for the material and tool.',
        rs: 5, rl: 1,
      },
      {
        hazard: 'Ejected material / fragments (cutting discs, masonry chips)',
        risk: 'Eye/facial injury to operative or bystanders',
        s: 3, l: 3,
        control: 'Safety eyewear (and face shield for cutting/grinding) worn; exclusion zone maintained; disc rated above the tool\'s maximum speed and checked for damage before fitting.',
        rs: 3, rl: 1,
      },
      {
        hazard: 'Electrocution from damaged tool/lead',
        risk: 'Electric shock',
        s: 4, l: 1,
        control: '110V tools used on site where possible; visual pre-use check and PAT testing regime; RCD protection where 230V is unavoidable.',
        rs: 4, rl: 1,
      },
      {
        hazard: 'Noise, vibration and RCS dust from cutting masonry/concrete/tile',
        risk: 'Hearing loss, HAVS, silicosis',
        s: 4, l: 3,
        control: 'See RA10 (Noise, Dust & Vibration) -- on-tool water suppression/extraction, FFP3 RPE and hearing protection used for all cutting of masonry, concrete, brick or tile.',
        rs: 4, rl: 1,
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Appendix B -- COSHH Library
// ---------------------------------------------------------------------------
export const COSHH_SHEETS = [
  {
    ref: 'Ref01',
    product: 'Butane Gas (soldering iron fuel cartridge)',
    manufacturer: 'Generic / as supplied -- confirm current manufacturer SDS before use',
    activity: 'Fuel for a portable gas soldering iron used intermittently for cable/connector terminations',
    personsAtRisk: ['Employees', 'Sub-contractors'],
    classifications: ['Flammable', 'Gas Under Pressure'],
    healthRisks: 'Inhalation of leaking gas in a confined space; fire/explosion risk from a naked flame source near a leak.',
    controls: 'Store upright, away from heat/direct sunlight/ignition sources. Use only in a well-ventilated area. Check cartridge seal before fitting. No smoking or open flame nearby. Do not puncture or incinerate the cartridge.',
    firstAid: 'If exposed to a large release, move to fresh air. Frostbite from direct contact with escaping liquefied gas: warm the area gently with lukewarm water, seek medical attention.',
    storage: 'Cool, dry, well-ventilated store away from ignition sources; segregated from oxidisers.',
    disposal: 'Empty cartridges disposed of via a licensed waste contractor / approved metal recycling -- never incinerated by the operative.',
  },
  {
    ref: 'Ref04',
    product: 'CO Contact Cleaner (electrical/electronic contact cleaner aerosol)',
    manufacturer: 'Generic / as supplied -- confirm current manufacturer SDS before use',
    activity: 'Cleaning electrical contacts, switchgear and connectors during termination/testing',
    personsAtRisk: ['Employees', 'Sub-contractors'],
    classifications: ['Flammable', 'Harmful/Irritant'],
    healthRisks: 'Inhalation of vapour causing dizziness/headache; irritation to eyes and skin on contact; flammable vapour risk near ignition sources or live equipment.',
    controls: 'Use in a well-ventilated area; do not spray near live, energised equipment unless the product is specifically rated de-energised-safe per its SDS; keep away from naked flames and hot surfaces; nitrile gloves and safety glasses for prolonged/repeated use.',
    firstAid: 'Skin: wash with soap and water. Eyes: irrigate with water for 15 minutes and seek medical advice if irritation persists. Inhalation: move to fresh air.',
    storage: 'Store upright in a cool, ventilated area away from ignition sources.',
    disposal: 'Empty aerosols via licensed waste contractor; do not puncture or burn.',
  },
  {
    ref: 'Ref05',
    product: 'Label Remover (adhesive/label residue remover aerosol)',
    manufacturer: 'Generic / as supplied -- confirm current manufacturer SDS before use',
    activity: 'Removing old labels/adhesive residue from equipment, containment or cabinets prior to re-labelling',
    personsAtRisk: ['Employees', 'Sub-contractors'],
    classifications: ['Flammable', 'Harmful/Irritant', 'Dangerous for Environment'],
    healthRisks: 'Skin/eye irritation on contact; vapour inhalation in poorly ventilated spaces; harmful to aquatic life if it enters drains/watercourses.',
    controls: 'Use in a ventilated area; nitrile gloves and eye protection for repeated use; keep away from ignition sources; prevent product entering drains.',
    firstAid: 'Skin: wash thoroughly. Eyes: irrigate with water, seek medical advice if irritation persists. Ingestion: do not induce vomiting, seek medical advice.',
    storage: 'Store upright, cool and ventilated, away from ignition sources.',
    disposal: 'Do not pour to drain. Empty containers via licensed waste contractor; any product-contaminated rags treated as hazardous waste.',
  },
  {
    ref: 'Ref09',
    product: '99SC Lead-Free Solder (wire solder, rosin flux core)',
    manufacturer: 'Generic / as supplied -- confirm current manufacturer SDS before use',
    activity: 'Soldering of cable terminations, connectors and small electronic assemblies',
    personsAtRisk: ['Employees', 'Sub-contractors'],
    classifications: ['Harmful/Irritant'],
    healthRisks: 'Rosin-based flux fume is a respiratory/eye irritant; repeated significant exposure is linked to occupational asthma; molten solder presents a burns risk (see RA06).',
    controls: 'Solder in a well-ventilated area; use local fume extraction (fume arm) for repeated/prolonged soldering; avoid inhaling fume directly above the work; wash hands after handling before eating/drinking.',
    firstAid: 'Eye/skin contact with flux fume residue: wash with water. Molten solder burns: cool under running water and seek first aid per Section 8 arrangements.',
    storage: 'Store in original packaging, dry conditions.',
    disposal: 'Solder off-cuts/dross disposed of as general waste unless the SDS states otherwise; not for release to drain.',
  },
  {
    ref: 'Ref10',
    product: 'WD-40 (or equivalent multi-purpose lubricant/corrosion protection aerosol)',
    manufacturer: 'Generic / as supplied -- confirm current manufacturer SDS before use',
    activity: 'Lubrication of fixings/mechanisms and corrosion protection during installation and maintenance work',
    personsAtRisk: ['Employees', 'Sub-contractors'],
    classifications: ['Flammable'],
    healthRisks: 'Mild skin/eye irritation on contact; flammable aerosol propellant; mist inhalation in confined/poorly ventilated spaces.',
    controls: 'Use in ventilated areas; avoid spraying near naked flames, hot surfaces or live electrical equipment; gloves for repeated use.',
    firstAid: 'Skin: wash with soap and water. Eyes: irrigate with water. Inhalation: move to fresh air.',
    storage: 'Store upright, cool and ventilated, away from ignition sources.',
    disposal: 'Empty aerosols via licensed waste contractor; do not puncture or burn.',
  },
  {
    ref: 'Ref16',
    product: 'Silicone Sealant -- Clear',
    manufacturer: 'Generic / as supplied -- confirm current manufacturer SDS before use',
    activity: 'General sealing/weatherproofing around installed equipment, penetrations and containment',
    personsAtRisk: ['Employees', 'Sub-contractors', 'Public'],
    classifications: ['Harmful/Irritant'],
    healthRisks: 'Harmful if swallowed; skin dryness/cracking with repeated/prolonged contact; mild vapour irritation (acetic-acid-releasing cure) in confined spaces.',
    controls: 'Use in ventilated areas; nitrile gloves for repeated use; avoid skin contact with uncured product; keep away from mouth/eyes.',
    firstAid: 'Skin: wipe off, wash with soap and water. Eyes: irrigate with water and seek medical advice if irritation persists. Ingestion: seek medical advice, do not induce vomiting.',
    storage: 'Store in original cartridge/tube, cool and dry, upright.',
    disposal: 'Cured/empty cartridges as general waste; uncured product waste per local authority guidance -- not to drain.',
  },
  {
    ref: 'Ref17',
    product: 'Silicone Sanitary Sealant -- White',
    manufacturer: 'Generic / as supplied -- confirm current manufacturer SDS before use',
    activity: 'Sanitary-grade sealing in wet areas (changing rooms, pool surrounds, kitchens) associated with the works',
    personsAtRisk: ['Employees', 'Sub-contractors', 'Public'],
    classifications: ['Harmful/Irritant'],
    healthRisks: 'Harmful if swallowed; skin dryness/cracking with repeated/prolonged contact; may contain biocide additives -- treat as a distinct assessment from Ref16, do not assume identical hazards.',
    controls: 'Use in ventilated areas; nitrile gloves for repeated use; avoid skin contact with uncured product; keep away from mouth/eyes.',
    firstAid: 'Skin: wipe off, wash with soap and water. Eyes: irrigate with water and seek medical advice if irritation persists. Ingestion: seek medical advice, do not induce vomiting.',
    storage: 'Store in original cartridge/tube, cool and dry, upright.',
    disposal: 'Cured/empty cartridges as general waste; uncured product waste per local authority guidance -- not to drain.',
  },
]

// ---------------------------------------------------------------------------
// Appendix C -- Method Statement Library
// ---------------------------------------------------------------------------
export const METHOD_STATEMENTS = [
  {
    ref: 'MS-CAB-01',
    activity: '1st Fix Cabling',
    relatedRA: ['RA02', 'RA03', 'RA04', 'RA07', 'RA13', 'RA20'],
    relatedCOSHH: [],
    steps: [
      'Survey the area with the client/principal contractor -- identify hazards, confirm containment routes and cordon off / apply precautions in line with site regulations.',
      'Confirm existing services (electrical, data, fire, water) via drawings and a CAT & Genny scan before any drilling, chasing or coring.',
      'Install containment (basket tray, conduit, trunking) at the agreed route and height using access equipment selected per the Work at Height hierarchy.',
      'Pull cable through containment/voids in a controlled, communicated sequence -- see RA04.',
      'Label cable at both ends as it is run, per the project cable schedule.',
      'Housekeeping check of the work area -- remove off-cuts/packaging, re-open any access previously closed for works.',
      'Report progress and any deviation from the agreed route to the Project Manager before continuing to the next area.',
    ],
  },
  {
    ref: 'MS-CAB-02',
    activity: '2nd Fix Cabling',
    relatedRA: ['RA03', 'RA06', 'RA08', 'RA13', 'RA20'],
    relatedCOSHH: ['Ref09'],
    steps: [
      'Confirm 1st fix cabling is complete, labelled and matches the project cable schedule before starting 2nd fix.',
      'Isolate and prove dead any circuit being terminated into per the safe isolation procedure (RA20).',
      'Trim cables to length at the faceplate/patch panel/equipment location.',
      'Terminate connectors/faceplates per manufacturer instructions; solder where required per RA06/COSHH Ref09.',
      'Label all terminated points to match the cable schedule.',
      'Prepare for testing -- visually check terminations, containment lids/covers refitted, area left safe and tidy.',
      'Hand over to the Testing & Commissioning stage (MS-TAC-01) with an as-built note of any changes from design.',
    ],
  },
  {
    ref: 'MS-BAL-01',
    activity: 'Balustrading',
    relatedRA: ['RA02', 'RA03', 'RA07', 'RA20', 'RA27'],
    relatedCOSHH: ['Ref16'],
    steps: [
      'Survey the area with the client/principal contractor -- identify hazards and cordon off the works, particularly where balustrading borders an edge/drop.',
      'Confirm setting-out/marking-out against approved drawings; existing services located before any drilling/coring for post fixings.',
      'Temporary edge protection maintained throughout until the new balustrade is structurally fixed and load-tested per manufacturer instructions.',
      'Drill/core fixing points using RCS controls per RA10/RA27 (on-tool extraction or water suppression, FFP3 RPE) where masonry/concrete is cut or drilled.',
      'Install chemical resin fixings per manufacturer instructions -- correct hole depth/diameter, cure time observed before loading.',
      'Fit balustrade posts, infill and handrail; power tools isolated/de-energised near any live services per RA20.',
      'Seal base fixings/junctions with clear silicone sealant (COSHH Ref16) where specified.',
      'Visual check and physical load test of the completed balustrade before removing temporary edge protection or opening the area to use.',
    ],
  },
  {
    ref: 'MS-TAC-01',
    activity: 'Testing & Commissioning',
    relatedRA: ['RA02', 'RA20'],
    relatedCOSHH: [],
    steps: [
      'Confirm all associated 1st and 2nd fix works are complete and the system is safe to energise.',
      'Visual inspection of all terminations, containment and equipment before applying power.',
      'Isolate and lock off any circuit being tested for continuity/insulation before energising, per the safe isolation procedure (RA20).',
      'Carry out inspection and testing in accordance with the relevant industry standard for the system (e.g. BS 7671 for electrical, manufacturer test procedures for AV/data/access control).',
      'Record all test results on the appropriate test certificate/commissioning sheet.',
      'Commission the system with the client -- functional demonstration, snagging list agreed and issued.',
      'Handover documentation (test certificates, O&M information, as-built records) issued to the Project Manager for the project close-out pack.',
    ],
  },
]

