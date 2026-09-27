import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing } from '../theme/colors';

export const OfflineBanner: React.FC = () => {
  return (
    <View style={styles.banner}>
      <View style={styles.indicator} />
      <Text style={styles.text}>
        Operating Offline · Using last synced cache & SMS emergency dispatch
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245, 158, 11, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.status.offline,
    marginRight: Spacing.sm,
  },
  text: {
    color: Colors.accent.amber,
    fontSize: FontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});