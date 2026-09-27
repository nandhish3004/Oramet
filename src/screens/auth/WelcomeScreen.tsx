import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../state/useAuthStore';
import { useLanguageStore } from '../../state/useLanguageStore';
import { AppLogo } from '../../components/AppLogo';
import { TelemetryLogos } from '../../components/TelemetryLogos';
import { GoogleSignInSheet, GoogleLogoSvg } from '../../components/GoogleSignInSheet';
import { LanguagePickerModal } from '../../components/LanguagePickerModal';
import { TribalUserVisualGuideModal } from '../../components/TribalUserVisualGuideModal';
import { Colors, FontSize, Spacing, BorderRadius } from '../../theme/colors';

const { width } = Dimensions.get('window');

// Clean SVG Vector Icons (Zero Emojis)
const ClockSvg = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="10" stroke="#8C5338" strokeWidth="2" fill="none" />
    <Path d="M12 6v6l4 2" stroke="#8C5338" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const MountainSvg = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M3 20l9-14 4 6 5-8 3 16H3z" stroke="#166534" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const RadioTowerSvg = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="2" fill="#BA1A1A" />
    <Path d="M16.24 7.76a6 6 0 0 1 0 8.49M7.76 16.24a6 6 0 0 1 0-8.49M19.07 4.93a10 10 0 0 1 0 14.14M4.93 19.07a10 10 0 0 1 0-14.14" stroke="#BA1A1A" strokeWidth="2" strokeLinecap="round" fill="none" />
  </Svg>
);

const GlobeIconSvg = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#8C5338" strokeWidth="2">
    <Circle cx="12" cy="12" r="10" />
    <Path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </Svg>
);

