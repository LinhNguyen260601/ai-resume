import type { CvContent } from '#/lib/schemas/cv'
import { formatDateRange } from '#/lib/cv-format'

export function CreativeTemplate({ content }: { content: CvContent }) {
  const { personal, experience, education, skills, certifications, projects } =
    content

  return (
    <div className="grid min-h-full grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <aside className="flex flex-col gap-6 bg-slate-900 p-8 text-slate-100">
        <h1 className="text-xl leading-tight font-bold">
          {personal.fullName || 'Your name'}
        </h1>

        <div className="flex flex-col gap-1 text-xs text-slate-300">
          {personal.email ? <p>{personal.email}</p> : null}
          {personal.phone ? <p>{personal.phone}</p> : null}
          {personal.location ? <p>{personal.location}</p> : null}
          {personal.linkedin ? <p>{personal.linkedin}</p> : null}
          {personal.website ? <p>{personal.website}</p> : null}
        </div>

        {skills.technical.length > 0 ||
        skills.soft?.length ||
        skills.languages?.length ? (
          <div className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold tracking-[0.2em] text-indigo-300 uppercase">
              Skills
            </h2>
            {skills.technical.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {skills.technical.map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="rounded bg-slate-800 px-2 py-0.5 text-[11px]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : null}
            {skills.soft?.length ? (
              <p className="text-xs text-slate-300">{skills.soft.join(', ')}</p>
            ) : null}
            {skills.languages?.length ? (
              <p className="text-xs text-slate-300">
                {skills.languages.join(', ')}
              </p>
            ) : null}
          </div>
        ) : null}

        {education.length > 0 ? (
          <div className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold tracking-[0.2em] text-indigo-300 uppercase">
              Education
            </h2>
            {education.map((entry) => (
              <div key={entry.id} className="break-inside-avoid">
                <p className="text-sm font-medium">
                  {entry.degree || 'Degree'}
                </p>
                <p className="text-xs text-slate-300">{entry.institution}</p>
                {entry.graduationDate ? (
                  <p className="text-xs text-slate-400">
                    {entry.graduationDate}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        {certifications?.length ? (
          <div className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold tracking-[0.2em] text-indigo-300 uppercase">
              Certifications
            </h2>
            {certifications.map((cert) => (
              <p key={cert.id} className="text-xs text-slate-300">
                {cert.name}
                {cert.issuer ? ` · ${cert.issuer}` : ''}
              </p>
            ))}
          </div>
        ) : null}
      </aside>

      <div className="flex flex-col gap-6 p-8 text-neutral-900">
        {personal.summary ? (
          <section>
            <h2 className="text-xs font-semibold tracking-[0.2em] text-indigo-600 uppercase">
              Profile
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-800">
              {personal.summary}
            </p>
          </section>
        ) : null}

        {experience.length > 0 ? (
          <section className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold tracking-[0.2em] text-indigo-600 uppercase">
              Experience
            </h2>
            {experience.map((entry) => (
              <div key={entry.id} className="break-inside-avoid">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-medium text-neutral-900">
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
                  <ul className="mt-1 list-disc pl-5 text-sm leading-relaxed text-neutral-800">
                    {entry.bullets.map((bullet, index) => (
                      <li key={index}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </section>
        ) : null}

        {projects?.length ? (
          <section className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold tracking-[0.2em] text-indigo-600 uppercase">
              Projects
            </h2>
            {projects.map((project) => (
              <div key={project.id} className="break-inside-avoid">
                <p className="font-medium text-neutral-900">{project.name}</p>
                <p className="text-sm leading-relaxed text-neutral-800">
                  {project.description}
                </p>
                {project.bullets?.length ? (
                  <ul className="mt-1 list-disc pl-5 text-sm leading-relaxed text-neutral-800">
                    {project.bullets.map((bullet, index) => (
                      <li key={index}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </section>
        ) : null}
      </div>
    </div>
  )
}
