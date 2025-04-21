import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { Mail, Lock } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);
  
  // Clear any previous errors when component mounts
  useEffect(() => {
    clearError();
    setLoginError(null);
  }, []);
  
  // Update local error state when store error changes
  useEffect(() => {
    if (error) {
      setLoginError(error);
    }
  }, [error]);
  
  const handleLogin = async () => {
    if (!email || !password) {
      setLoginError('Please enter both email and password');
      return;
    }
    
    setLoginError(null);
    
    try {
      await signIn(email, password);
      // If we get here without error, we should be redirected by the isAuthenticated effect
    } catch (error) {
      console.log('Login error:', error);
      setLoginError(error instanceof Error ? error.message : 'Login failed. Please check your credentials.');
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Log in to your Holobots account</Text>
        
        {loginError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{loginError}</Text>
          </View>
        )}
        
        <View style={styles.form}>
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
          
          <Button
            title="Log In"
            onPress={handleLogin}
            variant="primary"
            size="large"
            loading={isLoading}
            fullWidth
            style={styles.loginButton}
          />
          
          <Text style={styles.signupText}>
            Don't have an account?{' '}
            <Text 
              style={styles.signupLink}
              onPress={() => router.push('/signup')}
            >
              Sign Up
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  loginButton: {
    marginTop: 8,
  },
  signupText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 16,
  },
  signupLink: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});