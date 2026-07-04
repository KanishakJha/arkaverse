import { supabase } from './supabase'

export interface CheckoutSessionOptions {
  priceId: string
  planType: 'monthly' | 'yearly' | 'single_book'
  bookId?: string
}

export const BILLING_CONFIG = {
  currency: 'INR',
  plans: {
    monthly: { id: 'price_monthly_token_abc', amount: 299, name: 'Premium Monthly' },
    yearly: { id: 'price_yearly_token_xyz', amount: 1999, name: 'Premium Yearly' }
  }
}

export const billingService = {
  // 🚀 Stripe Checkout Redirect Simulation Generator
  async createCheckoutSession(options: CheckoutSessionOptions): Promise<{ url: string; error?: string }> {
    try {
      // 1. Fetch authenticated user instance safely
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { url: '', error: 'Please log in to unlock premium modules.' }
      }

      console.log(`Stripe Payload Initialized for user: ${user.id} with plan: ${options.planType}`)

      // 2. Stripe checkout metadata structure map framework
      // Real flow redirects to a serverless edge endpoint wrapper
      const simulatedStripeUrl = `https://checkout.stripe.com/pay/${options.priceId}?client_reference_id=${user.id}`
      
      return { url: simulatedStripeUrl }
    } catch (err: any) {
      return { url: '', error: err.message || 'Stripe initialization failed.' }
    }
  },

  // Checking synchronization states safely from memory caches
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
