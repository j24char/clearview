import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { Booking, Order, Service } from '@/lib/types';

type LoadableData<T> = {
  data: T[];
  loading: boolean;
  error: string | null;
};

function formatCurrency(cents: number) {
  if (!cents) {
    return 'Custom quote';
  }

  return `Starting at $${(cents / 100).toFixed(0)}`;
}

function isBookingStatus(value: unknown): value is Booking['status'] {
  return value === 'pending' || value === 'confirmed' || value === 'completed' || value === 'cancelled';
}

function isOrderStatus(value: unknown): value is Order['status'] {
  return value === 'paid' || value === 'pending' || value === 'refunded';
}

function normalizeService(raw: Record<string, unknown>, id: string): Service {
  const priceCents = typeof raw.priceCents === 'number' ? raw.priceCents : 0;

  return {
    id,
    name: typeof raw.name === 'string' ? raw.name : 'Untitled service',
    description:
      typeof raw.description === 'string'
        ? raw.description
        : 'Service description will appear here once added in Firestore.',
    priceCents,
    priceLabel:
      typeof raw.priceLabel === 'string' && raw.priceLabel.trim().length > 0
        ? raw.priceLabel
        : formatCurrency(priceCents),
    active: raw.active !== false,
  };
}

function normalizeBooking(raw: Record<string, unknown>, id: string): Booking {
  return {
    id,
    serviceName: typeof raw.serviceName === 'string' ? raw.serviceName : 'Window Cleaning',
    status: isBookingStatus(raw.status) ? raw.status : 'pending',
    scheduledDate: typeof raw.scheduledDate === 'string' ? raw.scheduledDate : undefined,
    slotLabel: typeof raw.slotLabel === 'string' ? raw.slotLabel : undefined,
    slotWindow: typeof raw.slotWindow === 'string' ? raw.slotWindow : undefined,
    numberOfWindows: typeof raw.numberOfWindows === 'number' ? raw.numberOfWindows : undefined,
  };
}

function normalizeOrder(raw: Record<string, unknown>, id: string): Order {
  const totalAmount = typeof raw.totalAmount === 'number' ? raw.totalAmount : 0;

  return {
    id,
    customerName:
      typeof raw.customerName === 'string' && raw.customerName.trim().length > 0
        ? raw.customerName
        : 'Clearview Customer',
    totalLabel:
      typeof raw.totalLabel === 'string' && raw.totalLabel.trim().length > 0
        ? raw.totalLabel
        : `$${(totalAmount / 100).toFixed(2)}`,
    status: isOrderStatus(raw.status) ? raw.status : 'pending',
    serviceName: typeof raw.serviceName === 'string' ? raw.serviceName : undefined,
  };
}

export function useServices(): LoadableData<Service> {
  const [data, setData] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'services'),
      (snapshot) => {
        setData(snapshot.docs.map((docSnapshot) => normalizeService(docSnapshot.data(), docSnapshot.id)));
        setLoading(false);
        setError(null);
      },
      (nextError) => {
        setError(nextError.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return { data, loading, error };
}

export function useOrders(): LoadableData<Order> {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'orders'),
      (snapshot) => {
        setData(snapshot.docs.map((docSnapshot) => normalizeOrder(docSnapshot.data(), docSnapshot.id)));
        setLoading(false);
        setError(null);
      },
      (nextError) => {
        setError(nextError.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return { data, loading, error };
}

export function useUserBookings(userId?: string | null): LoadableData<Booking> {
  const [data, setData] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);

    const bookingsQuery = query(collection(db, 'bookings'), where('userId', '==', userId));
    const unsubscribe = onSnapshot(
      bookingsQuery,
      (snapshot) => {
        setData(snapshot.docs.map((docSnapshot) => normalizeBooking(docSnapshot.data(), docSnapshot.id)));
        setLoading(false);
        setError(null);
      },
      (nextError) => {
        setError(nextError.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [userId]);

  return { data, loading, error };
}
