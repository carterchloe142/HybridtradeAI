"use client"
import { motion } from 'framer-motion'

type Props = {
  size?: number
  className?: string
  animated?: boolean
}

export default function LogoMark({ size = 24, className = '', animated = false }: Props) {
  const base = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g>
        <rect x="10" y="20" width="22" height="60" rx="2" fill="currentColor" />
        <rect x="40" y="20" width="12" height="60" rx="2" fill="currentColor" />
        <rect x="58" y="20" width="22" height="60" rx="2" fill="currentColor" />
        <path d="M18 58 L78 38" stroke="white" strokeWidth="7" strokeLinecap="round" />
        <path d="M78 38 L92 30 L92 45 L78 38 Z" fill="#E5C15B" />
      </g>
    </svg>
  )

  if (!animated) return base

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.rect
        x="10"
        y="20"
        width="22"
        height="60"
        rx="2"
        fill="currentColor"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: [0, 1, 0.95, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '21px 50px' }}
      />
      <motion.rect
        x="40"
        y="20"
        width="12"
        height="60"
        rx="2"
        fill="currentColor"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: [0, 1, 0.95, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.1 }}
        style={{ transformOrigin: '46px 50px' }}
      />
      <motion.rect
        x="58"
        y="20"
        width="22"
        height="60"
        rx="2"
        fill="currentColor"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: [0, 1, 0.95, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        style={{ transformOrigin: '69px 50px' }}
      />
      <motion.path
        d="M18 58 L78 38"
        stroke="white"
        strokeWidth="7"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: [0, 1, 0.3, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.1 }}
      />
      <motion.path
        d="M78 38 L92 30 L92 45 L78 38 Z"
        fill="#E5C15B"
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: [0, 1, 0.6, 1], y: [ -4, 0, 0, 0 ] }}
        transition={{ duration: 1.0, repeat: Infinity, ease: 'easeInOut', delay: 0.25 }}
      />
    </motion.svg>
  )
}

