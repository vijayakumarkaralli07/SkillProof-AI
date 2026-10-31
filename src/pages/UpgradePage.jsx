import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  CircleHelp,
  CreditCard,
  Crown,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { formatPlanPrice, getPlan, getPlanPriceCents, planConfiguration } from '../services/planConfiguration'
import '../styles/upgrade.css'

const billingIntervals = ['monthly', 'yearly']

function safeReturnTo(value) {
  return typeof value === 'string'
    && value.startsWith('/')
    && !value.startsWith('//')
    && !value.startsWith('/upgrade')
    ? value
    : '/dashboard'
}

function BackButton({ to, children }) {
  const navigate = useNavigate()
  return <button type="button" className="upgrade-back" onClick={() => navigate(to)}>
    <ArrowLeft size={15} />{children}
  </button>
}

function PricingPage({ interval, onIntervalChange }) {
  const navigate = useNavigate()
  return <section className="upgrade-page" aria-labelledby="upgrade-title">
    <BackButton to="/dashboard">Back to Build Your Career</BackButton>
    <header className="upgrade-heading">
      <span className="upgrade-kicker"><Sparkles size={14} />CAREER WORKSPACE</span>
      <h1 id="upgrade-title">Upgrade to Pro</h1>
      <p>Get more power, more practice, and faster career growth with SkillProof AI.</p>
    </header>

    <div className="upgrade-billing-row">
      <div className="upgrade-billing-toggle" role="group" aria-label="Billing interval">
        {billingIntervals.map((value) => <button
          type="button"
          key={value}
          aria-pressed={interval === value}
          className={interval === value ? 'selected' : ''}
          onClick={() => onIntervalChange(value)}
        >{value === 'monthly' ? 'Monthly' : 'Yearly'}</button>)}
      </div>
      <span className="upgrade-savings-badge">Save up to {planConfiguration.annualDiscountPercent}%</span>
      <span className="upgrade-current-label"><BadgeCheck size={15} />Free access remains available</span>
    </div>

    <div className="upgrade-plan-grid">
      {planConfiguration.plans.map((plan) => <article className={`upgrade-plan-card upgrade-${plan.id}-card${plan.id === 'pro' ? ' upgrade-pro-card' : ''}`} key={plan.id}>
        {plan.id === 'pro' && <span className="upgrade-recommended"><Crown size={13} />MOST POPULAR</span>}
        <div className="upgrade-plan-top"><span className={`upgrade-plan-icon${plan.id !== 'free' ? ' pro' : ''}`}>{plan.id === 'free' ? <ShieldCheck size={18} /> : <Sparkles size={18} />}</span><span className="upgrade-plan-status">{plan.id === 'free' ? 'CURRENT PLAN' : plan.name.toUpperCase()}</span></div>
        <h2>{plan.name}</h2>
        <p className="upgrade-plan-description">{plan.description}</p>
        <div className="upgrade-price"><b>{formatPlanPrice(getPlanPriceCents(plan, interval))}</b><span>{plan.id === 'free' ? 'forever' : interval === 'monthly' ? '/ month' : '/ year'}</span></div>
        {plan.id !== 'free' && interval === 'yearly' && <small className="upgrade-monthly-equivalent">{formatPlanPrice(Math.round(plan.annualCents / 12))} / month, billed yearly</small>}
        <ul className="upgrade-features">{plan.features.map((feature) => <li className={feature.included ? '' : 'not-included'} key={feature.label}>{feature.included ? <Check size={14} /> : <X size={14} />}{feature.label}</li>)}</ul>
        {plan.id === 'free'
          ? <button type="button" className="upgrade-plan-button secondary" disabled>Current Plan</button>
          : <button type="button" className={`upgrade-plan-button${plan.id === 'pro' ? ' primary' : ' outline'}`} onClick={() => navigate(`/upgrade/checkout?plan=${plan.id}&interval=${interval}`)}>
            Upgrade to {plan.name} <ArrowRight size={14} />
          </button>}
      </article>)}
    </div>

    <aside className="upgrade-setup-note" role="status">
      <LockKeyhole size={17} />
      <p><b>Development pricing preview.</b> These prices and plan benefits are illustrative only. Purchases and paid entitlements are unavailable until a payment provider and trusted backend are configured.</p>
    </aside>
    <div className="upgrade-bottom-links">
      <button type="button" onClick={() => navigate('/upgrade/manage')}>Manage subscription <ArrowRight size={14} /></button>
      <span><ShieldCheck size={14} />No payment details are collected here.</span>
    </div>
  </section>
}

