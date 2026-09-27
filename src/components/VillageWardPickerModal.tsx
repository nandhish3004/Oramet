import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Colors, FontSize, Spacing, BorderRadius } from '../theme/colors';
import { WeatherIcon } from './WeatherIcon';

export interface VillageWardItem {
  villageOrWard: string;
  panchayatOrTown: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  elevationMeters: number;
  slopeDeg: number;
  hazardHistory: string;
  isHighRiskZone: boolean;
}

export const HILLY_VILLAGE_WARD_CATALOG: VillageWardItem[] = [
  {
    villageOrWard: 'Ward 4 - Sunil / Gandhinagar',
    panchayatOrTown: 'Joshimath Municipality',
    district: 'Chamoli',
    state: 'Uttarakhand',
    lat: 30.556,
    lng: 79.567,
    elevationMeters: 1890,
    slopeDeg: 34.8,
    hazardHistory: 'Subsidence & Alaknanda flash flood corridor',
    isHighRiskZone: true,
  },
  {
    villageOrWard: 'Ward 7 - Ravigram / Marwari',
    panchayatOrTown: 'Joshimath Municipality',
    district: 'Chamoli',
    state: 'Uttarakhand',
    lat: 30.562,
    lng: 79.574,
    elevationMeters: 1720,
    slopeDeg: 32.5,
    hazardHistory: 'Alaknanda & Dhauliganga confluence runout',
    isHighRiskZone: true,
  },
  {
    villageOrWard: 'Dharali Panchayat',
    panchayatOrTown: 'Harsil Valley',
    district: 'Uttarkashi',
    state: 'Uttarakhand',
    lat: 31.036,
    lng: 78.784,
    elevationMeters: 2680,
    slopeDeg: 36.2,
    hazardHistory: 'Bhagirathi cloudburst & glacial stream surge',
    isHighRiskZone: true,
  },
  {
    villageOrWard: 'Chooralmala Ward',
    panchayatOrTown: 'Meppadi Panchayat',
    district: 'Wayanad',
    state: 'Kerala',
    lat: 11.517,
    lng: 76.168,
    elevationMeters: 850,
    slopeDeg: 28.0,
    hazardHistory: 'Severe debris flow & river channel surge',
    isHighRiskZone: true,
  },
  {
    villageOrWard: 'Mundakkai Ward',
    panchayatOrTown: 'Meppadi Panchayat',
    district: 'Wayanad',
    state: 'Kerala',
    lat: 11.528,
    lng: 76.175,
    elevationMeters: 920,
    slopeDeg: 31.5,
    hazardHistory: 'Western Ghats high-gradient landslide corridor',
    isHighRiskZone: true,
  },
  {
    villageOrWard: 'Old Manali - Ward 2',
    panchayatOrTown: 'Manali Municipal Council',
    district: 'Kullu',
    state: 'Himachal Pradesh',
    lat: 32.253,
    lng: 77.175,
    elevationMeters: 2050,
    slopeDeg: 29.0,
    hazardHistory: 'Beas River flash flood and boulder wash',
    isHighRiskZone: true,
  },
  {
    villageOrWard: 'Singtam - Ward 3',
    panchayatOrTown: 'Singtam Nagar Panchayat',
    district: 'East Sikkim',
    state: 'Sikkim',
    lat: 27.234,
    lng: 88.498,
    elevationMeters: 380,
    slopeDeg: 24.5,
    hazardHistory: 'Teesta River GLOF and glacial flash runoff',
    isHighRiskZone: true,
  },
  {
    villageOrWard: 'Pipalkoti Panchayat',
    panchayatOrTown: 'Dasholi Block',
    district: 'Chamoli',
    state: 'Uttarakhand',
    lat: 30.432,
    lng: 79.431,
    elevationMeters: 1330,
    slopeDeg: 26.0,
    hazardHistory: 'Alaknanda NH-58 mountain pass choke point',
    isHighRiskZone: false,
  },
  {
    villageOrWard: 'Kasol Village',
    panchayatOrTown: 'Parvati Valley Block',
    district: 'Kullu',
    state: 'Himachal Pradesh',
    lat: 32.010,
    lng: 77.315,
    elevationMeters: 1580,
    slopeDeg: 27.5,
    hazardHistory: 'Parvati River seasonal cloudburst surge',
    isHighRiskZone: false,
  },
];

