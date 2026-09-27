import React, { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { evacuationService, SafeShelter } from '../services/evacuation/evacuationService';
import { WeatherIcon } from './WeatherIcon';
import { BorderRadius, FontSize, Spacing } from '../theme/colors';

interface GoogleMapsLiveViewProps {
  height?: number;
  latitude: number;
  longitude: number;
  shelters?: SafeShelter[];
}

export const GoogleMapsLiveView: React.FC<GoogleMapsLiveViewProps> = ({
  height = 360,
  latitude,
  longitude,
  shelters = [],
}) => {
  const [mapType, setMapType] = useState<'street' | 'satellite'>('street');
  const [isLoading, setIsLoading] = useState(true);
  const mappedPoints = useMemo(() => JSON.stringify(shelters.map((place) => ({
    name: place.name,
    lat: place.latitude,
    lon: place.longitude,
    type: place.placeType,
  }))).replace(/</g, '\\u003c'), [shelters]);

  const mapHtml = `<!DOCTYPE html>
<html><head><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>html,body,#map{height:100%;width:100%;margin:0;background:#eef2f7;font-family:Arial,sans-serif}.leaflet-control-attribution{font-size:9px!important}</style>
</head><body><div id="map"></div><script>
const lat=${latitude}; const lon=${longitude};
const map=L.map('map',{zoomControl:true}).setView([lat,lon],13);
${mapType === 'satellite'
    ? "L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:18,attribution:'Imagery © Esri'}).addTo(map);"
    : "L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map);"}
L.circleMarker([lat,lon],{radius:9,color:'#fff',weight:3,fillColor:'#2563eb',fillOpacity:1}).addTo(map).bindPopup('Selected location');
const places=${mappedPoints}; const bounds=[[lat,lon]];
places.forEach(place=>{
  L.circleMarker([place.lat,place.lon],{radius:8,color:'#fff',weight:2,fillColor:'#0f766e',fillOpacity:1}).addTo(map)
   .bindPopup((()=>{const box=document.createElement('div');const title=document.createElement('strong');title.textContent=place.name;const detail=document.createElement('div');detail.textContent=place.type.replace(/_/g,' ')+' · OpenStreetMap · not authority-verified';box.appendChild(title);box.appendChild(detail);return box;})());
  bounds.push([place.lat,place.lon]);
});
if(bounds.length>1)map.fitBounds(bounds,{padding:[28,28],maxZoom:15});
</script></body></html>`;

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.toolbar}>
        <View style={styles.segment}>
          <TouchableOpacity onPress={() => setMapType('street')} style={[styles.segmentButton, mapType === 'street' && styles.segmentSelected]}>
            <Text style={[styles.segmentText, mapType === 'street' && styles.segmentTextSelected]}>Street</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMapType('satellite')} style={[styles.segmentButton, mapType === 'satellite' && styles.segmentSelected]}>
            <Text style={[styles.segmentText, mapType === 'satellite' && styles.segmentTextSelected]}>Satellite</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.openButton}
          onPress={() => evacuationService.navigateToSafeShelter(latitude, longitude)}
          accessibilityLabel="Search nearby places in Google Maps"
        >
          <WeatherIcon name="compass" size={14} color="#FFFFFF" />
          <Text style={styles.openButtonText}>Open map</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.webWrapper}>
        <WebView
          key={mapType}
          originWhitelist={['*']}
          source={{ html: mapHtml }}
          style={styles.webView}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          javaScriptEnabled
          domStorageEnabled
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator size="small" color="#0f766e" />
              <Text style={styles.loadingText}>Loading map tiles…</Text>
            </View>
          )}
        />
        {isLoading ? <View pointerEvents="none" style={styles.loadingOverlay}><ActivityIndicator color="#0f766e" /></View> : null}
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Blue: selected location · Teal: mapped place (not safety-verified)</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFE3E8',
    marginBottom: Spacing.md,
  },
  toolbar: {
    minHeight: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    backgroundColor: '#F7F9FC',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  segment: { flexDirection: 'row', backgroundColor: '#E8EDF3', borderRadius: 20, padding: 3 },
  segmentButton: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 17 },
  segmentSelected: { backgroundColor: '#FFFFFF' },
  segmentText: { fontSize: FontSize.xs, fontWeight: '700', color: '#64748B' },
  segmentTextSelected: { color: '#0F766E' },
  openButton: { flexDirection: 'row', gap: 5, alignItems: 'center', paddingHorizontal: 11, paddingVertical: 7, borderRadius: 18, backgroundColor: '#0F766E' },
  openButtonText: { color: '#FFFFFF', fontSize: FontSize.xs, fontWeight: '700' },
  webWrapper: { flex: 1 },
  webView: { flex: 1, backgroundColor: 'transparent' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(248,250,252,0.9)' },
  loadingText: { fontSize: FontSize.xs, color: '#64748B' },
  footer: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: '#F8FAFC' },
  footerText: { color: '#64748B', fontSize: FontSize.xs },
});
