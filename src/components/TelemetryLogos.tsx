import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface TelemetryLogosProps {
  compact?: boolean;
  style?: ViewStyle;
  onPressAgency?: (agency: 'IMD' | 'ISRO' | 'NASA' | 'GSI' | 'NHAI' | 'CWC' | 'WMO') => void;
}

/** Honest data-availability summary; no agency endorsement or connection implied. */
export const TelemetryLogos: React.FC<TelemetryLogosProps> = ({ compact = false, style }) => (
  <View style={[styles.container, compact && styles.compact, style]}>
    <Text style={styles.title}>DATA CONNECTIONS</Text>
    <View style={styles.row}>
      <View style={styles.badge}>
        <View style={styles.dot} />
        <Text style={styles.badgeText}>Open-Meteo · public weather model</Text>
      </View>
      <View style={[styles.badge, styles.unavailable]}>
        <View style={[styles.dot, styles.offlineDot]} />
        <Text style={styles.badgeText}>Official hazard feeds · not connected</Text>
      </View>
    </View>
    <Text style={styles.note}>No authority-verified flood warning or river-gauge data is available.</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', borderWidth: 1, borderRadius: 16, padding: 15 },
  compact: { padding: 12 },
  title: { color: '#334155', fontSize: 10, fontWeight: '900', letterSpacing: 1.2, marginBottom: 10 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingVertical: 7, paddingHorizontal: 10, backgroundColor: '#E0F2FE' },
  unavailable: { backgroundColor: '#FEF2F2' },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#0284C7', marginRight: 7 },
  offlineDot: { backgroundColor: '#DC2626' },
  badgeText: { color: '#334155', fontSize: 10, fontWeight: '700' },
  note: { color: '#64748B', fontSize: 10, lineHeight: 15, marginTop: 10 },
});
