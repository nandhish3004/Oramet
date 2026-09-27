import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CwcRiverTelemetry } from '../services/telemetry/cwcRiverService';

interface CwcFloodWatchViewProps {
  cwcLive?: CwcRiverTelemetry | null;
  activeDistrict?: string;
  onOpenVoiceAdvisory?: () => void;
}

/** Shows only an actual supplied reading; never substitutes a demo station. */
export const CwcFloodWatchView: React.FC<CwcFloodWatchViewProps> = ({ cwcLive, activeDistrict = 'selected area' }) => (
  <View style={styles.card}>
    <Text style={styles.eyebrow}>RIVER GAUGE</Text>
    <Text style={styles.title}>{cwcLive ? cwcLive.riverName : 'Official gauge feed unavailable'}</Text>
    {cwcLive ? (
      <>
        <Text style={styles.reading}>{cwcLive.currentWaterLevelMeters.toFixed(2)} m</Text>
        <Text style={styles.copy}>
          {cwcLive.gaugeStation} · {cwcLive.floodStatus} · updated {cwcLive.computedAt}
        </Text>
        <Text style={styles.copy}>Verify this reading and any safety decision with local emergency authorities.</Text>
      </>
    ) : (
      <>
        <Text style={styles.copy}>
          OraMet has no authorized CWC gauge connection for {activeDistrict}. No water level, trend, or all-clear is available.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => Linking.openURL('https://cwc.gov.in/')}>
          <Text style={styles.buttonText}>Visit Central Water Commission</Text>
        </TouchableOpacity>
      </>
    )}
  </View>
);

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 18, padding: 18 },
  eyebrow: { color: '#0369A1', fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: '#0F172A', fontSize: 17, fontWeight: '800', marginTop: 6 },
  reading: { color: '#0F172A', fontSize: 32, fontWeight: '900', marginTop: 12 },
  copy: { color: '#475569', fontSize: 12, lineHeight: 18, marginTop: 10 },
  button: { alignSelf: 'flex-start', marginTop: 15, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 13, backgroundColor: '#E0F2FE' },
  buttonText: { color: '#075985', fontSize: 12, fontWeight: '800' },
});
