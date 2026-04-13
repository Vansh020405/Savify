import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BadgeCheck, ArrowUpRight } from 'lucide-react'
import { allPolicies, formatCurrency, getPolicyById } from '../utils/policyData'

const habitQuestions = [
  {
    id: 'activity',
    label: 'How active are you?',
    options: [
      { value: 'sedentary', label: 'Sedentary' },
      { value: 'walks', label: 'Walks daily' },
      { value: 'gym', label: 'Gym regular' },
    ],
  },
  {
    id: 'habits',
    label: 'Do you smoke or drink?',
    options: [
      { value: 'neither', label: 'Neither' },
      { value: 'occasionally', label: 'Occasionally' },
      { value: 'regularly', label: 'Regularly' },
    ],
  },
  {
    id: 'travel',
    label: 'Do you travel for work?',
    options: [
      { value: 'rarely', label: 'Rarely' },
      { value: 'monthly', label: 'Monthly' },
      { value: 'weekly', label: 'Weekly' },
    ],
  },
  {
    id: 'dependents',
    label: 'Do you have dependents?',
    options: [
      { value: 'none', label: 'None' },
      { value: 'parents', label: 'Yes - parents' },
      { value: 'kids', label: 'Yes - kids' },
    ],
  },
  {
    id: 'savings',
    label: "What's your monthly savings goal?",
    options: [
      { value: '500', label: '₹500' },
      { value: '1000-2000', label: '₹1,000-2,000' },
      { value: '2000plus', label: '₹2,000+' },
    ],
  },
]

const computeMatchScore = (policy, answers) => {
  const profile = policy.habitProfile
  if (!profile) return 70

  let score = 68
  habitQuestions.forEach((question) => {
    const selected = answers[question.id]
    if (!selected) return
    if (profile[question.id]?.includes(selected)) {
      score += 6
    } else {
      score -= 4
    }
  })

  return Math.min(98, Math.max(40, score))
}

const InsuranceHabits = () => {
  const [answers, setAnswers] = useState({})

  const nextQuestion = habitQuestions.find((q) => !answers[q.id])
  const allAnswered = !nextQuestion

  const matchedPolicies = useMemo(() => {
    if (!allAnswered) return []
    return allPolicies
      .map((policy) => {
        const detail = getPolicyById(policy.id)
        const score = computeMatchScore(detail, answers)
        return {
          ...policy,
          habitReason: detail.habitProfile?.reason || 'Matched to your habits',
          score,
        }
      })
      .sort((a, b) => b.score - a.score)
  }, [allAnswered, answers])

  return (
    <div className="min-h-screen bg-[#F8F9FB] px-6 py-6 pb-28">
      <header className="mb-6">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-500">Habit-matched policies</p>
        <h1 className="text-4xl font-black tracking-tight text-[#232734] mt-2">Fit for your lifestyle</h1>
        <p className="text-sm text-slate-600 mt-2">Answer a few quick taps and we will rank your best matches.</p>
      </header>

      {!allAnswered && nextQuestion && (
        <section className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm mb-6">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Habit profile</p>
          <h2 className="text-lg font-black text-slate-900 mt-2">{nextQuestion.label}</h2>
          <div className="grid grid-cols-1 gap-2 mt-4">
            {nextQuestion.options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setAnswers((prev) => ({ ...prev, [nextQuestion.id]: option.value }))}
                className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-left text-sm font-bold text-slate-700"
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 font-semibold mt-4">
            {Object.keys(answers).length} of {habitQuestions.length} answered
          </p>
        </section>
      )}

      {allAnswered && (
        <section className="mb-6">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-emerald-700 text-xs font-semibold">
            Based on your habits, you're a low-risk profile. These plans reward that.
          </div>
        </section>
      )}

      {allAnswered && (
        <section>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 mb-3">Top matches</p>
          <div className="grid gap-3">
            {matchedPolicies.map((policy) => (
              <Link
                key={policy.id}
                to={`/insurance/${policy.id}`}
                className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.16em]">{policy.category}</p>
                    <h3 className="text-lg font-black text-slate-900 mt-1">{policy.name}</h3>
                    <p className="text-xs text-slate-600 font-semibold">{policy.habitReason}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase text-emerald-600">{policy.score}% match</span>
                    <BadgeCheck size={16} className="text-emerald-600 mt-1" />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm font-black text-slate-900">{formatCurrency(policy.monthlyPremium)}/mo</p>
                  <span className="inline-flex items-center gap-1 text-indigo-600 text-[11px] font-black uppercase">
                    View details
                    <ArrowUpRight size={12} />
                  </span>
                </div>

                <div className="mt-3 h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${policy.score}%` }} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default InsuranceHabits
