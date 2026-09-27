import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import Svg, { Path, Line } from 'react-native-svg';
import { useLanguageStore } from '../state/useLanguageStore';
import { SUPPORTED_LANGUAGES, LanguageMeta } from '../services/i18n/languageData';
import { Colors, FontSize, Spacing, BorderRadius } from '../theme/colors';

interface LanguagePickerModalProps {
  visible: boolean;
  onClose: () => void;
}

export const LanguagePickerModal: React.FC<LanguagePickerModalProps> = ({
  visible,
  onClose,
}) => {
  const { currentLanguage, setLanguage } = useLanguageStore();

  const hillyLanguages = SUPPORTED_LANGUAGES.filter((l) => Boolean(l.isHillyFocus));
  const generalLanguages = SUPPORTED_LANGUAGES.filter((l) => !l.isHillyFocus);

  const handleSelect = async (code: string) => {
    await setLanguage(code);
    onClose();
  };

  const renderLanguageItem = (lang: LanguageMeta) => {
    const isSelected = currentLanguage === lang.code;

    return (
      <TouchableOpacity
        key={lang.code}
        style={[styles.langItem, isSelected && styles.langItemSelected]}
        onPress={() => handleSelect(lang.code)}
        activeOpacity={0.7}
      >
        <View style={styles.langItemLeft}>
          <View
            style={[
              styles.langCodeBadge,
              isSelected && { backgroundColor: '#8C5338' },
            ]}
          >
            <Text
              style={[
                styles.langCodeText,
                isSelected && { color: '#FFFFFF' },
              ]}
            >
              {lang.code.toUpperCase()}
            </Text>
          </View>
          <View>
            <View style={styles.nameRow}>
              <Text style={styles.nativeNameText}>{lang.nativeName}</Text>
              <Text style={styles.englishNameText}>({lang.name})</Text>
            </View>
            <Text style={styles.regionText}>{lang.region}</Text>
          </View>
        </View>

        {isSelected ? (
          <View style={styles.checkCircle}>
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={3}>
              <Path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          <View style={styles.sheetHandle} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <View style={styles.titleRow}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#8C5338" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </Svg>
                <Text style={styles.headerTitle}>Select Local Language</Text>
              </View>
              <Text style={styles.headerSubtitle}>
                Himalayan, Western Ghats & Indian disaster zone dialects
              </Text>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#1F1A17" strokeWidth={2.5} strokeLinecap="round">
                <Line x1="18" y1="6" x2="6" y2="18" />
                <Line x1="6" y1="6" x2="18" y2="18" />
              </Svg>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
            {/* SECTION 1: Hilly Region Focus */}
            <View style={styles.sectionBadgeRow}>
              <View style={styles.mountainDot} />
              <Text style={styles.sectionHeaderTitle}>
                HIMALAYAN & HILLY REGION DIALECTS (ESPECIALLY HILLS)
              </Text>
            </View>
            <View style={styles.itemsGroup}>
              {hillyLanguages.map(renderLanguageItem)}
            </View>

            {/* SECTION 2: General Regional Languages */}
            <View style={[styles.sectionBadgeRow, { marginTop: 18 }]}>
              <Text style={styles.sectionHeaderTitle}>
                SCHEDULED REGIONAL & NATIONAL LANGUAGES
              </Text>
            </View>
            <View style={styles.itemsGroup}>
              {generalLanguages.map(renderLanguageItem)}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(31, 26, 23, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#F8F6F2',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '86%',
    borderWidth: 1,
    borderColor: '#EFECE6',
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D9D3C9',
    alignSelf: 'center',
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFECE6',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F1A17',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: '#827C77',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0EEE9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F1A17',
  },

  scrollList: {
    paddingBottom: 20,
  },
  sectionBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  mountainDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8C5338',
  },
  sectionHeaderTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8C5338',
    letterSpacing: 0.6,
  },
  itemsGroup: {
    gap: 8,
  },
  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EFECE6',
    borderRadius: 16,
    padding: 12,
  },
  langItemSelected: {
    borderColor: '#8C5338',
    backgroundColor: '#F5ECE6',
  },
  langItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  langCodeBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F0EEE9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  langCodeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#1F1A17',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nativeNameText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#1F1A17',
  },
  englishNameText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#827C77',
  },
  regionText: {
    fontSize: 11,
    color: '#827C77',
    marginTop: 1,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#8C5338',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