const QUICK_LANGUAGES: { code: string; name: string; nativeName: string }[] = [
  { code: 'gar', name: 'Garhwali', nativeName: 'गढ़वाली' },
  { code: 'kum', name: 'Kumaoni', nativeName: 'कुमाऊँनी' },
  { code: 'pah', name: 'Himachali', nativeName: 'हिमाचली' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'dog', name: 'Dogri', nativeName: 'डोगरी' },
  { code: 'nep', name: 'Nepali', nativeName: 'नेपाली' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
];

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { loginAsEmergencyGuest } = useAuthStore();
  const { currentLanguage, setLanguage, strings } = useLanguageStore();
  const [googleSheetVisible, setGoogleSheetVisible] = useState(false);
  const [langPickerVisible, setLangPickerVisible] = useState(false);
  const [visualGuideVisible, setVisualGuideVisible] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const activeLangObj = QUICK_LANGUAGES.find((l) => l.code === currentLanguage) || {
    name: 'Garhwali',
    nativeName: 'गढ़वाली',
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* MANDATORY PRE-LOGIN LANGUAGE SELECTION BAR */}
        <View style={styles.topLanguageBar}>
          <View style={styles.activeLangPill}>
            <GlobeIconSvg />
            <Text style={styles.activeLangText}>
              {activeLangObj.nativeName} ({activeLangObj.name})
            </Text>
          </View>
          <TouchableOpacity
            style={styles.changeLangBtn}
            onPress={() => setLangPickerVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.changeLangBtnText}>
              {strings.changeAction || 'Change / भाषा बदलें'} ›
            </Text>
          </TouchableOpacity>
        </View>

        {/* HORIZONTAL QUICK DIALECT SELECTOR CHIPS */}
        <View style={styles.quickDialectContainer}>
          <Text style={styles.quickDialectLabel}>
            Select Your Regional Language / अपनी स्थानीय भाषा चुनें:
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickDialectScroll}
          >
            {QUICK_LANGUAGES.map((lang) => {
              const isSelected = currentLanguage === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.dialectChip,
                    isSelected && styles.dialectChipSelected,
                  ]}
                  onPress={() => setLanguage(lang.code)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.dialectChipText,
                      isSelected && styles.dialectChipTextSelected,
                    ]}
                  >
                    {lang.nativeName}
                  </Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={styles.dialectChipMore}
              onPress={() => setLangPickerVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.dialectChipMoreText}>+ 17 Languages ›</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Top Live Satellite Operational Status Pill */}
        <Animated.View style={[styles.liveStatusRow, { opacity: fadeAnim }]}>
          <View style={styles.livePulseDot} />
          <Text style={styles.liveStatusText} numberOfLines={1}>
            PROTOTYPE · OFFICIAL AGENCY FEEDS NOT CONNECTED
          </Text>
        </Animated.View>

        {/* Hero Branding Section */}
        <Animated.View
          style={[
            styles.heroSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.logoWrapper}>
            <AppLogo size={76} />
          </View>

          <View style={styles.titleSection}>
            <View style={styles.govTag}>
              <Text style={styles.govTagText}>SIH 2026 CONCEPT · NOT AN OFFICIAL GOVERNMENT APP</Text>
            </View>
            <Text style={styles.appName}>OraMet</Text>
            <Text style={styles.appSubtitle}>
              {strings.appSubtitle || 'Early Warning & Evacuation Intelligence'}
            </Text>
            <Text style={styles.appDescription}>
              Local weather context, mapped nearby places, and emergency contact tools. Official hazard feeds, shelter verification, and background alert delivery are not configured.
            </Text>
          </View>
        </Animated.View>

        {/* Data availability summary */}
        <Animated.View style={[styles.telemetrySection, { opacity: fadeAnim }]}>
          <TelemetryLogos />
        </Animated.View>

        {/* Key Product Capabilities */}
        <Animated.View
          style={[
            styles.highlightsCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.highlightItem}>
            <View style={styles.hlIconCircle}>
              <ClockSvg />
            </View>
            <View style={styles.hlTextCol}>
              <Text style={styles.hlTitle}>Actionable Evacuation Lead-Time</Text>
              <Text style={styles.hlSub}>Computes exact minutes until maximum runoff crest</Text>
            </View>
          </View>

          <View style={styles.highlightItem}>
            <View style={[styles.hlIconCircle, { backgroundColor: '#F0FDF4' }]}>
              <MountainSvg />
            </View>
            <View style={styles.hlTextCol}>
              <Text style={styles.hlTitle}>High-Ground Navigation Corridors</Text>
              <Text style={styles.hlSub}>Uphill safe evacuation routing avoiding flooded valleys</Text>
            </View>
          </View>

          <View style={styles.highlightItem}>
            <View style={[styles.hlIconCircle, { backgroundColor: '#FEF2F2' }]}>
              <RadioTowerSvg />
            </View>
            <View style={styles.hlTextCol}>
              <Text style={styles.hlTitle}>Zero-Network 112 SMS Fallback</Text>
              <Text style={styles.hlSub}>Dispatches exact coordinates when cellular data fails</Text>
            </View>
          </View>
        </Animated.View>

        {/* Action Buttons Section */}
        <Animated.View
          style={[
            styles.actionSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Real Google Account Login Button */}
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={() => setGoogleSheetVisible(true)}
            activeOpacity={0.85}
          >
            <GoogleLogoSvg size={22} />
            <View style={styles.googleBtnTextCol}>
              <Text style={styles.googleBtnText}>
                {strings.signInWithGoogleTitle || 'Sign In with Google Account'}
              </Text>
              <Text style={styles.googleBtnSub}>
                Use your Google / Gmail account or mobile OTP
              </Text>
            </View>
          </TouchableOpacity>

          {/* Primary Action Button: Open Live Telemetry Dashboard */}
          <TouchableOpacity
            style={styles.primaryActionBtn}
            onPress={() => setGoogleSheetVisible(true)}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={['#8C5338', '#A26244']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBtnContent}
            >
              <Text style={styles.primaryActionText}>
                {strings.liveWatchHeader || 'Open Live Telemetry Dashboard'}
              </Text>
              <Text style={styles.primaryActionSub}>
                Automated sensor feeds and hyper-local alerts
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Emergency Direct Guest Bypass */}
          {/* Emergency Direct Guest Bypass */}
          <TouchableOpacity
            style={styles.emergencyBypassBtn}
            onPress={() => loginAsEmergencyGuest()}
            activeOpacity={0.75}
          >
            <Text style={styles.emergencyBypassText}>
              बिना लॉगिन तुरंत शुरू करें (नागरिक मोड) · Enter Without Login (Citizen Mode) ›
            </Text>
          </TouchableOpacity>

          {/* Simple Visual Guide for Rural & Tribal Citizens */}
          <TouchableOpacity
            style={styles.visualGuideWelcomeBtn}
            onPress={() => setVisualGuideVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.visualGuideWelcomeBtnText}>
              चित्र निर्देशिका · Simple Visual Guide (बिना पढ़े समझें)
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Security & Data Accreditation Footer */}
        <View style={styles.footerNote}>
          <Text style={styles.footerNoteText}>
            Public Open Data Feeds: NASA GPM, ISRO MOSDAC, IMD Doppler, GSI DEM, CWC Telemetry, and WMO Digital Twin.
          </Text>
        </View>
      </ScrollView>

      {/* Official Google & Mobile OTP Sign-In Sheet */}
      <GoogleSignInSheet
        visible={googleSheetVisible}
        onClose={() => setGoogleSheetVisible(false)}
        onSuccess={() => {
          setGoogleSheetVisible(false);
        }}
      />

      {/* Full 17-Language Selection Modal */}
      <LanguagePickerModal
        visible={langPickerVisible}
        onClose={() => setLangPickerVisible(false)}
      />

      {/* Pictorial Visual Guide for Non-Literate & Tribal Users */}
      <TribalUserVisualGuideModal
        visible={visualGuideVisible}
        onClose={() => setVisualGuideVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F6F2',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 40,
    alignItems: 'center',
  },

  topLanguageBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E8E4DF',
    marginBottom: 12,
    shadowColor: '#1F1A17',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  activeLangPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  activeLangText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F1A17',
    flexShrink: 1,
  },
  changeLangBtn: {
    backgroundColor: '#F3EFEA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1CCC6',
  },
  changeLangBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8C5338',
  },

  quickDialectContainer: {
    width: '100%',
    marginBottom: 14,
  },
  quickDialectLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#827C77',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  quickDialectScroll: {
    gap: 8,
    paddingRight: 10,
  },
  dialectChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E4DF',
  },
  dialectChipSelected: {
    backgroundColor: '#8C5338',
    borderColor: '#8C5338',
  },
  dialectChipText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1F1A17',
  },
  dialectChipTextSelected: {
    color: '#FFFFFF',
  },
  dialectChipMore: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0ECE6',
    borderWidth: 1,
    borderColor: '#D1CCC6',
    justifyContent: 'center',
  },
  dialectChipMoreText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#8C5338',
  },

  liveStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
    maxWidth: '100%',
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#16A34A',
  },
  liveStatusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#166534',
    letterSpacing: 0.5,
    flexShrink: 1,
  },

  heroSection: {
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  logoWrapper: {
    marginBottom: 12,
  },
  titleSection: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  govTag: {
    backgroundColor: '#EFEBE6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  govTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#8C5338',
    letterSpacing: 0.8,
  },
  appName: {
    fontSize: 34,
    fontWeight: '900',
    color: '#1F1A17',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8C5338',
    marginTop: 2,
    marginBottom: 8,
    textAlign: 'center',
  },
  appDescription: {
    fontSize: 12.5,
    color: '#5C5651',
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: width * 0.9,
  },

  telemetrySection: {
    width: '100%',
    marginBottom: 16,
  },

  highlightsCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E4DF',
    gap: 14,
    marginBottom: 20,
    shadowColor: '#1F1A17',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hlIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F5EBE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hlTextCol: {
    flex: 1,
  },
  hlTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1F1A17',
    marginBottom: 2,
  },
  hlSub: {
    fontSize: 11.5,
    color: '#827C77',
    lineHeight: 16,
  },

  actionSection: {
    width: '100%',
    gap: 12,
  },
  googleBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#4285F4',
    shadowColor: '#1F1A17',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    gap: 12,
  },
  googleBtnTextCol: {
    flex: 1,
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F1A17',
  },
  googleBtnSub: {
    fontSize: 11,
    color: '#827C77',
    marginTop: 2,
  },

  primaryActionBtn: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#8C5338',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  gradientBtnContent: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  primaryActionSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.88)',
    marginTop: 2,
  },

  emergencyBypassBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyBypassText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#BA1A1A',
    textDecorationLine: 'underline',
  },

  visualGuideWelcomeBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#E8E4DF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  visualGuideWelcomeBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#8C5338',
  },

  footerNote: {
    marginTop: 20,
    paddingHorizontal: 12,
  },
  footerNoteText: {
    fontSize: 10.5,
    color: '#A8A29E',
    textAlign: 'center',
    lineHeight: 15,
  },
});
