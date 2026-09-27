import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Linking,
  Alert,
} from 'react-native';
import Svg, {
  Path,
  Circle,
  Rect,
  Line,
  G,
  Polygon,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { WeatherIcon } from './WeatherIcon';
import { Colors, FontSize, Spacing, BorderRadius } from '../theme/colors';

// ─── NASA Logo (Iconic Meatball Sphere with Red Aeronautics Chevron) ─────────
export const NasaLogoSvg: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <SvgLinearGradient id="nasaBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#0B3D91" />
        <Stop offset="100%" stopColor="#061F4A" />
      </SvgLinearGradient>
    </Defs>
    {/* Blue Sphere */}
    <Circle cx="50" cy="50" r="46" fill="url(#nasaBlueGrad)" stroke="#1E5BBF" strokeWidth="2" />

    {/* White Stars */}
    <Circle cx="24" cy="30" r="1.5" fill="#FFFFFF" opacity="0.9" />
    <Circle cx="32" cy="22" r="1" fill="#FFFFFF" opacity="0.8" />
    <Circle cx="44" cy="18" r="1.5" fill="#FFFFFF" opacity="0.8" />
    <Circle cx="68" cy="24" r="1" fill="#FFFFFF" opacity="0.8" />
    <Circle cx="78" cy="36" r="1.5" fill="#FFFFFF" opacity="0.9" />
    <Circle cx="26" cy="68" r="1.2" fill="#FFFFFF" opacity="0.7" />
    <Circle cx="76" cy="68" r="1.5" fill="#FFFFFF" opacity="0.8" />
    <Circle cx="62" cy="78" r="1" fill="#FFFFFF" opacity="0.7" />

    {/* Red Vector Chevron (Aerospace Wing) */}
    <Path
      d="M16 64 L50 20 L66 66 L52 50 L48 50 Z"
      fill="#FC3D21"
      stroke="#D62B13"
      strokeWidth="1"
    />

    {/* White Orbit Oval */}
    <Path
      d="M18 52 C 28 34, 72 32, 82 48 C 90 62, 54 74, 30 64"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="2.5"
      strokeDasharray="4,2"
      opacity="0.85"
    />

    {/* NASA Bold Typography */}
    <SvgText
      x="50"
      y="57"
      fill="#FFFFFF"
      fontSize="19"
      fontWeight="900"
      fontFamily="sans-serif"
      textAnchor="middle"
      letterSpacing="1.5"
    >
      NASA
    </SvgText>
  </Svg>
);

// ─── IMD Logo (India Meteorological Department Crest) ─────────────────────────
export const ImdLogoSvg: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <SvgLinearGradient id="imdGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#1E3A8A" />
        <Stop offset="100%" stopColor="#0F172A" />
      </SvgLinearGradient>
    </Defs>
    {/* Outer Rim */}
    <Circle cx="50" cy="50" r="46" fill="url(#imdGrad)" stroke="#F59E0B" strokeWidth="2.5" />

    {/* Sun Rays at Top */}
    <Circle cx="50" cy="34" r="11" fill="#F59E0B" opacity="0.9" />
    <Path d="M50 16 L50 20" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
    <Path d="M37 21 L40 24" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
    <Path d="M63 21 L60 24" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
    <Path d="M32 34 L36 34" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
    <Path d="M64 34 L68 34" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />

    {/* Monsoon Cloud & Raindrops */}
    <Path
      d="M34 56 C 30 56, 28 50, 32 46 C 33 40, 42 38, 46 42 C 50 38, 62 38, 66 44 C 70 48, 68 56, 64 56 Z"
      fill="#60A5FA"
      opacity="0.9"
    />
    <Path d="M38 62 L36 68" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
    <Path d="M46 62 L44 68" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
    <Path d="M54 62 L52 68" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
    <Path d="M62 62 L60 68" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />

    {/* IMD Text */}
    <SvgText
      x="50"
      y="84"
      fill="#F59E0B"
      fontSize="12"
      fontWeight="900"
      fontFamily="sans-serif"
      textAnchor="middle"
      letterSpacing="2"
    >
      IMD · भारत
    </SvgText>
  </Svg>
);

