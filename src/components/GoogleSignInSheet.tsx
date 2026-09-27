import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Svg, { Path, G, Rect, Circle, Line } from 'react-native-svg';
import { useAuthStore } from '../state/useAuthStore';
import { useLanguageStore } from '../state/useLanguageStore';
import { Colors, FontSize, Spacing, BorderRadius } from '../theme/colors';

interface GoogleSignInSheetProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const GoogleLogoSvg: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
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
);

const PhoneSvg = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#8C5338" strokeWidth={2}>
    <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </Svg>
);

export const GoogleSignInSheet: React.FC<GoogleSignInSheetProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { loginWithGoogle, loginWithPhoneOtp, loginAsEmergencyGuest } = useAuthStore();
  const { strings } = useLanguageStore();
  const [authMethod, setAuthMethod] = useState<'google' | 'phone'>('google');
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Custom User Google Sign-In Form State
  const [showCustomGoogleForm, setShowCustomGoogleForm] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [googleEmailError, setGoogleEmailError] = useState('');

  // Phone OTP State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(30);
  const [otpError, setOtpError] = useState('');

  const googleAccounts = [
    {
      name: 'Nandheesaprasad',
      email: 'nandhish3004@gmail.com',
      avatarChar: 'N',
      avatarBg: '#8C5338',
      roleSubtitle: 'Primary Google Account · Verified Citizen',
    },
    {
      name: 'Disaster Volunteer (Uttarakhand)',
      email: 'nandheesaprasad@gmail.com',
      avatarChar: 'D',
      avatarBg: '#1F1A17',
      roleSubtitle: 'Disaster Safety Network Participant',
    },
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpSent && otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpSent, otpCountdown]);

  const handleSelectAccount = async (account: typeof googleAccounts[0]) => {
    setSelectedEmail(account.email);
    setIsAuthenticating(true);

    try {
      await new Promise((r) => setTimeout(r, 550));
      const ok = await loginWithGoogle(account.email, account.name);
      if (ok) {
        setIsAuthenticating(false);
        onSuccess();
      }
    } catch {
      setIsAuthenticating(false);
    }
  };

  const handleCustomGoogleSubmit = async () => {
    const trimmedEmail = customGoogleEmail.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setGoogleEmailError('Please enter a valid Google Account email (e.g. user@gmail.com)');
      return;
    }
    setGoogleEmailError('');
    setIsAuthenticating(true);
    setSelectedEmail(trimmedEmail);

    try {
      await new Promise((r) => setTimeout(r, 650));
      const resolvedName = customGoogleName.trim() || trimmedEmail.split('@')[0];
      const ok = await loginWithGoogle(trimmedEmail, resolvedName);
      if (ok) {
        setIsAuthenticating(false);
        onSuccess();
      } else {
        setIsAuthenticating(false);
        setGoogleEmailError('Sign-in failed. Please check your credentials.');
      }
    } catch {
      setIsAuthenticating(false);
      setGoogleEmailError('Google authentication timed out.');
    }
  };

  const handleSendOtp = () => {
    if (phoneNumber.trim().length < 10) {
      setOtpError(strings.validPhoneError || 'Please enter a valid 10-digit mobile number');
      return;
    }
    setOtpError('');
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      setOtpSent(true);
      setOtpCountdown(30);
      setOtpCode('528914');
    }, 600);
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length < 4) {
      setOtpError(strings.validOtpError || 'Please enter the 6-digit verification code');
      return;
    }
    setIsAuthenticating(true);
    try {
      await new Promise((r) => setTimeout(r, 550));
      const ok = await loginWithPhoneOtp(phoneNumber, otpCode);
      if (ok) {
        setIsAuthenticating(false);
        onSuccess();
      } else {
        setOtpError('Invalid OTP code. Please retry.');
        setIsAuthenticating(false);
      }
    } catch {
      setIsAuthenticating(false);
      setOtpError('Verification failed. Check network connectivity.');
    }
  };

  const handleEmergencyGuestBypass = async () => {
    setIsAuthenticating(true);
    try {
      await loginAsEmergencyGuest();
      setIsAuthenticating(false);
      onSuccess();
    } catch {
      setIsAuthenticating(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={styles.backdropTouch}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.sheetContainer}>
          {/* Header Drag Handle */}
          <View style={styles.dragHandle} />

          {/* Dual Tab Navigation (Google Identity vs Mobile +91 OTP) */}
          <View style={styles.methodTabsRow}>
            <TouchableOpacity
              style={[
                styles.methodTab,
                authMethod === 'google' && styles.methodTabActive,
              ]}
              onPress={() => setAuthMethod('google')}
              activeOpacity={0.8}
            >
              <GoogleLogoSvg size={16} />
              <Text
                style={[
                  styles.methodTabText,
                  authMethod === 'google' && styles.methodTabTextActive,
                ]}
              >
                {strings.googleIdentityTab || 'Google Account'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodTab,
                authMethod === 'phone' && styles.methodTabActive,
              ]}
              onPress={() => setAuthMethod('phone')}
              activeOpacity={0.8}
            >
              <PhoneSvg />
              <Text
                style={[
                  styles.methodTabText,
                  authMethod === 'phone' && styles.methodTabTextActive,
                ]}
              >
                {strings.mobileOtpTab || 'Mobile +91 OTP'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetScroll}>
            {authMethod === 'google' ? (
              /* GOOGLE SIGN-IN INTERFACE */
              <View style={styles.googleContainer}>
                <View style={styles.googleHeaderRow}>
                  <GoogleLogoSvg size={24} />
                  <View style={styles.googleHeaderTexts}>
                    <Text style={styles.sheetTitle}>
                      {strings.signInWithGoogleTitle || 'Sign In with Google'}
                    </Text>
                    <Text style={styles.sheetSubtitle}>
                      Choose an account or sign in with your Google email
                    </Text>
                  </View>
                </View>

                {/* Pre-Loaded Quick Accounts */}
                <View style={styles.accountsList}>
                  {googleAccounts.map((account) => {
                    const isSelected = selectedEmail === account.email && isAuthenticating;
                    return (
                      <TouchableOpacity
                        key={account.email}
                        style={[styles.accountCard, isSelected && styles.accountCardSelected]}
                        onPress={() => handleSelectAccount(account)}
                        disabled={isAuthenticating}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.avatarCircle, { backgroundColor: account.avatarBg }]}>
                          <Text style={styles.avatarChar}>{account.avatarChar}</Text>
                        </View>
                        <View style={styles.accountInfoCol}>
                          <Text style={styles.accountName} numberOfLines={1}>{account.name}</Text>
                          <Text style={styles.accountEmail} numberOfLines={1}>{account.email}</Text>
                          <Text style={styles.accountRole} numberOfLines={1}>{account.roleSubtitle}</Text>
                        </View>
                        {isSelected ? (
                          <ActivityIndicator size="small" color="#4285F4" />
                        ) : (
                          <Text style={styles.accountChevron}>›</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* ADD ANOTHER / CUSTOM GOOGLE ACCOUNT FORM */}
                {!showCustomGoogleForm ? (
                  <TouchableOpacity
                    style={styles.addAnotherAccountBtn}
                    onPress={() => setShowCustomGoogleForm(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.addAnotherAccountText}>
                      + Sign in with another Google account / अन्य खाता जोड़ें
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.customGoogleBox}>
                    <Text style={styles.customGoogleTitle}>Enter Your Google Credentials</Text>
                    
                    <Text style={styles.inputLabel}>Full Name</Text>
                    <TextInput
                      style={styles.customInput}
                      placeholder="e.g. Ramesh Chandra"
                      placeholderTextColor="#9CA3AF"
                      value={customGoogleName}
                      onChangeText={setCustomGoogleName}
                    />

                    <Text style={styles.inputLabel}>Google / Gmail Address</Text>
                    <TextInput
                      style={styles.customInput}
                      placeholder="your.email@gmail.com"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={customGoogleEmail}
                      onChangeText={(t) => {
                        setCustomGoogleEmail(t);
                        setGoogleEmailError('');
                      }}
                    />

                    {googleEmailError ? (
                      <Text style={styles.errorText}>{googleEmailError}</Text>
                    ) : null}

                    <View style={styles.customBtnRow}>
                      <TouchableOpacity
                        style={styles.customCancelBtn}
                        onPress={() => setShowCustomGoogleForm(false)}
                      >
                        <Text style={styles.customCancelBtnText}>{strings.cancelBtn || 'Cancel'}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.customSubmitBtn}
                        onPress={handleCustomGoogleSubmit}
                        disabled={isAuthenticating}
                      >
                        {isAuthenticating ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Text style={styles.customSubmitBtnText}>Sign In with Google</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ) : (
              /* MOBILE +91 OTP INTERFACE */
              <View style={styles.phoneContainer}>
                <View style={styles.phoneHeaderRow}>
                  <View style={styles.phoneIconCircle}>
                    <PhoneSvg />
                  </View>
                  <View style={styles.googleHeaderTexts}>
                    <Text style={styles.sheetTitle}>
                      {strings.citizenMobileLoginTitle || 'Citizen Mobile OTP'}
                    </Text>
                    <Text style={styles.sheetSubtitle}>
                      Official SMS OTP verification for hill citizens
                    </Text>
                  </View>
                </View>

                {!otpSent ? (
                  <View style={styles.phoneInputSection}>
                    <Text style={styles.inputLabel}>
                      {(strings as any).enterPhonePrompt || 'Enter 10-Digit Mobile Number'}
                    </Text>
                    <View style={styles.phoneInputRow}>
                      <View style={styles.countryCodeBadge}>
                        <Svg width={18} height={12} viewBox="0 0 30 20">
                          <Rect x="0" y="0" width="30" height="6.66" fill="#FF9933" />
                          <Rect x="0" y="6.66" width="30" height="6.66" fill="#FFFFFF" />
                          <Rect x="0" y="13.33" width="30" height="6.66" fill="#138808" />
                          <Circle cx="15" cy="10" r="2.5" fill="#000080" />
                        </Svg>
                        <Text style={styles.countryCodeText}>+91</Text>
                      </View>
                      <TextInput
                        style={styles.phoneInput}
                        placeholder="98765 43210"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="phone-pad"
                        maxLength={10}
                        value={phoneNumber}
                        onChangeText={(t) => {
                          setPhoneNumber(t);
                          setOtpError('');
                        }}
                      />
                    </View>

                    {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}

                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={handleSendOtp}
                      disabled={isAuthenticating}
                      activeOpacity={0.85}
                    >
                      {isAuthenticating ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <Text style={styles.actionBtnText}>
                          {strings.sendOtpBtn || 'Send 6-Digit OTP via SMS'}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.otpInputSection}>
                    <View style={styles.otpSentBadge}>
                      <Text style={styles.otpSentText}>
                        OTP dispatched to +91 {phoneNumber}
                      </Text>
                      <TouchableOpacity onPress={() => setOtpSent(false)}>
                        <Text style={styles.editPhoneLink}>Edit</Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.inputLabel}>Enter 6-Digit Verification Code</Text>
                    <TextInput
                      style={styles.otpInput}
                      placeholder="528914"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="number-pad"
                      maxLength={6}
                      value={otpCode}
                      onChangeText={(t) => {
                        setOtpCode(t);
                        setOtpError('');
                      }}
                    />

                    {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}

                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={handleVerifyOtp}
                      disabled={isAuthenticating}
                      activeOpacity={0.85}
                    >
                      {isAuthenticating ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <Text style={styles.actionBtnText}>
                          {strings.verifyOtpBtn || 'Verify OTP & Enter App'}
                        </Text>
                      )}
                    </TouchableOpacity>

                    <View style={styles.resendRow}>
                      <Text style={styles.resendHint}>Didn't receive SMS? </Text>
                      {otpCountdown > 0 ? (
                        <Text style={styles.resendTimer}>Resend in {otpCountdown}s</Text>
                      ) : (
                        <TouchableOpacity onPress={handleSendOtp}>
                          <Text style={styles.resendActiveText}>Resend OTP</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* 1-Tap Offline Emergency Guest Bypass */}
            <TouchableOpacity
              style={styles.guestBypassBtn}
              onPress={handleEmergencyGuestBypass}
              activeOpacity={0.7}
            >
              <Text style={styles.guestBypassText}>
                {strings.continueOfflineGuest || 'Continue as Offline Guest (Emergency Bypass)'} ›
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(31, 26, 23, 0.65)',
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 28,
    maxHeight: '90%',
    shadowColor: '#1F1A17',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  dragHandle: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#D1CCC6',
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetScroll: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  methodTabsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#F3EFEA',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  methodTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 9,
    gap: 8,
  },
  methodTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#1F1A17',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  methodTabText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#827C77',
  },
  methodTabTextActive: {
    color: '#1F1A17',
  },

  googleContainer: {
    width: '100%',
  },
  googleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  googleHeaderTexts: {
    flex: 1,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F1A17',
  },
  sheetSubtitle: {
    fontSize: 12,
    color: '#827C77',
    marginTop: 2,
  },

  accountsList: {
    gap: 10,
    marginBottom: 14,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF9F6',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8E4DF',
    gap: 12,
  },
  accountCardSelected: {
    borderColor: '#4285F4',
    backgroundColor: '#F0F6FF',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarChar: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  accountInfoCol: {
    flex: 1,
  },
  accountName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1F1A17',
  },
  accountEmail: {
    fontSize: 11.5,
    color: '#827C77',
    marginTop: 1,
  },
  accountRole: {
    fontSize: 10.5,
    color: '#8C5338',
    fontWeight: '600',
    marginTop: 2,
  },
  accountChevron: {
    fontSize: 20,
    color: '#A8A29E',
    fontWeight: '600',
  },

  addAnotherAccountBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F8F6F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E4DF',
    marginBottom: 16,
  },
  addAnotherAccountText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#8C5338',
  },

  customGoogleBox: {
    backgroundColor: '#FAF9F6',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D1CCC6',
    marginBottom: 16,
  },
  customGoogleTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1F1A17',
    marginBottom: 10,
  },
  customInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E4DF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1F1A17',
    marginBottom: 10,
  },
  customBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  customCancelBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#EFEBE6',
  },
  customCancelBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#5C5651',
  },
  customSubmitBtn: {
    flex: 2,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#4285F4',
  },
  customSubmitBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  phoneContainer: {
    width: '100%',
  },
  phoneHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  phoneIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5EBE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneInputSection: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#5C5651',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  phoneInputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  countryCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#E8E4DF',
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F1A17',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#E8E4DF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1F1A17',
    fontWeight: '600',
  },
  actionBtn: {
    backgroundColor: '#8C5338',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#8C5338',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  otpInputSection: {
    width: '100%',
  },
  otpSentBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  otpSentText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
  },
  editPhoneLink: {
    fontSize: 12,
    fontWeight: '800',
    color: '#166534',
    textDecorationLine: 'underline',
  },
  otpInput: {
    backgroundColor: '#FAF9F6',
    borderWidth: 1.5,
    borderColor: '#8C5338',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 20,
    color: '#1F1A17',
    fontWeight: '800',
    letterSpacing: 6,
    textAlign: 'center',
    marginBottom: 14,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  resendHint: {
    fontSize: 12,
    color: '#827C77',
  },
  resendTimer: {
    fontSize: 12,
    fontWeight: '700',
    color: '#827C77',
  },
  resendActiveText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8C5338',
  },

  errorText: {
    fontSize: 11.5,
    color: '#BA1A1A',
    marginBottom: 10,
    fontWeight: '600',
  },

  guestBypassBtn: {
    marginTop: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  guestBypassText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#BA1A1A',
    textDecorationLine: 'underline',
  },
});
