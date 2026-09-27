import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import Svg, { Path, Circle, Rect, Polygon, G, Text as SvgText } from 'react-native-svg';
import { Colors, FontSize, Spacing, BorderRadius } from '../theme/colors';
import { useLanguageStore } from '../state/useLanguageStore';

const { width } = Dimensions.get('window');

// 1. Safe Mountain Illustration (Green)
const CalmRiverSvg = () => (
  <Svg width={72} height={72} viewBox="0 0 100 100">
    <Circle cx="50" cy="50" r="46" fill="#DCFCE7" />
    <Polygon points="20,70 45,30 65,65 50,70" fill="#16A34A" opacity={0.8} />
    <Polygon points="40,70 65,22 90,70" fill="#15803D" />
    <Path
      d="M10 75 Q 30 70, 50 75 T 90 75"
      stroke="#38BDF8"
      strokeWidth={5}
      fill="none"
      strokeLinecap="round"
    />
    <Circle cx="50" cy="50" r="46" stroke="#16A34A" strokeWidth={2} fill="none" />
  </Svg>
);

// 2. Alert Cloudburst Illustration (Yellow)
const CloudburstSvg = () => (
  <Svg width={72} height={72} viewBox="0 0 100 100">
    <Circle cx="50" cy="50" r="46" fill="#FEF3C7" />
    <Polygon points="30,75 55,35 80,75" fill="#B45309" opacity={0.7} />
    {/* Dark Cloud */}
    <Path
      d="M35 48 C 30 48, 25 43, 28 38 C 29 32, 38 30, 42 34 C 45 30, 58 30, 62 36 C 66 40, 64 48, 60 48 Z"
      fill="#475569"
    />
    {/* Rain drops */}
    <Path d="M38 54 L34 62" stroke="#0284C7" strokeWidth={3} strokeLinecap="round" />
    <Path d="M48 54 L44 62" stroke="#0284C7" strokeWidth={3} strokeLinecap="round" />
    <Path d="M58 54 L54 62" stroke="#0284C7" strokeWidth={3} strokeLinecap="round" />
    <Circle cx="50" cy="50" r="46" stroke="#F59E0B" strokeWidth={2} fill="none" />
  </Svg>
);

// 3. Danger Evacuation Illustration (Red)
const EvacuationHillSvg = () => (
  <Svg width={72} height={72} viewBox="0 0 100 100">
    <Circle cx="50" cy="50" r="46" fill="#FEE2E2" />
    {/* Raging flood water */}
    <Path
      d="M10 80 Q 25 70, 40 80 T 70 80 T 95 80"
      stroke="#DC2626"
      strokeWidth={6}
      fill="none"
      strokeLinecap="round"
    />
    {/* High Ridge Refuge */}
    <Polygon points="35,70 65,25 95,70" fill="#991B1B" />
    {/* Evacuation Arrow UP */}
    <Path
      d="M25 65 L25 35 M25 35 L17 43 M25 35 L33 43"
      stroke="#DC2626"
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="50" cy="50" r="46" stroke="#DC2626" strokeWidth={2} fill="none" />
  </Svg>
);

// 4. SOS Phone Shake Illustration
const ShakePhoneSvg = () => (
  <Svg width={72} height={72} viewBox="0 0 100 100">
    <Circle cx="50" cy="50" r="46" fill="#FFF1F2" />
    {/* Smartphone */}
    <Rect
      x="36"
      y="24"
      width="28"
      height="52"
      rx="5"
      fill="#8C5338"
      stroke="#1F1A17"
      strokeWidth={2}
    />
    <Rect x="40" y="30" width="20" height="36" rx="2" fill="#FFFFFF" />
    <Circle cx="50" cy="71" r="2" fill="#E8E4DF" />
    {/* Shake shockwaves */}
    <Path
      d="M26 38 C 22 44, 22 56, 26 62"
      stroke="#E11D48"
      strokeWidth={3}
      strokeLinecap="round"
      fill="none"
    />
    <Path
      d="M74 38 C 78 44, 78 56, 74 62"
      stroke="#E11D48"
      strokeWidth={3}
      strokeLinecap="round"
      fill="none"
    />
    <Circle cx="50" cy="50" r="46" stroke="#E11D48" strokeWidth={2} fill="none" />
  </Svg>
);

interface TribalUserVisualGuideModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenVoiceAdvisory?: () => void;
}

