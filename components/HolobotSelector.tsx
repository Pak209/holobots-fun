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
import { ChevronDown, Check } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Holobot } from '@/types/holobot';
import { getHolobotImageUrl } from '@/utils/holobotUtils';

interface HolobotSelectorProps {
  holobots: Holobot[];
  selectedHolobot: Holobot | null;
  onSelect: (holobot: Holobot) => void;
}

export const HolobotSelector: React.FC<HolobotSelectorProps> = ({
  holobots,
  selectedHolobot,
  onSelect,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const handleSelect = (holobot: Holobot) => {
    onSelect(holobot);
    toggleModal();
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
              source={{ uri: selectedHolobot.image || getHolobotImageUrl(selectedHolobot.name) }} 
              style={styles.holobotImage} 
              resizeMode="cover"
            />
            <Text style={styles.holobotName}>{selectedHolobot.name}</Text>
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
                <Text style={styles.emptyStateText}>No Holobots available</Text>
              </View>
            ) : (
              <FlatList
                data={holobots}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.holobotItem}
                    onPress={() => handleSelect(item)}
                  >
                    <Image 
                      source={{ uri: item.image || getHolobotImageUrl(item.name) }} 
                      style={styles.listHolobotImage} 
                      resizeMode="cover"
                    />
                    <View style={styles.holobotInfo}>
                      <Text style={styles.listHolobotName}>{item.name}</Text>
                      <Text style={styles.holobotDetails}>
                        Rank {item.rank} • Level {item.level}
                      </Text>
                    </View>
                    {selectedHolobot?.id === item.id && (
                      <Check size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                )}
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
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedHolobot: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  holobotImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: colors.background,
  },
  holobotName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  placeholderText: {
    fontSize: 18,
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
  listHolobotImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: colors.background,
  },
  holobotInfo: {
    flex: 1,
  },
  listHolobotName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  holobotDetails: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});