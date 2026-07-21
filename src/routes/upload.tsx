import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { Dropzone } from '#/components/upload/dropzone'
import { ParsedCvSummary } from '#/components/upload/parsed-cv-summary'
import { PreviousUploadsList } from '#/components/upload/previous-uploads-list'
import { UploadProgress } from '#/components/upload/upload-progress'
import { useBaseCvs } from '#/hooks/use-base-cvs'
import { useCvUpload } from '#/hooks/use-cv-upload'
import type { UploadStage } from '#/hooks/use-cv-upload'
import { summarizeCvContent } from '#/models/cv-summary'

export const Route = createFileRoute('/upload')({
  component: UploadPage,
  head: function uploadHead() {
    return {
      meta: [{ title: 'Upload CV — ResumeAI' }],
    }
  },
})

function isBusyStage(
  stage: UploadStage,
): stage is 'uploading' | 'parsing' | 'structuring' {
  return stage === 'uploading' || stage === 'parsing' || stage === 'structuring'
}

function UploadPage() {
  const [highlightNewest, setHighlightNewest] = useState(false)
  const baseCvs = useBaseCvs()

  async function handleConfirmed() {
    await baseCvs.invalidate()
    setHighlightNewest(true)
  }

  const upload = useCvUpload({ onConfirmed: handleConfirmed })

  function handleFile(file: File) {
    setHighlightNewest(false)
    upload.handleFile(file)
  }

  function handleLooksGood() {
    void upload.handleLooksGood()
  }

  function handleReParse() {
    upload.handleReParse()
  }

  const summary =
    upload.result !== null ? summarizeCvContent(upload.result.content) : null

  return (
    <main className="relative min-h-screen bg-background px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-24 top-10 size-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-16 top-40 size-64 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-2xl space-y-8">
        <motion.h1
          className="text-3xl font-bold tracking-[-0.02em]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          Upload CV
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.08,
            duration: 0.45,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {upload.stage === 'idle' || upload.stage === 'review' ? (
            <Dropzone
              disabled={upload.isBusy}
              error={upload.error}
              onFile={handleFile}
            />
          ) : null}

          {isBusyStage(upload.stage) ? (
            <UploadProgress stage={upload.stage} />
          ) : null}

          {upload.stage === 'review' && summary && upload.result ? (
            <div className="mt-6">
              <ParsedCvSummary
                stats={summary}
                fileName={upload.result.baseCv.file_name}
                onLooksGood={handleLooksGood}
                onReParse={handleReParse}
              />
            </div>
          ) : null}
        </motion.div>

        <motion.section
          className="space-y-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.16,
            duration: 0.45,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <h2 className="text-lg font-semibold tracking-[-0.02em]">
            Previous uploads
          </h2>
          <PreviousUploadsList
            items={baseCvs.data}
            isLoading={baseCvs.isLoading}
            highlightNewest={highlightNewest}
          />
        </motion.section>
      </div>
    </main>
  )
}
