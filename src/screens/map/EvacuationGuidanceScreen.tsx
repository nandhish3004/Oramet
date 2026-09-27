import React from 'react';
import { Alert, Linking, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRiskStore } from '../../state/useRiskStore';
import { useNearbyShelters } from '../../hooks/useNearbyShelters';
import { evacuationService, SafeShelter } from '../../services/evacuation/evacuationService';
import { WeatherIcon } from '../../components/WeatherIcon';
import { Colors, FontSize, Spacing, BorderRadius } from '../../theme/colors';

export const EvacuationGuidanceScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { userLocation } = useRiskStore();
  const lat = userLocation?.latitude;
  const lng = userLocation?.longitude;
  const hasPreciseLocation = Boolean(userLocation && !userLocation.isApproximate);
  const { shelters, isLoading, error } = useNearbyShelters(lat, lng, hasPreciseLocation);

  const shareLocation = async () => {
    if (!hasPreciseLocation || lat === undefined || lng === undefined) {
      Alert.alert('Precise location unavailable', 'Enable GPS before sharing exact coordinates.');
      return;
    }
    await Share.share({
      title: 'My location',
      message: `My current location: https://maps.google.com/?q=${lat.toFixed(5)},${lng.toFixed(5)}\nPlease follow local emergency instructions.`,
    });
  };

  const openPlace = (place: SafeShelter) => {
    Alert.alert(
      'Mapped place — verify before travelling',
      `${place.name} is listed in OpenStreetMap but is not verified by emergency authorities as open or safe. Follow local instructions and avoid floodwater.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open walking directions', onPress: () => evacuationService.navigateToSafeShelter(lat, lng, place) },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton} accessibilityLabel="Back">
          <WeatherIcon name="arrow-left" size={18} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>FIELD GUIDE</Text>
          <Text style={styles.title}>Evacuation support</Text>
        </View>
        <TouchableOpacity onPress={() => Linking.openURL('tel:112')} style={styles.callButton} accessibilityLabel="Call 112">
          <WeatherIcon name="phone" size={17} color="#FFFFFF" />
          <Text style={styles.callButtonText}>112</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.emergencyCard}>
          <View style={styles.emergencyIcon}><WeatherIcon name="alert" size={22} color="#B91C1C" /></View>
          <Text style={styles.emergencyTitle}>If you are in immediate danger</Text>
          <Text style={styles.emergencyBody}>Call 112 and follow instructions from local authorities. Do not enter moving water, flooded roads, or closed routes. This app does not have live road closures or an authority-verified evacuation route.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => Linking.openURL('tel:112')}>
            <WeatherIcon name="phone" size={16} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Call emergency services</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={shareLocation}>
            <WeatherIcon name="share" size={16} color="#0F766E" />
            <Text style={styles.secondaryButtonText}>Share my location</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('SafeHaven')}>
            <WeatherIcon name="map" size={16} color="#0F766E" />
            <Text style={styles.secondaryButtonText}>Mapped places</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Nearby mapped places</Text>
            <Text style={styles.sectionSubtitle}>OpenStreetMap · not safety verified</Text>
          </View>
          <Text style={styles.resultCount}>{shelters.length}</Text>
        </View>

        {!hasPreciseLocation ? (
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>A precise device or manually selected location is needed to search nearby places. Approximate IP locations are not used.</Text>
          </View>
        ) : null}
        {isLoading ? <Text style={styles.loadingText}>Searching nearby map data…</Text> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {!isLoading && !error && hasPreciseLocation && shelters.length === 0 ? (
          <View style={styles.infoCard}><Text style={styles.infoText}>No matching places were found in OpenStreetMap. This does not mean an official shelter is unavailable.</Text></View>
        ) : null}
        {shelters.map((place) => (
          <TouchableOpacity key={place.id} style={styles.placeCard} onPress={() => openPlace(place)} activeOpacity={0.82}>
            <View style={styles.placeIcon}><WeatherIcon name="map" size={17} color="#0F766E" /></View>
            <View style={styles.placeInfo}>
              <Text style={styles.placeName}>{place.name}</Text>
              <Text style={styles.placeMeta}>{place.distanceKm.toFixed(1)} km straight-line · {place.placeType.replace(/_/g, ' ')}</Text>
              <Text style={styles.placeDisclaimer}>Mapped place · authority status unknown</Text>
            </View>
            <WeatherIcon name="arrow-right" size={16} color="#64748B" />
          </TouchableOpacity>
        ))}

        <View style={styles.tipsCard}>
          <Text style={styles.sectionTitle}>Safer next steps</Text>
          <Text style={styles.tip}>• Move away from rivers, drains, steep slopes, and low-lying areas when instructed.</Text>
          <Text style={styles.tip}>• Never walk or drive through moving or unknown-depth water.</Text>
          <Text style={styles.tip}>• Take medicines, essential documents, water, a torch, and a charged phone.</Text>
          <Text style={styles.tip}>• Trust local authorities for shelter status and route closures.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F7F8' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 48, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#E5E7EB', gap: Spacing.md },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  eyebrow: { color: '#0F766E', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  title: { color: '#0F172A', fontSize: FontSize.lg, fontWeight: '900', marginTop: 2 },
  callButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#B91C1C', paddingHorizontal: 14, paddingVertical: 11, borderRadius: 24 },
  callButtonText: { color: '#FFFFFF', fontSize: FontSize.sm, fontWeight: '900' },
  content: { padding: Spacing.lg, paddingBottom: 100, gap: Spacing.md },
  emergencyCard: { backgroundColor: '#FFF7F7', borderColor: '#FECACA', borderWidth: 1, borderRadius: 22, padding: Spacing.lg },
  emergencyIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  emergencyTitle: { color: '#7F1D1D', fontSize: FontSize.lg, fontWeight: '900' },
  emergencyBody: { color: '#7F1D1D', fontSize: FontSize.sm, lineHeight: 21, marginTop: Spacing.sm },
  primaryButton: { marginTop: Spacing.lg, backgroundColor: '#B91C1C', minHeight: 48, borderRadius: 15, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: FontSize.sm, fontWeight: '800' },
  actionRow: { flexDirection: 'row', gap: Spacing.sm },
  secondaryButton: { flex: 1, minHeight: 50, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#D8E4E4', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7 },
  secondaryButtonText: { color: '#0F766E', fontSize: FontSize.xs, fontWeight: '800' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.md },
  sectionTitle: { color: '#0F172A', fontSize: FontSize.md, fontWeight: '900' },
  sectionSubtitle: { color: '#64748B', fontSize: FontSize.xs, marginTop: 3 },
  resultCount: { color: '#0F766E', fontWeight: '900', fontSize: FontSize.md },
  infoCard: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderWidth: 1, borderRadius: 14, padding: Spacing.md },
  infoText: { color: '#1E3A8A', fontSize: FontSize.sm, lineHeight: 20 },
  loadingText: { color: '#64748B', fontSize: FontSize.sm, paddingVertical: Spacing.md },
  errorText: { color: '#B91C1C', fontSize: FontSize.sm, lineHeight: 20 },
  placeCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderWidth: 1, borderColor: '#E2E8F0' },
  placeIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: '#CCFBF1', alignItems: 'center', justifyContent: 'center' },
  placeInfo: { flex: 1 },
  placeName: { color: '#0F172A', fontSize: FontSize.sm, fontWeight: '800' },
  placeMeta: { color: '#475569', fontSize: FontSize.xs, marginTop: 3 },
  placeDisclaimer: { color: '#B45309', fontSize: 10, fontWeight: '700', marginTop: 4 },
  tipsCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: Spacing.lg, gap: Spacing.sm, borderWidth: 1, borderColor: '#E2E8F0' },
  tip: { color: '#334155', fontSize: FontSize.sm, lineHeight: 21 },
});
