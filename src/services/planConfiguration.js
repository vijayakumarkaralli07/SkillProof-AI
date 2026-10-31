export const planConfiguration = {
  currency: 'USD',
  pricingMode: 'sample',
  paymentProviderConfigured: false,
  annualDiscountPercent: 20,
  plans: [
    {
      id: 'free',
      name: 'Free',
      description: 'Great for getting started',
      monthlyCents: 0,
      annualCents: 0,
      features: [
        { label: 'Career dashboard', included: true },
        { label: 'Sample job discovery and filters', included: true },
        { label: 'Core learning and practice workspaces', included: true },
        { label: 'Expanded practice library', included: false },
        { label: 'Guided project pathways', included: false },
        { label: 'Advanced feedback tools', included: false },
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'For focused learners',
      monthlyCents: 999,
      annualCents: 9590,
      features: [
        { label: 'Everything in Free', included: true },
        { label: 'Additional practice workflows', included: true },
        { label: 'Step-by-step project workspaces', included: true },
        { label: 'Structured learning planner', included: true },
        { label: 'Resume and interview preparation', included: true },
        { label: 'Personalized progress review', included: true },
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'For serious career builders',
      monthlyCents: 1999,
      annualCents: 19190,
      features: [
        { label: 'Everything in Pro', included: true },
        { label: 'Expanded real-world project practice', included: true },
        { label: 'Advanced career practice workspaces', included: true },
        { label: 'Resume and coding practice tools', included: true },
        { label: 'Detailed progress tracking', included: true },
        { label: 'Priority support', included: true },
      ],
    },
  ],
}

export function getPlan(planId) {
  return planConfiguration.plans.find((plan) => plan.id === planId) ?? null
}

export function getPlanPriceCents(plan, interval) {
  return interval === 'yearly' ? plan.annualCents : plan.monthlyCents
}

export function formatPlanPrice(cents) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: planConfiguration.currency,
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}