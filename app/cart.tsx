import { ScrollView, StyleSheet, Text } from 'react-native';

import { SurfaceCard } from '@/components/surface-card';
import { AppColors, AppFonts } from '@/constants/theme';

export default function CartScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SurfaceCard>
        <Text style={styles.title}>Cart Placeholder</Text>
        <Text style={styles.copy}>
          This route is ready for a multi-item booking cart if you decide to sell service bundles,
          add-ons, or recurring cleaning packages.
        </Text>
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
    marginTop: 8,
  },
});
