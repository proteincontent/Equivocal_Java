"use client"
import { useRef, useState, useCallback, useEffect } from "react"
import { motion, useSpring, useTransform, type SpringOptions } from "framer-motion"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

type SpotlightProps = {
  className?: string
  size?: number
  springOptions?: SpringOptions
}

export function SpotlightInteractive({
  className,
  size = 200,
  springOptions = { stiffness: 150, damping: 15, mass: 0.1 },
}: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [parentElement, setParentElement] = useState<HTMLElement | null>(null)
  const { theme, resolvedTheme } = useTheme()

  const mouseX = useSpring(0, springOptions)
  const mouseY = useSpring(0, springOptions)

  const spotlightLeft = useTransform(mouseX, (x) => `${x - size / 2}px`)
  const spotlightTop = useTransform(mouseY, (y) => `${y - size / 2}px`)

  const getSpotlightGradient = () => {
    const isDark = resolvedTheme === "dark"
    if (isDark) {
      // White/bright gradient for dark mode
      return "bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0.4)_25%,rgba(255,255,255,0.1)_50%,transparent_80%)]"
    } else {
      return "bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.6)_0%,rgba(34,197,94,0.4)_25%,rgba(34,197,94,0.2)_50%,rgba(34,197,94,0.1)_70%,transparent_90%)]"
    }
  }

  useEffect(() => {
    if (containerRef.current) {
      const parent = containerRef.current.parentElement
      if (parent) {
        parent.style.position = "relative"
        parent.style.overflow = "hidden"
        setParentElement(parent)
      }
    }
  }, [])

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!parentElement) return
      const { left, top } = parentElement.getBoundingClientRect()
      mouseX.set(event.clientX - left)
      mouseY.set(event.clientY - top)
    },
    [mouseX, mouseY, parentElement],
  )

  const handleMouseEnter = useCallback(() => setIsHovered(true), [])
  const handleMouseLeave = useCallback(() => setIsHovered(false), [])

  useEffect(() => {
    if (!parentElement) return

    parentElement.addEventListener("mousemove", handleMouseMove)
    parentElement.addEventListener("mouseenter", handleMouseEnter)
    parentElement.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      parentElement.removeEventListener("mousemove", handleMouseMove)
      parentElement.removeEventListener("mouseenter", handleMouseEnter)
      parentElement.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [parentElement, handleMouseMove, handleMouseEnter, handleMouseLeave])

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        "pointer-events-none absolute rounded-full transition-all duration-300 ease-out",
        getSpotlightGradient(),
        resolvedTheme === "dark" ? "blur-sm" : "blur-[1px]",
        isHovered ? "opacity-100" : "opacity-0",
        className,
      )}
      style={{
        width: size,
        height: size,
        left: spotlightLeft,
        top: spotlightTop,
        zIndex: 10,
      }}
    />
  )
}
