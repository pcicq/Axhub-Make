/**
 * @name AnimatedSection
 * Wrapper component for animated sections (simplified version without framer-motion)
 */
import * as React from "react"
import type { HTMLAttributes, ReactNode } from "react"

interface AnimatedSectionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  delay?: number
}

export const AnimatedSection = function AnimatedSection({ 
  children, 
  className, 
  delay = 0, 
  ...props 
}: AnimatedSectionProps) {
  // Simplified version without framer-motion
  // Can be enhanced with CSS animations or framer-motion later
  return (
    <div
      className={className}
      {...props}
    >
      {children}
    </div>
  )
}