function CheckoutPage({ interval, selectedPlan, onIntervalChange }) {
  const navigate = useNavigate()
  const priceCents = getPlanPriceCents(selectedPlan, interval)
  return <section className="upgrade-page" aria-labelledby="checkout-title">
    <BackButton to={`/upgrade?interval=${interval}`}>Back to Plans</BackButton>
    <header className="upgrade-heading compact">
      <span className="upgrade-kicker"><LockKeyhole size={14} />SECURE CHECKOUT</span>
      <h1 id="checkout-title">Complete Your Upgrade</h1>
      <p>Review your selected plan and billing interval. No payment will be taken in this development preview.</p>
    </header>

    <div className="upgrade-checkout-layout">
      <article className="upgrade-checkout-card">
        <div className="upgrade-checkout-plan">
          <span className={`upgrade-plan-icon${selectedPlan.id === 'free' ? '' : ' pro'}`}>{selectedPlan.id === 'premium' ? <Crown size={18} /> : <Sparkles size={18} />}</span>
          <div><span>SELECTED PLAN</span><h2>{selectedPlan.name}</h2></div>
          <span className="upgrade-dev-tag">SAMPLE PRICING</span>
        </div>
        <div className="upgrade-checkout-interval">
          <span>Billing interval</span>
          <div className="upgrade-billing-toggle small" role="group" aria-label="Checkout billing interval">
            {billingIntervals.map((value) => <button type="button" key={value} aria-pressed={interval === value} className={interval === value ? 'selected' : ''} onClick={() => onIntervalChange(value)}>{value === 'monthly' ? 'Monthly' : 'Yearly'}</button>)}
          </div>
        </div>
        <ul className="upgrade-checkout-includes">
          {selectedPlan.features.filter((feature) => feature.included).slice(0, 4).map((feature) => <li key={feature.label}><Check size={15} /><span><b>{feature.label}</b><small>Illustrative plan benefit; no paid access is currently enabled.</small></span></li>)}
          <li><CreditCard size={15} /><span><b>Payment method</b><small>Not collected. A hosted payment provider is not configured.</small></span></li>
        </ul>
        <div className="upgrade-cost-breakdown">
          <div><span>Plan price</span><b>{formatPlanPrice(priceCents)}{selectedPlan.id !== 'free' ? interval === 'monthly' ? ' / month' : ' / year' : ''}</b></div>
          <div><span>Taxes</span><b>Not calculated</b></div>
          <div className="total"><span>Sample amount</span><b>{formatPlanPrice(priceCents)}</b></div>
          <small>Billing renewal terms are not configured. No amount will be charged.</small>
        </div>
        <button type="button" className="upgrade-plan-button primary full" disabled={!planConfiguration.paymentProviderConfigured} aria-disabled={!planConfiguration.paymentProviderConfigured}>
          Continue to Payment <LockKeyhole size={15} />
        </button>
        <p className="upgrade-disabled-reason" role="status">Payment is unavailable until a provider and server-side checkout endpoint are configured. Your plan will not change.</p>
      </article>

      <aside className="upgrade-checkout-aside">
        <span className="upgrade-aside-icon"><ShieldCheck size={21} /></span>
        <h2>Your payment stays protected</h2>
        <p>Payment details must be entered only in a provider-hosted checkout or provider-controlled payment component.</p>
        <div><Check size={14} />No raw card numbers or CVV stored by SkillProof AI</div>
        <div><Check size={14} />Provider secrets remain on the backend</div>
        <div><Check size={14} />Access changes only after trusted confirmation</div>
        <button type="button" className="upgrade-text-link" onClick={() => navigate('/upgrade?interval=' + interval)}>Back to Plans</button>
      </aside>
    </div>
  </section>
}

