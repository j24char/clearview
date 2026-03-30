import { Redirect } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { SurfaceCard } from '@/components/surface-card';
import { AppColors, AppFonts } from '@/constants/theme';
import { db } from '@/lib/firebase';
import { useDiscountCodes, useOrders, useServices } from '@/lib/firestore-data';
import { useAuth } from '@/providers/auth-provider';

export default function AdminScreen() {
  const { isAdmin, loading, user, userProfile } = useAuth();
  const { data: services, loading: servicesLoading, error: servicesError } = useServices();
  const {
    data: discountCodes,
    loading: discountCodesLoading,
    error: discountCodesError,
  } = useDiscountCodes();
  const { data: orders, loading: ordersLoading, error: ordersError } = useOrders();
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceStatus, setServiceStatus] = useState<'idle' | 'saving'>('idle');
  const [serviceFeedback, setServiceFeedback] = useState('');
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);
  const [discountCode, setDiscountCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [discountStatus, setDiscountStatus] = useState<'idle' | 'saving'>('idle');
  const [discountFeedback, setDiscountFeedback] = useState('');
  const [deletingDiscountId, setDeletingDiscountId] = useState<string | null>(null);

  if (!loading && (!user || !isAdmin)) {
    return <Redirect href="/" />;
  }

  const handleCreateService = async () => {
    const trimmedName = serviceName.trim();
    const trimmedDescription = serviceDescription.trim();
    const parsedPrice = Number(servicePrice);

    if (!trimmedName || !trimmedDescription || !servicePrice.trim()) {
      setServiceFeedback('Enter a name, description, and starting price.');
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setServiceFeedback('Starting price must be a valid non-negative number.');
      return;
    }

    setServiceStatus('saving');
    setServiceFeedback('');

    try {
      const priceCents = Math.round(parsedPrice * 100);

      await addDoc(collection(db, 'services'), {
        name: trimmedName,
        description: trimmedDescription,
        priceCents,
        priceLabel: priceCents > 0 ? `Base price $${parsedPrice.toFixed(0)} each` : 'Custom quote',
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setServiceName('');
      setServiceDescription('');
      setServicePrice('');
      setServiceFeedback('Service created.');
    } catch (error) {
      setServiceFeedback(error instanceof Error ? error.message : 'Unable to create service.');
    } finally {
      setServiceStatus('idle');
    }
  };

  const executeDeleteService = async (serviceId: string, name: string) => {
    setDeletingServiceId(serviceId);

    try {
      await deleteDoc(doc(db, 'services', serviceId));
      setServiceFeedback(`Deleted ${name}.`);
    } catch (error) {
      setServiceFeedback(error instanceof Error ? error.message : 'Unable to delete service.');
    } finally {
      setDeletingServiceId(null);
    }
  };

  const handleCreateDiscountCode = async () => {
    const trimmedCode = discountCode.trim().toUpperCase();
    const parsedPercent = Number(discountPercent);

    if (!trimmedCode || !discountPercent.trim()) {
      setDiscountFeedback('Enter a code and a percentage discount.');
      return;
    }

    if (!Number.isFinite(parsedPercent) || parsedPercent <= 0 || parsedPercent >= 100) {
      setDiscountFeedback('Discount percentage must be greater than 0 and less than 100.');
      return;
    }

    setDiscountStatus('saving');
    setDiscountFeedback('');

    try {
      await addDoc(collection(db, 'discountCodes'), {
        code: trimmedCode,
        percentageOff: parsedPercent,
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setDiscountCode('');
      setDiscountPercent('');
      setDiscountFeedback('Discount code created.');
    } catch (error) {
      setDiscountFeedback(error instanceof Error ? error.message : 'Unable to create discount code.');
    } finally {
      setDiscountStatus('idle');
    }
  };

  const executeDeleteDiscountCode = async (discountId: string, code: string) => {
    setDeletingDiscountId(discountId);

    try {
      await deleteDoc(doc(db, 'discountCodes', discountId));
      setDiscountFeedback(`Deleted ${code}.`);
    } catch (error) {
      setDiscountFeedback(
        error instanceof Error ? error.message : 'Unable to delete discount code.'
      );
    } finally {
      setDeletingDiscountId(null);
    }
  };

  const handleDeleteDiscountCode = (discountId: string, code: string) => {
    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined' ? window.confirm(`Delete "${code}"?`) : false;

      if (confirmed) {
        void executeDeleteDiscountCode(discountId, code);
      }

      return;
    }

    Alert.alert('Delete discount code', `Delete "${code}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void executeDeleteDiscountCode(discountId, code);
        },
      },
    ]);
  };

  const handleDeleteService = (serviceId: string, name: string) => {
    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined' ? window.confirm(`Delete "${name}"?`) : false;

      if (confirmed) {
        void executeDeleteService(serviceId, name);
      }

      return;
    }

    Alert.alert('Delete service', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void executeDeleteService(serviceId, name);
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.copy}>
          {isAdmin
            ? 'Your admin shell is active. You can now create new services and remove existing ones.'
            : 'Admin tools are visible as placeholders right now. Full write actions should be protected by role-based rules in Firebase.'}
        </Text>
      </View>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Access</Text>
        <Text style={styles.rowText}>Signed in as: {userProfile?.email ?? 'Guest user'}</Text>
        <Text style={styles.rowText}>Role: {isAdmin ? 'admin' : 'customer'}</Text>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Create Service</Text>
        <Text style={styles.rowText}>Service Name</Text>
        <TextInput
          onChangeText={setServiceName}
          placeholder="Service name"
          placeholderTextColor={AppColors.line}
          style={styles.input}
          value={serviceName}
        />
        <Text style={styles.rowText}>Service Description</Text>
        <TextInput
          multiline
          onChangeText={setServiceDescription}
          placeholder="Description"
          placeholderTextColor={AppColors.line}
          style={[styles.input, styles.textArea]}
          textAlignVertical="top"
          value={serviceDescription}
        />
        <Text style={styles.rowText}>Price (in dollars)</Text>
        <TextInput
          keyboardType="decimal-pad"
          onChangeText={setServicePrice}
          placeholder="Starting price in dollars"
          placeholderTextColor={AppColors.line}
          style={styles.input}
          value={servicePrice}
        />
        <Pressable
          onPress={handleCreateService}
          style={[styles.primaryButton, serviceStatus === 'saving' && styles.buttonDisabled]}>
          <Text style={styles.primaryButtonText}>
            {serviceStatus === 'saving' ? 'Creating...' : 'Create service'}
          </Text>
        </Pressable>
        {serviceFeedback ? <Text style={styles.feedback}>{serviceFeedback}</Text> : null}
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Services</Text>
        {servicesLoading ? <Text style={styles.rowText}>Loading services...</Text> : null}
        {servicesError ? <Text style={styles.rowText}>Unable to load services: {servicesError}</Text> : null}
        {!servicesLoading && !servicesError && services.length === 0 ? (
          <Text style={styles.rowText}>No Firestore services found yet.</Text>
        ) : null}
        {services.map((service) => (
          <View key={service.id} style={styles.serviceCard}>
            <View style={styles.serviceHeader}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.rowValue}>{service.active ? 'Active' : 'Inactive'}</Text>
            </View>
            <Text style={styles.serviceCopy}>{service.description}</Text>
            <View style={styles.serviceFooter}>
              <Text style={styles.servicePrice}>{service.priceLabel}</Text>
              <Pressable
                onPress={() => handleDeleteService(service.id, service.name)}
                style={[styles.deleteButton, deletingServiceId === service.id && styles.buttonDisabled]}>
                <Text style={styles.deleteButtonText}>
                  {deletingServiceId === service.id ? 'Deleting...' : 'Delete'}
                </Text>
              </Pressable>
            </View>
          </View>
        ))}
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Discount Codes</Text>
        <Text style={styles.rowText}>Discount Code</Text>
        <TextInput
          autoCapitalize="characters"
          onChangeText={setDiscountCode}
          placeholder="SPRING15"
          placeholderTextColor={AppColors.line}
          style={styles.input}
          value={discountCode}
        />
        <Text style={styles.rowText}>Percentage Off</Text>
        <TextInput
          keyboardType="decimal-pad"
          onChangeText={setDiscountPercent}
          placeholder="15"
          placeholderTextColor={AppColors.line}
          style={styles.input}
          value={discountPercent}
        />
        <Pressable
          onPress={handleCreateDiscountCode}
          style={[styles.primaryButton, discountStatus === 'saving' && styles.buttonDisabled]}>
          <Text style={styles.primaryButtonText}>
            {discountStatus === 'saving' ? 'Creating...' : 'Create discount code'}
          </Text>
        </Pressable>
        {discountFeedback ? <Text style={styles.feedback}>{discountFeedback}</Text> : null}
        {discountCodesLoading ? <Text style={styles.rowText}>Loading discount codes...</Text> : null}
        {discountCodesError ? (
          <Text style={styles.rowText}>Unable to load discount codes: {discountCodesError}</Text>
        ) : null}
        {!discountCodesLoading && !discountCodesError && discountCodes.length === 0 ? (
          <Text style={styles.rowText}>No discount codes found yet.</Text>
        ) : null}
        {discountCodes.map((code) => (
          <View key={code.id} style={styles.serviceCard}>
            <View style={styles.serviceHeader}>
              <Text style={styles.serviceName}>{code.code}</Text>
              <Text style={styles.rowValue}>{code.active ? 'Active' : 'Inactive'}</Text>
            </View>
            <View style={styles.serviceFooter}>
              <Text style={styles.servicePrice}>{code.percentageOff}% off</Text>
              <Pressable
                onPress={() => handleDeleteDiscountCode(code.id, code.code)}
                style={[
                  styles.deleteButton,
                  deletingDiscountId === code.id && styles.buttonDisabled,
                ]}>
                <Text style={styles.deleteButtonText}>
                  {deletingDiscountId === code.id ? 'Deleting...' : 'Delete'}
                </Text>
              </Pressable>
            </View>
          </View>
        ))}
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Transactions</Text>
        {ordersLoading ? <Text style={styles.rowText}>Loading orders...</Text> : null}
        {ordersError ? <Text style={styles.rowText}>Unable to load orders: {ordersError}</Text> : null}
        {!ordersLoading && !ordersError && orders.length === 0 ? (
          <Text style={styles.rowText}>No Firestore orders found yet.</Text>
        ) : null}
        {orders.map((order) => (
          <View key={order.id} style={styles.row}>
            <Text style={styles.rowLabel}>
              {order.customerName}
              {order.serviceName ? ` - ${order.serviceName}` : ''}
            </Text>
            <Text style={styles.rowValue}>
              {order.totalLabel} | {order.status}
            </Text>
          </View>
        ))}
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Next backend tasks</Text>
        <Text style={styles.todo}>Add edit controls for service pricing and active/inactive status.</Text>
        <Text style={styles.todo}>Write bookings into Firestore when the schedule form is submitted.</Text>
        <Text style={styles.todo}>Add Firebase Functions for Stripe checkout and webhook handling.</Text>
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
  input: {
    backgroundColor: AppColors.cardAlt,
    borderColor: AppColors.line,
    borderRadius: 14,
    borderWidth: 1,
    color: AppColors.ink,
    fontFamily: AppFonts.body,
    fontSize: 15,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  textArea: {
    minHeight: 96,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: AppColors.accentDeep,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: AppColors.card,
    fontFamily: AppFonts.body,
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  feedback: {
    color: AppColors.subtleText,
    fontFamily: AppFonts.body,
    fontSize: 14,
    marginTop: 10,
  },
  row: {
    borderTopColor: AppColors.line,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  rowText: {
    color: AppColors.subtleText,
    fontFamily: AppFonts.body,
    fontSize: 15,
    marginBottom: 6,
  },
  rowLabel: {
    color: AppColors.ink,
    flex: 1,
    fontFamily: AppFonts.body,
    fontSize: 14,
    paddingRight: 10,
  },
  rowValue: {
    color: AppColors.accentDeep,
    fontFamily: AppFonts.mono,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  serviceCard: {
    borderTopColor: AppColors.line,
    borderTopWidth: 1,
    gap: 10,
    paddingVertical: 14,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  serviceName: {
    color: AppColors.ink,
    flex: 1,
    fontFamily: AppFonts.display,
    fontSize: 17,
    paddingRight: 12,
  },
  serviceCopy: {
    color: AppColors.subtleText,
    fontFamily: AppFonts.body,
    fontSize: 14,
    lineHeight: 21,
  },
  serviceFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  servicePrice: {
    color: AppColors.ink,
    fontFamily: AppFonts.body,
    fontSize: 14,
  },
  deleteButton: {
    borderColor: '#B24A3A',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  deleteButtonText: {
    color: '#B24A3A',
    fontFamily: AppFonts.body,
    fontSize: 14,
  },
  todo: {
    color: AppColors.subtleText,
    fontFamily: AppFonts.body,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 6,
  },
});
