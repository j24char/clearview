type PlaceholderCheckoutInput = {
  serviceId: string;
  slotId: string;
  numberOfWindows: number;
};

export async function createStripeCheckoutPlaceholder(input: PlaceholderCheckoutInput) {
  const stripePublishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  return {
    ok: true,
    message: stripePublishableKey
      ? `Publishable key detected. Next step: call a Firebase Function to create a Checkout Session for ${input.serviceId} at ${input.slotId}.`
      : `No Stripe keys configured yet. Once your Stripe account is ready, add EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY and replace this placeholder with a Firebase Function call.`,
  };
}
