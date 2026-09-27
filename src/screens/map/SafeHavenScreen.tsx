import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Share,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { WeatherIcon } from '../../components/WeatherIcon';
import { evacuationService, SafeShelter } from '../../services/evacuation/evacuationService';
import { useNearbyShelters } from '../../hooks/useNearbyShelters';
import { Colors, FontSize, Spacing, BorderRadius } from '../../theme/colors';
import { useRiskStore } from '../../state/useRiskStore';

export const SafeHavenScreen: React.FC = () => {
  const navigation = useNavigation();
  const { userLocation, activeDistrict, activeState } = useRiskStore();

  const userCity = userLocation?.city || activeDistrict || 'Selected area';
  const userState = userLocation?.state || activeState || 'India';
  const lat = userLocation?.latitude;
  const lng = userLocation?.longitude;
  const hasPreciseLocation = Boolean(userLocation && !userLocation.isApproximate);
  const { shelters, isLoading: isLoadingShelters, error: shelterError } =
    useNearbyShelters(lat, lng, hasPreciseLocation);

  const handleSendSafeSMS = async () => {
    if (lat === undefined || lng === undefined || userLocation?.isApproximate) {
      Alert.alert('Precise location unavailable', 'Select a precise location before creating a check-in message. No approximate location will be shared.');
      return;
    }
    const msg = `I am checking in as safe near ${userCity}. Please confirm receipt. My location: https://maps.google.com/?q=${lat.toFixed(5)},${lng.toFixed(5)}`;
    try {
      await Share.share({ title: 'Safety check-in', message: msg });
    } catch {
      Alert.alert('Could not open sharing', 'Use your messaging app to contact family and share your location.');
    }
  };

  const handleShelterDirections = (shelter: SafeShelter) => {
    Alert.alert(
      'Map place is not safety-verified',
      `${shelter.name} is listed in OpenStreetMap. OraMet cannot confirm it is open, staffed, or safe. Directions are not checked for flooding or road closures.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open directions', onPress: () => evacuationService.navigateToSafeShelter(lat, lng, shelter) },
      ]
    );
  };

  const handleShareShelter = async (shelter: SafeShelter) => {
    try {
      await Share.share({
        title: `Mapped place: ${shelter.name}`,
        message: `OpenStreetMap place (not authority-verified as an emergency shelter): ${shelter.name}\nArea: ${userCity}, ${userState}\nMap: https://maps.google.com/?q=${shelter.latitude.toFixed(5)},${shelter.longitude.toFixed(5)}`,
      });
    } catch {}
  };

  const handleCallHelpline = (number: string, title: string) => {
    Alert.alert(
      `Call ${title}`,
      `Dial ${number}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Now', onPress: () => Linking.openURL(`tel:${number}`) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Back"
        >
          <WeatherIcon name="arrow-left" size={16} color="#8C5338" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.brandTitle}>Relief Centers & Shelters</Text>
          <Text style={styles.headerSub}>
            {userCity}, {userState}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.helpHeaderBtn}
          onPress={() => Linking.openURL('tel:112')}
          accessibilityLabel="Call 112"
        >
          <Text style={styles.helpHeaderBtnText}>112</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Safety Check-In Hero Card */}
        <View style={styles.checkinCard}>
          <View style={styles.checkinHeader}>
            <View style={styles.checkinIconCircle}>
              <WeatherIcon name="shield" size={24} color="#006A61" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.checkinTitle}>Family Safety Check-In</Text>
              <Text style={styles.checkinSub}>
                Share a check-in message yourself. OraMet cannot confirm that anyone received it.
              </Text>
            </View>
          </View>

          <View style={styles.previewBox}>
            <Text style={styles.previewLabel}>CHECK-IN MESSAGE PREVIEW</Text>
            <Text style={styles.previewContent}>
              {hasPreciseLocation && lat !== undefined && lng !== undefined
                ? `I am checking in near ${userCity}. Map: https://maps.google.com/?q=${lat.toFixed(5)},${lng.toFixed(5)}`
                : 'Precise location unavailable. No location will be included.'}
            </Text>
          </View>

          <TouchableOpacity style={styles.smsBtn} onPress={handleSendSafeSMS}>
            <WeatherIcon name="share" size={18} color="#FFFFFF" />
            <Text style={styles.smsBtnText}>Share check-in message</Text>
          </TouchableOpacity>
        </View>

        {/* Nearby Designated Shelters Section */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Nearby mapped places</Text>
            <Text style={styles.sectionSub}>OpenStreetMap results near {userCity} · not authority-verified</Text>
          </View>
          <View style={styles.verifiedCountBadge}>
            <Text style={styles.verifiedCountText}>{shelters.length} mapped</Text>
          </View>
        </View>

        {isLoadingShelters ? <Text style={styles.sectionSub}>Searching OpenStreetMap…</Text> : null}
        {shelterError ? <Text style={styles.sectionSub}>{shelterError}</Text> : null}
        {!isLoadingShelters && !shelterError && shelters.length === 0 ? (
          <View style={styles.shelterCard}>
            <Text style={styles.shelterName}>No mapped places found nearby</Text>
            <Text style={styles.sectionSub}>This does not mean an official shelter is unavailable. Call 112 in an emergency.</Text>
          </View>
        ) : null}
        {shelters.map((shelter, idx) => (
          <View key={shelter.id} style={styles.shelterCard}>
            <View style={styles.shelterCardHeader}>
              <View style={styles.shelterNumberBadge}>
                <Text style={styles.shelterNumberText}>#{idx + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.shelterName}>{shelter.name}</Text>
                <View style={styles.shelterMetaRow}>
                  <Text style={styles.shelterDistance}>{shelter.distanceKm.toFixed(1)} km straight-line</Text>
                  <Text style={styles.shelterDot}>•</Text>
                  <Text style={styles.shelterHighGround}>{shelter.placeType.replace(/_/g, ' ')}</Text>
                </View>
              </View>
            </View>

            {/* Amenities Badges */}
            <View style={styles.facilitiesRow}>
              {shelter.facilities.map((fac, fIdx) => (
                <View key={fIdx} style={styles.facilityChip}>
                  <Text style={styles.facilityChipText}>{fac}</Text>
                </View>
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.shelterActionsRow}>
              <TouchableOpacity
                style={styles.navigateBtn}
                onPress={() => handleShelterDirections(shelter)}
              >
                <WeatherIcon name="compass" size={16} color="#FFFFFF" />
                <Text style={styles.navigateBtnText}>Navigate in Google Maps</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareBtn}
                onPress={() => handleShareShelter(shelter)}
                accessibilityLabel="Share Shelter"
              >
                <WeatherIcon name="map" size={16} color="#8C5338" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Official 24x7 Emergency Helplines */}
        <View style={styles.helplinesCard}>
          <Text style={styles.helplinesTitle}>Official Emergency Helplines</Text>
          <Text style={styles.helplinesSub}>Government disaster management numbers for immediate assistance</Text>

          <View style={styles.helplineGrid}>
            <TouchableOpacity
              style={styles.helplineTile}
              onPress={() => handleCallHelpline('112', 'National Emergency')}
            >
              <Text style={styles.helplineNumber}>112</Text>
              <Text style={styles.helplineLabel}>National Emergency</Text>
              <Text style={styles.helplineAction}>Tap to Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.helplineTile}
              onPress={() => handleCallHelpline('1070', 'State Disaster Helpline')}
            >
              <Text style={styles.helplineNumber}>1070</Text>
              <Text style={styles.helplineLabel}>State Disaster Cell</Text>
              <Text style={styles.helplineAction}>Tap to Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.helplineTile}
              onPress={() => handleCallHelpline('1077', 'District Disaster Control')}
            >
              <Text style={styles.helplineNumber}>1077</Text>
              <Text style={styles.helplineLabel}>District Helpline</Text>
              <Text style={styles.helplineAction}>Tap to Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.helplineTile}
              onPress={() => handleCallHelpline('108', 'Emergency Ambulance')}
            >
              <Text style={styles.helplineNumber}>108</Text>
              <Text style={styles.helplineLabel}>Ambulance Service</Text>
              <Text style={styles.helplineAction}>Tap to Call</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Essential Evacuation Checklist */}
        <View style={styles.checklistCard}>
          <View style={styles.checklistHeader}>
            <WeatherIcon name="check" size={20} color="#006A61" />
            <Text style={styles.checklistTitle}>Evacuation Bag Essentials</Text>
          </View>
          <View style={styles.checkItemRow}>
            <Text style={styles.checkBullet}>•</Text>
            <Text style={styles.checkText}>Important documents (Aadhaar, IDs, deeds) in a sealed waterproof pouch</Text>
          </View>
          <View style={styles.checkItemRow}>
            <Text style={styles.checkBullet}>•</Text>
            <Text style={styles.checkText}>Drinking water bottles and 2-day non-perishable dry food</Text>
          </View>
          <View style={styles.checkItemRow}>
            <Text style={styles.checkBullet}>•</Text>
            <Text style={styles.checkText}>Prescription medications, first aid essentials, and baby food if needed</Text>
          </View>
          <View style={styles.checkItemRow}>
            <Text style={styles.checkBullet}>•</Text>
            <Text style={styles.checkText}>Fully charged mobile phone, power bank, and LED torch</Text>
          </View>
          <View style={styles.checkItemRow}>
            <Text style={styles.checkBullet}>•</Text>
            <Text style={styles.checkText}>Switch off main electricity breaker and cooking gas before evacuating</Text>
          </View>
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
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  helpHeaderBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  helpHeaderBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DC2626',
  },

  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 60,
  },

  checkinCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  checkinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  checkinIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkinTitle: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: '#0F172A',
  },
  checkinSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  previewBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  previewContent: {
    fontSize: 12,
    color: '#1E293B',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  smsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    gap: 8,
  },
  smsBtnSent: {
    backgroundColor: '#0D9488',
  },
  smsBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  verifiedCountBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  verifiedCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369A1',
  },

  shelterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.md,
    gap: Spacing.md,
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  shelterCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  shelterNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shelterNumberText: {
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
  shelterHighGround: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '600',
  },

  facilitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  facilityChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  facilityChipText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '500',
  },

  shelterActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  navigateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    gap: 8,
  },
  navigateBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  shareBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  helplinesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  helplinesTitle: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: '#0F172A',
  },
  helplinesSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  helplineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  helplineTile: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  helplineNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#DC2626',
  },
  helplineLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 2,
    textAlign: 'center',
  },
  helplineAction: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284C7',
    marginTop: 4,
  },

  checklistCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  checklistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  checklistTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#166534',
  },
  checkItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  checkBullet: {
    fontSize: 14,
    color: '#16A34A',
    fontWeight: '800',
    lineHeight: 18,
  },
  checkText: {
    flex: 1,
    fontSize: 12,
    color: '#1E293B',
    lineHeight: 18,
  },
});
