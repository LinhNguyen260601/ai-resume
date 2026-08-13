import type { CvContent } from '#/lib/schemas/cv'
import { formatDateRange } from '#/lib/cv-format'

export function ModernTemplate({ content }: { content: CvContent }) {
  const { personal, experience, education, skills, certifications, projects } =
    content

  return (
    <div className="flex flex-col gap-6 p-10 text-neutral-900">
      <header className="flex flex-col gap-1 border-b border-neutral-200 pb-4">
        <h1 className="text-2xl font-bold">
          {personal.fullName || 'Your name'}
        </h1>
        <p className="text-sm text-neutral-600">
          {[personal.email, personal.phone, personal.location]
            .filter(Boolean)
            .join(' · ')}
        </p>
        {personal.linkedin || personal.website ? (
          <p className="text-sm text-neutral-600">
            {[personal.linkedin, personal.website].filter(Boolean).join(' · ')}
          </p>
        ) : null}
        {personal.summary ? (
          <p className="mt-2 text-sm leading-relaxed">{personal.summary}</p>
        ) : null}
      </header>

      {experience.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold tracking-wide uppercase">
            Experience
          </h2>
          {experience.map((entry) => (
            <div key={entry.id} className="break-inside-avoid">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-medium">
                  {entry.title || 'Role'}
                  {entry.company ? ` · ${entry.company}` : ''}
                </span>
                <span className="shrink-0 text-xs text-neutral-500">
                  {formatDateRange(entry.startDate, entry.endDate)}
                </span>
              </div>
              {entry.location ? (
                <p className="text-xs text-neutral-500">{entry.location}</p>
              ) : null}
              {entry.bullets.length > 0 ? (
                <ul className="mt-1 list-disc pl-5 text-sm leading-relaxed">
                  {entry.bullets.map((bullet, index) => (
                    <li key={index}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </section>
      ) : null}

      {education.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold tracking-wide uppercase">
            Education
          </h2>
          {education.map((entry) => (
            <div key={entry.id} className="break-inside-avoid">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-medium">
                  {entry.degree || 'Degree'}
                  {entry.institution ? ` · ${entry.institution}` : ''}
                </span>
                {entry.graduationDate ? (
                  <span className="shrink-0 text-xs text-neutral-500">
                    {entry.graduationDate}
                  </span>
                ) : null}
              </div>
              {entry.field ? (
                <p className="text-xs text-neutral-500">{entry.field}</p>
              ) : null}
            </div>
          ))}
        </section>
      ) : null}

      {skills.technical.length > 0 ||
      skills.soft?.length ||
      skills.languages?.length ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold tracking-wide uppercase">
            Skills
          </h2>
          {skills.technical.length > 0 ? (
            <p className="text-sm">
              <span className="font-medium">Technical: </span>
              {skills.technical.join(', ')}
            </p>
          ) : null}
          {skills.soft?.length ? (
            <p className="text-sm">
              <span className="font-medium">Soft: </span>
              {skills.soft.join(', ')}
            </p>
          ) : null}
          {skills.languages?.length ? (
            <p className="text-sm">
              <span className="font-medium">Languages: </span>
              {skills.languages.join(', ')}
            </p>
          ) : null}
        </section>
      ) : null}

      {projects?.length ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold tracking-wide uppercase">
            Projects
          </h2>
          {projects.map((project) => (
            <div key={project.id} className="break-inside-avoid">
              <p className="font-medium">{project.name}</p>
              <p className="text-sm leading-relaxed">{project.description}</p>
              {project.bullets?.length ? (
                <ul className="mt-1 list-disc pl-5 text-sm leading-relaxed">
                  {project.bullets.map((bullet, index) => (
                    <li key={index}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </section>
      ) : null}

      {certifications?.length ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold tracking-wide uppercase">
            Certifications
          </h2>
          {certifications.map((cert) => (
            <p key={cert.id} className="text-sm">
              {cert.name}
              {cert.issuer ? ` · ${cert.issuer}` : ''}
              {cert.date ? ` · ${cert.date}` : ''}
            </p>
          ))}
        </section>
      ) : null}
    </div>
  )
}
