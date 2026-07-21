import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Upload } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

type DropzoneProps = {
  disabled: boolean
  error: string | null
  onFile: (file: File) => void
}

export function Dropzone({ disabled, error, onFile }: DropzoneProps) {
  const [dragging, setDragging] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    if (disabled) return
    setDragging(true)
  }

  function handleDragLeave() {
    setDragging(false)
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    if (disabled) return
    const file = event.dataTransfer.files.item(0)
    if (file) onFile(file)
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) onFile(file)
    event.target.value = ''
  }

  return (
    <motion.div
      animate={
        dragging
          ? { boxShadow: '0 0 0 1px #22D3EE, var(--glow-ai)' }
          : { boxShadow: '0 0 0 0 transparent' }
      }
      transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
      className={cn(
        'rounded-2xl border-2 border-dashed bg-card/80 p-12 text-center backdrop-blur-md',
        dragging ? 'border-secondary' : 'border-border',
        disabled && 'pointer-events-none opacity-60',
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Upload className="mx-auto mb-4 size-8 text-secondary" aria-hidden />
      <p className="mb-2 text-foreground">
        Drag &amp; drop PDF or DOCX, or choose a file
      </p>
      <p className="mb-6 text-sm text-muted-foreground">Max 10MB</p>
      <Button className="btn-gradient rounded-xl" disabled={disabled} asChild>
        <label className="cursor-pointer">
          Choose file
          <input
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="sr-only"
            disabled={disabled}
            onChange={handleInputChange}
          />
        </label>
      </Button>
      {error ? (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </motion.div>
  )
}