function PaymentStatusPage() {
  const navigate = useNavigate()
  return <section className="upgrade-page" aria-labelledby="confirmation-title">
    <BackButton to="/upgrade">Back to Plans</BackButton>
    <div className="upgrade-result-card">
      <span className="upgrade-result-icon"><CircleHelp size={25} /></span>
      <span className="upgrade-kicker">PAYMENT STATUS</span>
      <h1 id="confirmation-title">Payment not configured</h1>
      <p>No checkout provider is connected, so no payment was attempted or verified. Your account plan and access have not changed.</p>
      <div className="upgrade-result-details">
        <div><span>Status</span><b>Not started</b></div>
        <div><span>Plan</span><b>No paid plan activated</b></div>
        <div><span>Amount</span><b>Not charged</b></div>
      </div>
      <div className="upgrade-result-actions">
        <button type="button" className="upgrade-plan-button primary" onClick={() => navigate('/upgrade')}>Return to Plans</button>
        <button type="button" className="upgrade-plan-button secondary" onClick={() => navigate('/dashboard')}>Go to Build Your Career</button>
      </div>
    </div>
  </section>
}

function ManagementPage() {
  const navigate = useNavigate()
  return <section className="upgrade-page" aria-labelledby="management-title">
    <BackButton to="/dashboard">Back to Build Your Career</BackButton>
    <header className="upgrade-heading compact">
      <span className="upgrade-kicker"><CreditCard size={14} />ACCOUNT BILLING</span>
      <h1 id="management-title">Subscription management</h1>
      <p>Review your current plan and billing information.</p>
    </header>
    <article className="upgrade-empty-subscription">
      <span className="upgrade-empty-icon"><CreditCard size={22} /></span>
      <div>
        <span className="upgrade-plan-status">CURRENT STATUS</span>
        <h2>No paid subscription found</h2>
        <p>No subscription provider or user-scoped subscription record is configured for this account. Renewal dates, payment method details, invoices, usage, cancellation, and reactivation are unavailable.</p>
        <div className="upgrade-management-actions"><button type="button" className="upgrade-plan-button primary" onClick={() => navigate('/upgrade')}>Compare plans <ArrowRight size={15} /></button><button type="button" className="upgrade-plan-button secondary" onClick={() => navigate('/dashboard')}>Go to Build Your Career</button></div>
      </div>
    </article>
    <aside className="upgrade-setup-note">
      <ShieldCheck size={17} />
      <p>Subscription changes must be validated by a trusted backend against the signed-in user. This page cannot modify another user's subscription or grant entitlements.</p>
    </aside>
  </section>
}

export default function UpgradePage({ user }) {
  const location = useLocation()
  const navigate = useNavigate()
  const params = new URLSearchParams(location.search)
  const segments = location.pathname.replace(/\/+$/, '').split('/')
  const screen = segments.at(-1) === 'upgrade' ? 'pricing' : segments.at(-1)
  const interval = billingIntervals.includes(params.get('interval')) ? params.get('interval') : 'monthly'
  const selectedPlan = getPlan(params.get('plan') || 'pro') ?? getPlan('pro')
  const returnTo = safeReturnTo(location.state?.returnTo || params.get('returnTo'))

  function changeInterval(value) {
    const next = new URLSearchParams(location.search)
    next.set('interval', value)
    navigate(`${location.pathname}?${next.toString()}`, {
      replace: true,
      state: { ...location.state, returnTo },
    })
  }

  if (!user?.id) return <section className="upgrade-page"><p role="alert">Your signed-in account could not be verified. Please return to the application and sign in again.</p></section>

  if (screen === 'checkout') {
    return <CheckoutPage
      interval={interval}
      selectedPlan={selectedPlan}
      onIntervalChange={changeInterval}
    />
  }
  if (screen === 'confirmation') return <PaymentStatusPage />
  if (screen === 'manage') return <ManagementPage />

  return <PricingPage interval={interval} onIntervalChange={changeInterval} />
}
