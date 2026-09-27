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
import { useNearbyShelters } from '../../hooks/useNearbyShelters';

const { width } = Dimensions.get('window');
const MAP_HEIGHT = 340;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const MapViewScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { userLocation, activeDistrict, isLiveGpsMode } = useRiskStore();

  const userCity = isLiveGpsMode && userLocation ? userLocation.city : activeDistrict || 'Local Area';
  const userState = isLiveGpsMode && userLocation ? userLocation.state : 'India';
  const lat = userLocation?.latitude;
  const lng = userLocation?.longitude;
  const hasUsableLocation = Boolean(userLocation && !userLocation.isApproximate);
  const { shelters: allShelters, isLoading: isLoadingShelters, error: shelterError } =
    useNearbyShelters(lat, lng, hasUsableLocation);

  const [activeFilter, setActiveFilter] = useState<'all' | 'emergency'>('all');
  const filteredShelters = activeFilter === 'emergency'
    ? allShelters.filter((s) => s.isEmergencyTagged)
    : allShelters;

  const handlePlaceDirections = (place: SafeShelter) => {
    Alert.alert(
      'Map place is not safety-verified',
      `${place.name} is mapped in OpenStreetMap, but OraMet cannot confirm it is open or safe. Walking directions are not checked for flooding, closures, or terrain hazards.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open map directions', onPress: () => evacuationService.navigateToSafeShelter(lat, lng, place) },
      ]
    );
  };

  const handleShareMap = async () => {
    if (!hasUsableLocation || lat === undefined || lng === undefined) {
      Alert.alert('Precise location unavailable', 'Enable GPS or choose a precise location before sharing coordinates.');
      return;
    }
    try {
      await Share.share({
        title: `Map location - ${userCity}`,
        message: `Location (${userCity}, ${userState}):\nhttps://maps.google.com/?q=${lat.toFixed(5)},${lng.toFixed(5)}\nNearby mapped places are not authority-verified as safe shelters.`,
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
              <Text style={styles.brandName}>Map explorer</Text>
              <View style={styles.locationBadge}>
                <View style={[styles.livePulseDot, !hasUsableLocation && { backgroundColor: '#94A3B8' }]} />
                <Text style={styles.locationBadgeText}>{userCity}</Text>
              </View>
            </View>
            <Text style={styles.headerSub}>
              {userState} · {hasUsableLocation ? 'Selected location' : 'Precise location unavailable'}
            </Text>
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
            onPress={() => {
              if (!hasUsableLocation) {
                Alert.alert('Precise location unavailable', 'Enable GPS before searching the map around your location.');
                return;
              }
              evacuationService.navigateToSafeShelter(lat, lng);
            }}
            accessibilityLabel="Google Maps"
          >
            <WeatherIcon name="compass" size={18} color="#005BBF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Interactive Live Map View */}
        <View style={styles.mapContainer}>
          {hasUsableLocation && lat !== undefined && lng !== undefined ? (
            <>
              <GoogleMapsLiveView
                height={MAP_HEIGHT}
                latitude={lat}
                longitude={lng}
                shelters={allShelters}
              />
              <View style={styles.mapStatusPill}>
                <View style={styles.greenDot} />
                <Text style={styles.mapStatusText}>{lat.toFixed(4)}°, {lng.toFixed(4)}°</Text>
              </View>
            </>
          ) : (
            <View style={styles.mapUnavailable}>
              <WeatherIcon name="map" size={30} color="#64748B" />
              <Text style={styles.mapUnavailableTitle}>Precise location required</Text>
              <Text style={styles.mapUnavailableText}>Enable GPS or select a precise location. Approximate IP locations are hidden for safety.</Text>
            </View>
          )}
        </View>

        <View style={styles.unverifiedNotice}>
          <Text style={styles.unverifiedNoticeText}>
            Places come from OpenStreetMap and are not verified by emergency authorities. Always follow local official instructions.
          </Text>
        </View>

        {/* Mapped place filters */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'all' && styles.filterChipActive]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.filterChipText, activeFilter === 'all' && styles.filterChipTextActive]}>
              All mapped ({allShelters.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'emergency' && styles.filterChipActive]}
            onPress={() => setActiveFilter('emergency')}
          >
            <Text style={[styles.filterChipText, activeFilter === 'emergency' && styles.filterChipTextActive]}>
              Emergency tagged
            </Text>
          </TouchableOpacity>
        </View>

        {/* Evacuation Quick Launch Card */}
        <View style={styles.evacBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.evacBannerTitle}>Need to Evacuate?</Text>
            <Text style={styles.evacBannerSub}>
              Practical precautions and map data. No live road closures or verified evacuation routes.
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
          <Text style={styles.sheltersTitle}>Nearby mapped places</Text>
          <Text style={styles.sheltersCount}>{filteredShelters.length} found</Text>
        </View>

        {isLoadingShelters ? <Text style={styles.mapUnavailableText}>Searching OpenStreetMap…</Text> : null}
        {shelterError ? <Text style={styles.mapUnavailableText}>{shelterError}</Text> : null}
        {!isLoadingShelters && !shelterError && filteredShelters.length === 0 ? (
          <Text style={styles.mapUnavailableText}>No mapped shelters or assembly points were found nearby. This does not mean that no official shelter exists.</Text>
        ) : null}

        {filteredShelters.map((shelter: SafeShelter, idx: number) => (
          <View key={shelter.id} style={styles.shelterCard}>
            <View style={styles.shelterCardTop}>
              <View style={styles.shelterIndexPill}>
                <Text style={styles.shelterIndexText}>#{idx + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.shelterName}>{shelter.name}</Text>
                <View style={styles.shelterMetaRow}>
                  <Text style={styles.shelterDistance}>{shelter.distanceKm.toFixed(1)} km straight-line</Text>
                  <Text style={styles.shelterDot}>•</Text>
                  <Text style={styles.shelterStatus}>{shelter.placeType.replace(/_/g, ' ')}</Text>
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
                onPress={() => handlePlaceDirections(shelter)}
              >
                <WeatherIcon name="compass" size={16} color="#FFFFFF" />
                <Text style={styles.directionsBtnText}>Directions in Google Maps</Text>
              </TouchableOpacity>

              {shelter.contactNumber ? (
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => Linking.openURL(`tel:${shelter.contactNumber}`)}
                  accessibilityLabel="Call mapped place contact"
                >
                  <WeatherIcon name="phone" size={16} color="#0F172A" />
                </TouchableOpacity>
              ) : null}
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
  mapUnavailable: {
    height: MAP_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: '#EEF2F7',
    gap: Spacing.sm,
  },
  mapUnavailableTitle: { fontSize: FontSize.md, fontWeight: '800', color: '#334155', textAlign: 'center' },
  mapUnavailableText: { fontSize: FontSize.sm, color: '#64748B', textAlign: 'center', lineHeight: 20 },
  unverifiedNotice: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  unverifiedNoticeText: { color: '#9A3412', fontSize: FontSize.xs, lineHeight: 18, fontWeight: '600' },
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
