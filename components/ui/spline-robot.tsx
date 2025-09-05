"use client"

import { Suspense, lazy } from "react"
import { motion } from "framer-motion"

const Spline = lazy(() => import("@splinetool/react-spline"))

interface SplineSceneProps {
  scene?: string
  className?: string
}

// Fallback 3D-like robot visual when no scene is provided
function RobotFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
      <motion.div
        className="relative"
        animate={{
          rotateY: [0, 360],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        {/* Robot body */}
        <div className="relative">
          {/* Head */}
          <motion.div
            className="w-16 h-16 bg-gradient-to-br from-slate-300 to-slate-600 rounded-lg mx-auto mb-2 relative shadow-lg"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            {/* Eyes */}
            <div className="absolute top-4 left-3 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <div className="absolute top-4 right-3 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            {/* Antenna */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1 h-4 bg-slate-400 rounded-full" />
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-400 rounded-full animate-pulse" />
          </motion.div>

          {/* Body */}
          <motion.div
            className="w-20 h-24 bg-gradient-to-br from-slate-400 to-slate-700 rounded-xl mx-auto mb-2 relative shadow-lg"
            animate={{
              scaleY: [1, 0.98, 1],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            {/* Chest panel */}
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-12 h-8 bg-slate-600 rounded border-2 border-slate-500" />
            <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-green-400 rounded animate-pulse" />
          </motion.div>

          {/* Arms */}
          <motion.div
            className="absolute top-20 -left-6 w-4 h-16 bg-gradient-to-b from-slate-400 to-slate-600 rounded-full shadow-md"
            animate={{
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-20 -right-6 w-4 h-16 bg-gradient-to-b from-slate-400 to-slate-600 rounded-full shadow-md"
            animate={{
              rotate: [0, -10, 10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />

          {/* Legs */}
          <div className="flex justify-center gap-2 mt-2">
            <motion.div
              className="w-5 h-20 bg-gradient-to-b from-slate-500 to-slate-700 rounded-full shadow-md"
              animate={{
                scaleY: [1, 1.02, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="w-5 h-20 bg-gradient-to-b from-slate-500 to-slate-700 rounded-full shadow-md"
              animate={{
                scaleY: [1, 1.02, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 0.3,
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-blue-400 rounded-full"
          style={{
            left: `${20 + i * 10}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
          animate={{
            y: [-10, 10, -10],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 2 + i * 0.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  )
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  if (!scene) {
    return (
      <div className={className}>
        <RobotFallback />
      </div>
    )
  }

  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <RobotFallback />
        </div>
      }
    >
      <Spline scene={scene} className={className} />
    </Suspense>
  )
}
