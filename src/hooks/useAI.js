import { useState, useEffect, useCallback, useRef } from 'react'
import { enhanceNudgeText, getInvestmentInsight, getDailyInsight, buildExpenseSummary } from '../utils/aiHelper'

/**
 * Hook for AI-enhanced nudge descriptions.
 * Only triggers when nudge list actually changes.
 */
export function useAINudge(nudge) {
  const [aiText, setAiText] = useState(null)
  const [loading, setLoading] = useState(false)
  const prevIdRef = useRef(null)

  useEffect(() => {
    if (!nudge || nudge.id === prevIdRef.current) return
    prevIdRef.current = nudge.id

    let cancelled = false
    setLoading(true)

    enhanceNudgeText(nudge).then((text) => {
      if (!cancelled) {
        setAiText(text)
        setLoading(false)
      }
    })

    return () => { cancelled = true }
  }, [nudge?.id])

  return { aiText: aiText || nudge?.description, loading }
}

/**
 * Hook for AI investment motivation messages.
 * Caches internally and only re-fetches when savings change.
 */
export function useAIInvestmentInsight(monthlySaving, futureValue3Y, futureValue5Y) {
  const [insight, setInsight] = useState(null)
  const [loading, setLoading] = useState(false)
  const prevSavingRef = useRef(null)

  useEffect(() => {
    if (!monthlySaving || monthlySaving === prevSavingRef.current) return
    prevSavingRef.current = monthlySaving

    let cancelled = false
    setLoading(true)

    getInvestmentInsight(monthlySaving, futureValue3Y, futureValue5Y).then((text) => {
      if (!cancelled) {
        setInsight(text)
        setLoading(false)
      }
    })

    return () => { cancelled = true }
  }, [monthlySaving, futureValue3Y, futureValue5Y])

  return { insight, loading }
}

/**
 * Hook for personalized daily AI insight on the dashboard.
 * Triggers once per mount, cached for 10 minutes.
 */
export function useAIDailyInsight(expenses, user) {
  const [insight, setInsight] = useState(null)
  const [loading, setLoading] = useState(false)
  const hasFetchedRef = useRef(false)

  useEffect(() => {
    if (hasFetchedRef.current || !expenses?.length) return
    hasFetchedRef.current = true

    let cancelled = false
    setLoading(true)

    const summary = buildExpenseSummary(expenses, user)
    getDailyInsight(summary).then((text) => {
      if (!cancelled) {
        setInsight(text)
        setLoading(false)
      }
    })

    return () => { cancelled = true }
  }, [expenses?.length])

  return { insight, loading }
}
