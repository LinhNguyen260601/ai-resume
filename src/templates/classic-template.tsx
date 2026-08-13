import type { CvContent } from '#/lib/schemas/cv'
import { formatDateRange } from '#/lib/cv-format'

export function ClassicTemplate({ content }: { content: CvContent }) {
  const { personal, experience, education, skills, certifications, projects } =
    content

  return (
    <div className="flex flex-col gap-5 p-10 font-serif text-neutral-900">
      <header className="flex flex-col items-center gap-1 pb-4 text-center">
        <h1 className="text-3xl font-bold tracking-wide uppercase">
          {personal.fullName || 'Your name'}
        </h1>
        <p className="text-sm text-neutral-700">
          {[personal.email, personal.phone, personal.location]
            .filter(Boolean)
            .join(' | ')}
        </p>
        {personal.linkedin || personal.website ? (
          <p className="text-sm text-neutral-700">
            {[personal.linkedin, personal.website].filter(Boolean).join(' | ')}
          </p>
        ) : null}
        <div className="mt-3 h-px w-full bg-neutral-400" />
        {personal.summary ? (
          <p className="mt-2 text-sm leading-relaxed">{personal.summary}</p>
        ) : null}
      </header>

      {experience.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="border-b border-neutral-400 pb-1 text-center text-sm font-bold tracking-[0.2em] uppercase">
            Experience
          </h2>
          {experience.map((entry) => (
            <div key={entry.id} className="break-inside-avoid">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-bold">{entry.title || 'Role'}</span>
                <span className="shrink-0 text-xs italic text-neutral-600">
                  {formatDateRange(entry.startDate, entry.endDate)}
                </span>
              </div>
              <p className="text-sm italic text-neutral-700">
                {[entry.company, entry.location].filter(Boolean).join(', ')}
              </p>
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
          <h2 className="border-b border-neutral-400 pb-1 text-center text-sm font-bold tracking-[0.2em] uppercase">
            Education
          </h2>
          {education.map((entry) => (
            <div key={entry.id} className="break-inside-avoid">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-bold">{entry.degree || 'Degree'}</span>
                {entry.graduationDate ? (
                  <span className="shrink-0 text-xs italic text-neutral-600">
                    {entry.graduationDate}
                  </span>
                ) : null}
              </div>
              <p className="text-sm italic text-neutral-700">
                {[entry.institution, entry.field].filter(Boolean).join(', ')}
              </p>
            </div>
          ))}
        </section>
      ) : null}

      {skills.technical.length > 0 ||
      skills.soft?.length ||
      skills.languages?.length ? (
        <section className="flex flex-col gap-2">
          <h2 className="border-b border-neutral-400 pb-1 text-center text-sm font-bold tracking-[0.2em] uppercase">
            Skills
          </h2>
          <div className="flex flex-col gap-1 text-center text-sm">
            {skills.technical.length > 0 ? (
              <p>{skills.technical.join(', ')}</p>
            ) : null}
            {skills.soft?.length ? <p>{skills.soft.join(', ')}</p> : null}
            {skills.languages?.length ? (
              <p>{skills.languages.join(', ')}</p>
            ) : null}
          </div>
        </section>
      ) : null}

      {projects?.length ? (
        <section className="flex flex-col gap-3">
          <h2 className="border-b border-neutral-400 pb-1 text-center text-sm font-bold tracking-[0.2em] uppercase">
            Projects
          </h2>
          {projects.map((project) => (
            <div key={project.id} className="break-inside-avoid">
              <p className="font-bold">{project.name}</p>
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
          <h2 className="border-b border-neutral-400 pb-1 text-center text-sm font-bold tracking-[0.2em] uppercase">
            Certifications
          </h2>
          {certifications.map((cert) => (
            <p key={cert.id} className="text-center text-sm">
              {cert.name}
              {cert.issuer ? ` — ${cert.issuer}` : ''}
              {cert.date ? ` (${cert.date})` : ''}
            </p>
          ))}
        </section>
      ) : null}
    </div>
  )
}
