import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../state/useAuthStore';
import { useRiskStore } from '../../state/useRiskStore';
import { AvatarCircle } from '../../components/AvatarCircle';
import { GlassCard } from '../../components/GlassCard';
import { WeatherIcon } from '../../components/WeatherIcon';
import { Colors, FontSize, Spacing, BorderRadius } from '../../theme/colors';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuthStore();
  const { isLiveGpsMode, userLocation, activeDistrict } = useRiskStore();

  const activeZoneText = isLiveGpsMode
    ? userLocation?.formattedAddress || activeDistrict
    : user?.homeZoneName || activeDistrict || 'India';

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of OraMet?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const menuItems = [
    { icon: 'edit' as const, label: 'Edit Profile', subtitle: 'Name, email, credentials', onPress: () => navigation.navigate('EditProfile') },
    { icon: 'settings' as const, label: 'Settings', subtitle: 'Notifications, offline cache', onPress: () => navigation.navigate('Settings') },
    { icon: 'shield' as const, label: 'Safety Breakdown & Telemetry', subtitle: 'NASA, IMD & ISRO live telemetry weights', onPress: () => navigation.navigate('RiskScore') },
    { icon: 'map' as const, label: 'Emergency Shelters Directory', subtitle: 'Local high-ground safe havens', onPress: () => navigation.navigate('SafeHaven') },
    { icon: 'bell' as const, label: 'Alert Preferences', subtitle: 'Hazard thresholds & sound', onPress: () => navigation.navigate('Settings') },
  ];

  return (
    <LinearGradient colors={Colors.gradient.primary} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Card */}
        <GlassCard style={styles.profileCard}>
          <View style={styles.profileTop}>
            <AvatarCircle
              name={user?.name || 'U'}
              size={72}
              color={user?.avatarColor || Colors.accent.cyan}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || 'User'}</Text>
              <Text style={styles.profileEmail}>{user?.email || ''}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{user?.role?.toUpperCase() || 'RESIDENT'}</Text>
              </View>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue} numberOfLines={1}>{activeZoneText}</Text>
              <Text style={styles.statLabel}>Active Zone</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>Active</Text>
              <Text style={styles.statLabel}>Status</Text>
            </View>
          </View>
        </GlassCard>

        {/* Menu Items */}
        <Text style={styles.sectionTitle}>Account</Text>
        {menuItems.map((item, idx) => (
          <TouchableOpacity key={idx} onPress={item.onPress} activeOpacity={0.7}>
            <GlassCard style={styles.menuCard}>
              <View style={styles.menuRow}>
                <View style={styles.menuIcon}>
                  <WeatherIcon name={item.icon} size={18} color={Colors.accent.cyan} />
                </View>
                <View style={styles.menuText}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <WeatherIcon name="arrow-right" size={16} color={Colors.text.muted} />
              </View>
            </GlassCard>
          </TouchableOpacity>
        ))}

        {/* App Info */}
        <GlassCard style={styles.appInfoCard}>
          <View style={styles.appInfoRow}>
            <WeatherIcon name="shield" size={18} color={Colors.accent.cyan} />
            <View style={styles.appInfoText}>
              <Text style={styles.appName}>WeatherGuard · OraMet</Text>
              <Text style={styles.appVersion}>Version 2.0.0 (SIH 2026 Edition)</Text>
              <Text style={{ fontSize: 10, color: '#94A3B8', marginTop: 3, lineHeight: 14 }}>
                Telemetry: NASA Earth Science · IMD Mausam · ISRO MOSDAC · Open-Meteo · CWC
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
          <WeatherIcon name="logout" size={18} color={Colors.severity.critical.text} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: 100 },

  header: {
    paddingTop: 60,
    marginBottom: Spacing.xxl,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '900',
    color: Colors.text.primary,
  },

  profileCard: {
    marginBottom: Spacing.xxl,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: FontSize.xl,
    fontWeight: '900',
    color: Colors.text.primary,
  },
  profileEmail: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: Colors.accent.cyanGlow,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
  },
  roleText: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    color: Colors.accent.cyan,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.subtle,
    marginVertical: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border.subtle,
  },

  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },

  menuCard: {
    marginBottom: Spacing.sm,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.accent.cyanGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuText: {
    flex: 1,
  },
  menuLabel: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  menuSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.text.tertiary,
    marginTop: 2,
  },

  appInfoCard: {
    marginTop: Spacing.xxl,
    marginBottom: Spacing.lg,
  },
  appInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  appInfoText: {},
  appName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  appVersion: {
    fontSize: FontSize.xs,
    color: Colors.text.tertiary,
    marginTop: 2,
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
    gap: Spacing.sm,
  },
  logoutText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.severity.critical.text,
  },
});
