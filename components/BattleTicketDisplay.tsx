import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ticket, Coins } from 'lucide-react-native';
import { useLeagueStore } from '../store/league-store';
import { useAuthStore } from '../store/auth-store';
import { colors } from '../constants/colors';
import { Button } from './Button';

interface BattleTicketDisplayProps {
  onRefresh?: () => void;
}

export const BattleTicketDisplay: React.FC<BattleTicketDisplayProps> = ({ onRefresh }) => {
  const { battleTickets, refreshTickets, isLoading, purchaseTickets } = useLeagueStore();
  const { user, updateUser } = useAuthStore();
  
  const availableTickets = battleTickets.filter(ticket => !ticket.used && new Date(ticket.expiresAt) > new Date());
  const holosTokens = user?.holosTokens || 0;
  const canPurchase = holosTokens >= 250;
  
  const handleRefresh = async () => {
    await refreshTickets();
    if (onRefresh) {
      onRefresh();
    }
  };
  
  const handlePurchaseTickets = async () => {
    if (!canPurchase) {
      Alert.alert(
        "Insufficient Tokens",
        "You need 250 Holos Tokens to purchase 10 battle tickets.",
        [{ text: "OK" }]
      );
      return;
    }
    
    if (!user) {
      Alert.alert(
        "Authentication Required",
        "You need to be logged in to purchase tickets.",
        [{ text: "OK" }]
      );
      return;
    }
    
    try {
      await purchaseTickets(user.id, holosTokens);
      
      // Update user tokens in auth store
      await updateUser({
        holosTokens: holosTokens - 250
      });
      
      Alert.alert(
        "Purchase Successful",
        "You have purchased 10 battle tickets for 250 Holos Tokens.",
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert(
        "Purchase Failed",
        error instanceof Error ? error.message : "Failed to purchase tickets",
        [{ text: "OK" }]
      );
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Battle Tickets</Text>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={handleRefresh}
          disabled={isLoading}
        >
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.ticketsContainer}>
        {[...Array(10)].map((_, index) => (
          <View 
            key={index} 
            style={[
              styles.ticket, 
              index < availableTickets.length ? styles.availableTicket : styles.usedTicket
            ]}
          >
            <Ticket 
              size={20} 
              color={index < availableTickets.length ? colors.primary : colors.gray} 
            />
          </View>
        ))}
      </View>
      
      <Text style={styles.infoText}>
        {availableTickets.length} / 10 tickets available
      </Text>
      <Text style={styles.smallText}>
        Tickets refresh daily at midnight
      </Text>
      
      <View style={styles.purchaseContainer}>
        <View style={styles.tokenInfo}>
          <Coins size={18} color={colors.gold} />
          <Text style={styles.tokenText}>
            {holosTokens} Holos Tokens
          </Text>
        </View>
        
        <Button
          title="Buy 10 Tickets (250 Tokens)"
          onPress={handlePurchaseTickets}
          variant={canPurchase ? "primary" : "outline"}
          size="small"
          disabled={!canPurchase || isLoading}
          icon={<Ticket size={16} color={canPurchase ? colors.white : colors.primary} />}
          style={styles.purchaseButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  refreshButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  refreshText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  ticketsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  ticket: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  availableTicket: {
    backgroundColor: colors.primaryLight,
  },
  usedTicket: {
    backgroundColor: colors.lightGray,
  },
  infoText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  smallText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  purchaseContainer: {
    marginTop: 8,
    backgroundColor: colors.backgroundLighter,
    borderRadius: 8,
    padding: 12,
  },
  tokenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tokenText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
    marginLeft: 8,
  },
  purchaseButton: {
    marginTop: 4,
  },
});