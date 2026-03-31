import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { SurfaceCard } from '@/components/surface-card';
import { AppColors, AppFonts } from '@/constants/theme';
import { useUserBookings } from '@/lib/firestore-data';
import { useAuth } from '@/providers/auth-provider';

export default function ProfileScreen() {
  const { user, userProfile, updateProfileDetails, signOut, loading } = useAuth();
  const {
    data: bookings,
    loading: bookingsLoading,
    error: bookingsError,
  } = useUserBookings(user?.uid);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    setName(userProfile?.name ?? '');
    setPhone(userProfile?.phone ?? '');
  }, [userProfile?.name, userProfile?.phone]);

  if (!user) {
    return <Redirect href="/signin" />;
  }

  const handleSave = async () => {
    const result = await updateProfileDetails({ name, phone });
    setFeedback(result.message);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SurfaceCard>
        <Text style={styles.title}>Profile</Text>
        {/* <Text style={styles.copy}>Customer data is sourced from Firebase Auth and Firestore.</Text> */}
        <TextInput
          onChangeText={setName}
          placeholder="Full name"
          placeholderTextColor={AppColors.line}
          style={styles.input}
          value={name}
        />
        <TextInput
          editable={false}
          placeholder="Email"
          placeholderTextColor={AppColors.line}
          style={[styles.input, styles.inputDisabled]}
          value={userProfile?.email ?? ''}
        />
        <TextInput
          keyboardType="phone-pad"
          onChangeText={setPhone}
          placeholder="Phone"
          placeholderTextColor={AppColors.line}
          style={styles.input}
          value={phone}
        />
        <Pressable onPress={handleSave} style={styles.primaryButton}>
          <Text style={styles.primaryLabel}>{loading ? 'Saving...' : 'Save profile'}</Text>
        </Pressable>
        {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
        <Pressable onPress={signOut} style={styles.secondaryButton}>
          <Text style={styles.secondaryLabel}>Sign out</Text>
        </Pressable>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Booking history</Text>
        {bookingsLoading ? <Text style={styles.feedback}>Loading bookings...</Text> : null}
        {bookingsError ? <Text style={styles.feedback}>Unable to load bookings: {bookingsError}</Text> : null}
        {!bookingsLoading && !bookingsError && bookings.length === 0 ? (
          <Text style={styles.feedback}>No bookings found for this account yet.</Text>
        ) : null}
        {bookings.map((booking) => (
          <View key={booking.id} style={styles.row}>
            <View style={styles.bookingDetails}>
              <Text style={styles.rowLabel}>{booking.serviceName}</Text>
              {booking.scheduledDate || booking.slotWindow ? (
                <Text style={styles.bookingMeta}>
                  {[booking.scheduledDate, booking.slotLabel, booking.slotWindow].filter(Boolean).join(' | ')}
                </Text>
              ) : null}
            </View>
            <Text style={styles.rowValue}>{booking.status}</Text>
          </View>
        ))}
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
    marginBottom: 16,
    marginTop: 8,
  },
  input: {
    backgroundColor: AppColors.cardAlt,
    borderColor: AppColors.line,
    borderRadius: 14,
    borderWidth: 1,
    color: AppColors.ink,
    fontFamily: AppFonts.body,
    fontSize: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputDisabled: {
    opacity: 0.75,
  },
  primaryButton: {
    backgroundColor: AppColors.accentDeep,
    borderRadius: 999,
    marginBottom: 12,
    paddingVertical: 14,
  },
  primaryLabel: {
    color: AppColors.background,
    fontFamily: AppFonts.body,
    fontSize: 16,
    textAlign: 'center',
  },
  secondaryButton: {
    borderColor: AppColors.ink,
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 14,
  },
  secondaryLabel: {
    color: AppColors.ink,
    fontFamily: AppFonts.body,
    fontSize: 16,
    textAlign: 'center',
  },
  feedback: {
    color: AppColors.subtleText,
    fontFamily: AppFonts.body,
    fontSize: 14,
    marginTop: 4,
    marginBottom: 10,
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
  bookingDetails: {
    flex: 1,
    paddingRight: 10,
  },
  bookingMeta: {
    color: AppColors.subtleText,
    fontFamily: AppFonts.body,
    fontSize: 12,
    marginTop: 4,
  },
  rowLabel: {
    color: AppColors.ink,
    fontFamily: AppFonts.body,
    fontSize: 14,
  },
  rowValue: {
    color: AppColors.accentDeep,
    fontFamily: AppFonts.mono,
    fontSize: 12,
    textTransform: 'uppercase',
  },
});
