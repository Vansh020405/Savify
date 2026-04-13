export const formatCurrency = (value) => `₹${Math.round(value).toLocaleString('en-IN')}`

export const profileSnapshot = {
  age: 28,
  city: 'Bengaluru',
  budget: 1200,
  tags: 'Non-smoker · Salaried · No dependents',
}

export const sipPolicies = [
  {
    id: 'future-growth-ulip',
    name: 'Future Growth ULIP',
    insurer: 'Axis Life',
    category: 'ULIP',
    monthlyPremium: 500,
    maturityAmount: 820000,
    policyTerm: 20,
    benefitTag: 'Life cover + savings',
    reason: "Recommended because you're 28 and salaried with stable income.",
    isTopPick: true,
  },
  {
    id: 'secure-wealth-back',
    name: 'Secure Wealth Back',
    insurer: 'HDFC Life',
    category: 'Money-back',
    monthlyPremium: 750,
    maturityAmount: 620000,
    policyTerm: 18,
    benefitTag: 'Tax saving under 80C',
    reason: 'Recommended for monthly savings goal under ₹2,000.',
  },
  {
    id: 'steady-growth-sip',
    name: 'Steady Growth Plan',
    insurer: 'ICICI Pru',
    category: 'ULIP',
    monthlyPremium: 900,
    maturityAmount: 910000,
    policyTerm: 20,
    benefitTag: 'Long-term wealth + cover',
    reason: 'Recommended if you want savings discipline with protection.',
  },
]

export const protectionPolicies = [
  {
    id: 'health-core-plus',
    name: 'Health Core Plus',
    insurer: 'Care Health',
    category: 'Health',
    monthlyPremium: 1100,
    coverageAmount: 500000,
    policyTerm: 1,
    benefitTag: 'Cashless hospitalization',
    reason: 'Recommended because you have no current health cover.',
  },
  {
    id: 'term-shield-max',
    name: 'Term Shield Max',
    insurer: 'Max Life',
    category: 'Term',
    monthlyPremium: 420,
    coverageAmount: 8000000,
    policyTerm: 30,
    benefitTag: 'High life cover',
    reason: 'Recommended to protect income for 30 years.',
  },
  {
    id: 'accident-guard',
    name: 'Accident Guard',
    insurer: 'Bajaj Allianz',
    category: 'Accident',
    monthlyPremium: 260,
    coverageAmount: 1500000,
    policyTerm: 1,
    benefitTag: 'Immediate accident payout',
    reason: 'Recommended if you commute daily for work.',
  },
]