interface VillageWardPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectVillageWard: (item: VillageWardItem) => void;
  onSelectCurrentGps: () => void;
}

export const VillageWardPickerModal: React.FC<VillageWardPickerModalProps> = ({
  visible,
  onClose,
  onSelectVillageWard,
  onSelectCurrentGps,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = HILLY_VILLAGE_WARD_CATALOG.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.villageOrWard.toLowerCase().includes(q) ||
      item.panchayatOrTown.toLowerCase().includes(q) ||
      item.district.toLowerCase().includes(q) ||
      item.state.toLowerCase().includes(q)
    );
  });

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <View style={styles.badgeRow}>
                <Text style={styles.badgeText}>SIH PROBLEM 26192 COMPLIANT</Text>
              </View>
              <Text style={styles.title}>Hyper-Local Village & Ward Selector</Text>
              <Text style={styles.sub}>
                Forecast early warnings at exact panchayat/ward coordinates
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeText}>X</Text>
            </TouchableOpacity>
          </View>

          {/* Search Box */}
          <View style={styles.searchBox}>
            <WeatherIcon name="compass" size={16} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Village, Ward, Panchayat, or District..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearSearch}>X</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Auto-Detect Button */}
          <TouchableOpacity
            style={styles.autoGpsBtn}
            onPress={() => {
              onSelectCurrentGps();
              onClose();
            }}
          >
            <View style={styles.autoGpsIconBox}>
              <WeatherIcon name="map" size={18} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.autoGpsTitle}>Auto-Detect Panchayat via Live GPS</Text>
              <Text style={styles.autoGpsSub}>
                Reverse-geocodes your exact ward & syncs with nearest IMD AWS
              </Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.sectionHeader}>Vulnerable Hilly Panchayats & Wards</Text>

          {/* List of Villages / Wards */}
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {filtered.map((item, index) => (
              <TouchableOpacity
                key={`${item.villageOrWard}_${index}`}
                style={styles.itemCard}
                onPress={() => {
                  onSelectVillageWard(item);
                  onClose();
                }}
              >
                <View style={styles.itemTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemVillage}>{item.villageOrWard}</Text>
                    <Text style={styles.itemPanchayat}>
                      {item.panchayatOrTown}, {item.district}, {item.state}
                    </Text>
                  </View>
                  {item.isHighRiskZone && (
                    <View style={styles.riskBadge}>
                      <Text style={styles.riskBadgeText}>HIGH RISK ZONE</Text>
                    </View>
                  )}
                </View>

                <View style={styles.itemMetaRow}>
                  <View style={styles.metaChip}>
                    <Text style={styles.metaChipLabel}>ELEV:</Text>
                    <Text style={styles.metaChipVal}>{item.elevationMeters}m</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <Text style={styles.metaChipLabel}>SLOPE:</Text>
                    <Text style={styles.metaChipVal}>{item.slopeDeg}°</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <Text style={styles.metaChipLabel}>BASIN:</Text>
                    <Text style={styles.metaChipVal}>GSI NLSM</Text>
                  </View>
                </View>

                <Text style={styles.hazardHistoryText}>
                  Historical: {item.hazardHistory}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  badgeRow: {
    backgroundColor: '#E0F2FE',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#0284C7',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  sub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    paddingVertical: 10,
  },
  clearSearch: {
    fontSize: 14,
    color: '#94A3B8',
    padding: 4,
  },

  autoGpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284C7',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    padding: 12,
    borderRadius: 14,
    gap: 12,
  },
  autoGpsIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  autoGpsTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  autoGpsSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 1,
  },

  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
    marginHorizontal: Spacing.lg,
    marginTop: 8,
    marginBottom: 6,
  },

  list: {
    paddingHorizontal: Spacing.lg,
    marginBottom: 20,
  },
  itemCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  itemVillage: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  itemPanchayat: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  riskBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  riskBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#DC2626',
  },

  itemMetaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  metaChipLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
  },
  metaChipVal: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
  },

  hazardHistoryText: {
    fontSize: 11,
    color: '#B45309',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
});
