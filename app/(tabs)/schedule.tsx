import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { SurfaceCard } from '@/components/surface-card';
import { availabilitySlots, serviceCatalog } from '@/data/mock-data';
import { AppColors, AppFonts } from '@/constants/theme';
import { useDiscountCodes, useServices } from '@/lib/firestore-data';
import { db } from '@/lib/firebase';
import { createStripeCheckoutPlaceholder } from '@/lib/stripe';
import { useAuth } from '@/providers/auth-provider';

const fallbackService = serviceCatalog[0]!;
const initialSlot = availabilitySlots[0]!;

export default function ScheduleScreen() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const { data: firestoreServices, loading: servicesLoading } = useServices();
  const { data: discountCodes, loading: discountCodesLoading } = useDiscountCodes();
  const availableServices = firestoreServices.length > 0 ? firestoreServices : serviceCatalog;
  const selectedFallbackService = availableServices[0] ?? fallbackService;
  const [selectedServiceId, setSelectedServiceId] = useState(selectedFallbackService.id);
  const [selectedSlotId, setSelectedSlotId] = useState(initialSlot.id);
  const [windowCount, setWindowCount] = useState('12');
  const [discountCode, setDiscountCode] = useState('');
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'saving'>('idle');

  const selectedService = useMemo(
    () => availableServices.find((service) => service.id === selectedServiceId) ?? selectedFallbackService,
    [availableServices, selectedFallbackService, selectedServiceId]
  );

  const selectedSlot = useMemo(
    () => availabilitySlots.find((slot) => slot.id === selectedSlotId) ?? initialSlot,
    [selectedSlotId]
  );

  useEffect(() => {
    const hasSelectedService = availableServices.some((service) => service.id === selectedServiceId);

    if (!hasSelectedService) {
      setSelectedServiceId(selectedFallbackService.id);
    }
  }, [availableServices, selectedFallbackService.id, selectedServiceId]);

  const quantity = Math.max(0, Number(windowCount) || 0);
  const normalizedDiscountCode = discountCode.trim().toUpperCase();
  const appliedDiscount = useMemo(
    () =>
      discountCodes.find(
        (code) => code.active && code.code.trim().toUpperCase() === normalizedDiscountCode
      ),
    [discountCodes, normalizedDiscountCode]
  );
  const subtotalCents = selectedService.priceCents * quantity;
  const discountCents = appliedDiscount
    ? Math.round(subtotalCents * (appliedDiscount.percentageOff / 100))
    : 0;
  const totalCents = Math.max(0, subtotalCents - discountCents);

  const formatMoney = (amountCents: number) => `$${(amountCents / 100).toFixed(2)}`;

  const handleCheckout = async () => {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in before booking a service.', [
        {
          text: 'Go to sign in',
          onPress: () => {
            router.push('/signin');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }

    if (quantity <= 0) {
      Alert.alert('Quantity required', 'Enter a quantity greater than 0 before continuing.');
      return;
    }

    setBookingStatus('saving');

    try {
      await addDoc(collection(db, 'bookings'), {
        userId: user.uid,
        customerName: userProfile?.name?.trim() || userProfile?.email || user.email || 'Clearview Customer',
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        numberOfWindows: quantity,
        quantity,
        status: 'pending',
        slotId: selectedSlot.id,
        slotLabel: selectedSlot.label,
        slotWindow: selectedSlot.window,
        unitPriceCents: selectedService.priceCents,
        subtotalAmount: subtotalCents,
        totalAmount: totalCents,
        discountAmount: discountCents,
        discountCode: appliedDiscount?.code ?? null,
        discountPercentageOff: appliedDiscount?.percentageOff ?? 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const result = await createStripeCheckoutPlaceholder({
        serviceId: selectedService.id,
        slotId: selectedSlot.id,
        numberOfWindows: quantity,
      });

      Alert.alert(
        'Booking created',
        `Your booking was saved to Firestore with a total of ${formatMoney(totalCents)}. ${result.message}`
      );
    } catch (error) {
      Alert.alert(
        'Booking failed',
        error instanceof Error ? error.message : 'Unable to save your booking right now.'
      );
    } finally {
      setBookingStatus('idle');
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Schedule a cleaning</Text>
        <Text style={styles.copy}>
          This screen is already laid out like a booking flow. Right now it uses mock availability
          and a placeholder Stripe checkout response.
        </Text>
        {servicesLoading ? <Text style={styles.helper}>Loading live services from Firestore...</Text> : null}
        {discountCodesLoading ? (
          <Text style={styles.helper}>Loading discount codes from Firestore...</Text>
        ) : null}
      </View>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>1. Choose a service</Text>
        <View style={styles.choiceList}>
          {availableServices.map((service) => {
            const active = service.id === selectedServiceId;

            return (
              <Pressable
                key={service.id}
                onPress={() => setSelectedServiceId(service.id)}
                style={[styles.choiceCard, active && styles.choiceCardActive]}>
                <Text style={[styles.choiceTitle, active && styles.choiceTitleActive]}>
                  {service.name}
                </Text>
                <Text style={styles.choiceCopy}>{service.priceLabel}</Text>
              </Pressable>
            );
          })}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>2. Select a time slot</Text>
        <View style={styles.choiceList}>
          {availabilitySlots.map((slot) => {
            const active = slot.id === selectedSlotId;

            return (
              <Pressable
                key={slot.id}
                onPress={() => setSelectedSlotId(slot.id)}
                style={[styles.choiceCard, active && styles.choiceCardActive]}>
                <Text style={[styles.choiceTitle, active && styles.choiceTitleActive]}>
                  {slot.label}
                </Text>
                <Text style={styles.choiceCopy}>{slot.window}</Text>
              </Pressable>
            );
          })}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>3. Estimate size</Text>
        <TextInput
          keyboardType="number-pad"
          onChangeText={setWindowCount}
          placeholder="Number of windows"
          placeholderTextColor={AppColors.line}
          style={styles.input}
          value={windowCount}
        />
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>4. Discount code</Text>
        <TextInput
          autoCapitalize="characters"
          onChangeText={setDiscountCode}
          placeholder="Enter discount code"
          placeholderTextColor={AppColors.line}
          style={styles.input}
          value={discountCode}
        />
        {normalizedDiscountCode ? (
          <Text style={styles.discountHelper}>
            {appliedDiscount
              ? `${appliedDiscount.code} applied for ${appliedDiscount.percentageOff}% off.`
              : 'Discount code not found.'}
          </Text>
        ) : (
          <Text style={styles.discountHelper}>Enter a code if you have one.</Text>
        )}
      </SurfaceCard>

      <SurfaceCard style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>Booking summary</Text>
        <Text style={styles.summaryLine}>Service: {selectedService.name}</Text>
        <Text style={styles.summaryLine}>Slot: {selectedSlot.label}</Text>
        <Text style={styles.summaryLine}>Quantity: {quantity}</Text>
        <Text style={styles.summaryLine}>Unit price: {formatMoney(selectedService.priceCents)}</Text>
        <Text style={styles.summaryLine}>Subtotal: {formatMoney(subtotalCents)}</Text>
        {appliedDiscount ? (
          <Text style={styles.summaryLine}>
            Discount ({appliedDiscount.code}): -{formatMoney(discountCents)}
          </Text>
        ) : null}
        <Text style={styles.summaryPrice}>Total: {formatMoney(totalCents)}</Text>
        <Pressable onPress={handleCheckout} style={styles.checkoutButton}>
          <Text style={styles.checkoutText}>
            {bookingStatus === 'saving' ? 'Saving booking...' : 'Save booking and continue'}
          </Text>
        </Pressable>
      </SurfaceCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  header: {
    gap: 8,
  },
  title: {
    color: AppColors.ink,
    fontFamily: AppFonts.display,
    fontSize: 28,
  },
  copy: {
    color: AppColors.subtleText,
    fontFamily: AppFonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  sectionTitle: {
    color: AppColors.ink,
    fontFamily: AppFonts.display,
    fontSize: 18,
    marginBottom: 12,
  },
  helper: {
    color: AppColors.subtleText,
    fontFamily: AppFonts.body,
    fontSize: 14,
  },
  choiceList: {
    gap: 10,
  },
  choiceCard: {
    backgroundColor: AppColors.cardAlt,
    borderColor: AppColors.line,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  choiceCardActive: {
    backgroundColor: AppColors.accentSoft,
    borderColor: AppColors.accent,
  },
  choiceTitle: {
    color: AppColors.ink,
    fontFamily: AppFonts.body,
    fontSize: 15,
  },
  choiceTitleActive: {
    fontFamily: AppFonts.display,
  },
  choiceCopy: {
    color: AppColors.subtleText,
    fontFamily: AppFonts.body,
    fontSize: 13,
    marginTop: 4,
  },
  input: {
    backgroundColor: AppColors.cardAlt,
    borderColor: AppColors.line,
    borderRadius: 14,
    borderWidth: 1,
    color: AppColors.ink,
    fontFamily: AppFonts.body,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  discountHelper: {
    color: AppColors.subtleText,
    fontFamily: AppFonts.body,
    fontSize: 13,
    marginTop: -2,
  },
  summaryCard: {
    gap: 10,
  },
  summaryLine: {
    color: AppColors.subtleText,
    fontFamily: AppFonts.body,
    fontSize: 15,
  },
  summaryPrice: {
    color: AppColors.ink,
    fontFamily: AppFonts.display,
    fontSize: 22,
    marginTop: 6,
  },
  checkoutButton: {
    backgroundColor: AppColors.accentDeep,
    borderRadius: 999,
    marginTop: 6,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  checkoutText: {
    color: AppColors.background,
    fontFamily: AppFonts.body,
    fontSize: 15,
    textAlign: 'center',
  },
});
