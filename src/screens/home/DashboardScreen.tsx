import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../state/useAuthStore';
import { useRiskStore } from '../../state/useRiskStore';
import { useAlertStore } from '../../state/useAlertStore';
import { evacuationService } from '../../services/evacuation/evacuationService';
import { shakeService } from '../../services/emergency/shakeService';
import { WeatherIcon } from '../../components/WeatherIcon';
import { AppLogo } from '../../components/AppLogo';
import { CitizenReportModal } from '../../components/CitizenReportModal';
import { RescueWhistleModal } from '../../components/RescueWhistleModal';
import { LocationPickerModal } from '../../components/LocationPickerModal';
import { ScientificDataAttribution } from '../../components/ScientificDataAttribution';
import { WeatherMetricModal, MetricDetailData } from '../../components/WeatherMetricModal';
import { TelemetryLogos } from '../../components/TelemetryLogos';
import { GoogleSignInSheet } from '../../components/GoogleSignInSheet';
import { LanguagePickerModal } from '../../components/LanguagePickerModal';
import { useLanguageStore } from '../../state/useLanguageStore';
import { LiveTelemetryModal } from '../../components/LiveTelemetryModal';
import { VillageWardPickerModal, VillageWardItem } from '../../components/VillageWardPickerModal';
import { TribalUserVisualGuideModal } from '../../components/TribalUserVisualGuideModal';
import { VoiceAdvisorySpeaker, VoiceSpeakerRef } from '../../components/VoiceAdvisorySpeaker';
import { smsService } from '../../services/sms/smsService';
import { emergencyNotificationService } from '../../services/notification/emergencyNotificationService';
import { Colors, FontSize, Spacing, BorderRadius } from '../../theme/colors';

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const user = useAuthStore((state) => state.user);
  const {
    currentRisk,
    activeDistrict,
    activeState,
    activeVillageWard,
    activePanchayat,
    userLocation,
    liveWeather,
    multiSource,
    isLiveGpsMode,
    isAutoSimulating,
    secondsUntilNextSync,
    lastSyncedAt,
    setLiveGpsMode,
    setVillageWard,
    isLoading,
    fetchRiskData,
    startLive30sPolling,
    stopPolling,
    toggleAutoSimulation,
  } = useRiskStore();
  const { fetchAlerts } = useAlertStore();

  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [whistleModalVisible, setWhistleModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [villageWardModalVisible, setVillageWardModalVisible] = useState(false);
  const [telemetryModalVisible, setTelemetryModalVisible] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<'IMD' | 'ISRO' | 'NASA' | 'GSI' | 'NHAI' | 'CWC' | 'WMO'>('WMO');
  const [selectedMetric, setSelectedMetric] = useState<MetricDetailData | null>(null);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [visualGuideModalVisible, setVisualGuideModalVisible] = useState(false);
  const voiceSpeakerRef = useRef<VoiceSpeakerRef>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { currentLanguage, strings } = useLanguageStore();

  const handleToggleVoiceAdvisory = () => {
    if (isSpeaking) {
      voiceSpeakerRef.current?.stop();
      setIsSpeaking(false);
      return;
    }

    const isUrgent = currentRisk?.severityLabel === 'CRITICAL' || currentRisk?.severityLabel === 'HIGH';
    const city = userLocation?.city || activeDistrict || 'स्थानीय क्षेत्र';

    let speechText = '';
    if (isUrgent) {
      speechText = `सावधान! ${city} में भारी बारिश और बाढ़ की चेतावनी जारी की गई है। कृपया तुरंत अपने परिवार के साथ ऊंचे सुरक्षित स्थान की ओर जाएं। 112 डायल करें।`;
    } else {
      speechText = `${city} में नदियाँ और जलस्तर शांत हैं। वर्तमान में कोई बाढ़ का खतरा नहीं है। आप पूरी तरह सुरक्षित हैं।`;
    }

    voiceSpeakerRef.current?.speak(speechText, currentLanguage);
    setIsSpeaking(true);
    setTimeout(() => setIsSpeaking(false), 9000);
  };

  // Second-by-second live countdown timer until peak flood surge
  const [countdownSeconds, setCountdownSeconds] = useState(multiSource.leadTime.minutesRemaining * 60);

  useEffect(() => {
    setCountdownSeconds(multiSource.leadTime.minutesRemaining * 60);
  }, [multiSource.leadTime.minutesRemaining]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCall112 = () => {
    Alert.alert(
      strings.emergencyCallTitle,
      strings.emergencyCallDesc,
      [
        { text: strings.cancelBtn, style: 'cancel' },
        { text: strings.call112Btn, onPress: () => Linking.openURL('tel:112') },
      ]
    );
  };

  const handleDispatchRealSmsAlert = async () => {
    Alert.alert(
      strings.smsAlertTitle,
      `${strings.smsAlertDesc} (${activeVillageWard || activeDistrict})`,
      [
        { text: strings.cancelBtn, style: 'cancel' },
        {
          text: strings.openSmsBtn,
          onPress: async () => {
            await smsService.sendDisasterAlertSMS(
              '112',
              activeDistrict,
              userLocation ? { latitude: userLocation.latitude, longitude: userLocation.longitude } : undefined,
              liveWeather?.precipitationMm && liveWeather.precipitationMm > 20
                ? `Heavy Rain Alert (${liveWeather.precipitationMm} mm)`
                : 'Emergency Assistance Request'
            );
          },
        },
      ]
    );
  };

  useEffect(() => {
    startLive30sPolling();
    fetchAlerts();

    const removeShakeListener = shakeService.addListener(() => {
      Alert.alert(
        strings.shakeAlertTitle,
        strings.shakeAlertDesc,
        [
          { text: strings.cancelBtn, style: 'cancel' },
          { text: strings.openSosBtn, style: 'destructive', onPress: () => navigation.navigate('Emergency') },
        ]
      );
    });

    return () => {
      stopPolling();
      removeShakeListener();
    };
  }, []);

  const onRefresh = () => {
    fetchRiskData();
    fetchAlerts();
  };

  const isCritical = currentRisk?.severityLabel === 'CRITICAL' || currentRisk?.severityLabel === 'HIGH';
  const isModerate = currentRisk?.severityLabel === 'MODERATE';

  const precip = liveWeather?.precipitationMm ?? 0.0;
  const temp = liveWeather?.temperature ?? 29;
  const weatherDesc = liveWeather?.weatherDescription ?? 'Clear Sky';
  const humidity = liveWeather?.humidity ?? 65;
  const wind = liveWeather?.windSpeedKmh ?? 18;
  const pressure = liveWeather?.surfacePressureHpa ?? 1008;

  // Handlers for metric clicks
  const handleOpenPrecipDetail = () => {
    setSelectedMetric({
      title: 'Precipitation Accumulation',
      value: `${precip} mm/hr`,
      status: precip >= 25 ? 'Heavy Rainfall' : precip >= 5 ? 'Moderate Rain' : 'Light / Dry',
      source: 'NASA GPM & Open-Meteo Doppler Grid',
      description: `Live precipitation recorded for ${activeDistrict}. Multi-source correlation confirms current rate is ${precip} mm per hour.`,
      scientificContext: 'IMD Official Scale:\n• 0.1 - 2.4 mm: Very Light Rain\n• 2.5 - 15.5 mm: Moderate Rain\n• 15.6 - 64.4 mm: Heavy Rain (Watch Issued)\n• > 64.5 mm: Very Heavy Rain (Flood Hazard)',
      safetyAdvisory: precip > 20 ? 'Avoid underpasses, flooded culverts, and low-lying river paths.' : 'Standard outdoor conditions. Drainage systems operating within normal parameters.',
      icon: 'rain',
    });
  };

  const handleOpenHumidityDetail = () => {
    setSelectedMetric({
      title: 'Relative Humidity',
      value: `${humidity}%`,
      status: humidity > 80 ? 'High Moisture Saturation' : humidity > 50 ? 'Comfortable' : 'Dry',
      source: 'IMD Automatic Weather Station (AWS)',
      description: `Relative atmospheric moisture content in ${activeDistrict} air column.`,
      scientificContext: 'Relative humidity indicates moisture saturation relative to maximum temperature capacity. Levels exceeding 85% paired with rising heat trigger convective thunderstorm activity and localized downpours.',
      safetyAdvisory: 'Stay hydrated. High humidity reduces sweat evaporation rate.',
      icon: 'cloud',
    });
  };

  const handleOpenWindDetail = () => {
    setSelectedMetric({
      title: 'Wind Velocity & Gusts',
      value: `${wind} km/h`,
      status: wind > 40 ? 'Gale / Strong Wind' : wind > 20 ? 'Moderate Breeze' : 'Gentle Breeze',
      source: 'Doppler Anemometer & ECMWF Atmospheric Model',
      description: `Sustained horizontal surface wind velocity at 10-meter elevation.`,
      scientificContext: 'Beaufort Scale Index:\n• 12-19 km/h: Gentle Breeze\n• 20-28 km/h: Moderate Breeze\n• 29-38 km/h: Fresh Breeze\n• 39-49 km/h: Strong Wind (Loose objects hazardous)\n• > 50 km/h: Gale Warning',
      safetyAdvisory: wind > 35 ? 'Secure loose tin roofing, construction sheets, and stay away from weak trees.' : 'Winds are within standard safe operational thresholds.',
      icon: 'wind',
    });
  };

  const handleOpenPressureDetail = () => {
    setSelectedMetric({
      title: 'Surface Barometric Pressure',
      value: `${pressure} hPa`,
      status: pressure < 1000 ? 'Low Pressure (Depression)' : 'Normal Atmospheric Range',
      source: 'Barometric Sensor & NASA Earthdata Models',
      description: `Atmospheric pressure exerted by the weight of air at current ground elevation.`,
      scientificContext: 'Standard sea-level pressure is 1013.25 hPa. A rapid pressure decline of >3 hPa within 3 hours indicates cyclonic development, monsoon depressions, or active thunderstorm squall lines.',
      safetyAdvisory: pressure < 1000 ? 'Low pressure depression detected. Monitor official IMD storm advisories.' : 'Atmospheric pressure is stable. No severe pressure depression active.',
      icon: 'compass',
    });
  };

  const handleOpenForecastDetail = (f: { day: string; condition: string; tempHigh: number; tempLow: number; precipitation: number }) => {
    setSelectedMetric({
      title: `${f.day} Weather Outlook`,
      value: `${f.tempHigh}° / ${f.tempLow}°`,
      status: `${f.precipitation}% Chance of Rain`,
      source: 'Open-Meteo High-Resolution 5-Day Numerical Model',
      description: `Projected meteorological conditions for ${f.day} in ${activeDistrict}.`,
      scientificContext: `High temperature expected to reach ${f.tempHigh}°C, overnight low around ${f.tempLow}°C. Precipitation probability calculated across 24-hour simulation grid.`,
      safetyAdvisory: f.precipitation >= 50 ? 'Precipitation probable. Keep umbrella and emergency supplies handy.' : 'Pleasant weather anticipated. Regular activities can proceed.',
      icon: f.condition === 'rain' ? 'rain' : f.condition === 'storm' ? 'alert' : f.condition === 'wind' ? 'wind' : 'sun',
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor="#0284C7"
            colors={['#0284C7']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Designer Top Bar: Square Grid Button + User Profile Avatar (Ref: Screen 1) */}
        <View style={styles.designerTopBar}>
          <TouchableOpacity
            style={styles.designerGridBtn}
            onPress={() => setVillageWardModalVisible(true)}
            activeOpacity={0.8}
            accessibilityLabel="Location Selector"
          >
            <WeatherIcon name="grid" size={18} color="#1F1A17" />
          </TouchableOpacity>

          <View style={styles.topBarRightCol}>
            {/* Language Selector Capsule (Focus: Himalayan & Indian dialects) */}
            <TouchableOpacity
              style={styles.langPillBtn}
              onPress={() => setLanguageModalVisible(true)}
              activeOpacity={0.8}
            >
              <WeatherIcon name="globe" size={13} color="#8C5338" />
              <Text style={styles.langPillText}>
                {currentLanguage === 'gar' ? 'गढ़वाली' : currentLanguage === 'kum' ? 'कुमाऊँनी' : currentLanguage === 'pah' ? 'पहाड़ी' : currentLanguage.toUpperCase()} ▾
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.authPillBadge}
              onPress={() => setAuthModalVisible(true)}
              activeOpacity={0.8}
            >
              <WeatherIcon name="shield" size={12} color="#16A34A" />
              <Text style={styles.authPillBadgeText}>
                {user ? `${user.name.split(' ')[0]} (${strings.loginVerified})` : strings.googleMobileLogin}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.designerAvatarBtn}
              onPress={() => setAuthModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.designerAvatarText}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'N'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Dynamic Location & Catchment Headline */}
        <Text style={styles.designerMainHeadline} numberOfLines={2}>
          {isLiveGpsMode && userLocation?.city ? `Live Flood Watch: ${userLocation.city}` : strings.liveWatchHeader}
        </Text>
        <Text style={styles.designerSubHeadline} numberOfLines={1}>
          {userLocation ? `${userLocation.city}, ${userLocation.state} · ${userLocation.latitude.toFixed(3)}°N, ${userLocation.longitude.toFixed(3)}°E` : `${activeVillageWard || activeDistrict} · Active Basin`}
        </Text>

        {/* REAL-TIME LIVE GPS & BASIN DETECTOR */}
        <TouchableOpacity
          style={styles.autoGpsCapsule}
          onPress={() => {
            setLiveGpsMode(true);
            fetchRiskData();
          }}
          activeOpacity={0.8}
        >
          <View style={[styles.autoGpsDot, { backgroundColor: isLiveGpsMode && userLocation?.isLiveGps ? '#16A34A' : '#F59E0B' }]} />
          <Text style={styles.autoGpsText} numberOfLines={1}>
            {userLocation?.isLiveGps
              ? `📍 Real GPS: ${userLocation.city}, ${userLocation.state} (${userLocation.latitude.toFixed(3)}°N, ${userLocation.longitude.toFixed(3)}°E)`
              : isLiveGpsMode
              ? '📡 Acquiring Live Device GPS Coordinates...'
              : `🏔️ Hilly Ward: ${activeVillageWard || activeDistrict} (Tap for Real GPS)`}
          </Text>
          <WeatherIcon name="compass" size={12} color="#8C5338" />
        </TouchableOpacity>

        {/* TRIBAL & VILLAGE FRIENDLY ACCESSIBILITY ACTIONS */}
        <View style={styles.accessibleActionRow}>
          {/* Pictorial Visual Guide Button */}
          <TouchableOpacity
            style={styles.visualGuideBtn}
            onPress={() => setVisualGuideModalVisible(true)}
            activeOpacity={0.8}
          >
            <WeatherIcon name="shield" size={18} color="#8C5338" />
            <View style={{ flex: 1 }}>
              <Text style={styles.visualGuideBtnTitle}>
                चित्र निर्देशिका · Visual Guide
              </Text>
              <Text style={styles.visualGuideBtnSub}>
                रंगों और इशारों से समझें (No reading needed)
              </Text>
            </View>
            <WeatherIcon name="arrow-right" size={14} color="#8C5338" />
          </TouchableOpacity>

          {/* Voice Audio Listen Button */}
          <TouchableOpacity
            style={[styles.voiceAdvisoryBtn, isSpeaking && styles.voiceAdvisoryBtnActive]}
            onPress={handleToggleVoiceAdvisory}
            activeOpacity={0.8}
          >
            <WeatherIcon name={isSpeaking ? "check" : "bell"} size={16} color="#FFFFFF" />
            <Text style={styles.voiceAdvisoryBtnText}>
              {isSpeaking ? 'आवाज़ बंद करें' : '🔊 आवाज़ में सुनें (Listen)'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar + Terracotta Filter Action Button */}
        <View style={styles.designerSearchRow}>
          <TouchableOpacity
            style={styles.designerSearchBar}
            onPress={() => setVillageWardModalVisible(true)}
            activeOpacity={0.8}
          >
            <WeatherIcon name="search" size={18} color="#827C77" />
            <Text style={styles.designerSearchPlaceholder} numberOfLines={1}>
              {strings.searchPlaceholder}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.designerFilterBtn}
            onPress={() => {
              setSelectedAgency('WMO');
              setTelemetryModalVisible(true);
            }}
            activeOpacity={0.8}
            accessibilityLabel="Filter Telemetry"
          >
            <WeatherIcon name="filter" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* OFFICIAL LIVE SATELLITE & SENSOR FEEDS (NASA, ISRO, IMD, GSI, CWC, WMO) */}
        <View style={styles.designerFeedsRow}>
          <TelemetryLogos
            compact
            onPressAgency={(agency) => {
              setSelectedAgency(agency as any);
              setTelemetryModalVisible(true);
            }}
          />
        </View>

        {/* SHAKE-TO-SOS SENSOR STATUS CARD */}
        <View style={styles.designerShakeCard}>
          <View style={styles.designerShakeLeft}>
            <View style={styles.designerShakeIconBox}>
              <WeatherIcon name="alert" size={16} color="#FFFFFF" />
            </View>
            <View style={styles.designerShakeTextCol}>
              <Text style={styles.designerShakeTitle}>{strings.shakeToSosTitle}</Text>
              <Text style={styles.designerShakeSub} numberOfLines={1}>
                {strings.shakeToSosSub}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.designerShakeTestBtn}
            onPress={() => shakeService.triggerEmergencyShake()}
            activeOpacity={0.8}
          >
            <Text style={styles.designerShakeTestBtnText}>{strings.testShake}</Text>
          </TouchableOpacity>
        </View>

        {/* BACKGROUND NOTIFICATION WATCHDOG STATUS CARD */}
        <View style={styles.designerWatchdogCard}>
          <View style={styles.designerWatchdogLeft}>
            <View style={styles.designerWatchdogPulseDot} />
            <View style={styles.designerShakeTextCol}>
              <Text style={styles.designerWatchdogTitle}>
                Background Alert Watchdog Active
              </Text>
              <Text style={styles.designerWatchdogSub} numberOfLines={1}>
                Notifies you with sound & vibration even when app is closed
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.designerWatchdogTestBtn}
            onPress={() => emergencyNotificationService.triggerTestBackgroundAlert()}
            activeOpacity={0.8}
          >
            <Text style={styles.designerWatchdogTestBtnText}>Test Alert</Text>
          </TouchableOpacity>
        </View>

        {/* Dark Hero Promo Banner (Ref: "Up to 40% Discount!" -> "35 Mins Lead-Time") */}
        <View style={styles.designerDarkHero}>
          <View style={styles.designerDarkHeroLeft}>
            <Text style={styles.designerDarkHeroTag}>
              {isCritical ? strings.criticalEvacWindow : strings.liveSatelliteWatch}
            </Text>
            <Text style={styles.designerDarkHeroTitle}>
              {formatCountdown(countdownSeconds).replace(/^00:/, '')} {strings.minutesRemaining}
            </Text>
            <Text style={styles.designerDarkHeroSub} numberOfLines={2}>
              {strings.surgeAdvisory}
            </Text>
            <TouchableOpacity
              style={styles.designerWhitePillBtn}
              onPress={() => navigation.navigate('SafeHaven')}
              activeOpacity={0.9}
            >
              <Text style={styles.designerWhitePillBtnText}>{strings.viewSafeHavens}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.designerDarkHeroRight}>
            <View style={styles.heroShieldCircle}>
              <WeatherIcon name="shield" size={32} color="#8C5338" />
            </View>
          </View>
        </View>

        {/* Filter Pills Horizontal Row (Ref: "Popular Items" -> "Safety Essentials") */}
        <View style={styles.designerSectionHeaderRow}>
          <Text style={styles.designerSectionTitle}>{strings.safetyEssentials}</Text>
          <TouchableOpacity
            onPress={() => {
              setSelectedAgency('WMO');
              setTelemetryModalVisible(true);
            }}
          >
            <Text style={styles.designerSectionLink}>{strings.viewAll}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.designerFilterChipsScroll}
        >
          <TouchableOpacity
            style={[styles.designerFilterChip, styles.designerFilterChipActive]}
            activeOpacity={0.8}
          >
            <Text style={styles.designerFilterChipTextActive}>{strings.allFeeds}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.designerFilterChip}
            onPress={handleOpenPrecipDetail}
            activeOpacity={0.8}
          >
            <Text style={styles.designerFilterChipText}>{strings.rainfallChip} ({precip}mm)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.designerFilterChip}
            onPress={handleOpenHumidityDetail}
            activeOpacity={0.8}
          >
            <Text style={styles.designerFilterChipText}>{strings.soilChip} ({multiSource.soil.surfaceSaturationPercent}%)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.designerFilterChip}
            onPress={() => {
              setSelectedAgency('GSI');
              setTelemetryModalVisible(true);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.designerFilterChipText}>{strings.hillSlopeChip} ({strings.stableSlope})</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.designerFilterChip}
            onPress={() => {
              setSelectedAgency('CWC');
              setTelemetryModalVisible(true);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.designerFilterChipText}>{strings.riverStageChip} ({strings.safeRiverFlow})</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* 2-Column Product / Telemetry Grid (Ref: 2-column chair/sofa cards in Screen 1) */}
        <View style={styles.designerGridContainer}>
          {/* Card 1: Rainfall */}
          <TouchableOpacity
            style={styles.designerCard}
            onPress={handleOpenPrecipDetail}
            activeOpacity={0.85}
          >
            <View style={styles.designerCardVisual}>
              <WeatherIcon name="rain" size={36} color="#8C5338" />
            </View>
            <View style={styles.designerCardFooter}>
              <Text style={styles.designerCardCategory}>{strings.imdRadarCategory}</Text>
              <Text style={styles.designerCardTitle}>{strings.rainfallChip}: {precip} mm/hr</Text>
              <View style={styles.designerCardActionRow}>
                <View style={styles.designerCardTag}>
                  <Text style={styles.designerCardTagText}>
                    {precip > 20 ? strings.heavyRain : precip > 0 ? strings.lightRain : strings.dryClear}
                  </Text>
                </View>
                <View style={styles.designerCardInspectBtn}>
                  <WeatherIcon name="arrow-right" size={12} color="#FFFFFF" />
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Card 2: Soil Moisture */}
          <TouchableOpacity
            style={styles.designerCard}
            onPress={handleOpenHumidityDetail}
            activeOpacity={0.85}
          >
            <View style={styles.designerCardVisual}>
              <WeatherIcon name="cloud" size={36} color="#8C5338" />
            </View>
            <View style={styles.designerCardFooter}>
              <Text style={styles.designerCardCategory}>{strings.nasaCategory}</Text>
              <Text style={styles.designerCardTitle}>{strings.soilChip}: {multiSource.soil.surfaceSaturationPercent}%</Text>
              <View style={styles.designerCardActionRow}>
                <View style={styles.designerCardTag}>
                  <Text style={styles.designerCardTagText}>
                    {multiSource.soil.surfaceSaturationPercent > 75 ? strings.saturatedSoil : strings.safeMoisture}
                  </Text>
                </View>
                <View style={styles.designerCardInspectBtn}>
                  <WeatherIcon name="arrow-right" size={12} color="#FFFFFF" />
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Card 3: Hill Slope */}
          <TouchableOpacity
            style={styles.designerCard}
            onPress={() => {
              setSelectedAgency('GSI');
              setTelemetryModalVisible(true);
            }}
            activeOpacity={0.85}
          >
            <View style={styles.designerCardVisual}>
              <WeatherIcon name="mountain" size={36} color="#8C5338" />
            </View>
            <View style={styles.designerCardFooter}>
              <Text style={styles.designerCardCategory}>{strings.gsiCategory}</Text>
              <Text style={styles.designerCardTitle}>{strings.hillSlopeChip}: {multiSource.slope.demSlopeAngleDeg}°</Text>
              <View style={styles.designerCardActionRow}>
                <View style={styles.designerCardTag}>
                  <Text style={styles.designerCardTagText}>
                    {multiSource.slope.factorOfSafety < 1.1 ? strings.heavyRain : strings.stableSlope}
                  </Text>
                </View>
                <View style={styles.designerCardInspectBtn}>
                  <WeatherIcon name="arrow-right" size={12} color="#FFFFFF" />
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Card 4: River Stage */}
          <TouchableOpacity
            style={styles.designerCard}
            onPress={() => {
              setSelectedAgency('CWC');
              setTelemetryModalVisible(true);
            }}
            activeOpacity={0.85}
          >
            <View style={styles.designerCardVisual}>
              <WeatherIcon name="water" size={36} color="#8C5338" />
            </View>
            <View style={styles.designerCardFooter}>
              <Text style={styles.designerCardCategory}>{strings.cwcCategory}</Text>
              <Text style={styles.designerCardTitle}>
                {strings.riverStageChip}: {multiSource.cwcLive?.currentWaterLevelMeters ?? 1150.2} m
              </Text>
              <View style={styles.designerCardActionRow}>
                <View style={styles.designerCardTag}>
                  <Text style={styles.designerCardTagText}>
                    {multiSource.cwcLive?.isAboveDanger ? strings.heavyRain : strings.safeRiverFlow}
                  </Text>
                </View>
                <View style={styles.designerCardInspectBtn}>
                  <WeatherIcon name="arrow-right" size={12} color="#FFFFFF" />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Emergency Assistance Section (Ref: Screen 3 in Reference Image) */}
        <View style={styles.designerEmergencyContainer}>
          <Text style={styles.designerEmergencyTitle}>{strings.emergencySos}</Text>
          <View style={styles.designerEmergencyRow}>
            <TouchableOpacity
              style={styles.designerEmergencyCard}
              onPress={handleCall112}
              activeOpacity={0.8}
            >
              <View style={styles.designerEmergencyIconCircle}>
                <WeatherIcon name="phone" size={18} color="#8C5338" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.designerEmergencyCardTitle}>{strings.helpline112Title}</Text>
                <Text style={styles.designerEmergencyCardSub}>{strings.policeAndNdrf}</Text>
              </View>
              <View style={styles.designerEmergencyCallBtn}>
                <Text style={styles.designerEmergencyCallBtnText}>{strings.callAction}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.designerEmergencyCard}
              onPress={() => setWhistleModalVisible(true)}
              activeOpacity={0.8}
            >
              <View style={[styles.designerEmergencyIconCircle, { backgroundColor: '#F5ECE6' }]}>
                <WeatherIcon name="whistle" size={18} color="#1F1A17" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.designerEmergencyCardTitle}>{strings.rescueSirenTitle}</Text>
                <Text style={styles.designerEmergencyCardSub}>{strings.whistleFrequency}</Text>
              </View>
              <View style={[styles.designerEmergencyCallBtn, { backgroundColor: '#1F1A17' }]}>
                <Text style={styles.designerEmergencyCallBtnText}>{strings.soundAction}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Mountain Catchment Hydrological Telemetry Matrix */}
        <View style={styles.metricsHeaderRow}>
          <Text style={styles.sectionHeader}>{strings.currentWeatherDetails}</Text>
          <Text style={styles.tapToInspectHint}>{strings.tapToInspectHint}</Text>
        </View>

        <View style={styles.metricsGrid}>
          <TouchableOpacity
            style={styles.metricCard}
            onPress={handleOpenPrecipDetail}
            activeOpacity={0.7}
          >
            <Text style={styles.metricCardLabel}>{strings.precipitationLabel}</Text>
            <Text style={styles.metricCardValue}>{precip} mm</Text>
            <Text style={styles.metricCardFoot}>NASA GPM Doppler ›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.metricCard}
            onPress={() => {
              setSelectedAgency('CWC');
              setTelemetryModalVisible(true);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.metricCardLabel}>{strings.upstreamDischargeLabel || 'DISCHARGE'}</Text>
            <Text style={styles.metricCardValue}>420 m³/s</Text>
            <Text style={styles.metricCardFoot}>CWC Hydro Buoy ›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.metricCard}
            onPress={() => {
              setSelectedAgency('CWC');
              setTelemetryModalVisible(true);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.metricCardLabel}>{strings.riverVelocityLabel || 'RIVER VELOCITY'}</Text>
            <Text style={styles.metricCardValue}>1.8 m/s</Text>
            <Text style={styles.metricCardFoot}>Doppler Acoustic ›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.metricCard}
            onPress={() => {
              setSelectedAgency('GSI');
              setTelemetryModalVisible(true);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.metricCardLabel}>{strings.hillSlopeChip}</Text>
            <Text style={styles.metricCardValue}>Fs 1.48</Text>
            <Text style={styles.metricCardFoot}>GSI 30m LiDAR ›</Text>
          </TouchableOpacity>
        </View>

        {/* EMERGENCY LIFE-SAFETY STEP-BY-STEP ACTION GUIDE (LOCAL LANGUAGE) */}
        <View style={styles.guideContainer}>
          <View style={styles.guideHeaderRow}>
            <View style={styles.guideIconCircle}>
              <WeatherIcon name="shield" size={18} color="#8C5338" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.guideHeaderTitle}>{strings.stepByStepGuideTitle || 'Life-Safety Emergency Action Steps'}</Text>
              <Text style={styles.guideHeaderSub}>{strings.stepByStepGuideSub || 'Follow these 4 essential steps during cloudburst or river surge warning'}</Text>
            </View>
          </View>

          <View style={styles.stepCardsList}>
            {/* Step 1 */}
            <View style={styles.stepCard}>
              <View style={styles.stepNumberBadge}><Text style={styles.stepNumberText}>1</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>{strings.step1Title || '1. Monitor Evacuation Lead-Time'}</Text>
                <Text style={styles.stepDesc}>{strings.step1Desc || 'Keep your eyes on the surge countdown clock. Do not wait for water to enter roads.'}</Text>
              </View>
            </View>

            {/* Step 2 */}
            <TouchableOpacity
              style={styles.stepCard}
              onPress={() => navigation.navigate('SafeHaven')}
              activeOpacity={0.8}
            >
              <View style={[styles.stepNumberBadge, { backgroundColor: '#8C5338' }]}><Text style={styles.stepNumberText}>2</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>{strings.step2Title || '2. Move Uphill to Bedrock Shelter'}</Text>
                <Text style={styles.stepDesc}>{strings.step2Desc || 'Follow green dashed route to Joshimath Community Hall (>240m elevation above riverbed).'}</Text>
              </View>
              <WeatherIcon name="arrow-right" size={14} color="#8C5338" />
            </TouchableOpacity>

            {/* Step 3 */}
            <TouchableOpacity
              style={styles.stepCard}
              onPress={() => shakeService.triggerEmergencyShake()}
              activeOpacity={0.8}
            >
              <View style={[styles.stepNumberBadge, { backgroundColor: '#1F1A17' }]}><Text style={styles.stepNumberText}>3</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>{strings.step3Title || '3. Shake Phone 3 Times if Trapped'}</Text>
                <Text style={styles.stepDesc}>{strings.step3Desc || 'Automatic accelerometer trigger dispatches your GPS coordinates to 112 via offline SMS.'}</Text>
              </View>
              <WeatherIcon name="arrow-right" size={14} color="#1F1A17" />
            </TouchableOpacity>

            {/* Step 4 */}
            <TouchableOpacity
              style={styles.stepCard}
              onPress={() => setWhistleModalVisible(true)}
              activeOpacity={0.8}
            >
              <View style={[styles.stepNumberBadge, { backgroundColor: '#B45309' }]}><Text style={styles.stepNumberText}>4</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>{strings.step4Title || '4. Sound 3.5 kHz Acoustic Rescue Whistle'}</Text>
                <Text style={styles.stepDesc}>{strings.step4Desc || 'High-frequency pulse penetrates mountain fog and rain so NDRF rescue teams can locate you.'}</Text>
              </View>
              <WeatherIcon name="arrow-right" size={14} color="#B45309" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Official Scientific Data Sources (NASA, IMD, ISRO, Open-Meteo, CWC) */}
        <ScientificDataAttribution />

        {/* Citizen Reporting Card */}
        <View style={styles.reportCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.reportCardTitle}>{strings.reportHazardTitle}</Text>
            <Text style={styles.reportCardSub}>
              {strings.reportHazardSub}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.reportCardBtn}
            onPress={() => setReportModalVisible(true)}
          >
            <WeatherIcon name="camera" size={16} color="#FFFFFF" />
            <Text style={styles.reportCardBtnText}>{strings.reportHazardBtn}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Swiggy Iconic Floating Bottom Safe Haven Pill */}
      <View style={styles.floatingHavenContainer}>
        <View style={styles.floatingHavenCard}>
          <View style={styles.floatingHavenLeft}>
            <View style={styles.floatingHavenIconCircle}>
              <WeatherIcon name="shield" size={18} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.floatingHavenTitle}>{strings.nearestShelter} (1.1 km)</Text>
              <Text style={styles.floatingHavenSub} numberOfLines={1}>
                {strings.shelterWalkTime}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.floatingHavenCta}
            onPress={() => navigation.navigate('SafeHaven')}
            activeOpacity={0.8}
          >
            <Text style={styles.floatingHavenCtaText}>{strings.uphillDirections}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Citizen Field Report Modal */}
      <CitizenReportModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
      />

      {/* Acoustic Whistle Rescue Modal */}
      <RescueWhistleModal
        visible={whistleModalVisible}
        onClose={() => setWhistleModalVisible(false)}
      />

      {/* Interactive India Location Selector Modal */}
      <LocationPickerModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
      />

      {/* Weather Metric / Forecast Detail Modal */}
      <WeatherMetricModal
        visible={!!selectedMetric}
        metric={selectedMetric}
        onClose={() => setSelectedMetric(null)}
      />

      {/* Live Satellite & IoT Telemetry Inspection Modal (NASA, ISRO, IMD, GSI, NHAI, CWC) */}
      <LiveTelemetryModal
        visible={telemetryModalVisible}
        onClose={() => setTelemetryModalVisible(false)}
        telemetry={multiSource}
        initialAgency={selectedAgency}
        onForceRefresh={async () => {
          await fetchRiskData();
        }}
      />

      {/* Hyper-Local Village & Ward Level Selector Modal (SIH Problem 26192) */}
      <VillageWardPickerModal
        visible={villageWardModalVisible}
        onClose={() => setVillageWardModalVisible(false)}
        onSelectVillageWard={(item) => setVillageWard(item)}
        onSelectCurrentGps={() => setLiveGpsMode(true)}
      />

      {/* Google and Mobile Auth Sheet */}
      <GoogleSignInSheet
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
        onSuccess={() => setAuthModalVisible(false)}
      />

      {/* Local & Himalayan Language Selector Modal */}
      <LanguagePickerModal
        visible={languageModalVisible}
        onClose={() => setLanguageModalVisible(false)}
      />

      {/* Pictorial Visual Guide for Non-Literate & Tribal Communities */}
      <TribalUserVisualGuideModal
        visible={visualGuideModalVisible}
        onClose={() => setVisualGuideModalVisible(false)}
        onOpenVoiceAdvisory={handleToggleVoiceAdvisory}
      />

      {/* Real Voice Audio Speaker (Text-to-Speech) */}
      <VoiceAdvisorySpeaker ref={voiceSpeakerRef} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F6F2',
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 48,
    paddingBottom: 110,
  },

  accessibleActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  visualGuideBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#E8E4DF',
    gap: 8,
    shadowColor: '#1F1A17',
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  visualGuideBtnTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1F1A17',
  },
  visualGuideBtnSub: {
    fontSize: 10,
    color: '#827C77',
    marginTop: 1,
  },
  voiceAdvisoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8C5338',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
    shadowColor: '#8C5338',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  voiceAdvisoryBtnActive: {
    backgroundColor: '#DC2626',
  },
  voiceAdvisoryBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  brandTitle: {
    fontSize: FontSize.lg,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: -1,
  },
  emergencyDialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    shadowColor: '#DC2626',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  emergencyDialText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  locationRightBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  changeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },

  modeTabBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.lg,
    padding: 3,
    marginBottom: Spacing.md,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  modeTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  modeTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  modeTabTextActive: {
    color: '#0F172A',
  },

  weatherHero: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#0284C7',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  heroAgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    marginBottom: 8,
  },
  pulseWhiteDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  heroAgencyText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroCityName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  heroWeatherDesc: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 1,
    textTransform: 'capitalize',
  },
  heroMiddleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.md,
    marginVertical: Spacing.sm,
  },
  heroTemp: {
    fontSize: 58,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -2,
    lineHeight: 64,
  },
  heroTempMeta: {
    gap: 2,
  },
  heroHighLow: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  heroRainText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  heroBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  heroStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  heroStatusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroTapHint: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600',
  },

  leadTimeCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  leadTimeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  leadTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  leadTimeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#0284C7',
  },
  leadTimeTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.6,
  },
  urgencyPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  leadTimeBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  leadTimeTimeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  leadTimeMinutes: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -1,
  },
  leadTimeUnit: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  leadTimePeakSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  leadTimeRouteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  leadTimeRouteText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  leadTimeActionText: {
    fontSize: 11,
    color: '#475569',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 8,
    lineHeight: 16,
  },

  advisoryCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    gap: 6,
  },
  advisoryCardSafe: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  advisoryCardModerate: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  advisoryCardCritical: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  advisoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  advisoryTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  advisoryBody: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 17,
  },
  advisoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  advisoryBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },

  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  tapToInspectHint: {
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '600',
  },

  actionGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  actionTile: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  actionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionTileTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  actionTileSub: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 1,
    textAlign: 'center',
  },

  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 2,
    shadowColor: '#0F172A',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  metricCardLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  metricCardValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginVertical: 2,
  },
  metricCardFoot: {
    fontSize: 10,
    color: '#0284C7',
    fontWeight: '600',
  },

  forecastRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    paddingVertical: 2,
  },
  forecastDayCard: {
    width: 82,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
    shadowColor: '#0F172A',
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  forecastDayText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  forecastTempText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  forecastLowText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  forecastRainProb: {
    fontSize: 9,
    color: '#0284C7',
    fontWeight: '700',
  },

  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  reportCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  reportCardSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    lineHeight: 15,
  },
  reportCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0284C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  reportCardBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  plainLanguageCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    elevation: 2,
    shadowColor: '#64748B',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    gap: 8,
  },
  plainLanguageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  plainLanguageBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  plainDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#005BBF',
  },
  plainLanguageBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#005BBF',
    letterSpacing: 0.5,
  },
  plainLanguageStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  plainLanguageStatusText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  plainLanguageText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
    fontWeight: '500',
  },

  // Automated Status Bar styles
  autoStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: Spacing.sm,
    gap: 8,
  },
  autoStatusLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulsingGreenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },
  autoStatusTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  autoStatusSub: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 1,
  },
  autoSimBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  autoSimBtnInactive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  autoSimBtnActive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  autoSimBtnText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  autoSimBtnTextInactive: {
    color: '#1D4ED8',
  },
  autoSimBtnTextActive: {
    color: '#DC2626',
  },

  // Countdown clock styles
  leadTimeClockRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  leadTimeClockText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },
  leadTimeClockUnit: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },

  // WMO EW4All & Digital Twin styles
  wmoTwinCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    elevation: 3,
    shadowColor: '#0284C7',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  wmoTwinHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    gap: 8,
  },
  wmoBadgeGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  wmoBlueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0284C7',
    marginTop: 4,
  },
  wmoTwinTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0369A1',
    letterSpacing: 0.5,
  },
  wmoTwinSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
    lineHeight: 14,
  },
  cwcStageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  cwcStageText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  wmoSectionLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 0.5,
    marginTop: 4,
    marginBottom: 6,
  },
  wmoStepsScroll: {
    marginBottom: Spacing.sm,
  },
  wmoStepTile: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.md,
    padding: 8,
    marginRight: 8,
    alignItems: 'center',
    minWidth: 72,
  },
  wmoStepTileSevere: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  wmoStepTime: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 3,
  },
  wmoStepLevel: {
    fontSize: 13,
    fontWeight: '900',
  },
  wmoStepDischarge: {
    fontSize: 8.5,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 5,
  },
  wmoStepStatusPill: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  wmoStepStatusText: {
    fontSize: 7.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  wmoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 4,
  },
  wmoMetricBox: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.sm,
    padding: 8,
  },
  wmoMetricLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#64748B',
  },
  wmoMetricVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  wmoMetricFoot: {
    fontSize: 8.5,
    color: '#94A3B8',
    marginTop: 2,
  },
  cbsStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginTop: Spacing.sm,
    gap: 8,
  },
  cbsStatusLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cbsDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  cbsChannelText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0369A1',
    letterSpacing: 0.2,
  },
  wmoInspectBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#0284C7',
    borderRadius: 6,
  },
  wmoInspectText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Designer Terracotta & Warm Cream Styles (Ref: User Reference Image)
  designerTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  designerGridBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F0EEE9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  designerAvatarBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EAE6DF',
    borderWidth: 1.5,
    borderColor: '#8C5338',
    alignItems: 'center',
    justifyContent: 'center',
  },
  designerAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#8C5338',
  },
  designerMainHeadline: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1F1A17',
    letterSpacing: -0.5,
    lineHeight: 32,
    marginBottom: 4,
  },
  designerSubHeadline: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8C5338',
    marginBottom: 14,
  },
  designerShakeTextCol: {
    flex: 1,
    paddingRight: 6,
  },
  designerWatchdogCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    marginBottom: 16,
    shadowColor: '#16A34A',
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  designerWatchdogLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
    paddingRight: 8,
  },
  designerWatchdogPulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#16A34A',
  },
  designerWatchdogTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#166534',
  },
  designerWatchdogSub: {
    fontSize: 10.5,
    color: '#65A30D',
    marginTop: 1,
  },
  designerWatchdogTestBtn: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  designerWatchdogTestBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#166534',
  },
  designerSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  designerSearchBar: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F0EEE9',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  designerSearchPlaceholder: {
    fontSize: 13,
    color: '#827C77',
    fontWeight: '500',
    flex: 1,
  },
  designerFilterBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#8C5338',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  designerDarkHero: {
    backgroundColor: '#1F1A17',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    shadowColor: '#1F1A17',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  designerDarkHeroLeft: {
    flex: 1,
    paddingRight: 10,
  },
  designerDarkHeroTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#A49E98',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  designerDarkHeroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  designerDarkHeroSub: {
    fontSize: 11,
    color: '#D1CCC6',
    lineHeight: 16,
    marginBottom: 14,
  },
  designerWhitePillBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  designerWhitePillBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1F1A17',
  },
  designerDarkHeroRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroShieldCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(140, 83, 56, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  designerSectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  designerSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F1A17',
  },
  designerSectionLink: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#827C77',
  },
  designerFilterChipsScroll: {
    gap: 8,
    paddingRight: 10,
    marginBottom: 18,
  },
  designerFilterChip: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F0EEE9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  designerFilterChipActive: {
    backgroundColor: '#8C5338',
  },
  designerFilterChipText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1F1A17',
  },
  designerFilterChipTextActive: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  designerGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  designerCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#EFECE6',
    shadowColor: '#1F1A17',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  designerCardVisual: {
    height: 100,
    backgroundColor: '#F7F5F0',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  designerCardFooter: {
    paddingHorizontal: 2,
  },
  designerCardCategory: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#827C77',
    letterSpacing: 0.4,
  },
  designerCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1F1A17',
    marginTop: 2,
    marginBottom: 8,
  },
  designerCardActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  designerCardTag: {
    backgroundColor: '#F0EEE9',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  designerCardTagText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#1F1A17',
  },
  designerCardInspectBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#8C5338',
    alignItems: 'center',
    justifyContent: 'center',
  },
  designerEmergencyContainer: {
    backgroundColor: '#F0EEE9',
    borderRadius: 22,
    padding: 16,
    marginBottom: 24,
  },
  designerEmergencyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F1A17',
    marginBottom: 12,
  },
  designerEmergencyRow: {
    flexDirection: 'row',
    gap: 10,
  },
  designerEmergencyCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  designerEmergencyIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F5ECE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  designerEmergencyCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1F1A17',
  },
  designerEmergencyCardSub: {
    fontSize: 9.5,
    color: '#827C77',
    marginTop: 1,
  },
  designerEmergencyCallBtn: {
    backgroundColor: '#8C5338',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  designerEmergencyCallBtnText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Floating Bottom Safe Haven Pill
  floatingHavenContainer: {
    position: 'absolute',
    bottom: 96,
    left: 20,
    right: 20,
    elevation: 8,
    shadowColor: '#1F1A17',
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  floatingHavenCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1F1A17',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  floatingHavenLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  floatingHavenIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#8C5338',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingHavenTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  floatingHavenSub: {
    fontSize: 10.5,
    color: '#D1CCC6',
    marginTop: 1,
  },
  floatingHavenCta: {
    backgroundColor: '#8C5338',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },
  floatingHavenCtaText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },

  // Trust Banner Card
  trustBannerCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EFECE6',
    borderRadius: 20,
    padding: 16,
    marginBottom: Spacing.lg,
  },
  trustTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1F1A17',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  trustLogosRow: {
    marginBottom: 10,
  },
  trustLinkBtn: {
    alignSelf: 'flex-start',
  },
  trustLinkText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#8C5338',
    textDecorationLine: 'underline',
  },

  // Auth & Top Bar Elements
  topBarRightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0EEE9',
    borderWidth: 1,
    borderColor: '#EFECE6',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
  },
  langPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#8C5338',
  },
  authPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFECE6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  authPillBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1F1A17',
  },

  // Feeds Row
  designerFeedsRow: {
    marginBottom: 12,
  },

  // Shake Card
  designerShakeCard: {
    backgroundColor: '#F5ECE6',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#8C5338',
    borderRadius: 16,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  designerShakeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  designerShakeIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#8C5338',
    alignItems: 'center',
    justifyContent: 'center',
  },
  designerShakeTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#1F1A17',
    letterSpacing: 0.3,
  },
  designerShakeSub: {
    fontSize: 9,
    color: '#733F27',
    marginTop: 1,
  },
  designerShakeTestBtn: {
    backgroundColor: '#8C5338',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  designerShakeTestBtnText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },

  // Auto-GPS Catchment Capsule
  autoGpsCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F5ECE6',
    borderWidth: 1,
    borderColor: 'rgba(140, 83, 56, 0.25)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  autoGpsDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#16A34A',
  },
  autoGpsText: {
    flex: 1,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#733F27',
  },

  // Emergency Step-by-Step Guide
  guideContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EFECE6',
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
  },
  guideHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  guideIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F5ECE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F1A17',
    letterSpacing: -0.2,
  },
  guideHeaderSub: {
    fontSize: 10.5,
    color: '#827C77',
    marginTop: 2,
  },
  stepCardsList: {
    gap: 10,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8F6F2',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFECE6',
  },
  stepNumberBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#8C5338',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1F1A17',
  },
  stepDesc: {
    fontSize: 10.5,
    color: '#827C77',
    marginTop: 2,
    lineHeight: 14,
  },
});
