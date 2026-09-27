import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { IntegratedDisasterSnapshot } from '../services/telemetry/multiSourceService';

interface LiveTelemetryModalProps {
  visible: boolean;
  onClose: () => void;
  telemetry: IntegratedDisasterSnapshot;
  initialAgency?: 'IMD' | 'ISRO' | 'NASA' | 'GSI' | 'NHAI' | 'CWC' | 'WMO';
  onForceRefresh?: () => Promise<void>;
  weatherAvailable?: boolean;
}

const SOURCES = [
  { name: 'Open-Meteo', scope: 'Public weather model', status: 'Can be queried without an account' },
  { name: 'IMD', scope: 'Official warnings and station observations', status: 'Not connected' },
  { name: 'CWC', scope: 'Official river-gauge observations', status: 'Not connected' },
  { name: 'GSI', scope: 'Official landslide monitoring', status: 'Not connected' },
  { name: 'ISRO / MOSDAC', scope: 'Satellite products', status: 'Not connected' },
  { name: 'NHAI', scope: 'Road closure and road-weather data', status: 'Not connected' },
  { name: 'WMO', scope: 'Official basin and forecast services', status: 'Not connected' },
];

export const LiveTelemetryModal: React.FC<LiveTelemetryModalProps> = ({
  visible,
  onClose,
  onForceRefresh,
  weatherAvailable = false,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = async () => {
    if (!onForceRefresh) return;
    setIsRefreshing(true);
    try {
      await onForceRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const shareStatus = () => {
    const message = [
      'OraMet data connectivity status',
      `Open-Meteo weather response available: ${weatherAvailable ? 'Yes' : 'No'}`,
      'Official IMD, CWC, GSI, ISRO/MOSDAC, NHAI and WMO feeds: not configured.',
      'No authority-verified flood warning, river level, shelter status, or evacuation route is available from OraMet.',
      'Check official local emergency-service advisories.',
    ].join('\n');
    Share.share({ title: 'OraMet data status', message });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>DATA CONNECTIVITY</Text>
              <Text style={styles.title}>What OraMet can verify</Text>
            </View>
            <TouchableOpacity accessibilityLabel="Close data connectivity" onPress={onClose} style={styles.close}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.notice}>
            <View style={[styles.statusDot, weatherAvailable && styles.statusDotLive]} />
            <View style={styles.noticeCopy}>
              <Text style={styles.noticeTitle}>
                {weatherAvailable ? 'Weather response received' : 'No live weather response'}
              </Text>
              <Text style={styles.noticeBody}>
                Open-Meteo is a public weather model, not an emergency authority or a validated flood-warning service.
              </Text>
            </View>
          </View>

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {SOURCES.map((source) => {
              const connected = source.name === 'Open-Meteo' && weatherAvailable;
              const status = source.name === 'Open-Meteo'
                ? weatherAvailable ? 'Response received' : 'No response'
                : source.status;
              return (
                <View key={source.name} style={styles.sourceRow}>
                  <View style={styles.sourceText}>
                    <Text style={styles.sourceName}>{source.name}</Text>
                    <Text style={styles.sourceScope}>{source.scope}</Text>
                  </View>
                  <Text style={[styles.sourceStatus, connected && styles.sourceStatusLive]}>{status}</Text>
                </View>
              );
            })}
            <Text style={styles.disclaimer}>
              Unavailable feeds are not simulated in this view. OraMet cannot deliver official alerts, verify shelter occupancy, or calculate a safe evacuation route without authorized data and services.
            </Text>
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={shareStatus}>
              <Text style={styles.secondaryButtonText}>Share status</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={refresh} disabled={isRefreshing}>
              {isRefreshing ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text style={styles.primaryButtonText}>Refresh weather</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(10, 16, 30, 0.72)' },
  sheet: { maxHeight: '88%', backgroundColor: '#111827', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 22, paddingTop: 12, paddingBottom: 26 },
  handle: { width: 42, height: 4, borderRadius: 4, backgroundColor: '#475569', alignSelf: 'center', marginBottom: 22 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  headerCopy: { flex: 1 },
  eyebrow: { color: '#38BDF8', fontSize: 10, fontWeight: '900', letterSpacing: 1.7, marginBottom: 5 },
  title: { color: '#F8FAFC', fontSize: 21, fontWeight: '800' },
  close: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1F2937', alignItems: 'center', justifyContent: 'center' },
  closeText: { color: '#CBD5E1', fontSize: 26, lineHeight: 28 },
  notice: { flexDirection: 'row', backgroundColor: '#1E293B', borderColor: '#334155', borderWidth: 1, borderRadius: 16, padding: 15, marginBottom: 16 },
  statusDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#F59E0B', marginTop: 5, marginRight: 11 },
  statusDotLive: { backgroundColor: '#34D399' },
  noticeCopy: { flex: 1 },
  noticeTitle: { color: '#F8FAFC', fontSize: 14, fontWeight: '800', marginBottom: 4 },
  noticeBody: { color: '#CBD5E1', fontSize: 12, lineHeight: 18 },
  list: { flexGrow: 0 },
  listContent: { paddingBottom: 8 },
  sourceRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomColor: '#263244', borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
  sourceText: { flex: 1 },
  sourceName: { color: '#F8FAFC', fontSize: 13, fontWeight: '800' },
  sourceScope: { color: '#94A3B8', fontSize: 11, marginTop: 3 },
  sourceStatus: { color: '#FCA5A5', fontSize: 10, fontWeight: '800', textAlign: 'right' },
  sourceStatusLive: { color: '#6EE7B7' },
  disclaimer: { color: '#94A3B8', fontSize: 11, lineHeight: 17, marginTop: 16 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  secondaryButton: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 48, backgroundColor: '#1F2937', borderRadius: 13 },
  secondaryButtonText: { color: '#E2E8F0', fontSize: 13, fontWeight: '800' },
  primaryButton: { flex: 1.2, alignItems: 'center', justifyContent: 'center', minHeight: 48, backgroundColor: '#0284C7', borderRadius: 13 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
});