export const policyDetails = {
  'future-growth-ulip': {
    coverageBreakdown: [
      { label: 'Life cover', status: 'covered', note: 'Family gets payout on death.' },
      { label: 'Market-linked returns', status: 'partial', note: 'Returns depend on fund performance.' },
      { label: 'Liquidity', status: 'partial', note: 'Partial withdrawal after 5 years.' },
      { label: 'Guaranteed bonus', status: 'not', note: 'No fixed bonus promised.' },
    ],
    scenarios: {
      hospitalization: {
        title: "If I'm hospitalized",
        insurerPays: 0,
        youReceive: 0,
        condition: 'ULIPs do not cover medical bills.'
      },
      death: {
        title: 'If I pass away',
        insurerPays: 850000,
        youReceive: 850000,
        condition: 'Full cover paid to nominee.'
      },
      maturity: {
        title: 'At maturity',
        insurerPays: 820000,
        youReceive: 820000,
        condition: 'Projection at 8% fund growth.'
      },
    },
    habitProfile: {
      activity: ['walks', 'gym'],
      habits: ['neither', 'occasionally'],
      travel: ['monthly', 'weekly'],
      dependents: ['none'],
      savings: ['1000-2000', '2000plus'],
      reason: 'Good for active professionals who want long-term wealth.'
    },
  },
  'secure-wealth-back': {
    coverageBreakdown: [
      { label: 'Guaranteed payouts', status: 'covered', note: 'Fixed money-back schedule.' },
      { label: 'Life cover', status: 'covered', note: 'Protection included in plan.' },
      { label: 'Surrender value', status: 'partial', note: 'Available after 3 years.' },
      { label: 'Critical illness', status: 'not', note: 'Not part of this plan.' },
    ],
    scenarios: {
      hospitalization: {
        title: "If I'm hospitalized",
        insurerPays: 0,
        youReceive: 0,
        condition: 'Money-back plans do not pay hospital bills.'
      },
      death: {
        title: 'If I pass away',
        insurerPays: 450000,
        youReceive: 450000,
        condition: 'Sum assured paid to nominee.'
      },
      maturity: {
        title: 'At maturity',
        insurerPays: 620000,
        youReceive: 620000,
        condition: 'Guaranteed payouts across 18 years.'
      },
    },
    habitProfile: {
      activity: ['sedentary', 'walks'],
      habits: ['neither'],
      travel: ['rarely'],
      dependents: ['parents', 'kids'],
      savings: ['500', '1000-2000'],
      reason: 'Good for families who want assured payouts.'
    },
  },
  'steady-growth-sip': {
    coverageBreakdown: [
      { label: 'Life cover', status: 'covered', note: 'Nominee receives the cover amount.' },
      { label: 'Top-up contributions', status: 'partial', note: 'Allowed after year 2.' },
      { label: 'Partial withdrawals', status: 'partial', note: 'Allowed after lock-in.' },
      { label: 'Guaranteed returns', status: 'not', note: 'Returns are market-linked.' },
    ],
    scenarios: {
      hospitalization: {
        title: "If I'm hospitalized",
        insurerPays: 0,
        youReceive: 0,
        condition: 'ULIP does not cover hospital bills.'
      },
      death: {
        title: 'If I pass away',
        insurerPays: 900000,
        youReceive: 900000,
        condition: 'Cover amount paid to nominee.'
      },
      maturity: {
        title: 'At maturity',
        insurerPays: 910000,
        youReceive: 910000,
        condition: 'Projection at 8% fund growth.'
      },
    },
    habitProfile: {
      activity: ['walks', 'gym'],
      habits: ['neither', 'occasionally'],
      travel: ['monthly'],
      dependents: ['none'],
      savings: ['1000-2000', '2000plus'],
      reason: 'Good for consistent savers with medium risk appetite.'
    },
  },
  'health-core-plus': {
    coverageBreakdown: [
      { label: 'Hospitalization', status: 'covered', note: 'Room, ICU, and surgery covered.' },
      { label: 'Pre-existing illness', status: 'partial', note: 'Covered after 24 months.' },
      { label: 'Maternity', status: 'partial', note: 'Limited sub-limit applies.' },
      { label: 'Dental', status: 'not', note: 'Dental procedures excluded.' },
    ],
    scenarios: {
      hospitalization: {
        title: "If I'm hospitalized",
        insurerPays: 150000,
        youReceive: 150000,
        condition: 'Cashless claim in network hospitals.'
      },
      death: {
        title: 'If I pass away',
        insurerPays: 0,
        youReceive: 0,
        condition: 'Health policies do not pay life cover.'
      },
      maturity: {
        title: 'At maturity',
        insurerPays: 0,
        youReceive: 0,
        condition: 'Health plans do not have maturity benefit.'
      },
    },
    habitProfile: {
      activity: ['sedentary', 'walks'],
      habits: ['neither', 'occasionally'],
      travel: ['rarely', 'monthly'],
      dependents: ['parents'],
      savings: ['500', '1000-2000'],
      reason: 'Good for low-risk profiles without health cover.'
    },
  },
  'term-shield-max': {
    coverageBreakdown: [
      { label: 'Life cover', status: 'covered', note: 'Large payout to nominee.' },
      { label: 'Critical illness rider', status: 'partial', note: 'Optional add-on available.' },
      { label: 'Accidental death', status: 'covered', note: 'Included automatically.' },
      { label: 'Maturity payout', status: 'not', note: 'No payout if term completes.' },
    ],
    scenarios: {
      hospitalization: {
        title: "If I'm hospitalized",
        insurerPays: 0,
        youReceive: 0,
        condition: 'Term plans do not cover hospital bills.'
      },
      death: {
        title: 'If I pass away',
        insurerPays: 8000000,
        youReceive: 8000000,
        condition: 'Full sum assured paid to family.'
      },
      maturity: {
        title: 'At maturity',
        insurerPays: 0,
        youReceive: 0,
        condition: 'No maturity benefit.'
      },
    },
    habitProfile: {
      activity: ['sedentary', 'walks', 'gym'],
      habits: ['neither', 'occasionally'],
      travel: ['rarely', 'monthly'],
      dependents: ['parents', 'kids'],
      savings: ['500', '1000-2000'],
      reason: 'Good for anyone with dependents and income to protect.'
    },
  },
  'accident-guard': {
    coverageBreakdown: [
      { label: 'Accidental death', status: 'covered', note: 'Immediate payout on accident.' },
      { label: 'Disability cover', status: 'covered', note: 'Income support on disability.' },
      { label: 'Hospital cash', status: 'partial', note: 'Limited per-day cash benefit.' },
      { label: 'Critical illness', status: 'not', note: 'Not included.' },
    ],
    scenarios: {
      hospitalization: {
        title: "If I'm hospitalized",
        insurerPays: 45000,
        youReceive: 45000,
        condition: 'Daily hospital cash for 30 days.'
      },
      death: {
        title: 'If I pass away',
        insurerPays: 1500000,
        youReceive: 1500000,
        condition: 'Accidental death payout only.'
      },
      maturity: {
        title: 'At maturity',
        insurerPays: 0,
        youReceive: 0,
        condition: 'No maturity benefit.'
      },
    },
    habitProfile: {
      activity: ['gym', 'walks'],
      habits: ['occasionally', 'regularly'],
      travel: ['monthly', 'weekly'],
      dependents: ['none', 'parents'],
      savings: ['500'],
      reason: 'Good for commuters and frequent travelers.'
    },
  },
}

export const getPolicyById = (id) => {
  const allPolicies = [...sipPolicies, ...protectionPolicies]
  const base = allPolicies.find((policy) => policy.id === id)
  if (!base) return null
  return {
    ...base,
    ...policyDetails[id],
  }
}

export const allPolicies = [...sipPolicies, ...protectionPolicies]
