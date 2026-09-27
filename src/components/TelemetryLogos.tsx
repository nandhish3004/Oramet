import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import {
  NasaOfficialLogo,
  IsroOfficialLogo,
  ImdOfficialLogo,
  CwcOfficialLogo,
  GsiOfficialLogo,
  WmoOfficialLogo,
  NdrfOfficialLogo,
} from './OfficialLogos';

interface TelemetryLogosProps {
  compact?: boolean;
  style?: any;
  onPressAgency?: (agency: 'IMD' | 'ISRO' | 'NASA' | 'GSI' | 'NHAI' | 'CWC' | 'WMO') => void;
}

export const TelemetryLogos: React.FC<TelemetryLogosProps> = ({
  compact = false,
  style,
  onPressAgency,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={styles.livePulseDot} />
          <Text style={styles.sectionLabel}>OFFICIAL LIVE SATELLITE & SCIENTIFIC FEEDS</Text>
        </View>
        <Text style={styles.tapPrompt}>Tap badge to inspect telemetry ›</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {/* NASA Official Meatball Logo Badge */}
        <TouchableOpacity
          style={[styles.logoBadge, styles.nasaBadge]}
          activeOpacity={0.75}
          onPress={() => onPressAgency?.('NASA')}
        >
          <View style={styles.logoIconWrapper}>
            <NasaOfficialLogo size={28} />
          </View>
          <View style={styles.badgeTextCol}>
            <View style={styles.badgeTitleRow}>
              <Text style={[styles.badgeTitle, { color: '#0B3D91' }]}>NASA</Text>
              <View style={[styles.liveTag, { backgroundColor: '#DBEAFE' }]}>
                <Text style={[styles.liveTagText, { color: '#1E40AF' }]}>LIVE</Text>
              </View>
            </View>
            <Text style={styles.badgeSub} numberOfLines={1}>SMAP Soil Wetness</Text>
          </View>
        </TouchableOpacity>

        {/* ISRO Official Logo Badge */}
        <TouchableOpacity
          style={[styles.logoBadge, styles.isroBadge]}
          activeOpacity={0.75}
          onPress={() => onPressAgency?.('ISRO')}
        >
          <View style={styles.logoIconWrapper}>
            <IsroOfficialLogo size={28} />
          </View>
          <View style={styles.badgeTextCol}>
            <View style={styles.badgeTitleRow}>
              <Text style={[styles.badgeTitle, { color: '#C05600' }]}>ISRO</Text>
              <View style={[styles.liveTag, { backgroundColor: '#FFEDD5' }]}>
                <Text style={[styles.liveTagText, { color: '#C05600' }]}>LIVE</Text>
              </View>
            </View>
            <Text style={styles.badgeSub} numberOfLines={1}>MOSDAC / Bhuvan</Text>
          </View>
        </TouchableOpacity>

        {/* IMD Official Emblem Badge */}
        <TouchableOpacity
          style={[styles.logoBadge, styles.imdBadge]}
          activeOpacity={0.75}
          onPress={() => onPressAgency?.('IMD')}
        >
          <View style={styles.logoIconWrapper}>
            <ImdOfficialLogo size={28} />
          </View>
          <View style={styles.badgeTextCol}>
            <View style={styles.badgeTitleRow}>
              <Text style={[styles.badgeTitle, { color: '#002855' }]}>IMD</Text>
              <View style={[styles.liveTag, { backgroundColor: '#E0F2FE' }]}>
                <Text style={[styles.liveTagText, { color: '#0369A1' }]}>LIVE</Text>
              </View>
            </View>
            <Text style={styles.badgeSub} numberOfLines={1}>Mausam Doppler Grid</Text>
          </View>
        </TouchableOpacity>

        {/* CWC Official Hydrology Badge */}
        <TouchableOpacity
          style={[styles.logoBadge, styles.cwcBadge]}
          activeOpacity={0.75}
          onPress={() => onPressAgency?.('CWC')}
        >
          <View style={styles.logoIconWrapper}>
            <CwcOfficialLogo size={28} />
          </View>
          <View style={styles.badgeTextCol}>
            <View style={styles.badgeTitleRow}>
              <Text style={[styles.badgeTitle, { color: '#0284C7' }]}>CWC</Text>
              <View style={[styles.liveTag, { backgroundColor: '#E0F2FE' }]}>
                <Text style={[styles.liveTagText, { color: '#0284C7' }]}>LIVE</Text>
              </View>
            </View>
            <Text style={styles.badgeSub} numberOfLines={1}>River Gauge Telemetry</Text>
          </View>
        </TouchableOpacity>

        {/* GSI Official Geology Crest Badge */}
        <TouchableOpacity
          style={[styles.logoBadge, styles.gsiBadge]}
          activeOpacity={0.75}
          onPress={() => onPressAgency?.('GSI')}
        >
          <View style={styles.logoIconWrapper}>
            <GsiOfficialLogo size={28} />
          </View>
          <View style={styles.badgeTextCol}>
            <View style={styles.badgeTitleRow}>
              <Text style={[styles.badgeTitle, { color: '#166534' }]}>GSI</Text>
              <View style={[styles.liveTag, { backgroundColor: '#DCFCE7' }]}>
                <Text style={[styles.liveTagText, { color: '#166534' }]}>LIVE</Text>
              </View>
            </View>
            <Text style={styles.badgeSub} numberOfLines={1}>DEM Slope 30m</Text>
          </View>
        </TouchableOpacity>

        {/* WMO Official Seal Badge */}
        <TouchableOpacity
          style={[styles.logoBadge, styles.wmoBadge]}
          activeOpacity={0.75}
          onPress={() => onPressAgency?.('WMO')}
        >
          <View style={styles.logoIconWrapper}>
            <WmoOfficialLogo size={28} />
          </View>
          <View style={styles.badgeTextCol}>
            <View style={styles.badgeTitleRow}>
              <Text style={[styles.badgeTitle, { color: '#0284C7' }]}>WMO</Text>
              <View style={[styles.liveTag, { backgroundColor: '#E0F2FE' }]}>
                <Text style={[styles.liveTagText, { color: '#0369A1' }]}>LIVE</Text>
              </View>
            </View>
            <Text style={styles.badgeSub} numberOfLines={1}>Digital Twin Hub</Text>
          </View>
        </TouchableOpacity>

        {/* NDRF National Rescue Crest Badge */}
        <TouchableOpacity
          style={[styles.logoBadge, styles.ndrfBadge]}
          activeOpacity={0.75}
        >
          <View style={styles.logoIconWrapper}>
            <NdrfOfficialLogo size={28} />
          </View>
          <View style={styles.badgeTextCol}>
            <View style={styles.badgeTitleRow}>
              <Text style={[styles.badgeTitle, { color: '#8C5338' }]}>NDRF</Text>
              <View style={[styles.liveTag, { backgroundColor: '#FEF3C7' }]}>
                <Text style={[styles.liveTagText, { color: '#B45309' }]}>RESCUE</Text>
              </View>
            </View>
            <Text style={styles.badgeSub} numberOfLines={1}>1078 / 112 Protocol</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginBottom: 10,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#16A34A',
  },
  sectionLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#827C77',
    letterSpacing: 0.8,
  },
  tapPrompt: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8C5338',
  },
  scrollList: {
    gap: 10,
    paddingRight: 16,
  },
  logoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E8E4DF',
    minWidth: 172,
    shadowColor: '#1F1A17',
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  logoIconWrapper: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  badgeTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  badgeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  badgeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1F1A17',
  },
  liveTag: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  liveTagText: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badgeSub: {
    fontSize: 11,
    color: '#827C77',
    fontWeight: '500',
  },
  nasaBadge: {
    borderColor: '#BFDBFE',
    backgroundColor: '#F8FAFC',
  },
  isroBadge: {
    borderColor: '#FED7AA',
    backgroundColor: '#FFFBF5',
  },
  imdBadge: {
    borderColor: '#BAE6FD',
    backgroundColor: '#F0F9FF',
  },
  cwcBadge: {
    borderColor: '#BAE6FD',
    backgroundColor: '#F0F9FF',
  },
  gsiBadge: {
    borderColor: '#BBF7D0',
    backgroundColor: '#F2FDF5',
  },
  wmoBadge: {
    borderColor: '#BAE6FD',
    backgroundColor: '#F8FAFC',
  },
  ndrfBadge: {
    borderColor: '#FDE68A',
    backgroundColor: '#FFFDF5',
  },
});
