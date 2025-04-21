import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useLeagueStore } from '../store/league-store';
import { colors } from '../constants/colors';
import { League } from '../types/league';
import { ChevronRight, Trophy } from 'lucide-react-native';

interface LeagueSelectorProps {
  onSelectLeague: (league: League) => void;
}

export const LeagueSelector: React.FC<LeagueSelectorProps> = ({ onSelectLeague }) => {
  const { leagues, isLoading, fetchLeagues } = useLeagueStore();
  
  React.useEffect(() => {
    fetchLeagues();
  }, []);
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading leagues...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Battle Leagues</Text>
      <Text style={styles.subtitle}>Select a league to battle in</Text>
      
      {leagues.map((league) => (
        <TouchableOpacity
          key={league.id}
          style={styles.leagueCard}
          onPress={() => onSelectLeague(league)}
        >
          <View style={styles.leagueHeader}>
            <Image 
              source={{ uri: league.icon }} 
              style={styles.leagueIcon} 
            />
            <View style={styles.leagueInfo}>
              <Text style={styles.leagueName}>{league.name}</Text>
              <Text style={styles.leagueLevel}>Level {league.minLevel}-{league.maxLevel}</Text>
            </View>
            <ChevronRight size={24} color={colors.primary} />
          </View>
          
          <Text style={styles.leagueDescription}>{league.description}</Text>
          
          <View style={styles.rewardsContainer}>
            <Trophy size={16} color={colors.gold} />
            <Text style={styles.rewardsText}>
              Rewards: {league.rewards.holos} Holos, {league.rewards.experience} XP
              {league.rewards.gachaTickets > 0 ? `, ${league.rewards.gachaTickets} Gacha Tickets` : ''}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  leagueCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  leagueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  leagueIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  leagueInfo: {
    flex: 1,
  },
  leagueName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  leagueLevel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  leagueDescription: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  rewardsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    padding: 8,
    borderRadius: 8,
  },
  rewardsText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 8,
  },
});