#!/usr/bin/env node
// Seed a single article with wide/long content to validate layout
require('dotenv').config()

async function main() {
  const Articles = require('../data/articles')
  const slugify = require('slugify')
  const db = require('../db')

  if (db.ensureAppSchema) await db.ensureAppSchema()

  const title = 'Rendering Torture Test'
  const author = 'QA Bot'
  const description = 'Stress post for layout validation'
  const content = `# Rendering Torture Test

This post contains various elements to validate wrapping and scrolling.

## Bulleted list (inside)

- A short bullet
- A bullet with a longer line to test how inside markers align with text.
- A bullet containing a verylongunbreakablewordthatshouldforcewrappingbehaviororscroll
- A bullet with a URL: https://example.com/some/really/long/path/that/keeps/going/and/going?with=query&and=parameters

## Numbered list (inside)

1. First item
2. Second item
3. Third item with verylongunbreakablewordthatshouldstillwrap

## Code block (scrolls)

\`\`\`javascript
function big(n) {
  // Intentionally long line to trigger horizontal scroll in pre/code
  const txt = 'x'.repeat(400) + ' end';
  return { n, txt };
}
console.log(big(42));
\`\`\`

## Table (scrolls)

| heading 1 | heading 2 | heading 3 |
|-----------|-----------|-----------|
| cell | cell with quite a lot of text to test wrapping within table cells | cell |
| cell | verylongunbreakablewordthatmayoverflowandthereforetablemustscroll | cell |

## Image (constrained)

![kitten](https://placekitten.com/1200/400)
`

  const slug = slugify(title, { lower: true, strict: true })
  const existing = await Articles.findBySlug(slug)
  const article = existing || await Articles.create({ title, author, description, content, editor: 'Seeder' })
  console.log('Seeded torture test article:', { id: article.id, slug: article.slug })
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})

