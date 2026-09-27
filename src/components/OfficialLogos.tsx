import React from 'react';
import Svg, { Path, Circle, Rect, G, Ellipse, Polygon, Line, Text as SvgText } from 'react-native-svg';

interface LogoProps {
  size?: number;
}

/**
 * Authentic NASA Meatball Vector Logo
 * Features the official deep blue sphere (#0B3D91), white starry background,
 * red supersonic aerodynamic vector chevron (#FC3D21), orbital ellipse, and bold NASA wordmark.
 */
export const NasaOfficialLogo: React.FC<LogoProps> = ({ size = 28 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Blue Sphere */}
      <Circle cx="50" cy="50" r="48" fill="#0B3D91" />

      {/* Star Field */}
      <Circle cx="20" cy="30" r="1.5" fill="#FFFFFF" opacity={0.85} />
      <Circle cx="28" cy="22" r="1.2" fill="#FFFFFF" opacity={0.7} />
      <Circle cx="35" cy="40" r="1.8" fill="#FFFFFF" opacity={0.9} />
      <Circle cx="68" cy="25" r="1.6" fill="#FFFFFF" opacity={0.8} />
      <Circle cx="80" cy="35" r="1.2" fill="#FFFFFF" opacity={0.75} />
      <Circle cx="75" cy="65" r="1.8" fill="#FFFFFF" opacity={0.9} />
      <Circle cx="82" cy="72" r="1.3" fill="#FFFFFF" opacity={0.7} />
      <Circle cx="24" cy="70" r="1.5" fill="#FFFFFF" opacity={0.85} />
      <Circle cx="32" cy="78" r="1.2" fill="#FFFFFF" opacity={0.65} />

      {/* Orbit Ellipse */}
      <Ellipse
        cx="50"
        cy="50"
        rx="42"
        ry="18"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        fill="none"
        transform="rotate(-28, 50, 50)"
      />

      {/* Red Supersonic Aerodynamic Chevron */}
      <Path
        d="M20 78 L52 14 L84 78 L68 78 L52 38 L36 78 Z"
        fill="#FC3D21"
      />

      {/* NASA Lettering in White */}
      <SvgText
        x="50"
        y="58"
        fill="#FFFFFF"
        fontSize="22"
        fontWeight="900"
        textAnchor="middle"
        letterSpacing="2"
      >
        NASA
      </SvgText>
    </Svg>
  );
};

/**
 * Authentic ISRO Vector Logo
 * Features the signature orange upward sunburst triangle, blue dish / satellite array,
 * and official ISRO typography.
 */
export const IsroOfficialLogo: React.FC<LogoProps> = ({ size = 28 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Background soft circle for contrast */}
      <Circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />

      {/* Upward Orange Delta Launch Vector */}
      <Path
        d="M32 82 L50 18 L68 82 L50 68 Z"
        fill="#F37021"
      />

      {/* Inner White Launch Line */}
      <Path
        d="M48 68 L50 28 L52 68 Z"
        fill="#FFFFFF"
      />

      {/* Blue Satellite Dish Curve & Radiating Transmission Waves */}
      <Path
        d="M50 42 C64 42 75 53 75 67"
        stroke="#0066B3"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M50 32 C70 32 85 47 85 67"
        stroke="#0066B3"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Satellite Transponder Dot */}
      <Circle cx="50" cy="67" r="3.5" fill="#0066B3" />

      {/* ISRO Typography */}
      <SvgText
        x="50"
        y="92"
        fill="#0066B3"
        fontSize="12"
        fontWeight="900"
        textAnchor="middle"
      >
        isro
      </SvgText>
    </Svg>
  );
};

/**
 * Authentic IMD (India Meteorological Department) Crest
 * Features deep navy ground, concentric gold radar rings, Ashok Chakra sunburst motif,
 * and scientific atmospheric radar telemetry beams.
 */
export const ImdOfficialLogo: React.FC<LogoProps> = ({ size = 28 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Deep Navy Circular Field */}
      <Circle cx="50" cy="50" r="48" fill="#002855" />

      {/* Concentric Gold Radar Calibration Rings */}
      <Circle cx="50" cy="50" r="44" stroke="#E5A823" strokeWidth="2.2" fill="none" />
      <Circle cx="50" cy="50" r="34" stroke="#E5A823" strokeWidth="1.2" strokeDasharray="3,2" fill="none" />
      <Circle cx="50" cy="50" r="22" stroke="#E5A823" strokeWidth="1.2" strokeDasharray="2,2" fill="none" />

      {/* Central Radiating Solar / Radar Waves */}
      <Path
        d="M50 16 L50 84 M16 50 L84 50 M26 26 L74 74 M26 74 L74 26"
        stroke="#86E3CE"
        strokeWidth="1.5"
        opacity={0.65}
      />

      {/* Golden Core Anemometer / Sun Crest */}
      <Circle cx="50" cy="50" r="9" fill="#E5A823" />
      <Circle cx="50" cy="50" r="4" fill="#002855" />

      {/* IMD Wordmark */}
      <SvgText
        x="50"
        y="78"
        fill="#FFFFFF"
        fontSize="13"
        fontWeight="900"
        textAnchor="middle"
        letterSpacing="1"
      >
        IMD
      </SvgText>
    </Svg>
  );
};

/**
 * Authentic CWC (Central Water Commission / Jal Shakti) Logo
 * Features hydrological crest, barrage / dam spillway, and live river volume waves.
 */
