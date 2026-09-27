import React from 'react';
import Svg, { Path, Circle, G, Line, Polyline } from 'react-native-svg';

interface WeatherIconProps {
  name: 'sun' | 'rain' | 'storm' | 'wind' | 'flood' | 'cloud' | 'shield' | 'alert' | 'map' | 'user' | 'settings' | 'bell' | 'logout' | 'edit' | 'check' | 'arrow-right' | 'arrow-left' | 'home' | 'sos' | 'camera' | 'whistle' | 'compass' | 'phone' | 'share' | 'search' | 'satellite' | 'water' | 'mountain' | 'grid' | 'filter' | 'globe';
  size?: number;
  color?: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ name, size = 24, color = '#F8FAFC' }) => {
  const icons: Record<string, React.ReactNode> = {
    sun: (
      <G>
        <Circle cx="12" cy="12" r="5" fill="none" stroke={color} strokeWidth="2" />
        <Line x1="12" y1="1" x2="12" y2="3" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <Line x1="12" y1="21" x2="12" y2="23" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <Line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <Line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <Line x1="1" y1="12" x2="3" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <Line x1="21" y1="12" x2="23" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <Line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <Line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </G>
    ),
    rain: (
      <G>
        <Path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <Line x1="8" y1="16" x2="8" y2="20" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <Line x1="12" y1="18" x2="12" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <Line x1="16" y1="16" x2="16" y2="20" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </G>
    ),
    storm: (
      <G>
        <Path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9" fill="none" stroke={color} strokeWidth="2" />
        <Polyline points="13 11 9 17 15 17 11 23" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </G>
    ),
    wind: (
      <G>
        <Path d="M9.59 4.59A2 2 0 1 1 11 8H2" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <Path d="M12.59 19.41A2 2 0 1 0 14 16H2" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <Path d="M17.73 7.73A2.5 2.5 0 1 1 19.5 12H2" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </G>
    ),
    flood: (
      <G>
        <Path d="M2 18c1.5-1.5 3-2 4.5-2s3 .5 4.5 2 3 2 4.5 2 3-.5 4.5-2" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <Path d="M2 14c1.5-1.5 3-2 4.5-2s3 .5 4.5 2 3 2 4.5 2 3-.5 4.5-2" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <Path d="M2 10c1.5-1.5 3-2 4.5-2s3 .5 4.5 2 3 2 4.5 2 3-.5 4.5-2" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </G>
    ),
    cloud: (
      <G>
        <Path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill="none" stroke={color} strokeWidth="2" />
      </G>
    ),
    shield: (
      <G>
        <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke={color} strokeWidth="2" />
        <Polyline points="9 12 11 14 15 10" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </G>
    ),
    alert: (
      <G>
        <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" fill="none" stroke={color} strokeWidth="2" />
        <Line x1="12" y1="9" x2="12" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <Circle cx="12" cy="17" r="0.5" fill={color} stroke={color} strokeWidth="1" />
      </G>
    ),
    map: (
      <G>
        <Path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" fill="none" stroke={color} strokeWidth="2" />
        <Line x1="8" y1="2" x2="8" y2="18" stroke={color} strokeWidth="2" />
        <Line x1="16" y1="6" x2="16" y2="22" stroke={color} strokeWidth="2" />
      </G>
    ),
    user: (
      <G>
        <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill="none" stroke={color} strokeWidth="2" />
        <Circle cx="12" cy="7" r="4" fill="none" stroke={color} strokeWidth="2" />
      </G>
    ),
    settings: (
      <G>
        <Circle cx="12" cy="12" r="3" fill="none" stroke={color} strokeWidth="2" />
        <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" fill="none" stroke={color} strokeWidth="2" />
      </G>
    ),
    bell: (
      <G>
        <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" fill="none" stroke={color} strokeWidth="2" />
        <Path d="M13.73 21a2 2 0 0 1-3.46 0" fill="none" stroke={color} strokeWidth="2" />
      </G>
    ),
    logout: (
      <G>
        <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" fill="none" stroke={color} strokeWidth="2" />
        <Polyline points="16 17 21 12 16 7" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Line x1="21" y1="12" x2="9" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </G>
    ),
    edit: (
      <G>
        <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" fill="none" stroke={color} strokeWidth="2" />
        <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" fill="none" stroke={color} strokeWidth="2" />
      </G>
    ),
    check: (
      <G>
        <Polyline points="20 6 9 17 4 12" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </G>
    ),
    'arrow-right': (
      <G>
        <Line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <Polyline points="12 5 19 12 12 19" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </G>
    ),
    'arrow-left': (
      <G>
        <Line x1="19" y1="12" x2="5" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <Polyline points="12 19 5 12 12 5" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </G>
    ),
    home: (
      <G>
        <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke={color} strokeWidth="2" />
        <Polyline points="9 22 9 12 15 12 15 22" fill="none" stroke={color} strokeWidth="2" />
      </G>
    ),
    sos: (
      <G>
        <Circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="2" />
        <Line x1="12" y1="8" x2="12" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <Circle cx="12" cy="16" r="0.5" fill={color} stroke={color} strokeWidth="1" />
      </G>
    ),
    camera: (
      <G>
        <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx="12" cy="13" r="4" fill="none" stroke={color} strokeWidth="2" />
      </G>
    ),
    whistle: (
      <G>
        <Path d="M2 13a4 4 0 0 0 4 4h4a7 7 0 1 0 0-14H8a2 2 0 0 0-2 2v2H2z" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx="15" cy="10" r="1.5" fill={color} />
      </G>
    ),
    compass: (
      <G>
        <Circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="2" />
        <Polyline points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </G>
    ),
    phone: (
      <G>
        <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </G>
    ),
    share: (
      <G>
        <Circle cx="18" cy="5" r="3" fill="none" stroke={color} strokeWidth="2" />
        <Circle cx="6" cy="12" r="3" fill="none" stroke={color} strokeWidth="2" />
        <Circle cx="18" cy="19" r="3" fill="none" stroke={color} strokeWidth="2" />
        <Line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke={color} strokeWidth="2" />
        <Line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke={color} strokeWidth="2" />
      </G>
    ),
    search: (
      <G>
        <Circle cx="11" cy="11" r="8" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Line x1="21" y1="21" x2="16.65" y2="16.65" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </G>
    ),
    satellite: (
      <G>
        <Path d="M13 2a9 9 0 0 1 9 9" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <Path d="M13 6a5 5 0 0 1 5 5" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <Circle cx="12" cy="12" r="2" fill={color} />
        <Path d="M4.93 19.07 7.76 16.24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <Path d="m2 22 3-3" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </G>
    ),
    water: (
      <G>
        <Path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </G>
    ),
    mountain: (
      <G>
        <Path d="m8 3 4 8 5-5 5 15H2L8 3z" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </G>
    ),
    grid: (
      <G>
        <Path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" fill={color} />
      </G>
    ),
    filter: (
      <G>
        <Line x1="4" y1="21" x2="4" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Line x1="4" y1="10" x2="4" y2="3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Line x1="12" y1="21" x2="12" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Line x1="12" y1="8" x2="12" y2="3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Line x1="20" y1="21" x2="20" y2="16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Line x1="20" y1="12" x2="20" y2="3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Line x1="1" y1="14" x2="7" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Line x1="9" y1="8" x2="15" y2="8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Line x1="17" y1="16" x2="23" y2="16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </G>
    ),
    globe: (
      <G>
        <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
        <Line x1="2" y1="12" x2="22" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <Path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke={color} strokeWidth="2" fill="none" />
      </G>
    ),
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {icons[name] || icons.cloud}
    </Svg>
  );
};
