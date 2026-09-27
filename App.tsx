import React, { useEffect } from 'react';
import { StatusBar, View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import { Navigation } from './src/Navigation';
import { useRiskStore } from './src/state/useRiskStore';
import { useAuthStore } from './src/state/useAuthStore';
import { emergencyNotificationService } from './src/services/notification/emergencyNotificationService';
import { Colors } from './src/theme/colors';

export default function App() {
  const setConnected = useRiskStore((state) => state.setConnected);
  const isConnected = useRiskStore((state) => state.isConnected);
  const loadSession = useAuthStore((state) => state.loadSession);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    // Load existing session from DB on app startup
    loadSession();

    // Initialize background watchdog for notifications even when app is minimized
    emergencyNotificationService.initialize();

    // Monitor network connectivity
    const unsubscribe = NetInfo.addEventListener((state) => {
      setConnected(Boolean(state.isConnected && state.isInternetReachable !== false));
    });
    return () => unsubscribe();
  }, [setConnected, loadSession]);

  if (isLoading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={Colors.accent.cyan} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg.primary} />
      <Navigation />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});