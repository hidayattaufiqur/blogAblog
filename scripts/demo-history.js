#!/usr/bin/env node
// Seed an article and perform multiple edits to exercise version history
require('dotenv').config()

async function main() {
  const db = require('../db')
  const Articles = require('../data/articles')

  if (db.ensureAppSchema) await db.ensureAppSchema()

  // 1) Create an article with factual content
  const created = await Articles.create({
    title: 'James Webb Space Telescope (JWST) Overview',
    author: 'NASA Facts Team',
    description: 'What JWST is, where it orbits, and what it observes.',
    editor: 'Seeder',
    content: `# James Webb Space Telescope (JWST)

JWST is a space telescope developed by NASA, ESA, and CSA.

- Launch: 25 December 2021 on Ariane 5 from Kourou.
- Orbit: Sun–Earth L2 halo orbit (~1.5 million km from Earth).
- Primary mirror: 6.5 m segmented beryllium mirror (18 segments).
- Wavelengths: ~0.6 to 28 micrometers (near- to mid-infrared).
- First images released: 12 July 2022.

Key science capabilities include observing the early universe (high-redshift galaxies),
characterizing exoplanet atmospheres via transmission spectroscopy, and probing star
and planet formation in dust-obscured regions.
`
  })

  console.log('Created article:', { id: created.id, slug: created.slug })

  // 2) First edit: refine title and description, add a small fact
  let updated = await Articles.update(created.id, {
    title: 'James Webb Space Telescope: Key Facts',
    description: 'JWST basics: launch, orbit (Sun–Earth L2), mirror, wavelengths, first images.',
    content: `# James Webb Space Telescope: Key Facts

JWST is a joint mission by NASA, ESA, and CSA designed for infrared astronomy.

- Launch: 25 December 2021 (Ariane 5).
- Orbit: Sun–Earth L2 halo orbit (~1.5 million km).
- Primary mirror: 6.5 m, 18 hexagonal beryllium segments with gold coating.
- Wavelength sensitivity: ~0.6–28 μm (near-IR to mid-IR).
- First images: 12 July 2022, including the SMACS 0723 deep field.

Instruments include NIRCam, NIRSpec, MIRI, and FGS/NIRISS. JWST enables observations
of high-redshift galaxies and detailed exoplanet atmosphere studies.
`,
    editor: 'Hidayat T.'
  })

  console.log('First update:', { id: updated.id, slug: updated.slug })

  // 3) Second edit: add exoplanet example and clarify wavelengths
  updated = await Articles.update(created.id, {
    description: 'JWST basics + example exoplanet spectrum and deep-field imaging.',
    content: `# James Webb Space Telescope: Key Facts

JWST is a joint mission by NASA, ESA, and CSA designed for infrared astronomy.

- Launch: 25 December 2021 (Ariane 5).
- Orbit: Sun–Earth L2 halo orbit (~1.5 million km).
- Primary mirror: 6.5 m segmented mirror (18 gold-coated beryllium segments).
- Wavelength sensitivity: approximately 0.6–28 micrometers.
- First images: 12 July 2022 (e.g., SMACS 0723 deep field).

Instruments: NIRCam, NIRSpec, MIRI, and FGS/NIRISS.

Example result: JWST has captured transmission spectra of exoplanet atmospheres
that show molecular features (e.g., water vapor), and imaged very distant galaxies
from the first few hundred million years after the Big Bang.
`,
    editor: 'A. Admin'
  })

  console.log('Second update:', { id: updated.id, slug: updated.slug })

  // 4) Fetch versions to summarize
  const versions = await Articles.versionsByArticle(created.id)
  console.log(`Version count for article ${created.id}:`, versions.length)
  versions.forEach(v => console.log(`#${v.version_no} by ${v.editor} at ${v.created_at}`))

  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})

