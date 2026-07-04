import { supabase } from './supabase'

export interface CheckoutSessionOptions {
  priceId: string
  planType: 'monthly' | 'yearly' | 'single_book'
  provider: 'stripe' | 'paytm'
  bookId?: string
}

export const BILLING_CONFIG = {
  currency: 'INR',
  merchantUpi: '9015131108@ptyes', // 🚀 Paytm VPA Handle Integrated Safely
  plans: {
    monthly: { id: 'price_monthly_token_abc', amount: 299, name: 'Premium Monthly' },
    yearly: { id: 'price_yearly_token_xyz', amount: 1999, name: 'Premium Yearly' }
  }
}

export const billingService = {
  async createCheckoutSession(options: CheckoutSessionOptions): Promise<{ url: string; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { url: '', error: 'Please log in to unlock premium modules.' }
      }

      console.log(`Payment Initialized via ${options.provider} for user: ${user.id}`)

      const planDetails = BILLING_CONFIG.plans[options.planType as 'monthly' | 'yearly']
      const amount = planDetails ? planDetails.amount : 299
      const note = encodeURIComponent(`Fablex Premium ${options.planType}`)

      if (options.provider === 'paytm') {
        // Standard mobile web hyper-intent deep link layout matrix standard structure
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
    const { data } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (data && new Date(data.expires_at) > new Date()) {
      return { isPremium: true, plan: data.plan_type }
    }

    return { isPremium: false, plan: 'free' }
  }
}
