import { Redirect } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { SurfaceCard } from '@/components/surface-card';
import { AppColors, AppFonts } from '@/constants/theme';
import { useOrders, useServices } from '@/lib/firestore-data';
import { useAuth } from '@/providers/auth-provider';

export default function AdminScreen() {
  const { isAdmin, loading, user, userProfile } = useAuth();
  const { data: services, loading: servicesLoading, error: servicesError } = useServices();
  const { data: orders, loading: ordersLoading, error: ordersError } = useOrders();

  if (!loading && (!user || !isAdmin)) {
    return <Redirect href="/" />;
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.copy}>
          {isAdmin
            ? 'Your admin shell is active. These cards now read directly from Firestore where available.'
            : 'Admin tools are visible as placeholders right now. Full write actions should be protected by role-based rules in Firebase.'}
        </Text>
      </View>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Access</Text>
        <Text style={styles.rowText}>Signed in as: {userProfile?.email ?? 'Guest user'}</Text>
        <Text style={styles.rowText}>Role: {isAdmin ? 'admin' : 'customer'}</Text>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Services</Text>
        {servicesLoading ? <Text style={styles.rowText}>Loading services...</Text> : null}
        {servicesError ? <Text style={styles.rowText}>Unable to load services: {servicesError}</Text> : null}
        {!servicesLoading && !servicesError && services.length === 0 ? (
          <Text style={styles.rowText}>No Firestore services found yet.</Text>
        ) : null}
        {services.map((service) => (
          <View key={service.id} style={styles.row}>
            <Text style={styles.rowLabel}>{service.name}</Text>
            <Text style={styles.rowValue}>{service.active ? 'Active' : 'Inactive'}</Text>
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
        <Text style={styles.todo}>Write bookings into Firestore when the schedule form is submitted.</Text>
        <Text style={styles.todo}>Add Firebase Functions for Stripe checkout and webhook handling.</Text>
        <Text style={styles.todo}>Gate this route from non-admin users once roles are stored server-side.</Text>
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
  todo: {
    color: AppColors.subtleText,
    fontFamily: AppFonts.body,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 6,
  },
});
