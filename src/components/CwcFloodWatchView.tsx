import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import { CwcOfficialLogo } from './OfficialLogos';
import { Colors, FontSize, Spacing, BorderRadius } from '../theme/colors';
import { useLanguageStore } from '../state/useLanguageStore';
import { CwcRiverTelemetry } from '../services/telemetry/cwcRiverService';

// CWC River Gauge Stations across Himalayan and Indian basins
export interface CwcStationData {
  id: string;
  stationName: string;
  riverName: string;
  basinName: string;
  state: string;
  currentLevelM: number;
  warningLevelM: number;
  dangerLevelM: number;
  hflM: number;
  hflYear: number;
  trend: 'RISING' | 'STEADY' | 'FALLING';
  status: 'NORMAL' | 'WARNING' | 'DANGER' | 'EXTREME';
  forecast24h: string;
}

export const CWC_STATIONS_CATALOG: CwcStationData[] = [
  {
    id: 'cwc_station_01',
    stationName: 'Joshimath Hydro Post',
    riverName: 'Alaknanda River',
    basinName: 'Upper Ganga Basin',
    state: 'Uttarakhand',
    currentLevelM: 1150.2,
    warningLevelM: 1152.0,
    dangerLevelM: 1154.5,
    hflM: 1156.8,
    hflYear: 2021,
    trend: 'STEADY',
    status: 'NORMAL',
    forecast24h: 'Water level steady with no immediate threat to riverbank settlements.',
  },
  {
    id: 'cwc_station_02',
    stationName: 'Devprayag Confluence Gauge',
    riverName: 'Bhagirathi & Alaknanda',
    basinName: 'Ganga Basin',
    state: 'Uttarakhand',
    currentLevelM: 456.8,
    warningLevelM: 461.0,
    dangerLevelM: 463.0,
    hflM: 465.4,
    hflYear: 2013,
    trend: 'FALLING',
    status: 'NORMAL',
    forecast24h: 'Water discharge nominal at 820 cumecs. Safe transit corridor.',
  },
  {
    id: 'cwc_station_03',
    stationName: 'Uttarkashi Bridge Post',
    riverName: 'Bhagirathi River',
    basinName: 'Bhagirathi Catchment',
    state: 'Uttarakhand',
    currentLevelM: 1118.4,
    warningLevelM: 1120.0,
    dangerLevelM: 1123.0,
    hflM: 1125.4,
    hflYear: 2012,
    trend: 'STEADY',
    status: 'NORMAL',
    forecast24h: 'Upstream Tehri inflow regulated; water levels safely within buffer.',
  },
  {
    id: 'cwc_station_04',
    stationName: 'Old Manali Bridge',
    riverName: 'Beas River',
    basinName: 'Indus Basin',
    state: 'Himachal Pradesh',
    currentLevelM: 1978.2,
    warningLevelM: 1980.0,
    dangerLevelM: 1982.5,
    hflM: 1985.0,
    hflYear: 2023,
    trend: 'FALLING',
    status: 'NORMAL',
    forecast24h: 'Normal seasonal flow across Beas valley; low sediment runoff.',
  },
  {
    id: 'cwc_station_05',
    stationName: 'Singtam Gauge Post',
    riverName: 'Teesta River',
    basinName: 'Brahmaputra Basin',
    state: 'Sikkim',
    currentLevelM: 345.5,
    warningLevelM: 348.0,
    dangerLevelM: 351.0,
    hflM: 354.2,
    hflYear: 2023,
    trend: 'STEADY',
    status: 'NORMAL',
    forecast24h: 'NHPC dam spillway open; Teesta stream volume operating within safe margin.',
  },
];

interface CwcFloodWatchViewProps {
  cwcLive?: CwcRiverTelemetry;
  activeDistrict?: string;
  onOpenVoiceAdvisory?: () => void;
}

