import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/** Informational banner; local drafts are not transmitted automatically. */
export const OfflineBanner: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.text}>
      Offline · live weather and remote alerts are unavailable. SMS drafts require review and manual sending.
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  text: { color: '#92400E', fontSize: 11, fontWeight: '700', textAlign: 'center' },
});
