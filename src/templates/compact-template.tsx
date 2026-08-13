import type { CvContent } from '#/lib/schemas/cv'
import { formatDateRange } from '#/lib/cv-format'

export function CompactTemplate({ content }: { content: CvContent }) {
  const { personal, experience, education, skills, certifications, projects } =
    content

  return (
    <div className="flex flex-col gap-3 p-6 text-[13px] leading-snug text-neutral-900">
      <header className="flex flex-col gap-0.5 border-b border-neutral-300 pb-2">
        <h1 className="text-lg font-bold">
          {personal.fullName || 'Your name'}
        </h1>
        <p className="text-xs text-neutral-600">
          {[
            personal.email,
            personal.phone,
            personal.location,
            personal.linkedin,
            personal.website,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
        {personal.summary ? (
          <p className="mt-1 text-xs leading-snug">{personal.summary}</p>
        ) : null}
      </header>

      <div className="grid grid-cols-2 gap-4">
        {experience.length > 0 ? (
          <section className="col-span-2 flex flex-col gap-2">
            <h2 className="text-[11px] font-semibold tracking-wide uppercase">
              Experience
            </h2>
            {experience.map((entry) => (
              <div key={entry.id} className="break-inside-avoid">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-medium">
                    {entry.title || 'Role'}
                    {entry.company ? ` · ${entry.company}` : ''}
                  </span>
                  <span className="shrink-0 text-[11px] text-neutral-500">
                    {formatDateRange(entry.startDate, entry.endDate)}
                  </span>
                </div>
                {entry.bullets.length > 0 ? (
                  <ul className="mt-0.5 list-disc pl-4 text-xs leading-snug">
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
          <section className="flex flex-col gap-1">
            <h2 className="text-[11px] font-semibold tracking-wide uppercase">
              Education
            </h2>
            {education.map((entry) => (
              <div key={entry.id} className="break-inside-avoid text-xs">
                <p className="font-medium">{entry.degree || 'Degree'}</p>
                <p className="text-neutral-500">
                  {entry.institution}
                  {entry.graduationDate ? ` · ${entry.graduationDate}` : ''}
                </p>
              </div>
            ))}
          </section>
        ) : null}

        {skills.technical.length > 0 ||
        skills.soft?.length ||
        skills.languages?.length ? (
          <section className="flex flex-col gap-1">
            <h2 className="text-[11px] font-semibold tracking-wide uppercase">
              Skills
            </h2>
            <p className="text-xs leading-snug">
              {[
                ...skills.technical,
                ...(skills.soft ?? []),
                ...(skills.languages ?? []),
              ].join(', ')}
            </p>
          </section>
        ) : null}

        {projects?.length ? (
          <section className="col-span-2 flex flex-col gap-1">
            <h2 className="text-[11px] font-semibold tracking-wide uppercase">
              Projects
            </h2>
            {projects.map((project) => (
              <p key={project.id} className="text-xs leading-snug">
                <span className="font-medium">{project.name}: </span>
                {project.description}
              </p>
            ))}
          </section>
        ) : null}

        {certifications?.length ? (
          <section className="col-span-2 flex flex-col gap-1">
            <h2 className="text-[11px] font-semibold tracking-wide uppercase">
              Certifications
            </h2>
            <p className="text-xs leading-snug">
              {certifications
                .map(
                  (cert) =>
                    cert.name + (cert.issuer ? ` (${cert.issuer})` : ''),
                )
                .join(', ')}
            </p>
          </section>
        ) : null}
      </div>
    </div>
  )
}
