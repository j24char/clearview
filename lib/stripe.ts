import { httpsCallable } from 'firebase/functions';

import { functions } from '@/lib/firebase';

type CheckoutInput = {
  bookingId: string;
  serviceId: string;
  serviceName: string;
  slotId: string;
  numberOfWindows: number;
  unitPriceCents: number;
  totalAmount: number;
  customerEmail?: string;
  customerName?: string;
  successUrl: string;
  cancelUrl: string;
};

type CheckoutResult = {
  ok: boolean;
  message: string;
  url?: string;
  sessionId?: string;
  orderId?: string;
};

export async function createStripeCheckoutSession(input: CheckoutInput): Promise<CheckoutResult> {
  try {
    const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
    const result = await createCheckoutSession(input);
    const data = result.data as { url?: string; sessionId?: string; orderId?: string };

    if (!data?.url) {
      return {
        ok: false,
        message: 'Stripe Checkout did not return a session URL.',
      };
    }

    return {
      ok: true,
      message: 'Stripe Checkout session created.',
      url: data.url,
      sessionId: data.sessionId,
      orderId: data.orderId,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : 'Unable to create a Stripe Checkout session.',
    };
  }
}