export const CwcFloodWatchView: React.FC<CwcFloodWatchViewProps> = ({
  cwcLive,
  activeDistrict = 'Current Area',
  onOpenVoiceAdvisory,
}) => {
  const { currentLanguage, strings } = useLanguageStore();
  const [selectedStation, setSelectedStation] = useState<CwcStationData>(CWC_STATIONS_CATALOG[0]);
  const isHindi = ['hi', 'gar', 'kum', 'pah', 'dog', 'nep'].includes(currentLanguage);

  // Dynamic live level override from parent telemetry
  const displayLevel = cwcLive?.currentWaterLevelMeters ?? selectedStation.currentLevelM;
  const warningLevel = cwcLive?.warningLevelMeters ?? selectedStation.warningLevelM;
  const dangerLevel = cwcLive?.dangerLevelMeters ?? selectedStation.dangerLevelM;
  const hfl = cwcLive?.highestFloodLevelMeters ?? selectedStation.hflM;

  const isDanger = displayLevel >= dangerLevel;
  const isWarning = displayLevel >= warningLevel && !isDanger;
  const isNormal = !isDanger && !isWarning;

  // Percentage on water level gauge (0% = baseline, 100% = HFL)
  const baseline = warningLevel - 4.0;
  const gaugePct = Math.max(5, Math.min(100, Math.round(((displayLevel - baseline) / (hfl - baseline)) * 100)));

  return (
    <View style={styles.card}>
      {/* Official CWC FloodWatch India Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <CwcOfficialLogo size={36} />
          <View style={{ flex: 1 }}>
            <View style={styles.cwcTagRow}>
              <Text style={styles.cwcTag}>FLOODWATCH INDIA · CWC JAL SHAKTI</Text>
              <View style={[styles.liveDot, { backgroundColor: isDanger ? '#DC2626' : '#16A34A' }]} />
            </View>
            <Text style={styles.title}>
              {isHindi ? 'केंद्रीय जल आयोग नदी गेज प्रणाली' : 'CWC River Gauge Network'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.officialPortalBtn}
          onPress={() => Linking.openURL('https://ffs.india-water.gov.in')}
          activeOpacity={0.8}
        >
          <Text style={styles.officialPortalBtnText}>ffs.india-water.gov.in ›</Text>
        </TouchableOpacity>
      </View>

      {/* Station Selector Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.stationScroll}
      >
        {CWC_STATIONS_CATALOG.map((st) => {
          const isSelected = selectedStation.id === st.id;
          return (
            <TouchableOpacity
              key={st.id}
              style={[styles.stationChip, isSelected && styles.stationChipSelected]}
              onPress={() => setSelectedStation(st)}
              activeOpacity={0.8}
            >
              <Text style={[styles.stationChipText, isSelected && styles.stationChipTextSelected]}>
                {st.stationName.split(' ')[0]} ({st.riverName.split(' ')[0]})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Main River Station Stage Card */}
      <View style={[styles.stageBox, isDanger && styles.stageBoxDanger, isWarning && styles.stageBoxWarning]}>
        <View style={styles.stationTitleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.stationNameText}>{selectedStation.stationName}</Text>
            <Text style={styles.basinSubText}>
              {selectedStation.riverName} · {selectedStation.basinName} ({selectedStation.state})
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              isDanger
                ? styles.statusBadgeDanger
                : isWarning
                ? styles.statusBadgeWarning
                : styles.statusBadgeNormal,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                isDanger
                  ? { color: '#DC2626' }
                  : isWarning
                  ? { color: '#B45309' }
                  : { color: '#166534' },
              ]}
            >
              {isDanger
                ? isHindi ? '🔴 अत्यधिक बाढ़ (खतरा)' : '🔴 EXTREME FLOOD'
                : isWarning
                ? isHindi ? '🟡 चेतावनी जलस्तर' : '🟡 ABOVE WARNING'
                : isHindi ? '🟢 सामान्य स्थिति (सुरक्षित)' : '🟢 NORMAL (SAFE)'}
            </Text>
          </View>
        </View>

        {/* Big Water Level Gauge Number */}
        <View style={styles.levelRow}>
          <View style={styles.levelNumCol}>
            <Text style={styles.levelLabel}>
              {isHindi ? 'वर्तमान नदी जलस्तर' : 'CURRENT WATER LEVEL'}
            </Text>
            <View style={styles.levelValueRow}>
              <Text style={[styles.levelValue, isDanger && { color: '#DC2626' }]}>
                {displayLevel.toFixed(2)}
              </Text>
              <Text style={styles.levelUnit}>meters (m)</Text>
            </View>
          </View>

          <View style={styles.trendCol}>
            <Text style={styles.trendLabel}>{isHindi ? 'प्रवृत्ति (Trend)' : 'TREND'}</Text>
            <View style={styles.trendPill}>
              <Text style={styles.trendIcon}>
                {selectedStation.trend === 'RISING' ? '📈 Rising' : selectedStation.trend === 'FALLING' ? '📉 Falling' : '➡️ Steady'}
              </Text>
            </View>
          </View>
        </View>

        {/* Visual CWC Hydraulic Gauge Bar */}
        <View style={styles.gaugeContainer}>
          <View style={styles.gaugeLabelsRow}>
            <Text style={styles.gaugeThresholdText}>Safe Base</Text>
            <Text style={[styles.gaugeThresholdText, { color: '#B45309' }]}>
              Warning: {warningLevel}m
            </Text>
            <Text style={[styles.gaugeThresholdText, { color: '#DC2626' }]}>
              Danger: {dangerLevel}m
            </Text>
            <Text style={styles.gaugeThresholdText}>HFL: {hfl}m</Text>
          </View>

          {/* Bar track */}
          <View style={styles.gaugeTrack}>
            <View
              style={[
                styles.gaugeFill,
                { width: `${gaugePct}%` },
                isDanger
                  ? { backgroundColor: '#DC2626' }
                  : isWarning
                  ? { backgroundColor: '#F59E0B' }
                  : { backgroundColor: '#0284C7' },
              ]}
            />
            {/* Warning Mark Line */}
            <View style={[styles.thresholdMarker, { left: '60%', backgroundColor: '#F59E0B' }]} />
            {/* Danger Mark Line */}
            <View style={[styles.thresholdMarker, { left: '80%', backgroundColor: '#DC2626' }]} />
          </View>
        </View>

        {/* CWC Official 24-Hour Forecast Advisory */}
        <View style={styles.advisoryRow}>
          <Text style={styles.advisoryTitle}>
            {isHindi ? '24-घंटे का सी.डब्ल्यू.सी पूर्वानुमान:' : '24-Hour Hydrological Forecast:'}
          </Text>
          <Text style={styles.advisoryText}>
            {selectedStation.forecast24h}
          </Text>
        </View>
      </View>

      {/* Summary Footer Bar */}
      <View style={styles.footerSummary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNum}>338</Text>
          <Text style={styles.summaryLabel}>National Stations</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: '#166534' }]}>333</Text>
          <Text style={styles.summaryLabel}>Normal Flow</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: '#DC2626' }]}>5</Text>
          <Text style={styles.summaryLabel}>Severe Alerts</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E8E4DF',
    marginBottom: 16,
    shadowColor: '#1F1A17',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  cwcTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cwcTag: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  title: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1F1A17',
    marginTop: 1,
  },
  officialPortalBtn: {
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  officialPortalBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284C7',
  },
  stationScroll: {
    gap: 8,
    paddingBottom: 10,
  },
  stationChip: {
    backgroundColor: '#F8F6F2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8E4DF',
  },
  stationChipSelected: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  stationChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#827C77',
  },
  stationChipTextSelected: {
    color: '#FFFFFF',
  },
  stageBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stageBoxDanger: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  stageBoxWarning: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  stationTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  stationNameText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F1A17',
  },
  basinSubText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeNormal: {
    backgroundColor: '#DCFCE7',
  },
  statusBadgeWarning: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeDanger: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  levelNumCol: {
    gap: 2,
  },
  levelLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  levelValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  levelValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0284C7',
  },
  levelUnit: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  trendCol: {
    alignItems: 'flex-end',
    gap: 3,
  },
  trendLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.4,
  },
  trendPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  trendIcon: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1F1A17',
  },
  gaugeContainer: {
    marginTop: 4,
    marginBottom: 10,
  },
  gaugeLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  gaugeThresholdText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748B',
  },
  gaugeTrack: {
    height: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 5,
    overflow: 'hidden',
    position: 'relative',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 5,
  },
  thresholdMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
  },
  advisoryRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 3,
  },
  advisoryTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1F1A17',
  },
  advisoryText: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 15,
  },
  footerSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNum: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1F1A17',
  },
  summaryLabel: {
    fontSize: 9.5,
    color: '#827C77',
    marginTop: 1,
  },
  summaryDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E8E4DF',
  },
});
