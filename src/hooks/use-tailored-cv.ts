import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  addEducation,
  addExperience,
  addExperienceBullet,
  removeEducation,
  removeExperience,
  removeExperienceBullet,
  updateEducationField,
  updateExperienceBullet,
  updateExperienceField,
  updatePersonalField,
  updateSkillsText,
  updateSummary,
} from '#/models/cv-editor'
import type { CvContent } from '#/lib/schemas/cv'
import { cvContentSchema } from '#/lib/schemas/cv'
import type { TemplateId } from '#/lib/schemas/tailored-cv'
import { tailoredCvQueryKey } from '#/lib/query-keys'
import { getTailoredCv, updateTailoredCv } from '#/server/tailored'

export const AUTOSAVE_DEBOUNCE_MS = 1000

export type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error'

type UseTailoredCvOptions = {
  tailoredCvId: string
}

async function fetchTailoredCv(id: string) {
  return getTailoredCv({ data: { id } })
}

export function useTailoredCv({ tailoredCvId }: UseTailoredCvOptions) {
  const query = useQuery({
    queryKey: tailoredCvQueryKey(tailoredCvId),
    queryFn: () => fetchTailoredCv(tailoredCvId),
  })

  const [content, setContent] = useState<CvContent | null>(null)
  const [templateId, setTemplateIdState] = useState<TemplateId>('modern')
  const [title, setTitle] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const loadedRef = useRef(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const save = useMutation({
    mutationFn: async (input: { content: CvContent; templateId: TemplateId }) =>
      updateTailoredCv({
        data: {
          id: tailoredCvId,
          content: input.content,
          template_id: input.templateId,
        },
      }),
    onMutate() {
      setSaveStatus('saving')
    },
    onSuccess() {
      setSaveStatus('saved')
    },
    onError() {
      setSaveStatus('error')
    },
  })

  useEffect(
    function loadInitialContent() {
      if (loadedRef.current || !query.data) return
      loadedRef.current = true
      setContent(cvContentSchema.parse(query.data.content))
      setTemplateIdState((query.data.template_id ?? 'modern') as TemplateId)
      setTitle(query.data.title)
    },
    [query.data],
  )

  function scheduleSave(nextContent: CvContent, nextTemplateId: TemplateId) {
    setSaveStatus('pending')
    if (saveTimerRef.current !== null) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(function runSave() {
      save.mutate({ content: nextContent, templateId: nextTemplateId })
    }, AUTOSAVE_DEBOUNCE_MS)
  }

  function applyEdit(updater: (current: CvContent) => CvContent) {
    setContent((current) => {
      if (!current) return current
      const next = updater(current)
      scheduleSave(next, templateId)
      return next
    })
  }

  function setTemplateId(next: TemplateId) {
    setTemplateIdState(next)
    if (content) scheduleSave(content, next)
  }

  useEffect(
    function cleanupSaveTimer() {
      return function onUnmount() {
        if (saveTimerRef.current !== null) clearTimeout(saveTimerRef.current)
      }
    },
    [],
  )

  const jobPostingsData = query.data?.job_postings
  const jobPosting = Array.isArray(jobPostingsData)
    ? jobPostingsData[0]
    : jobPostingsData

  return {
    isLoading: query.isLoading,
    isError: query.isError,
    content,
    templateId,
    title,
    companyName: jobPosting?.company_name ?? null,
    jobTitle: jobPosting?.job_title ?? null,
    saveStatus,
    setTemplateId,
    updatePersonalField: (field: Parameters<typeof updatePersonalField>[1], value: string) =>
      applyEdit((current) => updatePersonalField(current, field, value)),
    updateSummary: (value: string) =>
      applyEdit((current) => updateSummary(current, value)),
    addExperience: () => applyEdit(addExperience),
    removeExperience: (id: string) =>
      applyEdit((current) => removeExperience(current, id)),
    updateExperienceField: (
      id: string,
      field: Parameters<typeof updateExperienceField>[2],
      value: string,
    ) =>
      applyEdit((current) => updateExperienceField(current, id, field, value)),
    addExperienceBullet: (id: string) =>
      applyEdit((current) => addExperienceBullet(current, id)),
    updateExperienceBullet: (id: string, index: number, value: string) =>
      applyEdit((current) =>
        updateExperienceBullet(current, id, index, value),
      ),
    removeExperienceBullet: (id: string, index: number) =>
      applyEdit((current) => removeExperienceBullet(current, id, index)),
    addEducation: () => applyEdit(addEducation),
    removeEducation: (id: string) =>
      applyEdit((current) => removeEducation(current, id)),
    updateEducationField: (
      id: string,
      field: Parameters<typeof updateEducationField>[2],
      value: string,
    ) =>
      applyEdit((current) => updateEducationField(current, id, field, value)),
    updateSkillsText: (
      field: Parameters<typeof updateSkillsText>[1],
      text: string,
    ) => applyEdit((current) => updateSkillsText(current, field, text)),
  }
}
