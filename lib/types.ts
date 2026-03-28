export type Service = {
  id: string;
  name: string;
  description: string;
  priceLabel: string;
  priceCents: number;
  active: boolean;
};

export type AvailabilitySlot = {
  id: string;
  label: string;
  window: string;
};

export type Booking = {
  id: string;
  serviceName: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  scheduledDate?: string;
  slotLabel?: string;
  slotWindow?: string;
  numberOfWindows?: number;
};

export type Order = {
  id: string;
  customerName: string;
  totalLabel: string;
  status: 'paid' | 'pending' | 'refunded';
  serviceName?: string;
};

export type Testimonial = {
  name: string;
  quote: string;
};

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'customer' | 'admin';
};
