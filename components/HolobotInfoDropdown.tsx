import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Card } from '@/components/Card';
import { colors } from '@/constants/colors';
import { ChevronDown, ChevronUp, Shield, Zap, Activity, Sword } from 'lucide-react-native';

export function HolobotInfoDropdown() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Mock holobot data
  const holobot = {
    name: 'Kurai',
    level: 41,
    rank: 'Legendary',
    experience: 16800,
    nextLevelExp: 17000,
    stats: {
      attack: 85,
      defense: 72,
      speed: 68,
      health: 150
    },
    attributePoints: 12,
    syncPoints: 45,
    image: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80'
  };
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  const calculateExpProgress = () => {
    return (holobot.experience / holobot.nextLevelExp) * 100;
  };
  
  return (
    <Card style={styles.container}>
      <TouchableOpacity 
        style={styles.header}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Image 
            source={{ uri: holobot.image }}
            style={styles.holobotImage}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.holobotName}>{holobot.name}</Text>
            <View style={styles.levelContainer}>
              <Text style={styles.levelText}>Lvl {holobot.level}</Text>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{holobot.rank}</Text>
              </View>
            </View>
          </View>
        </View>
        
        {isExpanded ? (
          <ChevronUp size={24} color={colors.text} />
        ) : (
          <ChevronDown size={24} color={colors.text} />
        )}
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.content}>
          <View style={styles.expContainer}>
            <Text style={styles.expLabel}>Experience</Text>
            <View style={styles.expBarContainer}>
              <View 
                style={[
                  styles.expBarFill, 
                  { width: `${calculateExpProgress()}%` }
                ]} 
              />
            </View>
            <Text style={styles.expText}>
              {holobot.experience} / {holobot.nextLevelExp}
            </Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Sword size={16} color={colors.text} />
              </View>
              <Text style={styles.statLabel}>Attack</Text>
              <Text style={styles.statValue}>{holobot.stats.attack}</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Shield size={16} color={colors.text} />
              </View>
              <Text style={styles.statLabel}>Defense</Text>
              <Text style={styles.statValue}>{holobot.stats.defense}</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Activity size={16} color={colors.text} />
              </View>
              <Text style={styles.statLabel}>Speed</Text>
              <Text style={styles.statValue}>{holobot.stats.speed}</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Zap size={16} color={colors.text} />
              </View>
              <Text style={styles.statLabel}>Health</Text>
              <Text style={styles.statValue}>{holobot.stats.health}</Text>
            </View>
          </View>
          
          <View style={styles.attributeContainer}>
            <Text style={styles.attributeText}>
              Available Attribute Points: <Text style={styles.attributeValue}>{holobot.attributePoints}</Text>
            </Text>
          </View>
          
          <View style={styles.syncContainer}>
            <Text style={styles.syncLabel}>Sync Points</Text>
            <Text style={styles.syncValue}>{holobot.syncPoints}</Text>
          </View>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  holobotImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  holobotName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 8,
  },
  rankBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  rankText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  expContainer: {
    marginBottom: 16,
  },
  expLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  expBarContainer: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  expBarFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  expText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  statItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  attributeContainer: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  attributeText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  attributeValue: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  syncContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 184, 148, 0.1)',
    padding: 12,
    borderRadius: 8,
  },
  syncLabel: {
    fontSize: 14,
    color: colors.text,
  },
  syncValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.secondary,
  },
});