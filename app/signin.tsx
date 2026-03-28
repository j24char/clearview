import { Link, Redirect } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';

import { SurfaceCard } from '@/components/surface-card';
import { AppColors, AppFonts } from '@/constants/theme';
import { useAuth } from '@/providers/auth-provider';

export default function SignInScreen() {
  const { signIn, resetPassword, loading, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState('');

  if (user) {
    return <Redirect href="/profile" />;
  }

  const handleSignIn = async () => {
    const result = await signIn(email, password);
    setFeedback(result.message);
  };

  const handleReset = async () => {
    const result = await resetPassword(email);
    setFeedback(result.message);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SurfaceCard>
        <Text style={styles.title}>Sign in</Text>
        <Text style={styles.copy}>Firebase Auth is connected here with email and password.</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={AppColors.line}
          style={styles.input}
          value={email}
        />
        <TextInput
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={AppColors.line}
          secureTextEntry
          style={styles.input}
          value={password}
        />
        <Pressable onPress={handleSignIn} style={styles.primaryButton}>
          <Text style={styles.primaryLabel}>{loading ? 'Signing in...' : 'Sign in'}</Text>
        </Pressable>
        <Pressable onPress={handleReset}>
          <Text style={styles.link}>Send password reset</Text>
        </Pressable>
        {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
        <Link href="/signup" style={styles.link}>
          Need an account? Create one here.
        </Link>
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
    flexGrow: 1,
    justifyContent: 'center',
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
  primaryButton: {
    backgroundColor: AppColors.ink,
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
  link: {
    color: AppColors.accentDeep,
    fontFamily: AppFonts.body,
    fontSize: 14,
    marginTop: 8,
  },
  feedback: {
    color: AppColors.subtleText,
    fontFamily: AppFonts.body,
    fontSize: 14,
    marginTop: 8,
  },
});
