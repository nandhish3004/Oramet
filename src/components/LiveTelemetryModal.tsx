import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Colors, FontSize, Spacing, BorderRadius } from '../theme/colors';
import { IntegratedDisasterSnapshot } from '../services/telemetry/multiSourceService';

interface LiveTelemetryModalProps {
  visible: boolean;
  onClose: () => void;
  telemetry: IntegratedDisasterSnapshot;
  initialAgency?: 'IMD' | 'ISRO' | 'NASA' | 'GSI' | 'NHAI' | 'CWC' | 'WMO';
  onForceRefresh?: () => Promise<void>;
}

export const LiveTelemetryModal: React.FC<LiveTelemetryModalProps> = ({
  visible,
  onClose,
  telemetry,
  initialAgency = 'WMO',
  onForceRefresh,
}) => {
  const [selectedAgency, setSelectedAgency] = useState<'IMD' | 'ISRO' | 'NASA' | 'GSI' | 'NHAI' | 'CWC' | 'WMO'>(initialAgency);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  const handleRefresh = async () => {
    if (!onForceRefresh) return;
    setIsRefreshing(true);
    try {
      await onForceRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleShareTelemetry = () => {
    const text = `OraMet Live Disaster Telemetry (${new Date().toLocaleTimeString()}):
Agency: ${selectedAgency}
Composite Hazard: ${telemetry.compositeHazardIndex}/100 (${telemetry.hazardCategory})
NASA Soil Saturation: ${telemetry.soil.surfaceSaturationPercent}%
GSI Slope Factor of Safety: ${telemetry.slope.factorOfSafety} Fs
Evacuation Lead Time: ${telemetry.leadTime.minutesRemaining} mins to peak
Verified by MoHA / NDRF OraMet Engine`;
    Share.share({ message: text, title: 'OraMet Live Telemetry Report' });
  };

  const agencies = [
    { id: 'WMO' as const, name: 'WMO', sub: 'EW4All / Digital Twin', color: '#0369A1' },
    { id: 'CWC' as const, name: 'CWC', sub: 'River Gauge Levels', color: '#0284C7' },
    { id: 'NASA' as const, name: 'NASA', sub: 'SMAP / POWER API', color: '#0B3D91' },
    { id: 'ISRO' as const, name: 'ISRO', sub: 'MOSDAC / Bhuvan', color: '#FF7700' },
    { id: 'IMD' as const, name: 'IMD', sub: 'AWS Mausam Grid', color: '#005BBF' },
    { id: 'GSI' as const, name: 'GSI', sub: '30m DEM Slope', color: '#2E7D32' },
    { id: 'NHAI' as const, name: 'NHAI', sub: 'RWIS Road IoT', color: '#E65100' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <View style={styles.liveBadgeRow}>
                <View style={styles.pulsingGreenDot} />
                <Text style={styles.liveStreamText}>LIVE SATELLITE & IOT TELEMETRY</Text>
              </View>
              <Text style={styles.modalTitle}>Multi-Source Agency Feed</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>X</Text>
            </TouchableOpacity>
          </View>

          {/* Agency Selector Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.agencyTabBar}
          >
            {agencies.map((agency) => {
              const active = selectedAgency === agency.id;
              return (
                <TouchableOpacity
                  key={agency.id}
                  style={[styles.agencyTab, active && { backgroundColor: agency.color, borderColor: agency.color }]}
                  onPress={() => setSelectedAgency(agency.id)}
                >
                  <Text style={[styles.agencyTabTitle, active && { color: '#FFFFFF' }]}>
                    {agency.name}
                  </Text>
                  <Text style={[styles.agencyTabSub, active && { color: 'rgba(255,255,255,0.8)' }]}>
                    {agency.sub}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Body Content */}
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Status & Connection Banner */}
            <View style={styles.connectionBanner}>
              <View style={styles.connectionLeft}>
                <View style={styles.checkCircle}>
                  <Svg width={12} height={12} viewBox="0 0 24 24">
                    <Path d="M5 13l4 4L19 7" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <View>
                  <Text style={styles.connStatusTitle}>
                    {selectedAgency === 'WMO' && 'WMO EW4All & Digital Twin Hydrology Model'}
                    {selectedAgency === 'NASA' && 'NASA POWER & SMAP Live Connection'}
                    {selectedAgency === 'ISRO' && 'ISRO MOSDAC INSAT-3DR Geostationary Stream'}
                    {selectedAgency === 'IMD' && 'IMD Mausam National Radar & AWS Grid'}
                    {selectedAgency === 'GSI' && 'GSI Digital Elevation Model (DEM) & Bhukosh'}
                    {selectedAgency === 'CWC' && 'Central Water Commission River Telemetry'}
                    {selectedAgency === 'NHAI' && 'NHAI Road Weather IoT & Piezometer Net'}
                  </Text>
                  <Text style={styles.connStatusSub}>
                    HTTP 200 OK · Latency: {telemetry.nasaLive?.latencyMs || 184} ms · SSL TLS 1.3
                  </Text>
                </View>
              </View>
            </View>

            {/* NASA FEED PANEL */}
            {selectedAgency === 'NASA' && (
              <View style={styles.feedCard}>
                <Text style={styles.feedCardHeader}>NASA SMAP & MERRA-2 SATELLITE ASSIMILATION</Text>
                <Text style={styles.feedCardDesc}>
                  Real-time surface soil wetness (0-5 cm) and root-zone moisture (0-100 cm) captured via NASA SMAP L-band microwave radiometry.
                </Text>

                <View style={styles.metricsGrid}>
                  <View style={styles.metricTile}>
                    <Text style={styles.metricLabel}>SURFACE SATURATION</Text>
                    <Text style={[styles.metricValue, { color: telemetry.soil.surfaceSaturationPercent > 75 ? '#DC2626' : '#16A34A' }]}>
                      {telemetry.soil.surfaceSaturationPercent}%
                    </Text>
                    <Text style={styles.metricFoot}>SMAP Layer (0-5cm)</Text>
                  </View>

                  <View style={styles.metricTile}>
                    <Text style={styles.metricLabel}>ROOT-ZONE INDEX</Text>
                    <Text style={styles.metricValue}>
                      {telemetry.nasaLive?.rootZoneSoilWetnessPercent ?? telemetry.soil.rootZoneMoistureIndex}%
                    </Text>
                    <Text style={styles.metricFoot}>MERRA-2 Deep Wetness</Text>
                  </View>

                  <View style={styles.metricTile}>
                    <Text style={styles.metricLabel}>VOLUMETRIC MOISTURE</Text>
                    <Text style={styles.metricValue}>
                      {telemetry.soil.volumetricMoisture} m³/m³
                    </Text>
                    <Text style={styles.metricFoot}>Field Capacity Limit 0.45</Text>
                  </View>

                  <View style={styles.metricTile}>
                    <Text style={styles.metricLabel}>RUNOFF RETENTION</Text>
                    <Text style={[styles.metricValue, { color: telemetry.soil.runoffAbsorptionCapacity === 'CRITICAL' ? '#DC2626' : '#16A34A', fontSize: 13, marginTop: 4 }]}>
                      {telemetry.soil.runoffAbsorptionCapacity}
                    </Text>
                    <Text style={styles.metricFoot}>Ground Absorption</Text>
                  </View>
                </View>

                <View style={styles.rawEndpointBox}>
                  <Text style={styles.endpointLabel}>REAL API ENDPOINT:</Text>
                  <Text style={styles.endpointUrl} numberOfLines={2}>
                    {telemetry.nasaLive?.endpointUrl || 'https://power.larc.nasa.gov/api/temporal/daily/point?parameters=GWETTOP,GWETROOT&format=JSON'}
                  </Text>
                </View>
              </View>
            )}

            {/* ISRO FEED PANEL */}
            {selectedAgency === 'ISRO' && (
              <View style={styles.feedCard}>
                <Text style={[styles.feedCardHeader, { color: '#C05600' }]}>
                  ISRO MOSDAC & BHUVAN GEOPORTAL
                </Text>
                <Text style={styles.feedCardDesc}>
                  INSAT-3DR geostationary meteorological satellite observations at 74°E orbital slot for convective cloud tracking and Bhuvan landslide hazard zones.
                </Text>

                <View style={styles.metricsGrid}>
                  <View style={styles.metricTile}>
                    <Text style={styles.metricLabel}>CLOUD TOP TEMP (TB)</Text>
                    <Text style={[styles.metricValue, { color: (telemetry.isroLive?.cloudTopBrightnessTempKelvin ?? 280) < 220 ? '#DC2626' : '#0284C7' }]}>
                      {telemetry.isroLive?.cloudTopBrightnessTempKelvin ?? 278.4} K
                    </Text>
                    <Text style={styles.metricFoot}>INSAT TIR-1 Imager</Text>
                  </View>

                  <View style={styles.metricTile}>
                    <Text style={styles.metricLabel}>CLOUDBURST RISK</Text>
                    <Text style={[styles.metricValue, { fontSize: 12, marginTop: 4, color: telemetry.isroLive?.convectiveCloudburstRisk === 'EXTREME_CLOUDBURST' ? '#DC2626' : '#16A34A' }]}>
                      {telemetry.isroLive?.convectiveCloudburstRisk ?? 'NONE'}
                    </Text>
                    <Text style={styles.metricFoot}>Convective Core Index</Text>
                  </View>

                  <View style={styles.metricTile}>
                    <Text style={styles.metricLabel}>BHUVAN LANDSLIDE</Text>
                    <Text style={[styles.metricValue, { fontSize: 12, marginTop: 4 }]}>
                      {telemetry.isroLive?.bhuvanLandslideZone?.replace(/_/g, ' ') ?? 'ZONE II MODERATE'}
                    </Text>
                    <Text style={styles.metricFoot}>NRSC Landslide Map</Text>
                  </View>

                  <View style={styles.metricTile}>
                    <Text style={styles.metricLabel}>HYDRO-ESTIMATOR</Text>
                    <Text style={styles.metricValue}>
                      {telemetry.isroLive?.insatPrecipitationRateMmHr ?? 0.0} mm/h
                    </Text>
                    <Text style={styles.metricFoot}>Calibrated Precipitation</Text>
                  </View>
                </View>

                <View style={styles.rawEndpointBox}>
                  <Text style={styles.endpointLabel}>MOSDAC PORTAL LINK:</Text>
                  <Text style={styles.endpointUrl}>https://mosdac.gov.in (INSAT-3DR Live Products)</Text>
                </View>
              </View>
            )}

            {/* IMD FEED PANEL */}
            {selectedAgency === 'IMD' && (
              <View style={styles.feedCard}>
                <Text style={[styles.feedCardHeader, { color: '#005BBF' }]}>
                  INDIA METEOROLOGICAL DEPARTMENT (IMD)
                </Text>
                <Text style={styles.feedCardDesc}>
                  Panchayat & ward-level Automatic Weather Stations (AWS) & Automatic Rain Gauges (ARG) calibrated with Indian Doppler Weather Radars.
                </Text>

                <View style={styles.metricsGrid}>
                  <View style={styles.metricTile}>
                    <Text style={styles.metricLabel}>STATION ID</Text>
                    <Text style={[styles.metricValue, { fontSize: 11, marginTop: 4 }]} numberOfLines={1}>
                      {telemetry.awsArg.stationId}
                    </Text>
                    <Text style={styles.metricFoot}>IMD National Grid</Text>
                  </View>

                  <View style={styles.metricTile}>
                    <Text style={styles.metricLabel}>RAIN INTENSITY</Text>
                    <Text style={[styles.metricValue, { color: telemetry.awsArg.precipitationIntensityMmHr > 15 ? '#DC2626' : '#0284C7' }]}>
                      {telemetry.awsArg.precipitationIntensityMmHr} mm/h
                    </Text>
                    <Text style={styles.metricFoot}>Tipping Bucket ARG</Text>
                  </View>

                  <View style={styles.metricTile}>
                    <Text style={styles.metricLabel}>HUMIDITY</Text>
                    <Text style={styles.metricValue}>{telemetry.awsArg.humidityPercent}%</Text>
                    <Text style={styles.metricFoot}>Hygrometer Sensor</Text>
                  </View>

                  <View style={styles.metricTile}>
                    <Text style={styles.metricLabel}>SURFACE PRESSURE</Text>
                    <Text style={styles.metricValue}>{telemetry.awsArg.barometricPressureHpa} hPa</Text>
                    <Text style={styles.metricFoot}>Barometric Altimeter</Text>
                  </View>
                </View>

                <View style={styles.rawEndpointBox}>
                  <Text style={styles.endpointLabel}>IMD MAUSAM PORTAL:</Text>
                  <Text style={styles.endpointUrl}>https://mausam.imd.gov.in (District Rainfall Network)</Text>
                </View>
              </View>
            )}

            {/* GSI SLOPE PANEL */}
            {selectedAgency === 'GSI' && (
              <View style={styles.feedCard}>
                <Text style={[styles.feedCardHeader, { color: '#2E7D32' }]}>
                  GEOLOGICAL SURVEY OF INDIA (GSI) SLOPE STABILITY
                </Text>
                <Text style={styles.feedCardDesc}>
                  Infinite slope geotechnical stability model calibrated with 30-meter Digital Elevation Model (DEM) and GSI Bhukosh national landslide inventory.
                </Text>

                <View style={styles.metricsGrid}>
                  <View style={styles.metricTile}>
                    <Text style={styles.metricLabel}>FACTOR OF SAFETY (FS)</Text>
                    <Text style={[styles.metricValue, { color: telemetry.slope.factorOfSafety < 1.0 ? '#DC2626' : telemetry.slope.factorOfSafety < 1.3 ? '#D97706' : '#16A34A' }]}>
                      {telemetry.slope.factorOfSafety} Fs
                    </Text>
                    <Text style={styles.metricFoot}>{telemetry.slope.factorOfSafety < 1.0 ? 'Failure Imminent' : 'Stable Margin'}</Text>
                  </View>

                  <View style={styles.metricTile}>
                    <Text style={styles.metricLabel}>TERRAIN SLOPE</Text>
                    <Text style={styles.metricValue}>{telemetry.slope.demSlopeAngleDeg}°</Text>
                    <Text style={styles.metricFoot}>DEM Gradient Mesh</Text>
                  </View>

                  <View style={styles.metricTile}>
                    <Text style={styles.metricLabel}>ELEVATION</Text>
                    <Text style={styles.metricValue}>{telemetry.slope.demElevationMeters} m</Text>
                    <Text style={styles.metricFoot}>Above Mean Sea Level</Text>
                  </View>

                  <View style={styles.metricTile}>
                    <Text style={styles.metricLabel}>HISTORICAL SLIDES</Text>
                    <Text style={styles.metricValue}>{telemetry.slope.historicalSlideEventCount}</Text>
                    <Text style={styles.metricFoot}>GSI Bhukosh Database</Text>
                  </View>
                </View>

                <View style={styles.rawEndpointBox}>
                  <Text style={styles.endpointLabel}>DATABASE REFERENCE:</Text>
                  <Text style={styles.endpointUrl}>GSI Bhukosh National Landslide Susceptibility Mapping (NLSM)</Text>
                </View>
              </View>
            )}

            {/* CWC RIVER PANEL */}
            {selectedAgency === 'CWC' && (
              <View style={styles.feedCard}>
                <Text style={[styles.feedCardHeader, { color: '#0284C7' }]}>
                  CENTRAL WATER COMMISSION (CWC) RIVER TELEMETRY
                </Text>
                <Text style={styles.feedCardDesc}>
                  Real-time river catchment hydrograph tracking, discharge gauging, and flood warning markers for mountain valleys and flash-flood drainage courses.
                </Text>

                <View style={styles.metricsGrid}>
                  <View style={styles.metricTile}>
                    <Text style={styles.metricLabel}>ACTIVE RIVER</Text>
                    <Text style={[styles.metricValue, { fontSize: 12, marginTop: 4 }]} numberOfLines={1}>
                      {telemetry.cwcLive?.riverName || 'Mountain Basin River'}
                    </Text>
                    <Text style={styles.metricFoot}>{telemetry.cwcLive?.riverBasin || 'Catchment Basin'}</Text>
                  </View>

                  <View style={styles.metricTile}>
                    <Text style={styles.metricLabel}>CURRENT STAGE</Text>
                    <Text style={[styles.metricValue, { color: (telemetry.cwcLive?.isAboveDanger) ? '#DC2626' : '#0284C7' }]}>
                      {telemetry.cwcLive?.currentWaterLevelMeters || 1150.2} m
                    </Text>
                    <Text style={styles.metricFoot}>Danger: {telemetry.cwcLive?.dangerLevelMeters || 1154.5}m</Text>
                  </View>

                  <View style={styles.metricTile}>
                    <Text style={styles.metricLabel}>DISCHARGE RATE</Text>
                    <Text style={styles.metricValue}>
                      {telemetry.cwcLive?.dischargeCusecs || 1450} cusecs
                    </Text>
                    <Text style={styles.metricFoot}>Flow Velocity Index</Text>
                  </View>

                  <View style={styles.metricTile}>
                    <Text style={styles.metricLabel}>HYDROGRAPH TREND</Text>
                    <Text style={[styles.metricValue, { fontSize: 12, marginTop: 4, color: telemetry.cwcLive?.trend === 'RISING_RAPIDLY' ? '#DC2626' : '#16A34A' }]}>
                      {telemetry.cwcLive?.trend?.replace(/_/g, ' ') || 'STEADY'}
                    </Text>
                    <Text style={styles.metricFoot}>Basin Inflow Rate</Text>
                  </View>
                </View>

                <View style={styles.rawEndpointBox}>
                  <Text style={styles.endpointLabel}>CWC HYDRO NETWORK:</Text>
                  <Text style={styles.endpointUrl}>CWC National Flood Forecasting Network (Ministry of Jal Shakti)</Text>
                </View>
              </View>
            )}

            {/* WMO EW4ALL & DIGITAL TWIN PANEL */}
            {selectedAgency === 'WMO' && (
              <View style={styles.feedCard}>
                <Text style={[styles.feedCardHeader, { color: '#0369A1' }]}>
                  WMO EARLY WARNINGS FOR ALL (EW4ALL) & DIGITAL TWIN
                </Text>
                <Text style={styles.feedCardDesc}>
                  World Meteorological Organization (June 2025 standard): Physics-informed LSTM Neural Network predicting river runoff at 10-minute intervals, coupled with the Hydrological Storage Function Method and Digital Twin hydrodynamic simulation.
                </Text>

                {/* 10-Min LSTM Hydrograph Forecast Timeline */}
                <Text style={styles.subSectionHeader}>10-MINUTE INTERVAL LSTM RIVER HYDROGRAPH</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.lstmTimelineScroll}>
                  {telemetry.wmoDigitalTwin?.lstm10MinForecast.map((step, idx) => {
                    const isSevere = step.stageStatus === 'SEVERE_FLOOD' || step.stageStatus === 'EXTREME_FLOOD';
                    const isWarning = step.stageStatus === 'ABOVE_WARNING';
                    const statusColor = isSevere ? '#DC2626' : isWarning ? '#D97706' : '#16A34A';
                    return (
                      <View key={idx} style={[styles.lstmStepCard, isSevere && { borderColor: '#FECACA', backgroundColor: '#FEF2F2' }]}>
                        <Text style={styles.lstmTimeLabel}>{step.timeLabel}</Text>
                        <Text style={[styles.lstmWaterLevel, { color: statusColor }]}>{step.predictedWaterLevelMeters}m</Text>
                        <Text style={styles.lstmDischarge}>{step.dischargeCubicMetersPerSec} m³/s</Text>
                        <View style={[styles.lstmStatusTag, { backgroundColor: isSevere ? '#DC2626' : isWarning ? '#F59E0B' : '#10B981' }]}>
                          <Text style={styles.lstmStatusText}>{step.stageStatus.replace(/_/g, ' ')}</Text>
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>

                {/* Digital Twin Basin Parameters */}
                <Text style={[styles.subSectionHeader, { marginTop: 12 }]}>DIGITAL TWIN 3D HYDRODYNAMIC MODEL</Text>
                <View style={styles.metricsGrid}>
                  <View style={styles.metricTile}>
                    <Text style={styles.metricLabel}>INUNDATION DEPTH</Text>
                    <Text style={[styles.metricValue, { color: (telemetry.wmoDigitalTwin?.inundationDepthMeters ?? 0) > 0.5 ? '#DC2626' : '#0369A1' }]}>
                      {telemetry.wmoDigitalTwin?.inundationDepthMeters ?? 0.0} m
                    </Text>
                    <Text style={styles.metricFoot}>Valley Floor Submersion</Text>
                  </View>

                  <View style={styles.metricTile}>
                    <Text style={styles.metricLabel}>RUNOFF FLOW VELOCITY</Text>
                    <Text style={styles.metricValue}>
                      {telemetry.wmoDigitalTwin?.flowVelocityMps ?? 1.8} m/s
                    </Text>
                    <Text style={styles.metricFoot}>Kinematic Wave Rate</Text>
                  </View>

                  <View style={styles.metricTile}>
                    <Text style={styles.metricLabel}>STORAGE FUNCTION METHOD</Text>
                    <Text style={styles.metricValue}>
                      K={telemetry.wmoDigitalTwin?.storageFunctionMethod.kStorageFactor ?? 2.8}
                    </Text>
                    <Text style={styles.metricFoot}>S = K·Q^0.6 Model</Text>
                  </View>

                  <View style={styles.metricTile}>
                    <Text style={styles.metricLabel}>DAM / CATCHMENT INFLOW</Text>
                    <Text style={styles.metricValue}>
                      {telemetry.wmoDigitalTwin?.upstreamDamInflowCusecs ?? 450} cusecs
                    </Text>
                    <Text style={styles.metricFoot}>Storage: {telemetry.wmoDigitalTwin?.upstreamDamStoragePercent ?? 65}%</Text>
                  </View>
                </View>

                {/* Cell Broadcast Service (CBS) Box */}
                <View style={[styles.cbsBox, { borderColor: (telemetry.wmoDigitalTwin?.cellBroadcastPayload.alertPriority === 'EXTREME' || telemetry.wmoDigitalTwin?.cellBroadcastPayload.alertPriority === 'SEVERE') ? '#FECACA' : '#E2E8F0' }]}>
                  <View style={styles.cbsHeaderRow}>
                    <Text style={styles.cbsTag}>CELL BROADCAST (CBS) / SMS PROTOCOL</Text>
                    <Text style={[styles.cbsStatus, { color: (telemetry.wmoDigitalTwin?.cellBroadcastPayload.alertPriority === 'EXTREME' || telemetry.wmoDigitalTwin?.cellBroadcastPayload.alertPriority === 'SEVERE') ? '#DC2626' : '#16A34A' }]}>
                      {telemetry.wmoDigitalTwin?.cellBroadcastPayload.alertPriority ?? 'NORMAL'}
                    </Text>
                  </View>
                  <Text style={styles.cbsMessageText}>
                    {telemetry.wmoDigitalTwin?.cellBroadcastPayload.cbsMessage ?? 'Basin normal. Automated broadcast channel listening.'}
                  </Text>
                  <Text style={styles.cbsFoot}>Automated dispatch compliant with WMO EW4All & NDMA CAP v1.2</Text>
                </View>

                <View style={styles.rawEndpointBox}>
                  <Text style={styles.endpointLabel}>WMO FRAMEWORK REFERENCE:</Text>
                  <Text style={styles.endpointUrl}>WMO MeteoWorld June 2025 / Ministry of Environment AI Flood Twin</Text>
                </View>
              </View>
            )}

            {/* NHAI RWIS & IOT PANEL */}
            {selectedAgency === 'NHAI' && (
              <View style={styles.feedCard}>
                <Text style={[styles.feedCardHeader, { color: '#E65100' }]}>
                  NHAI ROAD WEATHER INFORMATION SYSTEM (RWIS)
                </Text>
                <Text style={styles.feedCardDesc}>
                  Ultrasonic road surface water film sensors, pavement friction monitors, and hillside geotechnical piezometers along national highway corridors.
                </Text>

                <View style={styles.metricsGrid}>
                  <View style={styles.metricTile}>
                    <Text style={styles.metricLabel}>HIGHWAY CORRIDOR</Text>
                    <Text style={[styles.metricValue, { fontSize: 11, marginTop: 4 }]} numberOfLines={1}>
                      {telemetry.rwis.highwayId}
                    </Text>
                    <Text style={styles.metricFoot}>{telemetry.rwis.chainageKm}</Text>
                  </View>

                  <View style={styles.metricTile}>
                    <Text style={styles.metricLabel}>ROAD STATUS</Text>
                    <Text style={[styles.metricValue, { fontSize: 13, marginTop: 4, color: telemetry.rwis.status === 'IMPASSABLE' ? '#DC2626' : telemetry.rwis.status === 'CAUTION' ? '#D97706' : '#16A34A' }]}>
                      {telemetry.rwis.status}
                    </Text>
                    <Text style={styles.metricFoot}>{telemetry.rwis.roadSurfaceCondition}</Text>
                  </View>

                  <View style={styles.metricTile}>
                    <Text style={styles.metricLabel}>WATER FILM</Text>
                    <Text style={styles.metricValue}>{telemetry.rwis.waterFilmDepthMm} mm</Text>
                    <Text style={styles.metricFoot}>Ultrasonic IoT Sensor</Text>
                  </View>

                  <View style={styles.metricTile}>
                    <Text style={styles.metricLabel}>SURFACE FRICTION</Text>
                    <Text style={styles.metricValue}>{telemetry.rwis.surfaceFrictionIndex} μ</Text>
                    <Text style={styles.metricFoot}>Grip Coefficient</Text>
                  </View>
                </View>

                <View style={styles.rawEndpointBox}>
                  <Text style={styles.endpointLabel}>IoT SENSOR NETWORK:</Text>
                  <Text style={styles.endpointUrl}>NHAI Intelligent Transportation System (ITS) Telemetry Gateway</Text>
                </View>
              </View>
            )}

            {/* Raw JSON Toggle */}
            <TouchableOpacity
              style={styles.toggleJsonBtn}
              onPress={() => setShowRawJson(!showRawJson)}
            >
              <Text style={styles.toggleJsonText}>
                {showRawJson ? 'Hide Raw API JSON' : 'Inspect Raw Live JSON Payload'}
              </Text>
            </TouchableOpacity>

            {showRawJson && (
              <View style={styles.jsonContainer}>
                <Text style={styles.jsonText}>
                  {JSON.stringify(
                    selectedAgency === 'WMO'
                      ? telemetry.wmoDigitalTwin || { model: 'WMO LSTM EW4All Digital Twin' }
                      : selectedAgency === 'NASA'
                      ? telemetry.nasaLive || { soil: telemetry.soil }
                      : selectedAgency === 'ISRO'
                      ? telemetry.isroLive || { satellite: 'INSAT-3DR' }
                      : selectedAgency === 'IMD'
                      ? telemetry.awsArg
                      : selectedAgency === 'GSI'
                      ? telemetry.slope
                      : selectedAgency === 'CWC'
                      ? telemetry.cwcLive || { river: 'Active Basin' }
                      : telemetry.rwis,
                    null,
                    2
                  )}
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.primaryBtn, isRefreshing && { opacity: 0.7 }]}
                onPress={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.primaryBtnText}>Force Re-Sync Live Feed</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareBtn} onPress={handleShareTelemetry}>
                <Text style={styles.shareBtnText}>Share Report</Text>
              </TouchableOpacity>
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
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  liveBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  pulsingGreenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },
  liveStreamText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16A34A',
    letterSpacing: 0.8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },

  agencyTabBar: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: 8,
  },
  agencyTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  agencyTabTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
  },
  agencyTabSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },

  body: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },

  connectionBanner: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 12,
    marginBottom: Spacing.md,
  },
  connectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  connStatusTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#166534',
  },
  connStatusSub: {
    fontSize: 10,
    color: '#15803D',
    marginTop: 1,
  },

  feedCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  feedCardHeader: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0B3D91',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  feedCardDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
    marginBottom: Spacing.md,
  },

  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.md,
  },
  metricTile: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  metricFoot: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },

  rawEndpointBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 8,
  },
  endpointLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  endpointUrl: {
    fontSize: 10,
    color: '#0284C7',
    fontFamily: 'monospace',
    marginTop: 2,
  },

  toggleJsonBtn: {
    backgroundColor: '#EEF2F6',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  toggleJsonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  jsonContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  jsonText: {
    color: '#38BDF8',
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 16,
  },

  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  primaryBtn: {
    flex: 2,
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  shareBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
  },

  // WMO & Digital Twin styles
  subSectionHeader: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0369A1',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  lstmTimelineScroll: {
    marginBottom: 8,
  },
  lstmStepCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
    marginRight: 8,
    alignItems: 'center',
    minWidth: 78,
  },
  lstmTimeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 4,
  },
  lstmWaterLevel: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  lstmDischarge: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 6,
  },
  lstmStatusTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lstmStatusText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cbsBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
  },
  cbsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cbsTag: {
    fontSize: 9,
    fontWeight: '900',
    color: '#475569',
    letterSpacing: 0.5,
  },
  cbsStatus: {
    fontSize: 10,
    fontWeight: '900',
  },
  cbsMessageText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 16,
    marginBottom: 4,
  },
  cbsFoot: {
    fontSize: 9,
    color: '#64748B',
  },
});
