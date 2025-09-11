#!/usr/bin/env node
// Seed multiple factual articles and perform edits to populate version history
require('dotenv').config()

async function main() {
  const db = require('../db')
  const Articles = require('../data/articles')
  const slugify = require('slugify')

  if (db.ensureAppSchema) await db.ensureAppSchema()

  async function ensureArticle({ title, author, description, content, editor }) {
    const slug = slugify(title, { lower: true, strict: true })
    const existing = await Articles.findBySlug(slug)
    if (existing) return existing
    return Articles.create({ title, author, description, content, editor })
  }

  const seeds = [
    {
      title: 'Voyager Missions: 1 and 2',
      author: 'JPL/NASA',
      description: 'Highlights from the twin spacecraft launched in 1977.',
      editor: 'Seeder',
      content: `# Voyager Missions: 1 and 2

Voyager 1 and Voyager 2 were launched in 1977 to take advantage of a rare
planetary alignment for gravity assists. Key facts:

- Launch: Voyager 2 on 20 Aug 1977; Voyager 1 on 5 Sep 1977.
- Grand Tour: Jupiter and Saturn flybys for both; Uranus and Neptune flybys by Voyager 2.
- Interstellar space: Voyager 1 crossed the heliopause in 2012; Voyager 2 in 2018.
- Golden Records: Phonograph records carrying sounds and images of Earth.
- Current status: Both continue to transmit data on the interstellar medium.
`
    },
    {
      title: 'HTTP/3 and QUIC Overview',
      author: 'IETF HTTP WG',
      description: 'What HTTP/3 changes vs HTTP/2 and why it uses QUIC.',
      editor: 'Seeder',
      content: `# HTTP/3 and QUIC Overview

HTTP/3 is the third major version of the Hypertext Transfer Protocol using QUIC.

- Transport: QUIC (UDP-based) replaces TCP to reduce head-of-line blocking.
- Standardization: RFC 9114 (HTTP/3) and RFCs 9000–9002 (QUIC) published in 2022.
- Benefits: Faster connection setup (0-RTT/1-RTT), multiplexing without TCP HoL blocking,
  improved congestion control and connection migration.
- Adoption: Supported by major browsers and CDNs; widely deployed on the public web.
`
    },
    {
      title: 'CRISPR-Cas9: Genome Editing Basics',
      author: 'Broad/MIT/Harvard',
      description: 'A concise overview of CRISPR-Cas9 and what it enables.',
      editor: 'Seeder',
      content: `# CRISPR-Cas9: Genome Editing Basics

CRISPR-Cas9 is a technology adapted from a bacterial immune system for editing DNA.

- Components: Guide RNA (gRNA) targets a DNA sequence; Cas9 is a nuclease that cuts DNA.
- Mechanism: Cas9 induces a double-strand break near a PAM site; cells repair via NHEJ or HDR.
- Applications: Research, model organisms, diagnostics; clinical applications are under active study.
- Milestones: First demonstrations in eukaryotic cells published in 2013.
`
    }
  ]

  for (const seed of seeds) {
    const created = await ensureArticle(seed)
    console.log('Created or found:', { id: created.id, slug: created.slug })

    // Perform two edits per article to create history
    await Articles.update(created.id, {
      description: (seed.description || '') + ' Updated with key dates and specifics.',
      editor: 'Initial Editor'
    })

    await Articles.update(created.id, {
      content: (seed.content || '') + '\n\nNote: This entry is part of a seeded demo to exercise version history.',
      editor: 'Second Editor'
    })

    const versions = await Articles.versionsByArticle(created.id)
    console.log(`Versions for ${created.slug}:`, versions.length)
  }

  console.log('Seeding complete.')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})

