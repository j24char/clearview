import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ServiceCard } from '@/components/service-card';
import { SurfaceCard } from '@/components/surface-card';
import { AppColors, AppFonts } from '@/constants/theme';
import { useServices } from '@/lib/firestore-data';

export default function ServicesScreen() {
  const { data: services, loading, error } = useServices();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Service Catalog</Text>
        <Text style={styles.copy}>These are the services we currently offer.</Text>
      </View>

      {loading ? <Text style={styles.stateText}>Loading services...</Text> : null}
      {error ? <Text style={styles.stateText}>Unable to load services: {error}</Text> : null}
      {!loading && !error && services.length === 0 ? (
        <SurfaceCard>
          <Text style={styles.noteTitle}>No services yet</Text>
          <Text style={styles.noteCopy}>
            Add at least one document to your `services` collection and it will appear here.
          </Text>
        </SurfaceCard>
      ) : null}

      {services.map((service) => (
        <ServiceCard key={service.id} service={service} showFullDescription />
      ))}

      {/* <SurfaceCard>
        <Text style={styles.noteTitle}>Admin workflow</Text>
        <Text style={styles.noteCopy}>
          The admin tab includes placeholders for toggling active services, pricing changes, and
          future image uploads.
        </Text>
      </SurfaceCard> */}
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
  noteTitle: {
    color: AppColors.ink,
    fontFamily: AppFonts.display,
    fontSize: 18,
  },
  noteCopy: {
    color: AppColors.subtleText,
    fontFamily: AppFonts.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  stateText: {
    color: AppColors.subtleText,
    fontFamily: AppFonts.body,
    fontSize: 14,
  },
});
