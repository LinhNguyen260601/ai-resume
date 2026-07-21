import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { cvContentSchema } from '#/lib/schemas/cv'
import { summarizeCvContent } from '#/models/cv-summary'
import { cn } from '#/lib/utils'

export type BaseCvListItem = {
  id: string
  file_name: string
  content: unknown
  created_at: string
}

type PreviousUploadsListProps = {
  items: BaseCvListItem[] | undefined
  isLoading: boolean
  highlightNewest: boolean
}

function displayName(content: unknown) {
  const parsed = cvContentSchema.safeParse(content)
  if (!parsed.success) return 'Unknown'
  return summarizeCvContent(parsed.data).fullName
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString()
}

export function PreviousUploadsList({
  items,
  isLoading,
  highlightNewest,
}: PreviousUploadsListProps) {
  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading uploads…</p>
  }

  if (!items || items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No CVs yet — upload your first base CV above.
      </p>
    )
  }

  function renderCvItem(cv: BaseCvListItem, index: number) {
    const isNewest = highlightNewest && index === 0
    return (
      <motion.div
        key={cv.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{
          opacity: 1,
          y: 0,
          boxShadow: isNewest ? 'var(--glow-ai)' : 'none',
        }}
        transition={{ delay: index * 0.05, duration: 0.35 }}
      >
        <Card
          className={cn(
            'rounded-2xl border-border bg-card/80 backdrop-blur-md',
            isNewest && 'border-secondary/40',
          )}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{cv.file_name}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {displayName(cv.content)}
            {' · '}
            {formatDate(cv.created_at)}
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return <div className="space-y-3">{items.map(renderCvItem)}</div>
}
