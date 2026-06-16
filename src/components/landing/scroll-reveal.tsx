import { motion } from 'motion/react'
import type { Variants } from 'motion/react'
import type { ReactNode } from 'react'

import { cn } from '#/lib/utils.ts'

const defaultVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

type ScrollRevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  once?: boolean
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  duration = 0.6,
  once = true,
}: ScrollRevealProps) {
  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-80px' }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      variants={defaultVariants}
    >
      {children}
    </motion.div>
  )
}
