import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
import { cn } from '#/lib/utils'

type JobDescriptionMarkdownProps = {
  content: string
  className?: string
  emptyLabel?: string
}

export function JobDescriptionMarkdown({
  content,
  className,
  emptyLabel = 'No job description yet',
}: JobDescriptionMarkdownProps) {
  const trimmed = content.trim()

  if (!trimmed) {
    return (
      <p className="text-sm text-muted-foreground" data-slot="job-description-empty">
        {emptyLabel}
      </p>
    )
  }

  return (
    <div
      data-slot="job-description-markdown"
      className={cn(
        'prose prose-invert prose-sm max-w-none text-foreground',
        'prose-headings:tracking-[-0.02em] prose-headings:text-foreground',
        'prose-p:text-muted-foreground prose-li:text-muted-foreground',
        'prose-strong:text-foreground prose-a:text-secondary',
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
        {trimmed}
      </ReactMarkdown>
    </div>
  )
}
