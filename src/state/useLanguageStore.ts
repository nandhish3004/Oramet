import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TRANSLATIONS, TranslationStrings, SUPPORTED_LANGUAGES, LanguageMeta } from '../services/i18n/languageData';

const LANGUAGE_STORAGE_KEY = '@oramet_selected_language';

interface LanguageState {
  currentLanguage: string;
  strings: TranslationStrings;
  availableLanguages: LanguageMeta[];
  setLanguage: (code: string) => Promise<void>;
  loadSavedLanguage: () => Promise<void>;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  currentLanguage: 'en',
  strings: TRANSLATIONS['en'],
  availableLanguages: SUPPORTED_LANGUAGES,

  setLanguage: async (code: string) => {
    const targetStrings = TRANSLATIONS[code] || TRANSLATIONS['en'];
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    } catch (e) {
      console.error('Failed to save language preference', e);
    }
    set({
      currentLanguage: code,
      strings: targetStrings,
    });
  },

  loadSavedLanguage: async () => {
    try {
      const savedCode = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedCode && TRANSLATIONS[savedCode]) {
        set({
          currentLanguage: savedCode,
          strings: TRANSLATIONS[savedCode],
        });
      }
    } catch (e) {
      console.error('Failed to load language preference', e);
    }
  },
}));
