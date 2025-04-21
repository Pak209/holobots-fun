import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, Image, Animated } from 'react-native';
import { colors } from '@/constants/colors';
import { HOLOBOT_STATS } from '@/types/holobot';
import { Swords } from 'lucide-react-native';

interface QuestBattleBannerProps {
  isVisible: boolean;
  isBossQuest: boolean;
  squadHolobotKeys: string[];
  bossHolobotKey: string;
  onComplete: () => void;
}

export function QuestBattleBanner({ 
  isVisible, 
  isBossQuest, 
  squadHolobotKeys, 
  bossHolobotKey, 
  onComplete 
}: QuestBattleBannerProps) {
  const [animation] = useState(new Animated.Value(0));
  const [showVs, setShowVs] = useState(false);
  const [showBoss, setShowBoss] = useState(false);
  
  useEffect(() => {
    if (isVisible) {
      // Reset states
      setShowVs(false);
      setShowBoss(false);
      animation.setValue(0);
      
      // Start animation sequence
      Animated.sequence([
        // Fade in squad
        Animated.timing(animation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        // Hold
        Animated.delay(500),
      ]).start(() => {
        // Show VS
        setShowVs(true);
        
        // After delay, show boss
        setTimeout(() => {
          setShowBoss(true);
          
          // After another delay, complete the animation
          setTimeout(() => {
            onComplete();
          }, 1500);
        }, 800);
      });
    }
  }, [isVisible]);
  
  if (!isVisible) return null;
  
  // Get squad names
  const squadNames = squadHolobotKeys.map(key => HOLOBOT_STATS[key]?.name || 'Unknown');
  
  // Get boss name
  const bossName = HOLOBOT_STATS[bossHolobotKey]?.name || 'Unknown Boss';
  
  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="fade"
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.battleHeader}>
            <Text style={styles.battleTitle}>
              {isBossQuest ? 'BOSS BATTLE' : 'EXPLORATION'}
            </Text>
          </View>
          
          <View style={styles.battleScene}>
            {/* Squad Side */}
            <Animated.View 
              style={[
                styles.squadSide,
                { opacity: animation }
              ]}
            >
              {isBossQuest ? (
                // For boss quest, show all squad members
                <View style={styles.squadMembers}>
                  {squadNames.map((name, index) => (
                    <View key={index} style={styles.squadMember}>
                      <View style={styles.holobotAvatar}>
                        <Text style={styles.holobotInitial}>
                          {name.charAt(0)}
                        </Text>
                      </View>
                      <Text style={styles.holobotName}>{name}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                // For exploration, show single holobot
                <View style={styles.singleHolobot}>
                  <View style={styles.holobotAvatarLarge}>
                    <Text style={styles.holobotInitialLarge}>
                      {squadNames[0]?.charAt(0) || 'H'}
                    </Text>
                  </View>
                  <Text style={styles.holobotNameLarge}>{squadNames[0]}</Text>
                </View>
              )}
            </Animated.View>
            
            {/* VS */}
            {showVs && (
              <View style={styles.vsContainer}>
                <View style={styles.vsCircle}>
                  <Swords size={24} color={colors.text} />
                </View>
              </View>
            )}
            
            {/* Boss Side */}
            {showBoss && (
              <Animated.View style={styles.bossSide}>
                <View style={styles.singleHolobot}>
                  <View style={[styles.holobotAvatarLarge, styles.bossAvatar]}>
                    <Text style={styles.holobotInitialLarge}>
                      {bossName.charAt(0)}
                    </Text>
                  </View>
                  <Text style={[styles.holobotNameLarge, styles.bossName]}>
                    {bossName}
                  </Text>
                  {isBossQuest && (
                    <View style={styles.bossTag}>
                      <Text style={styles.bossTagText}>BOSS</Text>
                    </View>
                  )}
                </View>
              </Animated.View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  battleHeader: {
    backgroundColor: colors.primary,
    padding: 12,
    alignItems: 'center',
  },
  battleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  battleScene: {
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 200,
  },
  squadSide: {
    flex: 1,
    alignItems: 'center',
  },
  squadMembers: {
    alignItems: 'center',
  },
  squadMember: {
    alignItems: 'center',
    marginBottom: 12,
  },
  holobotAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  holobotInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  holobotName: {
    fontSize: 12,
    color: colors.text,
  },
  singleHolobot: {
    alignItems: 'center',
  },
  holobotAvatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  holobotInitialLarge: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  holobotNameLarge: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  vsContainer: {
    marginHorizontal: 16,
  },
  vsCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  bossSide: {
    flex: 1,
    alignItems: 'center',
  },
  bossAvatar: {
    backgroundColor: colors.danger,
  },
  bossName: {
    color: colors.danger,
  },
  bossTag: {
    backgroundColor: colors.danger,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
  },
  bossTagText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.text,
  },
});