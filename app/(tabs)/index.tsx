import { Link } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { SurfaceCard } from '@/components/surface-card';
import { AppColors, AppFonts } from '@/constants/theme';
import { businessHighlights, testimonials } from '@/data/mock-data';
import { useServices } from '@/lib/firestore-data';

const TESTIMONIAL_GAP = 12;

export default function HomeScreen() {
  const { data: services } = useServices();
  const carouselRef = useRef<ScrollView | null>(null);
  const { width } = useWindowDimensions();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const testimonialCardWidth = Math.max(260, width - 56);

  useEffect(() => {
    if (testimonials.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setActiveTestimonial((current) => {
        const nextIndex = (current + 1) % testimonials.length;

        carouselRef.current?.scrollTo({
          x: nextIndex * (testimonialCardWidth + TESTIMONIAL_GAP),
          animated: true,
        });

        return nextIndex;
      });
    }, 4200);

    return () => clearInterval(interval);
  }, [testimonialCardWidth]);

  const handleTestimonialScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(
      event.nativeEvent.contentOffset.x / (testimonialCardWidth + TESTIMONIAL_GAP)
    );

    if (nextIndex !== activeTestimonial) {
      setActiveTestimonial(nextIndex);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SurfaceCard style={styles.heroCard}>
        <Text style={styles.eyebrow}>CLEARVIEW WINDOW WASHING</Text>
        <Text style={styles.heroTitle}>Bright windows. Simple booking. Local service you can trust.</Text>
        <Text style={styles.heroBody}>
          Clearview helps homeowners book residential window washing in a few taps, with clear
          pricing, reliable scheduling, and a payment flow ready for Stripe when you are.
        </Text>
        <View style={styles.heroActions}>
          <Link href="/schedule" style={styles.primaryAction}>
            Book a Service
          </Link>
          <Link href="/signin" style={styles.secondaryAction}>
            Sign In / Sign Up
          </Link>
        </View>
      </SurfaceCard>

      {/* <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Services</Text>
        <Text style={styles.sectionCopy}>Live services from Firestore, with starter highlights below.</Text>
      </View>
      {services.slice(0, 3).map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))} */}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Why customers book with us</Text>
      </View>
      <View style={styles.highlightGrid}>
        {businessHighlights.map((item) => (
          <SurfaceCard key={item.title} style={styles.highlightCard}>
            <Text style={styles.highlightTitle}>{item.title}</Text>
            <Text style={styles.highlightCopy}>{item.description}</Text>
          </SurfaceCard>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Testimonials</Text>
        <Text style={styles.sectionCopy}>Real customer feedback in a rotating card carousel.</Text>
      </View>
      <ScrollView
        ref={carouselRef}
        horizontal
        decelerationRate="fast"
        disableIntervalMomentum
        onMomentumScrollEnd={handleTestimonialScroll}
        onScrollEndDrag={handleTestimonialScroll}
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={testimonialCardWidth + TESTIMONIAL_GAP}
        contentContainerStyle={styles.testimonialRow}>
        {testimonials.map((quote) => (
          <SurfaceCard
            key={quote.name}
            style={[styles.testimonialCard, { width: testimonialCardWidth }]}>
            <Text style={styles.quote}>"{quote.quote}"</Text>
            <Text style={styles.quoteAuthor}>{quote.name}</Text>
          </SurfaceCard>
        ))}
      </ScrollView>
      <View style={styles.pagination}>
        {testimonials.map((quote, index) => (
          <View
            key={quote.name}
            style={[styles.paginationDot, index === activeTestimonial && styles.paginationDotActive]}
          />
        ))}
      </View>
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
  heroCard: {
    backgroundColor: AppColors.hero,
    gap: 14,
  },
  eyebrow: {
    color: AppColors.accentDeep,
    fontFamily: AppFonts.mono,
    fontSize: 12,
    letterSpacing: 1.3,
  },
  heroTitle: {
    color: AppColors.ink,
    fontFamily: AppFonts.display,
    fontSize: 34,
    lineHeight: 40,
  },
  heroBody: {
    color: AppColors.subtleText,
    fontFamily: AppFonts.body,
    fontSize: 16,
    lineHeight: 24,
  },
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  primaryAction: {
    backgroundColor: AppColors.ink,
    borderRadius: 999,
    color: AppColors.background,
    overflow: 'hidden',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  secondaryAction: {
    borderColor: AppColors.ink,
    borderRadius: 999,
    borderWidth: 1,
    color: AppColors.ink,
    overflow: 'hidden',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  sectionHeader: {
    gap: 4,
    marginTop: 8,
  },
  sectionTitle: {
    color: AppColors.ink,
    fontFamily: AppFonts.display,
    fontSize: 24,
  },
  sectionCopy: {
    color: AppColors.subtleText,
    fontFamily: AppFonts.body,
    fontSize: 15,
  },
  highlightGrid: {
    gap: 12,
  },
  highlightCard: {
    gap: 6,
  },
  highlightTitle: {
    color: AppColors.ink,
    fontFamily: AppFonts.display,
    fontSize: 18,
  },
  highlightCopy: {
    color: AppColors.subtleText,
    fontFamily: AppFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  testimonialRow: {
    gap: TESTIMONIAL_GAP,
    paddingRight: 4,
  },
  testimonialCard: {
    backgroundColor: AppColors.accentSoft, //Colors.light.tabIconDefault,
    justifyContent: 'space-between',
    minHeight: 168,
  },
  quote: {
    color: AppColors.ink,
    fontFamily: AppFonts.body,
    fontSize: 20,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  quoteAuthor: {
    color: AppColors.accentDeep,
    fontFamily: AppFonts.mono,
    fontSize: 13,
    marginTop: 10,
    textTransform: 'uppercase',
  },
  pagination: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: -4,
  },
  paginationDot: {
    backgroundColor: AppColors.line,
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  paginationDotActive: {
    backgroundColor: AppColors.accentDeep,
    width: 22,
  },
});
