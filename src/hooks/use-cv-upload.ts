import { useEffect, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import type { CvContent } from '#/lib/schemas/cv'
import { validateCvUploadFile } from '#/models/cv-upload-file'
import { parseCvUpload } from '#/server/cv'

export type UploadStage =
  | 'idle'
  | 'uploading'
  | 'parsing'
  | 'structuring'
  | 'review'

export type ParseCvUploadResult = {
  baseCv: { id: string; file_name: string; created_at: string }
  content: CvContent
}

export const STAGE_PARSING_MS = 400
export const STAGE_STRUCTURING_MS = 900

type UseCvUploadOptions = {
  onConfirmed: () => void | Promise<void>
}

async function uploadCvFile(file: File) {
  const form = new FormData()
  form.append('file', file)
  return parseCvUpload({ data: form }) as Promise<ParseCvUploadResult>
}

export function useCvUpload({ onConfirmed }: UseCvUploadOptions) {
  const [stage, setStage] = useState<UploadStage>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ParseCvUploadResult | null>(null)
  const lastFileRef = useRef<File | null>(null)
  const parsingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const structuringTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function clearStageTimers() {
    if (parsingTimerRef.current !== null) {
      clearTimeout(parsingTimerRef.current)
      parsingTimerRef.current = null
    }
    if (structuringTimerRef.current !== null) {
      clearTimeout(structuringTimerRef.current)
      structuringTimerRef.current = null
    }
  }

  function startStageTimers() {
    clearStageTimers()
    setStage('uploading')
    parsingTimerRef.current = setTimeout(function advanceToParsing() {
      setStage('parsing')
    }, STAGE_PARSING_MS)
    structuringTimerRef.current = setTimeout(function advanceToStructuring() {
      setStage('structuring')
    }, STAGE_STRUCTURING_MS)
  }

  function handleUploadSuccess(data: ParseCvUploadResult) {
    clearStageTimers()
    setResult(data)
    setError(null)
    setStage('review')
  }

  function handleUploadError(err: Error) {
    clearStageTimers()
    setResult(null)
    setError(err.message || 'Upload failed')
    setStage('idle')
  }

  const mutation = useMutation({
    mutationFn: uploadCvFile,
    onSuccess: handleUploadSuccess,
    onError: handleUploadError,
  })

  function beginUpload(file: File) {
    const validationError = validateCvUploadFile(file)
    if (validationError) {
      setError(validationError)
      setStage('idle')
      return
    }
    lastFileRef.current = file
    setError(null)
    setResult(null)
    startStageTimers()
    mutation.mutate(file)
  }

  function handleFile(file: File) {
    beginUpload(file)
  }

  function handleReParse() {
    const file = lastFileRef.current
    if (!file) return
    beginUpload(file)
  }

  async function handleLooksGood() {
    setResult(null)
    setError(null)
    setStage('idle')
    await onConfirmed()
  }

  function clearError() {
    setError(null)
  }

  useEffect(function cleanupTimersOnUnmount() {
    return function onUnmount() {
      clearStageTimers()
    }
  }, [])

  const isBusy =
    stage === 'uploading' || stage === 'parsing' || stage === 'structuring'

  return {
    stage,
    error,
    result,
    isBusy,
    handleFile,
    handleLooksGood,
    handleReParse,
    clearError,
  }
}
