import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize } from '../theme/colors';

interface AvatarCircleProps {
  name: string;
  size?: number;
  color?: string;
}

export const AvatarCircle: React.FC<AvatarCircleProps> = ({
  name,
  size = 48,
  color = Colors.accent.cyan,
}) => {
  const initials = name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: color,
        },
      ]}
    >
      <View
        style={[
          styles.inner,
          {
            width: size - 4,
            height: size - 4,
            borderRadius: (size - 4) / 2,
            backgroundColor: `${color}22`,
          },
        ]}
      >
        <Text
          style={[
            styles.initials,
            {
              fontSize: size * 0.35,
              color: color,
            },
          ]}
        >
          {initials}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '800',
    letterSpacing: 1,
  },
});
