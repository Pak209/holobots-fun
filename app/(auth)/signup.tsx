import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { Mail, Lock, User } from 'lucide-react-native';

export default function SignupScreen() {
  const router = useRouter();
  const { signUp, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [signupError, setSignupError] = useState<string | null>(null);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Redirect to mint screen instead of tabs for new users to select their first Holobot
      router.replace('/mint');
    }
  }, [isAuthenticated]);
  
  // Clear any previous errors when component mounts
  useEffect(() => {
    clearError();
    setSignupError(null);
  }, []);
  
  // Update local error state when store error changes
  useEffect(() => {
    if (error) {
      setSignupError(error);
    }
  }, [error]);
  
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const validatePassword = (password: string) => {
    return password.length >= 6;
  };
  
  const handleSignup = async () => {
    // Clear previous errors
    setSignupError(null);
    
    // Validate inputs
    if (!email || !password || !confirmPassword || !username) {
      setSignupError('All fields are required');
      return;
    }
    
    if (!validateEmail(email)) {
      setSignupError('Please enter a valid email address');
      return;
    }
    
    if (!validatePassword(password)) {
      setSignupError('Password must be at least 6 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setSignupError('Passwords do not match');
      return;
    }
    
    try {
      await signUp(email, password, username);
      // Successful signup will trigger the isAuthenticated effect which redirects to mint screen
    } catch (error) {
      console.log('Signup error:', error);
      setSignupError(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the Holobots community</Text>
          
          {signupError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{signupError}</Text>
            </View>
          )}
          
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <User size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor={colors.textSecondary}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Mail size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!isLoading}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Lock size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!isLoading}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Lock size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor={colors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!isLoading}
              />
            </View>
            
            <Button
              title="Sign Up"
              onPress={handleSignup}
              variant="primary"
              size="large"
              loading={isLoading}
              fullWidth
              style={styles.signupButton}
            />
            
            <Text style={styles.loginText}>
              Already have an account?{' '}
              <Text 
                style={styles.loginLink}
                onPress={() => router.push('/login')}
              >
                Log In
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 118, 117, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
  },
  signupButton: {
    marginTop: 8,
  },
  loginText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 16,
  },
  loginLink: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});