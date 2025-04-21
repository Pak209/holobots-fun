import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';

export default function AuthLayout() {
  const { refreshUser } = useAuthStore();
  
  // Check for existing session on mount
  useEffect(() => {
    refreshUser();
  }, []);
  
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="link-wallet" />
    </Stack>
  );
}