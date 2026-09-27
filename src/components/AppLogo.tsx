import React from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';

interface AppLogoProps {
  size?: number;
  showFullLogo?: boolean;
  style?: ViewStyle;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 64,
  showFullLogo = false,
  style,
}) => {
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Image
        source={
          showFullLogo
            ? require('../assets/logo.png')
            : require('../assets/icon_squircle.png')
        }
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});
