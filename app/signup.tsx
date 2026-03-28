import { Link, Redirect } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';

import { SurfaceCard } from '@/components/surface-card';
import { AppColors, AppFonts } from '@/constants/theme';
import { useAuth } from '@/providers/auth-provider';

export default function SignUpScreen() {
  const { signUp, loading, user } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState('');

  if (user) {
    return <Redirect href="/profile" />;
  }

  const handleSignUp = async () => {
    const result = await signUp({ email, password, name, phone });
    setFeedback(result.message);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SurfaceCard>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.copy}>
          This writes to Firebase Auth and creates a matching Firestore profile document.
        </Text>
        <TextInput
          onChangeText={setName}
          placeholder="Full name"
          placeholderTextColor={AppColors.line}
          style={styles.input}
          value={name}
        />
        <TextInput
          keyboardType="phone-pad"
          onChangeText={setPhone}
          placeholder="Phone"
          placeholderTextColor={AppColors.line}
          style={styles.input}
          value={phone}
        />
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
        <Pressable onPress={handleSignUp} style={styles.primaryButton}>
          <Text style={styles.primaryLabel}>{loading ? 'Creating account...' : 'Create account'}</Text>
        </Pressable>
        {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
        <Link href="/signin" style={styles.link}>
          Already have an account? Sign in.
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
  feedback: {
    color: AppColors.subtleText,
    fontFamily: AppFonts.body,
    fontSize: 14,
    marginTop: 8,
  },
  link: {
    color: AppColors.accentDeep,
    fontFamily: AppFonts.body,
    fontSize: 14,
    marginTop: 8,
  },
});
