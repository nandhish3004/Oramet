import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../state/useAuthStore';
import { useRiskStore } from '../../state/useRiskStore';
import { RiskBadge } from '../../components/RiskBadge';

export const HomeResident: React.FC = () => {
  const navigation = useNavigation<any>();
  const user = useAuthStore((state) => state.user);
  const { currentRisk, isLoading, fetchRiskData, lastSyncedAt } = useRiskStore();

  useEffect(() => {
    if (user?.homeZoneId) {
      fetchRiskData(user.homeZoneId);
    }
  }, [user?.homeZoneId, fetchRiskData]);

  const onRefresh = () => {
    if (user?.homeZoneId) fetchRiskData(user.homeZoneId);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back, {user?.name}</Text>
          <Text style={styles.location}>{user?.homeZoneName}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.riskCard}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('RiskScore')}
      >
        <View style={styles.riskHeader}>
          <Text style={styles.riskTitle}>Area Composite Safety</Text>
          {currentRisk && <RiskBadge severity={currentRisk.severityLabel} />}
        </View>

        <Text style={styles.scoreText}>
          {currentRisk?.compositeScore}
          <Text style={styles.scoreTotal}> / 100</Text>
        </Text>

        <Text style={styles.syncText}>
          Telemetry verified · Last sync:{' '}
          {lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending'}
        </Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Environmental Telemetry</Text>
        {currentRisk?.factors.map((factor) => (
          <View key={factor.name} style={styles.telemetryRow}>
            <View style={styles.telemetryHeader}>
              <Text style={styles.telemetryName}>{factor.name}</Text>
              <Text style={styles.telemetryVal}>
                {factor.value} {factor.unit}
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.min(factor.value, 100)}%` },
                ]}
              />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.sosQuickBtn}
          onPress={() => navigation.navigate('Emergency')}
        >
          <Text style={styles.sosQuickText}>Emergency SOS Channel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 16 },
  greeting: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  location: { fontSize: 13, color: '#64748B', fontWeight: '500', marginTop: 2 },
  riskCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  riskTitle: { fontSize: 14, fontWeight: '600', color: '#475569' },
  scoreText: { fontSize: 36, fontWeight: '900', color: '#0F172A' },
  scoreTotal: { fontSize: 16, fontWeight: '500', color: '#94A3B8' },
  syncText: { fontSize: 11, color: '#94A3B8', marginTop: 8 },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 14 },
  telemetryRow: { marginBottom: 14 },
  telemetryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  telemetryName: { fontSize: 13, color: '#475569', fontWeight: '500' },
  telemetryVal: { fontSize: 13, color: '#0F172A', fontWeight: '700' },
  progressBarBg: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#0284C7', borderRadius: 3 },
  quickActions: { marginTop: 20 },
  sosQuickBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  sosQuickText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});