import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useLanguageStore } from '../../state/useLanguageStore';
import { SUPPORTED_LANGUAGES, LanguageMeta } from '../../services/i18n/languageData';
import { Colors, FontSize, Spacing, BorderRadius } from '../../theme/colors';

const MountainIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 20L10 6L14 13L17 8L22 20H3Z"
      stroke="#8C5338"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CheckIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6L9 17L4 12"
      stroke="#FFFFFF"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const LanguageSelectScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { currentLanguage, setLanguage, strings } = useLanguageStore();
  const [selectedCode, setSelectedCode] = useState(currentLanguage || 'en');

  const handleSelectLanguage = async (code: string) => {
    setSelectedCode(code);
    await setLanguage(code);
  };

  const handleContinue = async () => {
    await setLanguage(selectedCode);
    navigation.navigate('Welcome');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F6F2" />

      {/* Top Brand Header */}
      <View style={styles.topHeader}>
        <View style={styles.badgeRow}>
          <MountainIcon />
          <Text style={styles.badgeText}>HIMALAYAN EARLY WARNING INITIATIVE</Text>
        </View>
        <Text style={styles.headline}>अपनी भाषा चुनें</Text>
        <Text style={styles.subHeadline}>
          Select your dialect or language for life-saving flood & landslide alerts
        </Text>
        <View style={styles.divider} />
      </View>

      {/* Language Selection Grid */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {SUPPORTED_LANGUAGES.map((lang: LanguageMeta) => {
            const isSelected = selectedCode === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                style={[styles.langCard, isSelected && styles.langCardSelected]}
                onPress={() => handleSelectLanguage(lang.code)}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeader}>
                  <Text
                    style={[
                      styles.nativeNameText,
                      isSelected && styles.nativeNameTextSelected,
                    ]}
                  >
                    {lang.nativeName}
                  </Text>
                  {isSelected ? (
                    <View style={styles.selectedCircle}>
                      <CheckIcon />
                    </View>
                  ) : (
                    <View style={styles.unselectedCircle} />
                  )}
                </View>
                <Text
                  style={[
                    styles.englishNameText,
                    isSelected && styles.englishNameTextSelected,
                  ]}
                >
                  {lang.name}
                </Text>
                <Text
                  style={[
                    styles.regionText,
                    isSelected && styles.regionTextSelected,
                  ]}
                  numberOfLines={2}
                >
                  {lang.region}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>
            आगे बढ़ें · Continue to Login / Login के लिए आगे बढ़ें
          </Text>
        </TouchableOpacity>
        <Text style={styles.bottomHint}>
          You can change your language anytime from app settings
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F6F2',
  },
  topHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#F8F6F2',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#8C5338',
    letterSpacing: 0.8,
  },
  headline: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1F1A17',
    letterSpacing: -0.5,
  },
  subHeadline: {
    fontSize: 13,
    color: '#827C77',
    marginTop: 4,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E4DF',
    marginTop: 14,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  grid: {
    gap: 10,
  },
  langCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E8E4DF',
    shadowColor: '#1F1A17',
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  langCardSelected: {
    borderColor: '#8C5338',
    backgroundColor: '#FFFBF9',
    shadowColor: '#8C5338',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  nativeNameText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F1A17',
  },
  nativeNameTextSelected: {
    color: '#8C5338',
  },
  selectedCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#8C5338',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unselectedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D4CECA',
  },
  englishNameText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#827C77',
    marginBottom: 4,
  },
  englishNameTextSelected: {
    color: '#8C5338',
  },
  regionText: {
    fontSize: 11.5,
    color: '#9C9690',
    lineHeight: 15,
  },
  regionTextSelected: {
    color: '#827C77',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E4DF',
    shadowColor: '#1F1A17',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  continueBtn: {
    backgroundColor: '#8C5338',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  bottomHint: {
    fontSize: 11,
    color: '#9C9690',
    textAlign: 'center',
    marginTop: 8,
  },
});
