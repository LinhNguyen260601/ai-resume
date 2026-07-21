import { Sparkles } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import type { CvSummaryStats } from '#/models/cv-summary'

type ParsedCvSummaryProps = {
  stats: CvSummaryStats
  fileName: string
  onLooksGood: () => void
  onReParse: () => void
}

export function ParsedCvSummary({
  stats,
  fileName,
  onLooksGood,
  onReParse,
}: ParsedCvSummaryProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { type: 'spring', stiffness: 320, damping: 28 }
      }
    >
      <Card className="rounded-2xl border-border bg-card/80 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-xl tracking-[-0.02em]">
            {stats.fullName}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{fileName}</p>
        </CardHeader>
        <CardContent className="flex gap-6 text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">
              {stats.experienceCount}
            </span>{' '}
            roles
          </p>
          <p>
            <span className="font-medium text-foreground">
              {stats.skillCount}
            </span>{' '}
            skills
          </p>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-3">
          <Button
            type="button"
            className="btn-gradient rounded-xl"
            onClick={onLooksGood}
          >
            Looks good
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-primary/50"
            onClick={onReParse}
          >
            <Sparkles className="size-4" />
            Re-parse
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
