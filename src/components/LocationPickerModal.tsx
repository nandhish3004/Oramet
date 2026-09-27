import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { deviceLocationService } from '../services/location/DeviceLocationService';
import { useRiskStore } from '../state/useRiskStore';
import { WeatherIcon } from './WeatherIcon';
import { Colors, FontSize, Spacing, BorderRadius } from '../theme/colors';

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  visible,
  onClose,
}) => {
  const { setManualLocation, setLiveGpsMode, isLiveGpsMode, activeDistrict } = useRiskStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<
    Array<{ name: string; state: string; latitude: number; longitude: number }>
  >([]);

  const curatedList = deviceLocationService.getCuratedIndianLocations();

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await deviceLocationService.searchIndianLocations(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectLiveGps = () => {
    deviceLocationService.clearCache();
    setLiveGpsMode(true);
    onClose();
  };

  const handleSelectCity = (city: {
    name: string;
    state: string;
    latitude: number;
    longitude: number;
  }) => {
    setManualLocation(city.latitude, city.longitude, city.name, city.state);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Choose Location in India</Text>
              <Text style={styles.subtitle}>
                Auto-detect live GPS or explore any district/city
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} accessibilityLabel="Close">
              <WeatherIcon name="check" size={16} color="#727785" />
            </TouchableOpacity>
          </View>

          {/* 1-Tap Auto GPS Button */}
          <TouchableOpacity
            style={[styles.gpsBtn, isLiveGpsMode && styles.gpsBtnActive]}
            onPress={handleSelectLiveGps}
          >
            <View style={styles.gpsIconCircle}>
              <WeatherIcon name="compass" size={18} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.gpsBtnTitle}>Use Live Device GPS</Text>
                {isLiveGpsMode && (
                  <View style={styles.activePill}>
                    <Text style={styles.activePillText}>Active</Text>
                  </View>
                )}
              </View>
              <Text style={styles.gpsBtnSub}>
                Automatically fetches live weather & coordinates for where you are
              </Text>
            </View>
          </TouchableOpacity>

          {/* Search Box */}
          <View style={styles.searchBox}>
            <WeatherIcon name="map" size={16} color="#005BBF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search any Indian city, district, or town..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
            />
            {isSearching && <ActivityIndicator size="small" color="#005BBF" />}
          </View>

          {/* Search Results or Curated Cities */}
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {searchResults.length > 0 ? (
              <View>
                <Text style={styles.sectionHeader}>SEARCH RESULTS ACROSS INDIA</Text>
                {searchResults.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.cityRow}
                    onPress={() => handleSelectCity(item)}
                  >
                    <View style={styles.pinCircle}>
                      <WeatherIcon name="map" size={14} color="#005BBF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cityName}>{item.name}</Text>
                      <Text style={styles.cityState}>
                        {item.state} · {item.latitude.toFixed(2)}°, {item.longitude.toFixed(2)}°
                      </Text>
                    </View>
                    <WeatherIcon name="arrow-right" size={14} color="#94A3B8" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View>
                <Text style={styles.sectionHeader}>POPULAR INDIAN CITIES & HAZARD ZONES</Text>
                {curatedList.map((item, idx) => {
                  const isSelected = !isLiveGpsMode && activeDistrict.toLowerCase().includes(item.name.toLowerCase().split(' ')[0]);
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.cityRow, isSelected && styles.cityRowSelected]}
                      onPress={() => handleSelectCity(item)}
                    >
                      <View
                        style={[
                          styles.pinCircle,
                          isSelected && { backgroundColor: '#005BBF' },
                        ]}
                      >
                        <WeatherIcon
                          name="map"
                          size={14}
                          color={isSelected ? '#FFFFFF' : '#005BBF'}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={[styles.cityName, isSelected && { color: '#005BBF' }]}>
                            {item.name}
                          </Text>
                          {item.tag && (
                            <View style={styles.tagPill}>
                              <Text style={styles.tagText}>{item.tag}</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.cityState}>
                          {item.state} · {item.latitude.toFixed(2)}°N, {item.longitude.toFixed(2)}°E
                        </Text>
                      </View>
                      {isSelected ? (
                        <View style={styles.selectedCheck}>
                          <WeatherIcon name="check" size={14} color="#006A61" />
                        </View>
                      ) : (
                        <WeatherIcon name="arrow-right" size={14} color="#94A3B8" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  gpsBtnActive: {
    borderColor: '#0284C7',
    backgroundColor: '#E0F2FE',
  },
  gpsIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0284C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gpsBtnTitle: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    color: '#0369A1',
  },
  gpsBtnSub: {
    fontSize: FontSize.xs,
    color: '#0284C7',
    marginTop: 2,
  },
  activePill: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  activePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: FontSize.sm,
    color: Colors.text.primary,
  },

  list: {
    maxHeight: 380,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.text.tertiary,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cityRowSelected: {
    backgroundColor: '#F0F9FF',
  },
  pinCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cityName: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  cityState: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    marginTop: 1,
  },
  tagPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.text.tertiary,
  },
  selectedCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
