import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
  Share,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { evacuationService, SafeShelter } from '../../services/evacuation/evacuationService';
import { WeatherIcon } from '../../components/WeatherIcon';
import { GoogleMapsLiveView } from '../../components/GoogleMapsLiveView';
import { Colors, FontSize, Spacing, BorderRadius } from '../../theme/colors';
import { RootStackParamList } from '../../Navigation';
import { useRiskStore } from '../../state/useRiskStore';

const { width } = Dimensions.get('window');
const MAP_HEIGHT = 340;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const MapViewScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { userLocation, activeDistrict, isLiveGpsMode } = useRiskStore();

  const userCity = isLiveGpsMode && userLocation ? userLocation.city : activeDistrict || 'Local Area';
  const userState = isLiveGpsMode && userLocation ? userLocation.state : 'India';
  const lat = userLocation?.latitude ?? 28.6139;
  const lng = userLocation?.longitude ?? 77.2090;

  const [activeFilter, setActiveFilter] = useState<'all' | 'high_ground' | 'medical'>('all');

  const allShelters = evacuationService.getDynamicNearbyShelters(lat, lng, userCity);
  const filteredShelters = allShelters.filter((s) => {
    if (activeFilter === 'high_ground') return s.isHighGround;
    if (activeFilter === 'medical') {
      return s.facilities.some((f) => f.toLowerCase().includes('medical') || f.toLowerCase().includes('aid') || f.toLowerCase().includes('doctor'));
    }
    return true;
  });

  const handleShareMap = async () => {
    try {
      await Share.share({
        title: `Live Safety Map - ${userCity}`,
        message: `Live Emergency Coordinates (${userCity}, ${userState}):\nLocation: https://maps.google.com/?q=${lat.toFixed(4)},${lng.toFixed(4)}\nDesignated Safe Haven: ${allShelters[0].name}`,
      });
    } catch {}
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoBadge}>
            <WeatherIcon name="map" size={18} color="#005BBF" />
          </View>
          <View>
            <View style={styles.brandRow}>
              <Text style={styles.brandName}>Live Safety Map</Text>
              <View style={styles.locationBadge}>
                <View style={styles.livePulseDot} />
                <Text style={styles.locationBadgeText}>{userCity}</Text>
              </View>
            </View>
            <Text style={styles.headerSub}>{userState} · Live Coordinates</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={handleShareMap}
            accessibilityLabel="Share Map"
          >
            <WeatherIcon name="share" size={18} color="#0F172A" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => evacuationService.navigateToSafeShelter(lat, lng)}
            accessibilityLabel="Google Maps"
          >
            <WeatherIcon name="compass" size={18} color="#005BBF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Interactive Live Map View */}
        <View style={styles.mapContainer}>
          <GoogleMapsLiveView
            height={MAP_HEIGHT}
            latitude={lat}
            longitude={lng}
            shelterName={allShelters[0].name}
          />
          <View style={styles.mapStatusPill}>
            <View style={styles.greenDot} />
            <Text style={styles.mapStatusText}>
              {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
            </Text>
          </View>
        </View>

        {/* Shelter Filter Tabs */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'all' && styles.filterChipActive]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.filterChipText, activeFilter === 'all' && styles.filterChipTextActive]}>
              All Shelters ({allShelters.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'high_ground' && styles.filterChipActive]}
            onPress={() => setActiveFilter('high_ground')}
          >
            <Text style={[styles.filterChipText, activeFilter === 'high_ground' && styles.filterChipTextActive]}>
              High Ground
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'medical' && styles.filterChipActive]}
            onPress={() => setActiveFilter('medical')}
          >
            <Text style={[styles.filterChipText, activeFilter === 'medical' && styles.filterChipTextActive]}>
              Medical & First Aid
            </Text>
          </TouchableOpacity>
        </View>

        {/* Evacuation Quick Launch Card */}
        <View style={styles.evacBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.evacBannerTitle}>Need to Evacuate?</Text>
            <Text style={styles.evacBannerSub}>
              View turn-by-turn walking route and official NDMA safety instructions.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.evacGuideBtn}
            onPress={() => navigation.navigate('EvacuationGuidance' as any)}
          >
            <Text style={styles.evacGuideBtnText}>Guide</Text>
            <WeatherIcon name="arrow-right" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Nearby Relief Havens List */}
        <View style={styles.sheltersHeaderRow}>
          <Text style={styles.sheltersTitle}>Nearby Relief Havens</Text>
          <Text style={styles.sheltersCount}>{filteredShelters.length} Available</Text>
        </View>

        {filteredShelters.map((shelter: SafeShelter, idx: number) => (
          <View key={shelter.id} style={styles.shelterCard}>
            <View style={styles.shelterCardTop}>
              <View style={styles.shelterIndexPill}>
                <Text style={styles.shelterIndexText}>#{idx + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.shelterName}>{shelter.name}</Text>
                <View style={styles.shelterMetaRow}>
                  <Text style={styles.shelterDistance}>~{shelter.distanceKm} km walking</Text>
                  <Text style={styles.shelterDot}>•</Text>
                  <Text style={styles.shelterStatus}>Capacity: {shelter.capacity}</Text>
                </View>
              </View>
            </View>

            <View style={styles.amenitiesRow}>
              {shelter.facilities.map((fac, fIdx) => (
                <View key={fIdx} style={styles.amenityChip}>
                  <Text style={styles.amenityChipText}>{fac}</Text>
                </View>
              ))}
            </View>

            <View style={styles.cardActionsRow}>
              <TouchableOpacity
                style={styles.directionsBtn}
                onPress={() => evacuationService.navigateToSafeShelter(lat, lng, shelter)}
              >
                <WeatherIcon name="compass" size={16} color="#FFFFFF" />
                <Text style={styles.directionsBtnText}>Directions in Google Maps</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => Linking.openURL(`tel:${shelter.contactNumber}`)}
                accessibilityLabel="Call"
              >
                <WeatherIcon name="phone" size={16} color="#0F172A" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Emergency Helpline Strip */}
        <View style={styles.emergencyStrip}>
          <View style={styles.emergencyLeft}>
            <WeatherIcon name="alert" size={18} color="#DC2626" />
            <View>
              <Text style={styles.emergencyTitle}>24x7 National Emergency</Text>
              <Text style={styles.emergencySub}>Police · Fire · Ambulance · Disaster</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.call112Btn}
            onPress={() => Linking.openURL('tel:112')}
          >
            <WeatherIcon name="phone" size={14} color="#FFFFFF" />
            <Text style={styles.call112Text}>Call 112</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: 48,
    paddingBottom: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandName: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: '#0F172A',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  locationBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 60,
  },

  mapContainer: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.md,
    backgroundColor: '#E2E8F0',
    position: 'relative',
  },
  mapStatusPill: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  mapStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F172A',
  },

  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },

  evacBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  evacBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  evacBannerSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    lineHeight: 15,
  },
  evacGuideBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0284C7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  evacGuideBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  sheltersHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sheltersTitle: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: '#0F172A',
  },
  sheltersCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },

  shelterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  shelterCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  shelterIndexPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shelterIndexText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
  },
  shelterName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  shelterMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  shelterDistance: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0284C7',
  },
  shelterDot: {
    fontSize: 10,
    color: '#94A3B8',
  },
  shelterStatus: {
    fontSize: 12,
    color: '#64748B',
  },

  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  amenityChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  amenityChipText: {
    fontSize: 11,
    color: '#334155',
  },

  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
  },
  directionsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 11,
    borderRadius: BorderRadius.md,
    gap: 8,
  },
  directionsBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  callBtn: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  emergencyStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  emergencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emergencyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#991B1B',
  },
  emergencySub: {
    fontSize: 11,
    color: '#B91C1C',
    marginTop: 1,
  },
  call112Btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  call112Text: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