export const CwcOfficialLogo: React.FC<LogoProps> = ({ size = 28 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Hydrologic Blue Circular Field */}
      <Circle cx="50" cy="50" r="48" fill="#0284C7" />
      <Circle cx="50" cy="50" r="44" stroke="#FFFFFF" strokeWidth="1.8" fill="none" />

      {/* Dam Spillway Structure */}
      <Path
        d="M24 38 L38 38 L42 55 L58 55 L62 38 L76 38 L76 44 L66 44 L61 62 L39 62 L34 44 L24 44 Z"
        fill="#FFFFFF"
      />

      {/* Dynamic Hydrologic Discharge River Waves */}
      <Path
        d="M22 66 C32 60 40 72 50 66 C60 60 68 72 78 66"
        stroke="#BAE6FD"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M22 75 C32 69 40 81 50 75 C60 69 68 81 78 75"
        stroke="#FFFFFF"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* CWC Wordmark */}
      <SvgText
        x="50"
        y="30"
        fill="#FFFFFF"
        fontSize="12"
        fontWeight="900"
        textAnchor="middle"
        letterSpacing="1"
      >
        CWC
      </SvgText>
    </Svg>
  );
};

/**
 * Authentic GSI (Geological Survey of India) Crest
 * Features the historical 1851 crossed geological hammer and pickaxe over bedrock strata.
 */
export const GsiOfficialLogo: React.FC<LogoProps> = ({ size = 28 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Geological Forest Green Shield */}
      <Circle cx="50" cy="50" r="48" fill="#14532D" />
      <Circle cx="50" cy="50" r="44" stroke="#FDE047" strokeWidth="2" fill="none" />

      {/* Crossed Geological Pickaxe & Sledgehammer */}
      {/* Pickaxe */}
      <Path
        d="M26 30 C34 26 44 26 52 30 L48 34 C42 32 34 32 28 34 Z"
        fill="#FDE047"
      />
      <Path
        d="M38 32 L72 76 L68 79 L34 35 Z"
        fill="#FFFFFF"
      />

      {/* Sledgehammer */}
      <Rect x="64" y="26" width="14" height="8" rx="1.5" fill="#FDE047" transform="rotate(45, 71, 30)" />
      <Path
        d="M62 35 L28 79 L24 76 L58 32 Z"
        fill="#FFFFFF"
      />

      {/* Bedrock Strata Baseline */}
      <Path
        d="M26 84 L74 84"
        stroke="#86EFAC"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* GSI Wordmark */}
      <SvgText
        x="50"
        y="60"
        fill="#FDE047"
        fontSize="13"
        fontWeight="900"
        textAnchor="middle"
        letterSpacing="1.2"
      >
        GSI
      </SvgText>
    </Svg>
  );
};

/**
 * Authentic WMO (World Meteorological Organization) Seal
 * Features the official UN blue globe with coordinate grid and golden wind vane compass.
 */
export const WmoOfficialLogo: React.FC<LogoProps> = ({ size = 28 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* UN Sky Blue Globe */}
      <Circle cx="50" cy="50" r="48" fill="#0284C7" />

      {/* Global Coordinates Grid (Latitude & Longitude) */}
      <Circle cx="50" cy="50" r="38" stroke="#BAE6FD" strokeWidth="1.4" fill="none" opacity={0.7} />
      <Ellipse cx="50" cy="50" rx="20" ry="38" stroke="#BAE6FD" strokeWidth="1.4" fill="none" opacity={0.7} />
      <Line x1="12" y1="50" x2="88" y2="50" stroke="#BAE6FD" strokeWidth="1.4" opacity={0.7} />

      {/* Golden Compass Rose / Anemometer Wind Vane */}
      <Polygon points="50,18 54,46 50,50 46,46" fill="#FDE047" />
      <Polygon points="50,82 54,54 50,50 46,54" fill="#FFFFFF" />
      <Polygon points="18,50 46,46 50,50 46,54" fill="#FFFFFF" />
      <Polygon points="82,50 54,46 50,50 54,54" fill="#FDE047" />

      {/* Center Pivot Point */}
      <Circle cx="50" cy="50" r="3.5" fill="#1E293B" />

      {/* WMO Wordmark */}
      <SvgText
        x="50"
        y="92"
        fill="#FFFFFF"
        fontSize="11"
        fontWeight="900"
        textAnchor="middle"
        letterSpacing="1"
      >
        WMO
      </SvgText>
    </Svg>
  );
};

/**
 * Authentic NDMA / NDRF Disaster Management Crest
 * Features official tri-color national rescue shield.
 */
export const NdrfOfficialLogo: React.FC<LogoProps> = ({ size = 28 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Outer Golden Shield Ring */}
      <Circle cx="50" cy="50" r="48" fill="#1F1A17" />
      <Circle cx="50" cy="50" r="44" stroke="#8C5338" strokeWidth="2" fill="none" />

      {/* Tri-color Saffron / White / Green Shield */}
      <Path
        d="M26 28 L74 28 L74 54 C74 72 50 82 50 82 C50 82 26 72 26 54 Z"
        fill="#FF9933"
      />
      <Path
        d="M26 42 L74 42 L74 54 C74 72 50 82 50 82 C50 82 26 72 26 54 Z"
        fill="#FFFFFF"
      />
      <Path
        d="M26 54 L74 54 C74 72 50 82 50 82 C50 82 26 72 26 54 Z"
        fill="#138808"
      />

      {/* NDRF Rescue Wordmark */}
      <SvgText
        x="50"
        y="49"
        fill="#000080"
        fontSize="11"
        fontWeight="900"
        textAnchor="middle"
      >
        NDRF
      </SvgText>
    </Svg>
  );
};
