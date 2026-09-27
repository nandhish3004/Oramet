import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Vibration,
} from 'react-native';
import { WeatherIcon } from './WeatherIcon';
import { Colors, FontSize, Spacing, BorderRadius } from '../theme/colors';

interface RescueWhistleModalProps {
  visible: boolean;
  onClose: () => void;
}

export const RescueWhistleModal: React.FC<RescueWhistleModalProps> = ({ visible, onClose }) => {
  const [isActive, setIsActive] = useState<boolean>(true);
  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    if (visible && isActive) {
      // Vibrate phone in SOS rhythm
      try {
        Vibration.vibrate([400, 250, 400, 250, 800, 400], true);
      } catch {}

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      try {
        Vibration.cancel();
      } catch {}
    }

    return () => {
      try {
        Vibration.cancel();
      } catch {}
    };
  }, [visible, isActive]);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <WeatherIcon name="whistle" size={24} color={Colors.severity.critical.accent} />
              <Text style={styles.title}>SOS vibration demo</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeText}>X</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.desc}>
            This only vibrates this device. It does not sound an audible siren, send an SOS, or share your location. Call 112 or contact someone directly for help.
          </Text>

          {/* Pulsing Visual Beacon */}
          <View style={styles.beaconContainer}>
            <Animated.View
              style={[
                styles.beaconCircle,
                { transform: [{ scale: pulseAnim }] },
                isActive ? styles.beaconActive : styles.beaconInactive,
              ]}
            >
              <WeatherIcon
                name="whistle"
                size={44}
                color={isActive ? '#FFFFFF' : Colors.text.muted}
              />
            </Animated.View>
            <Text style={styles.statusText}>
              {isActive ? '● DEVICE VIBRATION ACTIVE' : 'Vibration paused'}
            </Text>
          </View>

          {/* Toggle Button */}
          <TouchableOpacity
            style={[styles.toggleBtn, isActive ? styles.stopBtn : styles.startBtn]}
            onPress={() => setIsActive(!isActive)}
          >
            <Text style={styles.toggleBtnText}>
              {isActive ? 'STOP VIBRATION' : 'START VIBRATION'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dismissBtn} onPress={onClose}>
            <Text style={styles.dismissText}>Close Window</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  container: {
    backgroundColor: Colors.bg.secondary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.severity.critical.accent,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing.sm,
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
  desc: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 18,
  },
  beaconContainer: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  beaconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.severity.critical.accent,
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },
  beaconActive: {
    backgroundColor: Colors.severity.critical.accent,
  },
  beaconInactive: {
    backgroundColor: Colors.bg.elevated,
  },
  statusText: {
    marginTop: Spacing.md,
    fontSize: FontSize.xs,
    fontWeight: '800',
    color: Colors.severity.critical.accent,
    letterSpacing: 1,
  },
  toggleBtn: {
    width: '100%',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  stopBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: Colors.severity.critical.accent,
  },
  startBtn: {
    backgroundColor: Colors.accent.cyan,
  },
  toggleBtnText: {
    fontWeight: '800',
    color: Colors.text.primary,
    fontSize: FontSize.sm,
    letterSpacing: 0.5,
  },
  dismissBtn: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  dismissText: {
    color: Colors.text.tertiary,
    fontSize: FontSize.xs,
  },
});
