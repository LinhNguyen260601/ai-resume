/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CvPreview } from '#/components/cv/cv-preview'
import { EducationEditor } from '#/components/cv/education-editor'
import { EditorSection } from '#/components/cv/editor-section'
import { ExperienceEditor } from '#/components/cv/experience-editor'
import { SkillsEditor } from '#/components/cv/skills-editor'
import type { CvContent } from '#/lib/schemas/cv'

afterEach(function cleanupDom() {
  cleanup()
})

const PERSONAL: CvContent['personal'] = {
  fullName: 'Ada Lovelace',
  email: 'ada@example.com',
  phone: undefined,
  location: undefined,
  linkedin: undefined,
  website: undefined,
  summary: 'Computing pioneer',
}

const EXPERIENCE: CvContent['experience'] = [
  {
    id: 'exp-1',
    company: 'Analytical Engines Ltd',
    title: 'Engineer',
    location: undefined,
    startDate: '1840',
    endDate: undefined,
    bullets: ['Wrote the first algorithm'],
  },
]

const EDUCATION: CvContent['education'] = [
  {
    id: 'edu-1',
    institution: 'Royal Institution',
    degree: 'Self-taught',
    field: undefined,
    graduationDate: undefined,
  },
]

const SKILLS: CvContent['skills'] = {
  technical: ['Mathematics', 'Programming'],
  soft: undefined,
  languages: undefined,
}

describe('EditorSection', function editorSectionSuite() {
  it('renders personal field values', function rendersValues() {
    render(
      <EditorSection
        personal={PERSONAL}
        disabled={false}
        onFieldChange={vi.fn()}
        onSummaryChange={vi.fn()}
      />,
    )

    expect(screen.getByLabelText<HTMLInputElement>('Full name').value).toBe(
      'Ada Lovelace',
    )
    expect(
      screen.getByLabelText<HTMLTextAreaElement>('Summary').value,
    ).toBe('Computing pioneer')
  })

  it('forwards field edits to onFieldChange and onSummaryChange', function forwardsEdits() {
    const onFieldChange = vi.fn()
    const onSummaryChange = vi.fn()
    render(
      <EditorSection
        personal={PERSONAL}
        disabled={false}
        onFieldChange={onFieldChange}
        onSummaryChange={onSummaryChange}
      />,
    )

    fireEvent.change(screen.getByLabelText('Full name'), {
      target: { value: 'Ada Byron' },
    })
    expect(onFieldChange).toHaveBeenCalledWith('fullName', 'Ada Byron')

    fireEvent.change(screen.getByLabelText('Summary'), {
      target: { value: 'Mathematician' },
    })
    expect(onSummaryChange).toHaveBeenCalledWith('Mathematician')
  })
})

describe('ExperienceEditor', function experienceEditorSuite() {
  it('renders entries and calls onAdd', function addsEntry() {
    const onAdd = vi.fn()
    render(
      <ExperienceEditor
        entries={EXPERIENCE}
        disabled={false}
        onAdd={onAdd}
        onRemove={vi.fn()}
        onFieldChange={vi.fn()}
        onAddBullet={vi.fn()}
        onUpdateBullet={vi.fn()}
        onRemoveBullet={vi.fn()}
      />,
    )

    expect(screen.getByDisplayValue('Analytical Engines Ltd')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Add experience' }))
    expect(onAdd).toHaveBeenCalledOnce()
  })

  it('forwards field, bullet, and removal edits with the entry id', function forwardsEntryEdits() {
    const onFieldChange = vi.fn()
    const onAddBullet = vi.fn()
    const onUpdateBullet = vi.fn()
    const onRemoveBullet = vi.fn()
    const onRemove = vi.fn()
    render(
      <ExperienceEditor
        entries={EXPERIENCE}
        disabled={false}
        onAdd={vi.fn()}
        onRemove={onRemove}
        onFieldChange={onFieldChange}
        onAddBullet={onAddBullet}
        onUpdateBullet={onUpdateBullet}
        onRemoveBullet={onRemoveBullet}
      />,
    )

    fireEvent.change(screen.getByLabelText('Company'), {
      target: { value: 'Babbage & Co' },
    })
    expect(onFieldChange).toHaveBeenCalledWith('exp-1', 'company', 'Babbage & Co')

    fireEvent.click(screen.getByRole('button', { name: 'Add bullet' }))
    expect(onAddBullet).toHaveBeenCalledWith('exp-1')

    fireEvent.change(screen.getByLabelText('Bullet 1'), {
      target: { value: 'Updated bullet' },
    })
    expect(onUpdateBullet).toHaveBeenCalledWith('exp-1', 0, 'Updated bullet')

    fireEvent.click(screen.getByRole('button', { name: 'Remove bullet' }))
    expect(onRemoveBullet).toHaveBeenCalledWith('exp-1', 0)

    fireEvent.click(screen.getByRole('button', { name: 'Remove experience' }))
    expect(onRemove).toHaveBeenCalledWith('exp-1')
  })
})

describe('EducationEditor', function educationEditorSuite() {
  it('renders entries and forwards add/remove/field edits', function forwardsEducationEdits() {
    const onAdd = vi.fn()
    const onRemove = vi.fn()
    const onFieldChange = vi.fn()
    render(
      <EducationEditor
        entries={EDUCATION}
        disabled={false}
        onAdd={onAdd}
        onRemove={onRemove}
        onFieldChange={onFieldChange}
      />,
    )

    expect(screen.getByDisplayValue('Royal Institution')).toBeTruthy()

    fireEvent.change(screen.getByLabelText('Degree'), {
      target: { value: 'Honorary Degree' },
    })
    expect(onFieldChange).toHaveBeenCalledWith(
      'edu-1',
      'degree',
      'Honorary Degree',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Add education' }))
    expect(onAdd).toHaveBeenCalledOnce()

    fireEvent.click(screen.getByRole('button', { name: 'Remove education' }))
    expect(onRemove).toHaveBeenCalledWith('edu-1')
  })
})

describe('SkillsEditor', function skillsEditorSuite() {
  it('renders comma-joined skills and forwards raw text edits', function forwardsSkillsText() {
    const onChangeText = vi.fn()
    render(
      <SkillsEditor
        skills={SKILLS}
        disabled={false}
        onChangeText={onChangeText}
      />,
    )

    expect(
      screen.getByLabelText<HTMLInputElement>('Technical skills').value,
    ).toBe('Mathematics, Programming')

    fireEvent.change(screen.getByLabelText('Soft skills'), {
      target: { value: 'Leadership, Patience' },
    })
    expect(onChangeText).toHaveBeenCalledWith('soft', 'Leadership, Patience')
  })
})

describe('CvPreview', function cvPreviewSuite() {
  it('renders the personal, experience, education, and skills sections', function rendersContent() {
    render(
      <CvPreview
        content={{
          personal: PERSONAL,
          experience: EXPERIENCE,
          education: EDUCATION,
          skills: SKILLS,
        }}
      />,
    )

    expect(screen.getByText('Ada Lovelace')).toBeTruthy()
    expect(screen.getByText('Wrote the first algorithm')).toBeTruthy()
    expect(screen.getByText(/Royal Institution/)).toBeTruthy()
    expect(screen.getByText(/Mathematics, Programming/)).toBeTruthy()
  })
})
