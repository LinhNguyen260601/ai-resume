import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const fixtureDir = join(import.meta.dirname, '../fixtures')
const workDir = join(fixtureDir, '.docx-build')
const outputPath = join(fixtureDir, 'sample-cv.docx')

const cvText = `Jane Doe
Software Engineer
jane.doe@example.com | +1 555 010 2000 | San Francisco, CA
linkedin.com/in/janedoe

Summary
Full-stack engineer with 6 years building web applications using TypeScript, React, and Node.js.

Experience
Acme Corp — Senior Software Engineer (2021 - Present)
- Led migration of monolith to microservices, reducing deployment time by 40%
- Built internal design system adopted by 5 product teams
- Mentored 3 junior engineers through structured onboarding program

Bright Labs — Software Engineer (2018 - 2021)
- Shipped customer dashboard used by 50k monthly active users
- Introduced automated testing that cut production incidents by 30%

Education
State University — B.S. Computer Science (2018)

Skills
TypeScript, React, Node.js, PostgreSQL, AWS, Docker, CI/CD`

const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>${cvText
      .split('\n')
      .map((line) => line.replace(/&/g, '&amp;').replace(/</g, '&lt;'))
      .join('</w:t></w:r></w:p><w:p><w:r><w:t>')}</w:t></w:r></w:p>
  </w:body>
</w:document>`

rmSync(workDir, { recursive: true, force: true })
mkdirSync(join(workDir, '_rels'), { recursive: true })
mkdirSync(join(workDir, 'word/_rels'), { recursive: true })

writeFileSync(
  join(workDir, '[Content_Types].xml'),
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`,
)

writeFileSync(
  join(workDir, '_rels', '.rels'),
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
)

writeFileSync(join(workDir, 'word', 'document.xml'), documentXml)

writeFileSync(
  join(workDir, 'word', '_rels', 'document.xml.rels'),
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>`,
)

mkdirSync(fixtureDir, { recursive: true })
execFileSync('zip', ['-qr', outputPath, '.'], { cwd: workDir })
rmSync(workDir, { recursive: true, force: true })

console.log(`Created ${outputPath}`)
