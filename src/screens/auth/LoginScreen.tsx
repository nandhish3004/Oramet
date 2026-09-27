import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../state/useAuthStore';
import { GradientButton } from '../../components/GradientButton';
import { WeatherIcon } from '../../components/WeatherIcon';
import { AppLogo } from '../../components/AppLogo';
import { Colors, FontSize, Spacing, BorderRadius } from '../../theme/colors';

type LoginTab = 'google' | 'phone' | 'email' | 'station';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {
    login,
    loginWithGoogle,
    loginAsEmergencyGuest,
    loginWithStationId,
    isLoading,
    error,
    clearError,
  } = useAuthStore();

  const [activeTab, setActiveTab] = useState<LoginTab>('phone');

  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Phone OTP state
  const [phoneNumber, setPhoneNumber] = useState('');

  // Station ID state
  const [stationId, setStationId] = useState('');
  const [badgeCode, setBadgeCode] = useState('');

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    await login(email.trim(), password);
  };

  const handleGoogleLogin = async () => {
    clearError();
    await loginWithGoogle();
  };

  const handleSendOtp = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    clearError();
    Alert.alert(
      'Phone sign-in unavailable',
      'SMS delivery and OTP verification are not configured in this app yet. Use email sign-in or Emergency Guest mode.'
    );
  };

  const handleStationLogin = async () => {
    if (!stationId.trim() || !badgeCode.trim()) return;
    await loginWithStationId(stationId.trim(), badgeCode.trim());
  };

  const handleEmergencyGuestBypass = async () => {
    Alert.alert(
      'Emergency Guest Bypass',
      'Entering offline emergency mode immediately. You can view all live shelters, flood telemetry, and sound rescue whistles without credentials.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Enter Emergency Mode', onPress: () => loginAsEmergencyGuest() },
      ]
    );
  };

  return (
    <LinearGradient colors={Colors.gradient.welcome} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Back"
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={{ marginBottom: Spacing.sm }}>
              <AppLogo size={60} />
            </View>
            <Text style={styles.title}>Welcome to OraMet</Text>
            <Text style={styles.subtitle}>
              Disaster Early Warning & Relief Services
            </Text>
          </View>

          {/* Prominent Google One-Tap Sign In */}
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={handleGoogleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24">
              <Path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <Path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <Path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <Path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </Svg>
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR SIGN IN WITH</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Login Mode Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'phone' && styles.tabBtnActive]}
              onPress={() => { setActiveTab('phone'); clearError(); }}
            >
              <Text style={[styles.tabText, activeTab === 'phone' && styles.tabTextActive]}>
                Phone
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'email' && styles.tabBtnActive]}
              onPress={() => { setActiveTab('email'); clearError(); }}
            >
              <Text style={[styles.tabText, activeTab === 'email' && styles.tabTextActive]}>
                Email ID
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'station' && styles.tabBtnActive]}
              onPress={() => { setActiveTab('station'); clearError(); }}
            >
              <Text style={[styles.tabText, activeTab === 'station' && styles.tabTextActive]}>
                Responder ID
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Area */}
          <View style={styles.form}>
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* TAB 1: PHONE OTP */}
            {activeTab === 'phone' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mobile Number (India)</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.countryCode}>+91</Text>
                    <TextInput
                      style={styles.input}
                      value={phoneNumber}
                      onChangeText={(t) => { setPhoneNumber(t); clearError(); }}
                      placeholder="98765 43210"
                      placeholderTextColor={Colors.text.muted}
                      keyboardType="phone-pad"
                      maxLength={10}
                    />
                  </View>
                </View>

                <GradientButton
                  title="Phone sign-in unavailable"
                  onPress={handleSendOtp}
                  loading={isLoading}
                  disabled={!phoneNumber.trim()}
                  size="large"
                  style={styles.loginBtn}
                />
              </>
            )}

            {/* TAB 2: EMAIL & PASSWORD */}
            {activeTab === 'email' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <View style={styles.inputWrapper}>
                    <WeatherIcon name="user" size={16} color={Colors.text.tertiary} />
                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={(t) => { setEmail(t); clearError(); }}
                      placeholder="you@example.com"
                      placeholderTextColor={Colors.text.muted}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.inputWrapper}>
                    <WeatherIcon name="shield" size={16} color={Colors.text.tertiary} />
                    <TextInput
                      style={styles.input}
                      value={password}
                      onChangeText={(t) => { setPassword(t); clearError(); }}
                      placeholder="Enter your password"
                      placeholderTextColor={Colors.text.muted}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Text style={styles.showHide}>{showPassword ? 'Hide' : 'Show'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <GradientButton
                  title="Sign In with Email"
                  onPress={handleEmailLogin}
                  loading={isLoading}
                  disabled={!email.trim() || !password.trim()}
                  size="large"
                  style={styles.loginBtn}
                />
              </>
            )}

            {/* TAB 3: RESPONDER / STATION ID */}
            {activeTab === 'station' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Station ID / Unit Code</Text>
                  <View style={styles.inputWrapper}>
                    <WeatherIcon name="compass" size={16} color={Colors.text.tertiary} />
                    <TextInput
                      style={styles.input}
                      value={stationId}
                      onChangeText={(t) => { setStationId(t); clearError(); }}
                      placeholder="e.g. NDRF-UK-08"
                      placeholderTextColor={Colors.text.muted}
                      autoCapitalize="characters"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Disaster Personnel Security PIN</Text>
                  <View style={styles.inputWrapper}>
                    <WeatherIcon name="shield" size={16} color={Colors.text.tertiary} />
                    <TextInput
                      style={styles.input}
                      value={badgeCode}
                      onChangeText={(t) => { setBadgeCode(t); clearError(); }}
                      placeholder="Badge Security PIN"
                      placeholderTextColor={Colors.text.muted}
                      secureTextEntry
                    />
                  </View>
                </View>

                <GradientButton
                  title="Authenticate Responder"
                  onPress={handleStationLogin}
                  loading={isLoading}
                  disabled={!stationId.trim() || !badgeCode.trim()}
                  size="large"
                  style={styles.loginBtn}
                />
              </>
            )}
          </View>

          {/* Emergency Evacuee Instant Guest Bypass */}
          <TouchableOpacity
            style={styles.emergencyBypassBtn}
            onPress={handleEmergencyGuestBypass}
            activeOpacity={0.8}
          >
            <View style={styles.emergencyPulseDot} />
            <Text style={styles.emergencyBypassText}>
              Emergency Situation? Bypass Login (Enter as Guest)
            </Text>
          </TouchableOpacity>

          {/* Sign up link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.footerLink}>Register Ward Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: 50,
    paddingBottom: Spacing.xxxl,
  },
  backBtn: {
    marginBottom: Spacing.md,
  },
  backText: {
    fontSize: FontSize.md,
    color: '#005BBF',
    fontWeight: '700',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  iconGlow: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#D8E2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '900',
    color: '#181C20',
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: '#414754',
    marginTop: 2,
    textAlign: 'center',
  },

  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFE3E8',
    borderRadius: BorderRadius.full,
    paddingVertical: 14,
    shadowColor: '#181C20',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: Spacing.md,
  },
  googleBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: '#181C20',
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginVertical: Spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#DFE3E8',
  },
  dividerText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#727785',
    letterSpacing: 0.5,
  },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EBEEF4',
    borderRadius: BorderRadius.full,
    padding: 3,
    marginBottom: Spacing.md,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: BorderRadius.full,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: '#414754',
  },
  tabTextActive: {
    color: '#005BBF',
  },

  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#DFE3E8',
    marginBottom: Spacing.md,
    shadowColor: '#181C20',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  errorBox: {
    backgroundColor: '#FFDAD6',
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: '#BA1A1A',
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: '#181C20',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F4FA',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: '#DFE3E8',
  },
  countryCode: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    color: '#181C20',
    marginRight: 6,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: Spacing.sm,
    fontSize: FontSize.sm,
    color: '#181C20',
  },
  showHide: {
    fontSize: FontSize.xs,
    color: '#005BBF',
    fontWeight: '700',
  },
  sendOtpBtn: {
    backgroundColor: '#005BBF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  sendOtpText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  loginBtn: {
    marginTop: Spacing.xs,
  },

  emergencyBypassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 218, 214, 0.7)',
    borderWidth: 1,
    borderColor: '#BA1A1A',
    borderRadius: BorderRadius.full,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  emergencyPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#BA1A1A',
  },
  emergencyBypassText: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    color: '#BA1A1A',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  footerText: {
    fontSize: FontSize.xs,
    color: '#414754',
  },
  footerLink: {
    fontSize: FontSize.xs,
    color: '#005BBF',
    fontWeight: '800',
  },
});
