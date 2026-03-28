import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { SurfaceCard } from '@/components/surface-card';
import { availabilitySlots, serviceCatalog } from '@/data/mock-data';
import { AppColors, AppFonts } from '@/constants/theme';
import { useServices } from '@/lib/firestore-data';
import { createStripeCheckoutPlaceholder } from '@/lib/stripe';

const fallbackService = serviceCatalog[0]!;
const initialSlot = availabilitySlots[0]!;

export default function ScheduleScreen() {
  const { data: firestoreServices, loading: servicesLoading } = useServices();
  const availableServices = firestoreServices.length > 0 ? firestoreServices : serviceCatalog;
  const selectedFallbackService = availableServices[0] ?? fallbackService;
  const [selectedServiceId, setSelectedServiceId] = useState(selectedFallbackService.id);
  const [selectedSlotId, setSelectedSlotId] = useState(initialSlot.id);
  const [windowCount, setWindowCount] = useState('12');

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

  const handleCheckout = async () => {
    const result = await createStripeCheckoutPlaceholder({
      serviceId: selectedService.id,
      slotId: selectedSlot.id,
      numberOfWindows: Number(windowCount) || 0,
    });

    Alert.alert('Stripe placeholder', result.message);
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

      <SurfaceCard style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>Booking summary</Text>
        <Text style={styles.summaryLine}>Service: {selectedService.name}</Text>
        <Text style={styles.summaryLine}>Slot: {selectedSlot.label}</Text>
        <Text style={styles.summaryLine}>Windows: {windowCount}</Text>
        <Text style={styles.summaryPrice}>{selectedService.priceLabel}</Text>
        <Pressable onPress={handleCheckout} style={styles.checkoutButton}>
          <Text style={styles.checkoutText}>Continue to Stripe placeholder</Text>
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
