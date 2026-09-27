import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAuthStore } from '../../state/useAuthStore';
import { databaseService } from '../../services/database/DatabaseService';
import { GlassCard } from '../../components/GlassCard';
import { WeatherIcon } from '../../components/WeatherIcon';
import { Colors, FontSize, Spacing, BorderRadius } from '../../theme/colors';

export const SettingsScreen: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [alertSound, setAlertSound] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    if (!user) return;
    const settings = await databaseService.getSettings(user.id);
    if (settings) {
      setNotificationsEnabled(settings.notifications_enabled === 1);
      setDarkMode(settings.dark_mode === 1);
      setAlertSound(settings.alert_sound === 1);
    }
  };

  const updateSetting = async (key: string, value: boolean) => {
    if (!user) return;
    const updates: any = {};
    updates[key] = value ? 1 : 0;
    await databaseService.updateSettings(user.id, updates);
  };

  const toggleNotifications = (val: boolean) => {
    setNotificationsEnabled(val);
    updateSetting('notifications_enabled', val);
  };

  const toggleDarkMode = (val: boolean) => {
    setDarkMode(val);
    updateSetting('dark_mode', val);
  };

  const toggleAlertSound = (val: boolean) => {
    setAlertSound(val);
    updateSetting('alert_sound', val);
  };

  return (
    <LinearGradient colors={Colors.gradient.primary} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>

        <GlassCard style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
              <WeatherIcon name="bell" size={18} color={Colors.accent.cyan} />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDesc}>Receive weather alerts and updates</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: Colors.bg.input, true: Colors.accent.cyanGlow }}
              thumbColor={notificationsEnabled ? Colors.accent.cyan : Colors.text.muted}
            />
          </View>
        </GlassCard>

        <GlassCard style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
              <WeatherIcon name="alert" size={18} color={Colors.accent.amber} />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Alert Sound</Text>
              <Text style={styles.settingDesc}>Play sound for critical alerts</Text>
            </View>
            <Switch
              value={alertSound}
              onValueChange={toggleAlertSound}
              trackColor={{ false: Colors.bg.input, true: Colors.accent.amberGlow }}
              thumbColor={alertSound ? Colors.accent.amber : Colors.text.muted}
            />
          </View>
        </GlassCard>

        <Text style={styles.sectionLabel}>DISPLAY</Text>

        <GlassCard style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
              <WeatherIcon name="sun" size={18} color={Colors.accent.cyan} />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingDesc}>Use dark theme (recommended)</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: Colors.bg.input, true: Colors.accent.cyanGlow }}
              thumbColor={darkMode ? Colors.accent.cyan : Colors.text.muted}
            />
          </View>
        </GlassCard>

        <Text style={styles.sectionLabel}>DATA & PRIVACY</Text>

        <GlassCard style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
              <WeatherIcon name="shield" size={18} color={Colors.severity.low.text} />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Data Stored Locally</Text>
              <Text style={styles.settingDesc}>All account data is stored securely on your device using SQLite encryption</Text>
            </View>
          </View>
        </GlassCard>

        <GlassCard style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
              <WeatherIcon name="map" size={18} color={Colors.text.tertiary} />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Location Services</Text>
              <Text style={styles.settingDesc}>GPS is used only for SOS dispatch and never stored remotely</Text>
            </View>
          </View>
        </GlassCard>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: 100 },

  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    color: Colors.text.tertiary,
    letterSpacing: 1,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },

  settingCard: {
    marginBottom: Spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.bg.glass,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  settingDesc: {
    fontSize: FontSize.xs,
    color: Colors.text.tertiary,
    marginTop: 2,
    lineHeight: 16,
  },
});
