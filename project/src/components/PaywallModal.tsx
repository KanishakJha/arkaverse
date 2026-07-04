import { useState } from 'react'
import { X, Sparkles, CheckCircle2, CreditCard, ShieldCheck } from 'lucide-react'
import { billingService, BILLING_CONFIG } from '../lib/billing'

interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubscribe = async (planType: 'monthly' | 'yearly', priceId: string) => {
    try {
      setLoadingPlan(planType)
      const { url, error } = await billingService.createCheckoutSession({
        priceId,
        planType
      })

      if (error) {
        alert(error)
        return
      }

      // Mock redirect sequence bypass for sandbox deployment presentation
      alert(`🚀 Redirecting to Stripe Gateway secure payment terminal for ${BILLING_CONFIG.plans[planType].name}...`)
      window.open(url, '_blank')
      onClose()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-3xl p-6 overflow-hidden shadow-2xl space-y-6">
        
        {/* TOP GLOW PATTERN EFFECTS */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 bg-emerald-500/10 blur-2xl rounded-full" />

        <div className="flex justify-between items-start relative">
          <div className="space-y-1">
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-black tracking-widest uppercase px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1 w-max">
              <Sparkles className="w-3 h-3" /> Fablex Premium Access
            </span>
            <h2 className="text-base font-black text-white">Unlock Full Story Universe</h2>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-zinc-800 rounded-full transition text-zinc-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* BENEFIT LAYOUT CHECKS */}
        <div className="space-y-2.5 text-xs font-semibold text-zinc-300">
          {[
            'Unlock all premium locked episodes & scripts',
            'Super high-quality human-like audio voices',
            'Ad-free uninterrupted horror ambient tracks',
            'Unlimited book cover phone uploads allocation'
          ].map((text, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* PRICING OPTIONS LIST */}
        <div className="space-y-3">
          {/* Monthly Sub Card */}
          <div className="border border-zinc-800 bg-zinc-950/40 p-4 rounded-2xl flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-zinc-400">{BILLING_CONFIG.plans.monthly.name}</p>
              <p className="text-lg font-black text-white">₹{BILLING_CONFIG.plans.monthly.amount}<span className="text-[10px] text-zinc-500 font-bold"> / month</span></p>
            </div>
            <button
              type="button"
              disabled={loadingPlan !== null}
              onClick={() => handleSubscribe('monthly', BILLING_CONFIG.plans.monthly.id)}
              className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-white font-bold text-xs rounded-xl hover:bg-zinc-800 transition shadow-md"
            >
              {loadingPlan === 'monthly' ? 'Linking...' : 'Choose Plan'}
            </button>
          </div>

          {/* Yearly Sub Card (Best Value Offer) */}
          <div className="border-2 border-emerald-500/30 bg-zinc-950/80 p-4 rounded-2xl flex items-center justify-between gap-4 relative">
            <span className="absolute -top-2.5 right-4 bg-emerald-500 text-black text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow">
              Save 45% • Best Offer
            </span>
            <div>
              <p className="text-xs font-bold text-zinc-200">{BILLING_CONFIG.plans.yearly.name}</p>
              <p className="text-lg font-black text-white">₹{BILLING_CONFIG.plans.yearly.amount}<span className="text-[10px] text-zinc-400 font-bold"> / year</span></p>
            </div>
            <button
              type="button"
              disabled={loadingPlan !== null}
              onClick={() => handleSubscribe('yearly', BILLING_CONFIG.plans.yearly.id)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-400 to-teal-500 text-black font-black text-xs rounded-xl shadow-lg transition transform active:scale-95"
            >
              {loadingPlan === 'yearly' ? 'Linking...' : 'Subscribe Now'}
            </button>
          </div>
        </div>

        {/* SECURITY PROMISE FOOTER */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-zinc-500 border-t border-zinc-800/60 pt-3">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-600" />
          <span>Secured Encryption Payment Processing Gateway Matrix</span>
        </div>

      </div>
    </div>
  )
}
