import { supabase } from './supabase'

// 🚀 Explicit rigidly locked strict types for absolute type safety
export type PlanType = 'monthly' | 'yearly' | 'single_book'
export type BillingProvider = 'stripe' | 'paytm'

export interface CheckoutSessionOptions {
  priceId: string
  planType: PlanType
  provider: BillingProvider
  bookId?: string
}

export const BILLING_CONFIG = {
  currency: 'INR',
  merchantUpi: '9015131108@ptyes', // Paytm VPA Handle
  plans: {
    monthly: { id: 'price_monthly_token_abc', amount: 299, name: 'Premium Monthly' },
    yearly: { id: 'price_yearly_token_xyz', amount: 1999, name: 'Premium Yearly' },
    single_book: { id: 'price_single_book_token', amount: 99, name: 'Single Script Purchase' }
  }
} as const // Use 'as const' to make properties strictly read-only for TS compiler

export const billingService = {
  async createCheckoutSession(options: CheckoutSessionOptions): Promise<{ url: string; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { url: '', error: 'Please log in to unlock premium modules.' }
      }

      console.log(`Payment Initialized via ${options.provider} for user: ${user.id}`)

      // Safely access amount or default to 299
      let amount = 299
      if (options.planType === 'monthly') amount = BILLING_CONFIG.plans.monthly.amount
      else if (options.planType === 'yearly') amount = BILLING_CONFIG.plans.yearly.amount
      else if (options.planType === 'single_book') amount = BILLING_CONFIG.plans.single_book.amount

      const note = encodeURIComponent(`Fablex Premium ${options.planType}`)

      if (options.provider === 'paytm') {
        // Standard mobile web hyper-intent deep link layout matrix structure
        const upiIntentUrl = `upi://pay?pa=${BILLING_CONFIG.merchantUpi}&pn=Fablex&am=${amount}&cu=INR&tn=${note}`
        return { url: upiIntentUrl }
      } else {
        const simulatedStripeUrl = `https://checkout.stripe.com/pay/${options.priceId}?client_reference_id=${user.id}`
        return { url: simulatedStripeUrl }
      }

    } catch (err: any) {
      return { url: '', error: err.message || 'Payment initialization failed.' }
    }
  },

  async verifyUserSubscriptionStatus(userId: string): Promise<{ isPremium: boolean; plan: string }> {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle() // Use maybeSingle to prevent crash if row does not exist

      if (!error && data && new Date(data.expires_at) > new Date()) {
        return { isPremium: true, plan: data.plan_type }
      }
    } catch (e) {
      console.error("Subscription verify log crash info:", e)
    }

    return { isPremium: false, plan: 'free' }
  }
}
