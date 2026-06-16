import { motion, useScroll, useTransform } from 'motion/react'

type ParallaxOrbsProps = {
  className?: string
  violetClassName?: string
  cyanClassName?: string
}

export function ParallaxOrbs({
  className,
  violetClassName,
  cyanClassName,
}: ParallaxOrbsProps) {
  const { scrollY } = useScroll()
  const violetY = useTransform(scrollY, [0, 1200], [0, 80])
  const cyanY = useTransform(scrollY, [0, 1200], [0, -60])

  return (
    <div className={className} aria-hidden>
      <motion.div
        style={{ y: violetY }}
        className={
          violetClassName ??
          'mesh-orb mesh-orb-violet absolute -left-32 top-20 size-[480px]'
        }
      />
      <motion.div
        style={{ y: cyanY }}
        className={
          cyanClassName ??
          'mesh-orb mesh-orb-cyan absolute -right-24 bottom-20 size-[400px]'
        }
      />
    </div>
  )
}
