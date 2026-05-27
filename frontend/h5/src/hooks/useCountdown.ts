import { useState, useEffect, useRef, useCallback } from 'react'

interface CountdownOptions {
  onTick?: (remainingMs: number) => void
  onComplete?: () => void
  autoStart?: boolean
}

export const useCountdown = (initialMs: number, options: CountdownOptions = {}) => {
  const { onTick, onComplete, autoStart = true } = options

  const [remainingMs, setRemainingMs] = useState(initialMs)
  const [isRunning, setIsRunning] = useState(autoStart)
  const rafIdRef = useRef<number | null>(null)
  const lastTickRef = useRef<number>(Date.now())

  const start = useCallback(() => {
    setIsRunning(true)
  }, [])

  const pause = useCallback(() => {
    setIsRunning(false)
  }, [])

  const reset = useCallback(
    (newMs?: number) => {
      setRemainingMs(newMs ?? initialMs)
      lastTickRef.current = Date.now()
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
    },
    [initialMs]
  )

  useEffect(() => {
    if (!isRunning || remainingMs <= 0) {
      if (remainingMs <= 0 && onComplete) {
        onComplete()
      }
      return
    }

    const tick = () => {
      const now = Date.now()
      const delta = now - lastTickRef.current
      lastTickRef.current = now

      setRemainingMs((prev) => {
        const newRemaining = Math.max(0, prev - delta)

        if (onTick) {
          onTick(newRemaining)
        }

        if (newRemaining <= 0) {
          setIsRunning(false)
          if (onComplete) {
            onComplete()
          }
        }

        return newRemaining
      })

      if (isRunning) {
        rafIdRef.current = requestAnimationFrame(tick)
      }
    }

    lastTickRef.current = Date.now()
    rafIdRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [isRunning, onTick, onComplete])

  return {
    remainingMs,
    isRunning,
    start,
    pause,
    reset,
  }
}
