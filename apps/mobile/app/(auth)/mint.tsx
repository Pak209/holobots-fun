import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { HOLOBOT_STATS } from '@/types/holobot';
import { Holobot } from '@/types/holobots';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Shield, Zap, Coins, FileCode2 } from 'lucide-react-native';
import { colors } from '@/constants/colors';

export default function MintScreen() {
  const [selectedHolobot, setSelectedHolobot] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const { user, profile, refreshUser, updateUser } = useAuthStore();
  const router = useRouter();
  
  useEffect(() => {
    // Check if user has any holobots
    if (profile && Object.keys(profile.holobots || {}).length > 0) {
      // User already has holobots, redirect to main app
      router.replace('/(tabs)');
    }
  }, [profile, router]);

  // Starter holobots available for minting
  const starterHolobots = ['ace', 'shadow', 'kuma'].filter(key => HOLOBOT_STATS[key]);

  const handleSelectHolobot = (holobotKey: string) => {
    setSelectedHolobot(holobotKey);
  };

  const handleMintHolobot = async () => {
    if (!selectedHolobot) {
      Alert.alert("Selection Required", "Please select a Holobot to mint");
      return;
    }

    if (!HOLOBOT_STATS[selectedHolobot]) {
      Alert.alert("Invalid Selection", "The selected Holobot is not available for minting");
      return;
    }

    setIsMinting(true);
    
    try {
      // Create the user's first holobot
      const baseStats = HOLOBOT_STATS[selectedHolobot];
      
      // Create new holobot object with fields expected by the backend - using the Holobot type from holobots.ts
      const newHolobot: Holobot = {
        id: Date.now().toString(),
        name: baseStats.name,
        level: 1,
        attack: baseStats.attack,
        defense: baseStats.defense,
        speed: baseStats.speed,
        health: baseStats.maxHealth || 100,
        experience: 0,
        rank: 'Rookie',
        energy: 100,
        maxEnergy: 100,
        syncPoints: 0,
        dailySyncQuota: 5000,
        dailySyncUsed: 0,
        hackMeter: 0,
        maxHackMeter: 100,
        intelligence: baseStats.intelligence || 0,
        specialMove: baseStats.specialMove,
        attributes: {
          strength: baseStats.attack,
          agility: baseStats.speed,
          intelligence: baseStats.intelligence || 0,
          durability: baseStats.defense
        },
        image: selectedHolobot === 'ace' 
          ? 'https://i.imgur.com/JGkzwKX.png' 
          : selectedHolobot === 'kuma'
          ? 'https://i.imgur.com/pT9rffW.png'
          : 'https://i.imgur.com/2MWZgrR.png',
        streak: {
          type: 'win',
          count: 0
        },
        nextBattle: {
          time: new Date(Date.now() + 3600000).toISOString()
        }
      };
      
      console.log("Adding 500 Holos tokens to user and first Holobot");
      
      // User gets their first holobot for free and some starter tokens
      await updateUser({
        holobots: {[newHolobot.id]: newHolobot},
        holosTokens: 500
      });
      
      await refreshUser();
      
      // Navigate to the dashboard after successful minting
      router.replace('/(tabs)');
    } catch (error) {
      console.error("Error minting holobot:", error);
      Alert.alert(
        "Minting Error",
        "There was an error minting your Holobot. Please try again."
      );
    } finally {
      setIsMinting(false);
    }
  };

  const renderHolobotCard = (holobotKey: string) => {
    if (!HOLOBOT_STATS[holobotKey]) {
      console.error(`Missing holobot stats for: ${holobotKey}`);
      return null;
    }
    
    const holobot = HOLOBOT_STATS[holobotKey];
    const isSelected = selectedHolobot === holobotKey;
    
    return (
      <TouchableOpacity
        key={holobotKey}
        onPress={() => handleSelectHolobot(holobotKey)}
        style={[
          styles.holobotCard,
          isSelected && styles.selectedCard
        ]}
        activeOpacity={0.8}
      >
        <View style={styles.cardContent}>
          {/* Holobot Image */}
          <View style={styles.imageContainer}>
            <Image 
              source={{ 
                uri: holobotKey === 'ace' 
                  ? 'https://i.imgur.com/JGkzwKX.png' 
                  : holobotKey === 'kuma'
                  ? 'https://i.imgur.com/pT9rffW.png'
                  : 'https://i.imgur.com/2MWZgrR.png'
              }}
              style={styles.holobotImage}
              resizeMode="contain"
            />
          </View>

          {/* Holobot Details */}
          <View style={styles.holobotDetails}>
            <Text style={styles.holobotName}>{holobot.name}</Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statRow}>
                <View style={styles.statIcon}>
                  <Shield width={16} height={16} color={colors.primary} />
                </View>
                <Text style={styles.statLabel}>Style</Text>
                <Text style={styles.statValue}>
                  {holobotKey === 'ace' ? 'Balanced' : 
                  holobotKey === 'kuma' ? 'Aggressive' : 
                  holobotKey === 'shadow' ? 'Defensive' : 'Standard'}
                </Text>
              </View>
              
              <View style={styles.statRow}>
                <View style={styles.statIcon}>
                  <Zap width={16} height={16} color="#FFD700" />
                </View>
                <Text style={styles.statLabel}>Special</Text>
                <Text style={styles.statValue}>{holobot.specialMove}</Text>
              </View>
            </View>

            {holobot.abilityDescription && (
              <Text style={styles.abilityText}>"{holobot.abilityDescription}"</Text>
            )}
          </View>
        </View>
        
        {/* Selection Indicator */}
        {isSelected && <View style={styles.selectionIndicator} />}
      </TouchableOpacity>
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your First Holobot</Text>
          <Text style={styles.subtitle}>
            Welcome to Holobots! Select your starter Holobot to begin your journey.
          </Text>
          
          <View style={styles.tokenInfo}>
            <Coins width={20} height={20} color="#FFD700" />
            <Text style={styles.tokenText}>500 Holos tokens will be added to your account</Text>
          </View>
        </View>
        
        {starterHolobots.length > 0 ? (
          <View style={styles.holobotsGrid}>
            {starterHolobots.map((holobotKey) => renderHolobotCard(holobotKey))}
          </View>
        ) : (
          <Card style={styles.errorCard}>
            <Text style={styles.errorText}>No starter Holobots available. Please contact support.</Text>
          </Card>
        )}
        
        <View style={styles.actionContainer}>
          <Button
            title={isMinting ? "Minting..." : "Mint Your Holobot"}
            onPress={handleMintHolobot}
            disabled={!selectedHolobot || isMinting}
            style={styles.mintButton}
          />
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            You'll be able to unlock additional Holobots with tokens as you progress through the game!
          </Text>
          <View style={styles.footerItem}>
            <FileCode2 width={16} height={16} color="#A78BFA" />
            <Text style={styles.footerItemText}>Collect blueprints and resources from quests and battles</Text>
          </View>
          <View style={[styles.footerItem, styles.tokenFooter]}>
            <Coins width={16} height={16} color="#FFD700" />
            <Text style={styles.footerTokenText}>
              Holos tokens earned in-game now will seamlessly transfer to crypto tokens in the future
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
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  tokenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    padding: 8,
    borderRadius: 8,
  },
  tokenText: {
    marginLeft: 8,
    color: '#FFD700',
    fontWeight: '600',
  },
  holobotsGrid: {
    gap: 16,
    marginBottom: 24,
  },
  holobotCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  selectedCard: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    elevation: 5,
  },
  cardContent: {
    flexDirection: 'row',
  },
  imageContainer: {
    width: 100,
    height: 120,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  holobotImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  holobotDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  holobotName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  statsContainer: {
    gap: 8,
    marginBottom: 8,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  statIcon: {
    marginRight: 8,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    width: 60,
  },
  statValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'right',
  },
  abilityText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.textSecondary,
    marginTop: 8,
  },
  selectionIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  errorCard: {
    padding: 16,
    marginBottom: 24,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
  },
  actionContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  mintButton: {
    width: 200,
    height: 50,
  },
  spinner: {
    marginRight: 8,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  footerItemText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.textSecondary,
  },
  tokenFooter: {
    marginTop: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
    padding: 8,
    borderRadius: 8,
  },
  footerTokenText: {
    marginLeft: 8,
    fontSize: 12,
    color: colors.textSecondary,
  },
}); 