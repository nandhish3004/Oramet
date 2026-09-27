import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAlertStore, AlertItem } from '../../state/useAlertStore';
import { AlertCard } from '../../components/AlertCard';
import { WeatherIcon } from '../../components/WeatherIcon';
import { Colors, FontSize, Spacing } from '../../theme/colors';

export const AlertsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { alerts, isLoading, fetchAlerts } = useAlertStore();

  useEffect(() => {
    fetchAlerts();
  }, []);

  const renderAlert = ({ item }: { item: AlertItem }) => (
    <AlertCard
      id={item.id}
      severity={item.severity}
      title={item.title}
      description={item.description}
      createdAt={item.created_at}
      isRead={item.is_read === 1}
      onPress={() => navigation.navigate('AlertDetail', { alertId: item.id })}
    />
  );

  return (
    <LinearGradient colors={Colors.gradient.primary} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Weather Alerts</Text>
          <Text style={styles.subtitle}>
            {alerts.filter((a) => a.is_read === 0).length} unread alerts
          </Text>
        </View>
        <View style={styles.headerIcon}>
          <WeatherIcon name="bell" size={22} color={Colors.accent.amber} />
        </View>
      </View>

      {/* Alert List */}
      <FlatList
        data={alerts}
        renderItem={renderAlert}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onRefresh={() => fetchAlerts()}
        refreshing={isLoading}
        ListEmptyComponent={
          <View style={styles.empty}>
            <WeatherIcon name="check" size={40} color={Colors.text.tertiary} />
            <Text style={styles.emptyText}>No alerts at this time</Text>
            <Text style={styles.emptySubtext}>You're all clear! We'll notify you when conditions change.</Text>
          </View>
        }
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '900',
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent.amberGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text.secondary,
    marginTop: Spacing.lg,
  },
  emptySubtext: {
    fontSize: FontSize.sm,
    color: Colors.text.tertiary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});