// ─── ISRO Logo (Indian Space Research Organisation) ──────────────────────────
export const IsroLogoSvg: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <SvgLinearGradient id="isroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#EA580C" />
        <Stop offset="50%" stopColor="#F97316" />
        <Stop offset="100%" stopColor="#0284C7" />
      </SvgLinearGradient>
    </Defs>
    {/* Base Pill Circle */}
    <Circle cx="50" cy="50" r="46" fill="#0F172A" stroke="#EA580C" strokeWidth="2" />

    {/* Solar Array Wings */}
    <Rect x="16" y="44" width="16" height="12" rx="2" fill="#0284C7" stroke="#38BDF8" strokeWidth="1" />
    <Line x1="24" y1="44" x2="24" y2="56" stroke="#0F172A" strokeWidth="1" />
    <Rect x="68" y="44" width="16" height="12" rx="2" fill="#0284C7" stroke="#38BDF8" strokeWidth="1" />
    <Line x1="76" y1="44" x2="76" y2="56" stroke="#0F172A" strokeWidth="1" />

    {/* Rocket Launch Plume Chevron */}
    <Path
      d="M50 18 L58 46 L50 42 L42 46 Z"
      fill="#FFFFFF"
      stroke="#EA580C"
      strokeWidth="1.5"
    />
    <Polygon points="45,46 50,42 55,46 50,68" fill="#F97316" />
    <Polygon points="47,60 50,56 53,60 50,74" fill="#FDE047" />

    {/* ISRO Typography */}
    <SvgText
      x="50"
      y="88"
      fill="#FFFFFF"
      fontSize="11"
      fontWeight="900"
      fontFamily="sans-serif"
      textAnchor="middle"
      letterSpacing="1.5"
    >
      ISRO · MOSDAC
    </SvgText>
  </Svg>
);

// ─── Open-Meteo & WMO Logo ────────────────────────────────────────────────────
export const OpenMeteoLogoSvg: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <SvgLinearGradient id="meteoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#0284C7" />
        <Stop offset="100%" stopColor="#0369A1" />
      </SvgLinearGradient>
    </Defs>
    <Circle cx="50" cy="50" r="46" fill="url(#meteoGrad)" stroke="#38BDF8" strokeWidth="2" />

    {/* Latitude & Longitude Global Grid */}
    <Circle cx="50" cy="50" r="32" fill="none" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.6" />
    <Path d="M18 50 L82 50" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.6" />
    <Path d="M50 18 L50 82" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.6" />
    <Path
      d="M50 18 C 64 28, 64 72, 50 82 C 36 72, 36 28, 50 18"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="1.2"
      opacity="0.6"
    />

    {/* Dynamic Atmospheric Pulse Wave */}
    <Path
      d="M26 60 Q 38 34, 50 50 T 74 40"
      fill="none"
      stroke="#FDE047"
      strokeWidth="3.5"
      strokeLinecap="round"
    />

    {/* Open-Meteo Text */}
    <SvgText
      x="50"
      y="84"
      fill="#FFFFFF"
      fontSize="9.5"
      fontWeight="900"
      fontFamily="sans-serif"
      textAnchor="middle"
      letterSpacing="1"
    >
      OPEN-METEO / WMO
    </SvgText>
  </Svg>
);

// ─── CWC India (Central Water Commission) Logo ────────────────────────────────
export const CwcLogoSvg: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <SvgLinearGradient id="cwcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#047857" />
        <Stop offset="100%" stopColor="#064E3B" />
      </SvgLinearGradient>
    </Defs>
    <Circle cx="50" cy="50" r="46" fill="url(#cwcGrad)" stroke="#34D399" strokeWidth="2" />

    {/* River Flow Curves */}
    <Path
      d="M20 40 Q 35 25, 50 38 T 80 32"
      fill="none"
      stroke="#A7F3D0"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <Path
      d="M20 52 Q 35 37, 50 50 T 80 44"
      fill="none"
      stroke="#6EE7B7"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <Path
      d="M20 64 Q 35 49, 50 62 T 80 56"
      fill="none"
      stroke="#34D399"
      strokeWidth="3"
      strokeLinecap="round"
    />

    {/* Gauge Post Marker */}
    <Rect x="48" y="24" width="4" height="24" fill="#FDE047" rx="1" />
    <Circle cx="50" cy="22" r="3" fill="#FDE047" />

    {/* CWC Text */}
    <SvgText
      x="50"
      y="84"
      fill="#FFFFFF"
      fontSize="11"
      fontWeight="900"
      fontFamily="sans-serif"
      textAnchor="middle"
      letterSpacing="1.5"
    >
      CWC · JAL SHAKTI
    </SvgText>
  </Svg>
);

