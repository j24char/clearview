import { AvailabilitySlot, Booking, Order, Service, Testimonial } from '@/lib/types';

export const serviceCatalog: Service[] = [
  {
    id: 'svc-exterior',
    name: 'Exterior Shine',
    description:
      'Exterior glass wash for street-facing and backyard windows with frame wipe-down and spot check.',
    priceLabel: 'Starting at $129',
    priceCents: 12900,
    active: true,
  },
  {
    id: 'svc-full-home',
    name: 'Full Home Detail',
    description:
      'Inside and outside window cleaning for single-family homes, including tracks and sill touch-up.',
    priceLabel: 'Starting at $219',
    priceCents: 21900,
    active: true,
  },
  {
    id: 'svc-storefront',
    name: 'Storefront Refresh',
    description:
      'Recurring storefront cleaning option for small businesses with flexible morning availability.',
    priceLabel: 'Custom quote',
    priceCents: 0,
    active: true,
  },
];

export const availabilitySlots: AvailabilitySlot[] = [
  { id: 'slot-1', label: 'Monday', window: '9:00 AM - 11:00 AM' },
  { id: 'slot-2', label: 'Wednesday', window: '1:00 PM - 3:00 PM' },
  { id: 'slot-3', label: 'Friday', window: '10:00 AM - 12:00 PM' },
];

export const mockBookings: Booking[] = [
  { id: 'bk-1', serviceName: 'Full Home Detail', status: 'confirmed' },
  { id: 'bk-2', serviceName: 'Exterior Shine', status: 'completed' },
];

export const mockOrders: Order[] = [
  { id: 'ord-1', customerName: 'Avery Johnson', totalLabel: '$219.00', status: 'paid' },
  { id: 'ord-2', customerName: 'Morgan Patel', totalLabel: '$129.00', status: 'pending' },
];

export const businessHighlights = [
  {
    title: 'Fast local scheduling',
    description: 'Customers can see the next available openings without calling or texting first.',
  },
  {
    title: 'Clean customer records',
    description: 'Firebase Auth and profile documents give you a simple source of truth for repeat clients.',
  },
  {
    title: 'Ready for payments',
    description: 'The booking flow already has a place for Stripe checkout when your account is ready.',
  },
];

export const testimonials: Testimonial[] = [
  {
    name: 'Jordan R.',
    quote: 'The booking flow felt simple and professional, and the windows looked incredible.',
  },
  {
    name: 'Casey L.',
    quote: 'I appreciated getting a clear time window and transparent pricing before checkout.',
  },
];
