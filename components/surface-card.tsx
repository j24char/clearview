import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { AppColors } from '@/constants/theme';

type SurfaceCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function SurfaceCard({ children, style }: SurfaceCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.card,
    borderColor: AppColors.line,
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#0D2B26',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
  },
});
