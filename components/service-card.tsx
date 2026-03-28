import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts } from '@/constants/theme';
import { Service } from '@/lib/types';
import { SurfaceCard } from '@/components/surface-card';

type ServiceCardProps = {
  service: Service;
  showFullDescription?: boolean;
};

export function ServiceCard({ service, showFullDescription = false }: ServiceCardProps) {
  return (
    <SurfaceCard style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{service.name}</Text>
        <Text style={styles.price}>{service.priceLabel}</Text>
      </View>
      <Text numberOfLines={showFullDescription ? undefined : 3} style={styles.description}>
        {service.description}
      </Text>
      <View style={styles.footer}>
        <Text style={styles.meta}>{service.active ? 'Available now' : 'Temporarily inactive'}</Text>
        <Link href="/schedule" style={styles.link}>
          Book
        </Link>
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 10,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  name: {
    color: AppColors.ink,
    flex: 1,
    fontFamily: AppFonts.display,
    fontSize: 20,
    paddingRight: 10,
  },
  price: {
    color: AppColors.accentDeep,
    fontFamily: AppFonts.mono,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  description: {
    color: AppColors.subtleText,
    fontFamily: AppFonts.body,
    fontSize: 14,
    lineHeight: 21,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  meta: {
    color: AppColors.subtleText,
    fontFamily: AppFonts.body,
    fontSize: 13,
  },
  link: {
    color: AppColors.accentDeep,
    fontFamily: AppFonts.body,
    fontSize: 14,
  },
});
