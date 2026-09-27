import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { WeatherIcon } from './WeatherIcon';
import { Colors, FontSize, Spacing, BorderRadius } from '../theme/colors';

export interface MetricDetailData {
  title: string;
  value: string;
  status: string;
  source: string;
  description: string;
  scientificContext: string;
  safetyAdvisory: string;
  icon: 'rain' | 'wind' | 'sun' | 'cloud' | 'alert' | 'compass';
}

interface WeatherMetricModalProps {
  visible: boolean;
  metric: MetricDetailData | null;
  onClose: () => void;
}

export const WeatherMetricModal: React.FC<WeatherMetricModalProps> = ({
  visible,
  metric,
  onClose,
}) => {
  if (!metric) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <WeatherIcon name={metric.icon} size={22} color="#005BBF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{metric.title}</Text>
              <Text style={styles.sourceText}>Source: {metric.source}</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} accessibilityLabel="Close">
              <Text style={styles.closeText}>X</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
            {/* Value Readout Box */}
            <View style={styles.valueCard}>
              <Text style={styles.valueDigit}>{metric.value}</Text>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>{metric.status}</Text>
              </View>
            </View>

            {/* Description */}
            <View style={styles.infoCard}>
              <Text style={styles.cardHeader}>CURRENT CONDITION</Text>
              <Text style={styles.cardText}>{metric.description}</Text>
            </View>

            {/* Scientific Context */}
            <View style={styles.infoCard}>
              <Text style={styles.cardHeader}>SCIENTIFIC MEASUREMENT & THRESHOLDS</Text>
              <Text style={styles.cardText}>{metric.scientificContext}</Text>
            </View>

            {/* Safety Advisory */}
            <View style={[styles.infoCard, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
              <Text style={[styles.cardHeader, { color: '#166534' }]}>SAFETY RECOMMENDATION</Text>
              <Text style={[styles.cardText, { color: '#14532D' }]}>{metric.safetyAdvisory}</Text>
            </View>

            <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
              <Text style={styles.doneBtnText}>Close Details</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: '#0F172A',
  },
  sourceText: {
    fontSize: 11,
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
  closeText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '700',
  },

  body: {
    marginBottom: Spacing.md,
  },
  valueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.md,
  },
  valueDigit: {
    fontSize: FontSize.hero,
    fontWeight: '900',
    color: '#0284C7',
  },
  statusPill: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0369A1',
  },

  infoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: 4,
  },
  cardHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  cardText: {
    fontSize: 12,
    color: '#1E293B',
    lineHeight: 18,
  },

  doneBtn: {
    backgroundColor: '#0F172A',
    borderRadius: BorderRadius.md,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  doneBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
