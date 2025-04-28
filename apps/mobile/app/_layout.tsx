import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { useAuthStore } from '@/store/auth-store';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isAuthenticated, refreshUser } = useAuthStore();
  
  const [fontsLoaded] = useFonts({
    // Add any custom fonts here
  });

  useEffect(() => {
    // Check for existing session on app start
    refreshUser();
  }, []);

  useEffect(() => {
    // Hide the splash screen when fonts are loaded and auth state is determined
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // If fonts aren't loaded yet, return null
  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" redirect={isAuthenticated} />
        <Stack.Screen name="(tabs)" redirect={!isAuthenticated} />
        <Stack.Screen name="battle/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="battle-result/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}