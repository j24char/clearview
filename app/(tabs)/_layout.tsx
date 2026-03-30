import { Link, Tabs, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppColors, AppFonts, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/providers/auth-provider';

function HeaderAccountMenu() {
  const router = useRouter();
  const { user, userProfile, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const label =
    userProfile?.name?.trim() ||
    userProfile?.email?.split('@')[0] ||
    (user ? 'Account' : 'Sign In');

  const handleProfile = () => {
    setOpen(false);
    router.push('/profile');
  };

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    router.replace('/');
  };

  if (!user) {
    return (
      <Link href="/signin" style={styles.accountLink}>
        <Text numberOfLines={1} style={styles.accountText}>
          {label}
        </Text>
      </Link>
    );
  }

  return (
    <View style={styles.menuWrap}>
      <Pressable onPress={() => setOpen((current) => !current)} style={styles.accountLink}>
        <Text numberOfLines={1} style={styles.accountText}>
          {label}
        </Text>
      </Pressable>
      {open ? (
        <View style={styles.dropdown}>
          <Pressable onPress={handleProfile} style={styles.menuItem}>
            <Text style={styles.menuText}>Profile</Text>
          </Pressable>
          <Pressable onPress={handleSignOut} style={styles.menuItem}>
            <Text style={[styles.menuText, styles.menuTextDanger]}>Sign out</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function HeaderLogo() {
  return <Image source={require('@/assets/images/Clearview.png')} style={styles.logo} resizeMode="contain" />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isAdmin } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarButton: HapticTab,
        headerShown: true,
        headerStyle: {
          backgroundColor: AppColors.background,
        },
        headerTitleStyle: {
          color: AppColors.ink,
          fontFamily: AppFonts.display,
          fontSize: 22,
        },
        headerShadowVisible: false,
        headerLeft: HeaderLogo,
        headerRight: HeaderAccountMenu,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="sparkles" color={color} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: '',
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.2.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  menuWrap: {
    marginRight: 12,
    position: 'relative',
  },
  logo: {
    height: 70,
    marginLeft: 12,
    width: 220,
  },
  accountLink: {
    alignItems: 'center',
    backgroundColor: AppColors.card,
    borderColor: AppColors.line,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    maxWidth: 140,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  accountText: {
    color: AppColors.accentDeep,
    fontFamily: AppFonts.body,
    fontSize: 14,
  },
  dropdown: {
    backgroundColor: AppColors.card,
    borderColor: AppColors.line,
    borderRadius: 18,
    borderWidth: 1,
    minWidth: 150,
    paddingVertical: 6,
    position: 'absolute',
    right: 0,
    top: 46,
    shadowColor: '#0D2B26',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  menuItem: {
    paddingHorizontal: 14,
    paddingVertical: 15,
  },
  menuText: {
    color: AppColors.ink,
    fontFamily: AppFonts.body,
    fontSize: 14,
  },
  menuTextDanger: {
    color: '#B24A3A',
  },
});
