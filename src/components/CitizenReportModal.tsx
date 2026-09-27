import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { WeatherIcon } from './WeatherIcon';
import { databaseService } from '../services/database/DatabaseService';
import { useAlertStore } from '../state/useAlertStore';
import { useRiskStore } from '../state/useRiskStore';
import { Colors, FontSize, Spacing, BorderRadius } from '../theme/colors';

interface CitizenReportModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CitizenReportModal: React.FC<CitizenReportModalProps> = ({ visible, onClose }) => {
  const [selectedHazard, setSelectedHazard] = useState<string>('waterlogging');
  const [waterLevel, setWaterLevel] = useState<string>('Knee-High (approx 45cm)');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const loc = useRiskStore.getState().userLocation;
    const city = loc?.city || 'Current Area';
    const hazardLabels: Record<string, string> = {
      waterlogging: 'River / Flood Rise',
      landslide: 'Debris / Mudslide',
      roadblock: 'Highway Blockage',
      culvert: 'Culvert Overflow',
    };
    const hazardName = hazardLabels[selectedHazard] || 'Hazard Observation';
    const isCritical = waterLevel.includes('Dangerous') || waterLevel.includes('Waist');

    await databaseService.addAlert({
      zone_id: 'zone_ground_truth',
      severity: isCritical ? 'CRITICAL' : 'HIGH',
      title: `Citizen Ground Truth: ${hazardName}`,
      description: `Reported level: ${waterLevel} in ${city}. Notes: ${notes || 'Verified field observation.'}`,
    });

    await useAlertStore.getState().fetchAlerts();

    setIsSubmitting(false);
    Alert.alert(
      'Observation Logged & Transmitted',
      `Your field report for ${city} has been recorded and added to your live Weather Alerts list.`,
      [{ text: 'View in Alerts', onPress: onClose }]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <WeatherIcon name="camera" size={20} color={Colors.accent.cyan} />
              <Text style={styles.title}>Take & Report: Ground Truth</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeText}>X</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Empower NDRF rescue forces with hyper-local field observations from your ward or village.
          </Text>

          {/* Hazard Type Selector */}
          <Text style={styles.label}>Select Observed Hazard:</Text>
          <View style={styles.grid}>
            {[
              { id: 'waterlogging', label: 'River / Flood Rise', icon: 'flood' as const },
              { id: 'landslide', label: 'Debris / Mudslide', icon: 'storm' as const },
              { id: 'roadblock', label: 'Highway Blockage', icon: 'alert' as const },
              { id: 'culvert', label: 'Culvert Overflow', icon: 'rain' as const },
            ].map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.hazardTile,
                  selectedHazard === item.id && styles.hazardTileActive,
                ]}
                onPress={() => setSelectedHazard(item.id)}
              >
                <WeatherIcon
                  name={item.icon}
                  size={18}
                  color={selectedHazard === item.id ? Colors.accent.cyan : Colors.text.tertiary}
                />
                <Text
                  style={[
                    styles.hazardTileText,
                    selectedHazard === item.id && styles.hazardTileTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Water / Debris Height */}
          <Text style={styles.label}>Estimated Water / Debris Depth:</Text>
          <View style={styles.pillRow}>
            {['Ankle (~15cm)', 'Knee (~45cm)', 'Waist (~90cm)', 'Dangerous (>1.5m)'].map((lvl) => (
              <TouchableOpacity
                key={lvl}
                style={[styles.pill, waterLevel === lvl && styles.pillActive]}
                onPress={() => setWaterLevel(lvl)}
              >
                <Text style={[styles.pillText, waterLevel === lvl && styles.pillTextActive]}>
                  {lvl}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Notes Input */}
          <Text style={styles.label}>Specific Landmarks or Bridge Points:</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Water overflowing culvert near Primary School B7"
            placeholderTextColor={Colors.text.muted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
          />

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={isSubmitting}>
              <Text style={styles.submitText}>
                {isSubmitting ? 'Transmitting...' : 'Submit Field Report'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.bg.secondary,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  closeText: {
    color: Colors.text.muted,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
    marginTop: Spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  hazardTile: {
    flexBasis: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
    backgroundColor: Colors.bg.elevated,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  hazardTileActive: {
    borderColor: Colors.accent.cyan,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
  },
  hazardTileText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  hazardTileTextActive: {
    color: Colors.accent.cyan,
    fontWeight: '700',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  pill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.bg.elevated,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  pillActive: {
    borderColor: Colors.accent.cyan,
    backgroundColor: 'rgba(0, 212, 255, 0.15)',
  },
  pillText: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  pillTextActive: {
    color: Colors.accent.cyan,
    fontWeight: '700',
  },
  input: {
    backgroundColor: Colors.bg.elevated,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    color: Colors.text.primary,
    padding: Spacing.sm,
    fontSize: FontSize.sm,
    marginBottom: Spacing.lg,
    minHeight: 50,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.bg.elevated,
  },
  cancelText: {
    color: Colors.text.secondary,
    fontWeight: '700',
  },
  submitBtn: {
    flex: 2,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.accent.cyan,
  },
  submitText: {
    color: Colors.bg.primary,
    fontWeight: '800',
  },
});
