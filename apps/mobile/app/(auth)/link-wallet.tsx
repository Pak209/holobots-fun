import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { Link, Wallet, ArrowRight } from 'lucide-react-native';

export default function LinkWalletScreen() {
  const router = useRouter();
  const { user, linkWallet, isLoading, error, clearError } = useAuthStore();
  
  const [walletAddress, setWalletAddress] = useState('');
  
  const handleLinkWallet = async () => {
    if (!walletAddress) {
      Alert.alert('Error', 'Please enter a wallet address');
      return;
    }
    
    try {
      await linkWallet(walletAddress);
      if (!error) {
        Alert.alert(
          'Wallet Linked',
          'Your wallet has been successfully linked to your account.',
          [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
        );
      }
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleSkip = () => {
    router.replace('/(tabs)');
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <Text style={styles.title}>Link Your Wallet</Text>
        <Text style={styles.subtitle}>Connect to your Holobots account</Text>
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={clearError}>
              <Text style={styles.dismissText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Wallet size={24} color={colors.primary} />
            <Text style={styles.infoTitle}>Why Link Your Wallet?</Text>
          </View>
          <Text style={styles.infoText}>
            Linking your wallet allows you to:
          </Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <ArrowRight size={16} color={colors.primary} />
              <Text style={styles.benefitText}>Sync activity to your Holobot</Text>
            </View>
            <View style={styles.benefitItem}>
              <ArrowRight size={16} color={colors.primary} />
              <Text style={styles.benefitText}>Participate in battles</Text>
            </View>
            <View style={styles.benefitItem}>
              <ArrowRight size={16} color={colors.primary} />
              <Text style={styles.benefitText}>Earn rewards and upgrades</Text>
            </View>
          </View>
        </Card>
        
        <View style={styles.form}>
          <Text style={styles.formLabel}>Your Wallet Address</Text>
          <View style={styles.inputContainer}>
            <Link size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="0x..."
              placeholderTextColor={colors.textSecondary}
              value={walletAddress}
              onChangeText={setWalletAddress}
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>
          
          <Button
            title="Link Wallet"
            onPress={handleLinkWallet}
            variant="primary"
            size="large"
            fullWidth
            loading={isLoading}
            style={styles.linkButton}
          />
          
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            You can always link your wallet later in the settings.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 118, 117, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    flex: 1,
  },
  dismissText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoCard: {
    marginBottom: 24,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  benefitsList: {
    marginTop: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  form: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
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
    height: '100%',
  },
  linkButton: {
    height: 56,
    marginBottom: 16,
  },
  skipButton: {
    alignItems: 'center',
    padding: 12,
  },
  skipText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
});