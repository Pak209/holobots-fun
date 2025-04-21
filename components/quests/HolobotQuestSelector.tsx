import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  FlatList, 
  Image 
} from 'react-native';
import { ChevronDown, Clock, AlertCircle, Check } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { getHolobotImageUrl } from '@/utils/holobotUtils';
import { HOLOBOT_STATS } from '@/types/holobot';

interface HolobotQuestSelectorProps {
  holobots: any[];
  selectedHolobotKey: string;
  onSelect: (holobotKey: string) => void;
  showCooldowns?: boolean;
}

export const HolobotQuestSelector: React.FC<HolobotQuestSelectorProps> = ({
  holobots,
  selectedHolobotKey,
  onSelect,
  showCooldowns = true
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const handleSelect = (holobotKey: string) => {
    onSelect(holobotKey);
    toggleModal();
  };

  // Get the selected holobot data
  const selectedHolobot = holobots.find(h => h.key === selectedHolobotKey);
  
  // Get the holobot stats
  const getHolobotStats = (holobotKey: string) => {
    return HOLOBOT_STATS[holobotKey] || {};
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.selector} 
        onPress={toggleModal}
        activeOpacity={0.7}
      >
        {selectedHolobot ? (
          <View style={styles.selectedHolobot}>
            <Image 
              source={{ uri: getHolobotImageUrl(selectedHolobot.key) }} 
              style={styles.holobotImage} 
              resizeMode="cover"
            />
            <View style={styles.holobotInfo}>
              <Text style={styles.holobotName}>{selectedHolobot.name}</Text>
              <Text style={styles.holobotLevel}>Level {selectedHolobot.level}</Text>
            </View>
            {showCooldowns && selectedHolobot.isOnCooldown && (
              <View style={styles.cooldownBadge}>
                <Clock size={12} color={colors.text} />
                <Text style={styles.cooldownText}>{selectedHolobot.cooldownTimeRemaining}</Text>
              </View>
            )}
          </View>
        ) : (
          <Text style={styles.placeholderText}>Choose Holobot</Text>
        )}
        <ChevronDown size={20} color={colors.text} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={toggleModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={toggleModal}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Holobot</Text>
            
            {holobots.length === 0 ? (
              <View style={styles.emptyState}>
                <AlertCircle size={40} color={colors.textSecondary} />
                <Text style={styles.emptyStateText}>No Holobots available</Text>
              </View>
            ) : (
              <FlatList
                data={holobots}
                keyExtractor={(item, index) => item.id || item.key || index.toString()}
                renderItem={({ item }) => {
                  const isSelected = selectedHolobotKey === item.key;
                  const isOnCooldown = showCooldowns && item.isOnCooldown;
                  
                  return (
                    <TouchableOpacity
                      style={[
                        styles.holobotItem,
                        isSelected && styles.holobotItemSelected,
                        isOnCooldown && styles.holobotItemCooldown
                      ]}
                      onPress={() => handleSelect(item.key)}
                      disabled={isOnCooldown}
                    >
                      <Image 
                        source={{ uri: getHolobotImageUrl(item.key) }} 
                        style={styles.listHolobotImage} 
                        resizeMode="cover"
                      />
                      <View style={styles.holobotItemInfo}>
                        <Text style={[
                          styles.listHolobotName,
                          isOnCooldown && styles.holobotItemTextCooldown
                        ]}>
                          {item.name}
                        </Text>
                        <View style={styles.holobotItemDetails}>
                          <Text style={[
                            styles.holobotDetails,
                            isOnCooldown && styles.holobotItemTextCooldown
                          ]}>
                            Level {item.level}
                          </Text>
                          {isOnCooldown && (
                            <View style={styles.cooldownBadgeSmall}>
                              <Clock size={10} color={colors.text} />
                              <Text style={styles.cooldownTextSmall}>
                                {item.cooldownTimeRemaining}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                      {isSelected && !isOnCooldown && (
                        <Check size={20} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  );
                }}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundLighter,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedHolobot: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  holobotImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: colors.background,
  },
  holobotInfo: {
    flex: 1,
  },
  holobotName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  holobotLevel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  cooldownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  cooldownText: {
    fontSize: 12,
    color: colors.warning,
    marginLeft: 4,
    fontWeight: '500',
  },
  placeholderText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
  holobotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  holobotItemSelected: {
    backgroundColor: colors.primary + '10',
  },
  holobotItemCooldown: {
    opacity: 0.7,
  },
  listHolobotImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: colors.background,
  },
  holobotItemInfo: {
    flex: 1,
  },
  listHolobotName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  holobotItemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  holobotDetails: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 8,
  },
  holobotItemTextCooldown: {
    color: colors.textSecondary,
  },
  cooldownBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  cooldownTextSmall: {
    fontSize: 10,
    color: colors.warning,
    marginLeft: 2,
  },
});