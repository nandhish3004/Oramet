import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../state/useAuthStore';
import { AvatarCircle } from '../../components/AvatarCircle';
import { GradientButton } from '../../components/GradientButton';
import { WeatherIcon } from '../../components/WeatherIcon';
import { Colors, FontSize, Spacing, BorderRadius } from '../../theme/colors';

const AVATAR_COLORS = [
  '#00D4FF', '#4ADE80', '#FACC15', '#FB923C', '#F87171',
  '#A78BFA', '#F472B6', '#60A5FA', '#34D399', '#FBBF24',
];

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, updateProfile } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor || Colors.accent.cyan);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Email cannot be empty.');
      return;
    }

    setSaving(true);
    await updateProfile({
      name: name.trim(),
      email: email.trim(),
      avatarColor,
    });
    setSaving(false);
    Alert.alert('Updated', 'Your profile has been saved.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <LinearGradient colors={Colors.gradient.primary} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Avatar Preview */}
          <View style={styles.avatarSection}>
            <AvatarCircle name={name || 'U'} size={80} color={avatarColor} />
            <Text style={styles.changeAvatar}>Tap a color below</Text>
          </View>

          {/* Color Picker */}
          <View style={styles.colorGrid}>
            {AVATAR_COLORS.map((color) => (
              <View
                key={color}
                style={[
                  styles.colorOption,
                  avatarColor === color && styles.colorSelected,
                ]}
              >
                <View
                  style={[styles.colorDot, { backgroundColor: color }]}
                  onStartShouldSetResponder={() => {
                    setAvatarColor(color);
                    return true;
                  }}
                />
              </View>
            ))}
          </View>

          {/* Form */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <WeatherIcon name="user" size={16} color={Colors.text.tertiary} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={Colors.text.muted}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <WeatherIcon name="bell" size={16} color={Colors.text.tertiary} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={Colors.text.muted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Home Zone</Text>
            <View style={[styles.inputWrapper, styles.disabledInput]}>
              <WeatherIcon name="map" size={16} color={Colors.text.tertiary} />
              <Text style={styles.disabledText}>{user?.homeZoneName || 'Village A (Ward 3)'}</Text>
            </View>
            <Text style={styles.hint}>Contact administrators to change your zone assignment</Text>
          </View>

          <GradientButton
            title="Save Changes"
            onPress={handleSave}
            loading={saving}
            disabled={!name.trim() || !email.trim()}
            size="large"
            style={styles.saveBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: Spacing.xxl, paddingBottom: 100 },

  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
    marginTop: Spacing.lg,
  },
  changeAvatar: {
    fontSize: FontSize.sm,
    color: Colors.text.tertiary,
    marginTop: Spacing.sm,
  },

  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xxxl,
  },
  colorOption: {
    padding: 3,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSelected: {
    borderColor: Colors.text.primary,
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },

  inputGroup: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg.input,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    paddingHorizontal: Spacing.lg,
    height: 52,
    gap: Spacing.md,
  },
  input: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: '500',
  },
  disabledInput: {
    opacity: 0.6,
  },
  disabledText: {
    color: Colors.text.secondary,
    fontSize: FontSize.md,
  },
  hint: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    marginTop: Spacing.xs,
  },

  saveBtn: {
    marginTop: Spacing.md,
  },
});