export const TribalUserVisualGuideModal: React.FC<TribalUserVisualGuideModalProps> = ({
  visible,
  onClose,
  onOpenVoiceAdvisory,
}) => {
  const { currentLanguage } = useLanguageStore();

  const isHindiFamily = ['hi', 'gar', 'kum', 'pah', 'dog', 'nep'].includes(currentLanguage);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headline}>
                {isHindiFamily ? 'चित्र निर्देशिका · कैसे उपयोग करें' : 'Visual Guide · How To Use'}
              </Text>
              <Text style={styles.subHeadline}>
                {isHindiFamily
                  ? 'सरल रंगों और इशारों से समझें (No reading required)'
                  : 'Understand safety alerts easily with simple visual signs'}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Visual Step 1: Green */}
            <View style={[styles.guideCard, { borderColor: '#86EFAC', backgroundColor: '#F0FDF4' }]}>
              <CalmRiverSvg />
              <View style={styles.cardContent}>
                <View style={[styles.colorPill, { backgroundColor: '#DCFCE7' }]}>
                  <Text style={[styles.colorPillText, { color: '#166534' }]}>
                    🟢 {isHindiFamily ? 'हरा रंग = बिल्कुल सुरक्षित' : 'GREEN = SAFE'}
                  </Text>
                </View>
                <Text style={styles.cardTitle}>
                  {isHindiFamily ? 'नदियाँ शांत हैं' : 'Rivers Normal & Safe'}
                </Text>
                <Text style={styles.cardDesc}>
                  {isHindiFamily
                    ? 'पानी का स्तर सामान्य है। आप अपने घर, खेत और रोज़ाना के काम बिना किसी चिंता के कर सकते हैं।'
                    : 'Water levels are within normal limits. Safe to stay home and carry out routine mountain activities.'}
                </Text>
              </View>
            </View>

            {/* Visual Step 2: Yellow */}
            <View style={[styles.guideCard, { borderColor: '#FDE68A', backgroundColor: '#FFFBEB' }]}>
              <CloudburstSvg />
              <View style={styles.cardContent}>
                <View style={[styles.colorPill, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={[styles.colorPillText, { color: '#B45309' }]}>
                    🟡 {isHindiFamily ? 'पीला रंग = सावधान रहें' : 'YELLOW = BE ALERT'}
                  </Text>
                </View>
                <Text style={styles.cardTitle}>
                  {isHindiFamily ? 'पहाड़ों में भारी बारिश' : 'Heavy Mountain Rain'}
                </Text>
                <Text style={styles.cardDesc}>
                  {isHindiFamily
                    ? 'नदी-नालों और खड्डों के पास मत जाएं। मिट्टी धंसने और अचानक पानी बढ़ने का खतरा है।'
                    : 'Heavy rainfall in upper catchment. Stay away from riverbanks, stream beds, and loose hill slopes.'}
                </Text>
              </View>
            </View>

            {/* Visual Step 3: Red */}
            <View style={[styles.guideCard, { borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' }]}>
              <EvacuationHillSvg />
              <View style={styles.cardContent}>
                <View style={[styles.colorPill, { backgroundColor: '#FEE2E2' }]}>
                  <Text style={[styles.colorPillText, { color: '#DC2626' }]}>
                    🔴 {isHindiFamily ? 'लाल रंग = तुरंत ऊंचे स्थान भागें' : 'RED = RUN UPHILL'}
                  </Text>
                </View>
                <Text style={styles.cardTitle}>
                  {isHindiFamily ? 'बाढ़ का जलस्तर बहुत तेज!' : 'Flash Flood Warning!'}
                </Text>
                <Text style={styles.cardDesc}>
                  {isHindiFamily
                    ? 'नीचे घाटी से तुरंत ऊपर पक्की पहाड़ी या सरकारी शरण शिविर (Safe Haven) की ओर चलें।'
                    : 'Immediate evacuation required. Move uphill to high-elevation roads or designated relief camps.'}
                </Text>
              </View>
            </View>

            {/* Visual Step 4: SOS Shake */}
            <View style={[styles.guideCard, { borderColor: '#FECDD3', backgroundColor: '#FFF1F2' }]}>
              <ShakePhoneSvg />
              <View style={styles.cardContent}>
                <View style={[styles.colorPill, { backgroundColor: '#FFE4E6' }]}>
                  <Text style={[styles.colorPillText, { color: '#E11D48' }]}>
                    🆘 {isHindiFamily ? 'फोन को 3 बार हिलाएं' : 'SHAKE PHONE 3 TIMES'}
                  </Text>
                </View>
                <Text style={styles.cardTitle}>
                  {isHindiFamily ? '112 आपातकालीन मदद' : 'Instant 112 Help'}
                </Text>
                <Text style={styles.cardDesc}>
                  {isHindiFamily
                    ? 'मुसीबत में फोन को तेज़ी से 3 बार हिलाएं या 112 बटन दबाएं। आपकी जीपीएस लोकेशन तुरंत बचाव दल तक पहुंच जाएगी।'
                    : 'In danger, shake your phone vigorously 3 times or tap 112. Your coordinates will be sent to disaster response.'}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={onClose}
              activeOpacity={0.85}
            >
              <Text style={styles.doneBtnText}>
                {isHindiFamily ? 'समझ गए · ऐप पर वापस जाएं' : 'Understood · Return to App'}
              </Text>
            </TouchableOpacity>
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
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    maxHeight: '88%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E4DF',
    marginBottom: 12,
  },
  headline: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1F1A17',
  },
  subHeadline: {
    fontSize: 12,
    color: '#827C77',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F6F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#827C77',
  },
  scroll: {
    marginBottom: 8,
  },
  guideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 12,
    gap: 14,
  },
  cardContent: {
    flex: 1,
  },
  colorPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 4,
  },
  colorPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#1F1A17',
    marginBottom: 3,
  },
  cardDesc: {
    fontSize: 11.5,
    color: '#4B5563',
    lineHeight: 16,
  },
  doneBtn: {
    backgroundColor: '#8C5338',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  doneBtnText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