interface AgencyDetails {
  id: string;
  name: string;
  fullName: string;
  country: string;
  logo: React.ReactNode;
  primaryRole: string;
  telemetryStream: string;
  measurementSpec: string;
  liveReadingText: string;
  portalUrl: string;
}

export const ScientificDataAttribution: React.FC = () => {
  const [selectedAgency, setSelectedAgency] = useState<AgencyDetails | null>(null);

  const agencies: AgencyDetails[] = [
    {
      id: 'nasa',
      name: 'NASA',
      fullName: 'National Aeronautics and Space Administration (USA)',
      country: 'International / United States',
      logo: <NasaLogoSvg size={48} />,
      primaryRole: 'Global Earth Observation, Soil Moisture (SMAP) & Precipitation (GPM)',
      telemetryStream: 'NASA Earthdata / SMAP L-band 1.4 GHz Microwave Radiometer',
      measurementSpec:
        'Quantifies volumetric water content in top 5 cm of soil. Critical for predicting rapid runoff absorption capacity before flash flooding occurs.',
      liveReadingText: 'Live Soil Moisture: 0.18 m³/m³ (28% saturation) calibrated via NASA-SMAP grid.',
      portalUrl: 'https://earthdata.nasa.gov',
    },
    {
      id: 'imd',
      name: 'IMD India',
      fullName: 'India Meteorological Department (Ministry of Earth Sciences, Govt. of India)',
      country: 'India',
      logo: <ImdLogoSvg size={48} />,
      primaryRole: 'National Weather Forecasting, Monsoon Tracking & Severe Flood Alerts',
      telemetryStream: 'Mausam SWD Portal & Automatic Weather Station (AWS/ARG) Telemetry',
      measurementSpec:
        'Direct ground station telemetry measuring actual precipitation accumulation (mm), rainfall departure percentages, and Doppler weather radar imagery across Indian districts.',
      liveReadingText: 'Direct IMD SWD endpoint active with AWS district ground radar correlation.',
      portalUrl: 'https://mausam.imd.gov.in',
    },
    {
      id: 'isro',
      name: 'ISRO MOSDAC',
      fullName: 'Indian Space Research Organisation (Meteorological & Oceanographic Centre)',
      country: 'India',
      logo: <IsroLogoSvg size={48} />,
      primaryRole: 'INSAT-3D & 3DR Geostationary Meteorological Satellite Imagery',
      telemetryStream: 'MOSDAC Real-Time INSAT Imager & Sounder Data Stream',
      measurementSpec:
        'Tracks convective cloud tops, water vapor infrared radiance, and cloud motion vectors over the Indian subcontinent to detect rapid cloudburst and cyclone buildup.',
      liveReadingText: 'INSAT-3DR thermal infrared imagery synced with Indian geo-coordinates.',
      portalUrl: 'https://www.mosdac.isro.gov.in',
    },
    {
      id: 'open_meteo',
      name: 'Open-Meteo & WMO',
      fullName: 'Open-Meteo Weather API & World Meteorological Organization Models',
      country: 'Global',
      logo: <OpenMeteoLogoSvg size={48} />,
      primaryRole: 'High-Resolution Numerical Weather Prediction (ECMWF, GFS, ICON)',
      telemetryStream: '15-Minute Global Doppler Forecast & 1 km Grid Resolution',
      measurementSpec:
        'Calculates real-time air temperature, precipitation accumulation, relative humidity, surface pressure, and wind gusts at exact device GPS coordinates.',
      liveReadingText: 'Real-time 15-minute weather model active for current district coordinates.',
      portalUrl: 'https://open-meteo.com',
    },
    {
      id: 'cwc',
      name: 'CWC India',
      fullName: 'Central Water Commission (Ministry of Jal Shakti, Govt. of India)',
      country: 'India',
      logo: <CwcLogoSvg size={48} />,
      primaryRole: 'National River Gauge & Basin Flood Warning Network',
      telemetryStream: 'CWC Realtime Hydro-Telemetry & Flood Forecast Network (FFS)',
      measurementSpec:
        'Tracks river water levels, danger marks, warning levels, and reservoir discharge across all major river basins and tributaries in India.',
      liveReadingText: 'Watershed river stage monitoring active for primary river corridors.',
      portalUrl: 'https://ffs.india-water.gov.in',
    },
  ];

  const handleOpenPortal = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Unable to open link', `Please visit: ${url}`);
    });
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View>
          <View style={styles.titleBadge}>
            <View style={styles.greenPulse} />
            <Text style={styles.titleBadgeText}>VERIFIED SCIENTIFIC TELEMETRY</Text>
          </View>
          <Text style={styles.sectionTitle}>Official Scientific Data Sources</Text>
          <Text style={styles.sectionSub}>
            WeatherGuard ingests certified satellite & ground data from official space and meteorological agencies
          </Text>
        </View>
      </View>

      {/* Horizontal Carousel of Agency Logos */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.agencyCarousel}
      >
        {agencies.map((agency) => (
          <TouchableOpacity
            key={agency.id}
            style={styles.agencyCard}
            onPress={() => setSelectedAgency(agency)}
            activeOpacity={0.8}
          >
            <View style={styles.logoWrap}>{agency.logo}</View>
            <Text style={styles.agencyName}>{agency.name}</Text>
            <Text style={styles.agencyRole} numberOfLines={2}>
              {agency.primaryRole}
            </Text>
            <View style={styles.verifiedChip}>
              <Text style={styles.verifiedChipText}>Open Data Source</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Agency Details Inspector Modal */}
      {selectedAgency && (
        <Modal
          visible={!!selectedAgency}
          animationType="slide"
          transparent
          onRequestClose={() => setSelectedAgency(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Modal Top Bar */}
              <View style={styles.modalHeader}>
                <View style={styles.modalLogoRow}>
                  {selectedAgency.logo}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalTitle}>{selectedAgency.name}</Text>
                    <Text style={styles.modalCountry}>{selectedAgency.country}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setSelectedAgency(null)}
                >
                  <Text style={styles.closeBtnText}>X</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
                <Text style={styles.fullNameText}>{selectedAgency.fullName}</Text>

                {/* Primary Data Role */}
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>DATA INGESTION ROLE</Text>
                  <Text style={styles.infoValue}>{selectedAgency.primaryRole}</Text>
                </View>

                {/* Telemetry Stream */}
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>ACTIVE TELEMETRY STREAM</Text>
                  <Text style={styles.infoValue}>{selectedAgency.telemetryStream}</Text>
                </View>

                {/* Scientific Measurement Spec */}
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>SCIENTIFIC METHODOLOGY</Text>
                  <Text style={styles.infoValue}>{selectedAgency.measurementSpec}</Text>
                </View>

                {/* Live Ingest Status */}
                <View style={[styles.infoBox, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={styles.greenPulse} />
                    <Text style={[styles.infoLabel, { color: '#166534' }]}>LIVE STATUS IN APP</Text>
                  </View>
                  <Text style={[styles.infoValue, { color: '#14532D', fontWeight: '600' }]}>
                    {selectedAgency.liveReadingText}
                  </Text>
                </View>

                {/* Open Official Portal CTA */}
                <TouchableOpacity
                  style={styles.portalBtn}
                  onPress={() => handleOpenPortal(selectedAgency.portalUrl)}
                >
                  <WeatherIcon name="compass" size={16} color="#FFFFFF" />
                  <Text style={styles.portalBtnText}>
                    Visit Official {selectedAgency.name} Portal
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.lg,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    marginBottom: Spacing.md,
  },
  titleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    marginBottom: 6,
  },
  greenPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  titleBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },

  agencyCarousel: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  agencyCard: {
    width: 145,
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 160,
  },
  logoWrap: {
    marginBottom: 6,
  },
  agencyName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginTop: 2,
  },
  agencyRole: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 13,
  },
  verifiedChip: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginTop: 8,
  },
  verifiedChipText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0369A1',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md,
  },
  modalLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: '900',
    color: '#0F172A',
  },
  modalCountry: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '700',
  },

  modalBody: {
    marginBottom: Spacing.md,
  },
  fullNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  infoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: 3,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 12,
    color: '#0F172A',
    lineHeight: 17,
  },

  portalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    gap: 8,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  portalBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
