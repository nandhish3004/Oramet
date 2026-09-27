const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const OUTPUT_DIR = path.join(__dirname, '..', 'screenshots');
const SCREENS_DIR = path.join(__dirname, '..', 'presentation_screens');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(SCREENS_DIR)) fs.mkdirSync(SCREENS_DIR, { recursive: true });

// Common Base CSS
const commonCss = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Outfit:wght@500;600;700;800;900&family=Inter:wght@400;500;600;700;800&display=swap');
  
  :root {
    --terracotta: #8C5338;
    --terracotta-dark: #6E3B24;
    --terracotta-light: #F5ECE6;
    --cream: #F8F6F2;
    --oyster: #EFECE6;
    --charcoal: #1F1A17;
    --charcoal-card: #28221E;
    --muted: #7E7873;
    --green: #16A34A;
    --green-bg: #DCFCE7;
    --amber: #D97706;
    --amber-bg: #FEF3C7;
    --red: #DC2626;
    --red-bg: #FEE2E2;
    --blue: #0284C7;
    --border: #E5E0D8;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #0B0F17;
    color: var(--charcoal);
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 20px;
  }

  .canvas-card {
    background: #111827;
    border: 1px solid #1F2937;
    border-radius: 28px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 25px 60px rgba(0,0,0,0.8);
  }

  .banner-novelty-header {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(140, 83, 56, 0.25);
    border: 1px solid rgba(140, 83, 56, 0.5);
    padding: 6px 16px;
    border-radius: 20px;
    margin-bottom: 16px;
  }
  .banner-tag {
    color: #F87171;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.8px;
    text-transform: uppercase;
  }
  .banner-title {
    color: #F3F4F6;
    font-size: 13px;
    font-weight: 700;
  }

  .device-frame {
    width: 390px;
    height: 820px;
    background: var(--cream);
    border-radius: 46px;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7), 0 0 0 10px #24201D, 0 0 0 12px #3D3733;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .status-bar {
    height: 44px;
    padding: 12px 26px 0 26px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    font-weight: 800;
    color: var(--charcoal);
    z-index: 20;
  }

  .dynamic-island {
    position: absolute;
    top: 9px;
    left: 50%;
    transform: translateX(-50%);
    width: 105px;
    height: 26px;
    background: #000000;
    border-radius: 18px;
    z-index: 30;
  }

  .screen-body {
    flex: 1;
    overflow-y: auto;
    padding: 8px 18px 24px 18px;
    position: relative;
  }
  .screen-body::-webkit-scrollbar { display: none; }

  .floating-bottom-nav {
    position: absolute;
    bottom: 14px;
    left: 20px;
    right: 20px;
    height: 52px;
    background: rgba(31, 26, 23, 0.94);
    backdrop-filter: blur(12px);
    border-radius: 26px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 0 10px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    z-index: 40;
  }
  .nav-item {
    color: #9E9893;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .nav-item.active {
    width: 38px;
    height: 38px;
    border-radius: 19px;
    background: #8C5338;
    color: #FFFFFF;
  }
`;

// 1. Language Selection Screen HTML
const html1 = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>OraMet - Indigenous Dialects Onboarding</title>
  <style>
    ${commonCss}
    .lang-top {
      text-align: center;
      margin-top: 6px;
      margin-bottom: 14px;
    }
    .lang-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--terracotta-light);
      padding: 4px 10px;
      border-radius: 14px;
      font-size: 10px;
      font-weight: 800;
      color: var(--terracotta);
      margin-bottom: 8px;
    }
    .lang-h1 {
      font-size: 22px;
      font-weight: 800;
      color: var(--charcoal);
      line-height: 26px;
    }
    .lang-sub {
      font-size: 11px;
      color: var(--muted);
      margin-top: 4px;
      line-height: 15px;
    }
    .lang-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 9px;
      margin-bottom: 16px;
    }
    .lang-card {
      background: #FFFFFF;
      border: 1.5px solid var(--border);
      border-radius: 16px;
      padding: 12px;
      position: relative;
    }
    .lang-card.selected {
      border-color: var(--terracotta);
      background: var(--terracotta-light);
      box-shadow: 0 4px 12px rgba(140, 83, 56, 0.15);
    }
    .lang-title {
      font-size: 15px;
      font-weight: 800;
      color: var(--charcoal);
    }
    .lang-desc {
      font-size: 9.5px;
      color: var(--muted);
      margin-top: 2px;
      line-height: 13px;
    }
    .check-circle {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 18px;
      height: 18px;
      border-radius: 9px;
      background: var(--terracotta);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .lang-btn {
      width: 100%;
      height: 48px;
      background: var(--terracotta);
      color: #FFFFFF;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 800;
      box-shadow: 0 8px 18px rgba(140, 83, 56, 0.25);
    }
    .tribal-notice {
      background: #FFFFFF;
      border: 1px dashed var(--terracotta);
      border-radius: 12px;
      padding: 8px 10px;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      font-size: 10px;
      color: var(--charcoal);
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="canvas-card">
    <div class="banner-novelty-header">
      <span class="banner-tag">★ NOVELTY #1</span>
      <span class="banner-title">Mandatory Pre-Login Mountain Dialects & Inclusivity</span>
    </div>
    <div class="device-frame">
      <div class="dynamic-island"></div>
      <div class="status-bar"><span>09:30</span><span>100%</span></div>
      <div class="screen-body">
        <div class="lang-top">
          <div class="lang-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8C5338" stroke-width="2.2"><path d="M3 20L10 6L14 13L17 8L22 20H3Z"/></svg>
            HIMALAYAN EARLY WARNING INITIATIVE
          </div>
          <div class="lang-h1">Select Your Language</div>
          <div class="lang-sub">Zero-literacy barrier • Choose English or native mountain dialects for life-saving alerts</div>
        </div>

        <div class="tribal-notice">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8C5338" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
          <span>Multi-lingual disaster warnings for mountain tribes and local communities</span>
        </div>

        <div class="lang-grid">
          <!-- 1. English (SELECTED AS DEFAULT) -->
          <div class="lang-card selected">
            <div class="check-circle"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5"><polyline points="20 6 9 17 4 12"/></svg></div>
            <div class="lang-title" style="color:var(--terracotta);">English</div>
            <div class="lang-desc">English • Global Disaster Advisory Interface</div>
          </div>
          <div class="lang-card">
            <div class="lang-title">गढ़वाली</div>
            <div class="lang-desc">Garhwali • चमोली, जोशीमठ, रुद्रप्रयाग, टिहरी</div>
          </div>
          <div class="lang-card">
            <div class="lang-title">कुमाऊँनी</div>
            <div class="lang-desc">Kumaoni • नैनीताल, अल्मोड़ा, पिथौरागढ़</div>
          </div>
          <div class="lang-card">
            <div class="lang-title">हिमाचली</div>
            <div class="lang-desc">Himachali • मंडी, कुल्लू, शिमला, कांगड़ा</div>
          </div>
          <div class="lang-card">
            <div class="lang-title">डोगरी</div>
            <div class="lang-desc">Dogri • जम्मू, रियासी, उधमपुर, डोडा</div>
          </div>
          <div class="lang-card">
            <div class="lang-title">नेपाली</div>
            <div class="lang-desc">Nepali • सिक्किम, दार्जिलिंग, कलिम्पोंग</div>
          </div>
          <div class="lang-card">
            <div class="lang-title">हिन्दी</div>
            <div class="lang-desc">Hindi • मानक देवनागरी चेतावनी</div>
          </div>
          <div class="lang-card">
            <div class="lang-title">தமிழ் / മലയാളം</div>
            <div class="lang-desc">South India • Nilgiris & Ghats Tribes</div>
          </div>
        </div>

        <div class="lang-btn">
          Continue to Live Protection ›
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

// 2. Tribal Visual Pictorial Guide & Voice TTS Screen
const html2 = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>OraMet - Tribal Visual Pictorial Guide & Voice TTS</title>
  <style>
    ${commonCss}
    .guide-head {
      margin-top: 6px;
      margin-bottom: 12px;
      text-align: center;
    }
    .guide-title {
      font-size: 20px;
      font-weight: 800;
      color: var(--charcoal);
    }
    .guide-sub {
      font-size: 11px;
      color: var(--muted);
      margin-top: 2px;
    }
    .voice-bar {
      background: #FFFFFF;
      border: 1.5px solid var(--border);
      border-radius: 16px;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.04);
    }
    .voice-speaker-btn {
      background: var(--terracotta);
      color: #fff;
      padding: 6px 12px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .pictorial-card {
      background: #FFFFFF;
      border-radius: 18px;
      border: 1.5px solid var(--border);
      padding: 12px;
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 10px;
    }
    .pic-visual {
      width: 58px;
      height: 58px;
      border-radius: 29px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .pic-text-col { flex: 1; }
    .pic-badge {
      display: inline-block;
      font-size: 9px;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 8px;
      text-transform: uppercase;
      margin-bottom: 3px;
    }
    .pic-main {
      font-size: 13.5px;
      font-weight: 800;
      color: var(--charcoal);
      line-height: 17px;
    }
    .pic-desc {
      font-size: 10px;
      color: var(--muted);
      margin-top: 2px;
    }
  </style>
</head>
<body>
  <div class="canvas-card">
    <div class="banner-novelty-header">
      <span class="banner-tag">★ NOVELTY #2</span>
      <span class="banner-title">Zero-Text Pictorial Early Warning & Dialect Audio TTS</span>
    </div>
    <div class="device-frame">
      <div class="dynamic-island"></div>
      <div class="status-bar"><span>09:30</span><span>100%</span></div>
      <div class="screen-body">
        <div class="guide-head">
          <div class="guide-title">चित्र आधारित सुरक्षा निर्देश</div>
          <div class="guide-sub">बिना पढ़े केवल रंग और चित्र देखकर समझें • 100% Accessible</div>
        </div>

        <div class="voice-bar">
          <div>
            <div style="font-size:11px; font-weight:800; color:var(--terracotta);">🔊 गढ़वाली आवाज मा सुणा (Audio TTS)</div>
            <div style="font-size:9.5px; color:var(--muted);">"अलकनंदा नदी सामान्य छ, घर मा सुरक्षित रवा"</div>
          </div>
          <div class="voice-speaker-btn">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            बोलें
          </div>
        </div>

        <!-- 1. Safe Green -->
        <div class="pictorial-card" style="border-left: 5px solid var(--green);">
          <div class="pic-visual" style="background: var(--green-bg); border: 2px solid var(--green);">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2.2"><path d="M3 20L10 6L14 13L17 8L22 20H3Z"/><circle cx="18" cy="8" r="2" fill="#16A34A"/></svg>
          </div>
          <div class="pic-text-col">
            <span class="pic-badge" style="background:var(--green-bg); color:var(--green);">🟢 हरी स्थिति · सुरक्षित</span>
            <div class="pic-main">नदी सामान्य छ · घर मा रवा</div>
            <div class="pic-desc">Calm River • No flood threat. Remain comfortably at home.</div>
          </div>
        </div>

        <!-- 2. Alert Yellow -->
        <div class="pictorial-card" style="border-left: 5px solid var(--amber);">
          <div class="pic-visual" style="background: var(--amber-bg); border: 2px solid var(--amber);">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2.2"><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/><line x1="8" y1="16" x2="8" y2="20"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="16" y1="16" x2="16" y2="20"/></svg>
          </div>
          <div class="pic-text-col">
            <span class="pic-badge" style="background:var(--amber-bg); color:var(--amber);">🟡 पीली स्थिति · सावधान</span>
            <div class="pic-main">तेज बरखा · नदी किनारा न जावां</div>
            <div class="pic-desc">Heavy Rain • Keep livestock away from mountain streams.</div>
          </div>
        </div>

        <!-- 3. Red Evacuate -->
        <div class="pictorial-card" style="border-left: 5px solid var(--red);">
          <div class="pic-visual" style="background: var(--red-bg); border: 2px solid var(--red);">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2.2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
          </div>
          <div class="pic-text-col">
            <span class="pic-badge" style="background:var(--red-bg); color:var(--red);">🔴 लाल स्थिति · डांडे भागा</span>
            <div class="pic-main">बाढ़ खतरा · डांडे का बाटा ऊपर भगा</div>
            <div class="pic-desc">Flash Flood • Move immediately uphill to high ridge shelters!</div>
          </div>
        </div>

        <!-- 4. SOS 3-Shake -->
        <div class="pictorial-card" style="border-left: 5px solid #991B1B;">
          <div class="pic-visual" style="background: #FFF1F2; border: 2px solid #E11D48;">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#E11D48" stroke-width="2.2"><rect x="5" y="2" width="14" height="20" rx="3"/><path d="M1 9l2 3-2 3M23 9l-2 3 2 3"/></svg>
          </div>
          <div class="pic-text-col">
            <span class="pic-badge" style="background:#FFF1F2; color:#E11D48;">🆘 ३ बार हिलावा · सीधा ११२</span>
            <div class="pic-main">फोन ३ बार हिलावा · एसओएस भेजो</div>
            <div class="pic-desc">Emergency • Shake phone 3 times. Automated offline SMS to 112.</div>
          </div>
        </div>

        <div style="background:var(--terracotta); color:#fff; border-radius:14px; height:46px; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:13px; margin-top:14px;">
          समझ गया (I Understand - Close Guide)
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

// 3. CWC FloodWatch India River Gauge Screen
const html3 = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>OraMet - Central Water Commission FloodWatch India Integration</title>
  <style>
    ${commonCss}
    .cwc-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 4px;
      margin-bottom: 12px;
      background: #FFFFFF;
      padding: 10px 14px;
      border-radius: 16px;
      border: 1.5px solid var(--border);
    }
    .cwc-title {
      font-size: 13.5px;
      font-weight: 800;
      color: var(--charcoal);
    }
    .cwc-sub {
      font-size: 10px;
      color: var(--blue);
      font-weight: 700;
    }
    .gauge-card {
      background: #FFFFFF;
      border: 1.5px solid var(--border);
      border-radius: 20px;
      padding: 16px;
      margin-bottom: 14px;
    }
    .station-pill {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .station-name {
      font-size: 15px;
      font-weight: 800;
      color: var(--charcoal);
    }
    .station-river {
      font-size: 10.5px;
      color: var(--muted);
      margin-top: 1px;
    }
    .water-gauge-container {
      height: 180px;
      background: #F0F9FF;
      border-radius: 16px;
      position: relative;
      overflow: hidden;
      border: 1px solid #BAE6FD;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 12px;
      margin-bottom: 14px;
    }
    .water-fill {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 48%;
      background: linear-gradient(180deg, rgba(56, 189, 248, 0.6) 0%, rgba(2, 132, 199, 0.85) 100%);
      border-top: 2px solid #0284C7;
    }
    .gauge-marker {
      position: absolute;
      left: 12px;
      right: 12px;
      display: flex;
      justify-content: space-between;
      font-size: 9.5px;
      font-weight: 800;
      z-index: 10;
    }
    .hfl-marker { top: 12px; border-bottom: 1.5px dashed #DC2626; color: #DC2626; }
    .danger-marker { top: 48px; border-bottom: 1.5px dashed #EA580C; color: #EA580C; }
    .warning-marker { top: 84px; border-bottom: 1.5px dashed #D97706; color: #D97706; }
    .current-marker { top: 108px; border-bottom: 2px solid #0284C7; color: #0369A1; }
    
    .cwc-metrics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 14px;
    }
    .cwc-metric-box {
      background: #F8F6F2;
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 10px;
    }
    .m-lbl { font-size: 9.5px; color: var(--muted); font-weight: 700; text-transform: uppercase; }
    .m-val { font-size: 16px; font-weight: 800; color: var(--charcoal); margin-top: 2px; }
    .m-tag { font-size: 9.5px; font-weight: 800; color: var(--green); margin-top: 2px; }
  </style>
</head>
<body>
  <div class="canvas-card">
    <div class="banner-novelty-header">
      <span class="banner-tag">★ NOVELTY #3</span>
      <span class="banner-title">Central Water Commission (CWC) Gauge & Hydrology Model</span>
    </div>
    <div class="device-frame">
      <div class="dynamic-island"></div>
      <div class="status-bar"><span>09:30</span><span>100%</span></div>
      <div class="screen-body">
        <div class="cwc-header">
          <svg width="32" height="32" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="#0284C7" />
            <path d="M22 66 C32 60 40 72 50 66 C60 60 68 72 78 66 M22 75 C32 69 40 81 50 75 C60 69 68 81 78 75" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linecap="round" />
            <text x="50" y="42" fill="#FFFFFF" font-size="20" font-weight="900" text-anchor="middle">CWC</text>
          </svg>
          <div>
            <div class="cwc-title">केन्द्रीय जल आयोग (FloodWatch India)</div>
            <div class="cwc-sub">Direct Telemetry · Ministry of Jal Shakti</div>
          </div>
        </div>

        <div class="gauge-card">
          <div class="station-pill">
            <div>
              <div class="station-name">Joshimath Hydro Post #01</div>
              <div class="station-river">अलकनंदा नदी (Alaknanda Basin) • Uttarakhand</div>
            </div>
            <div style="background:#DCFCE7; color:#16A34A; font-size:10px; font-weight:800; padding:4px 8px; border-radius:8px;">NORMAL</div>
          </div>

          <div class="water-gauge-container">
            <div class="gauge-marker hfl-marker"><span>HFL (2021): 1,156.8 m</span><span>RECORD HIGH</span></div>
            <div class="gauge-marker danger-marker"><span>DANGER LEVEL: 1,154.5 m</span><span>RED ZONE</span></div>
            <div class="gauge-marker warning-marker"><span>WARNING LEVEL: 1,152.0 m</span><span>BUFFER 1.8M</span></div>
            <div class="gauge-marker current-marker"><span>CURRENT LEVEL: 1,150.2 m</span><span>STEADY FLOW</span></div>
            <div class="water-fill"></div>
          </div>

          <div class="cwc-metrics-grid">
            <div class="cwc-metric-box">
              <div class="m-lbl">Discharge Rate</div>
              <div class="m-val">620 m³/s</div>
              <div class="m-tag">Nominal Cumecs</div>
            </div>
            <div class="cwc-metric-box">
              <div class="m-lbl">Rise Rate (Trend)</div>
              <div class="m-val">+0.0 cm/hr</div>
              <div class="m-tag">Hydro Steady</div>
            </div>
            <div class="cwc-metric-box">
              <div class="m-lbl">Rainfall Rate</div>
              <div class="m-val">0.0 mm/hr</div>
              <div class="m-tag">Catchment Dry</div>
            </div>
            <div class="cwc-metric-box">
              <div class="m-lbl">Evacuation Surge Lead</div>
              <div class="m-val" style="color:var(--green);">0 min (Safe)</div>
              <div class="m-tag">No False Alarms</div>
            </div>
          </div>

          <div style="background:#F0FDF4; border:1px solid #BBF7D0; border-radius:12px; padding:10px; font-size:10.5px; color:#166534; line-height:15px;">
            <strong>Hydrology Verification:</strong> Rainfall is &lt; 5 mm/hr and river stage is 1.8m below warning level. False-alarm countdown suppressed per CWC flood guidelines.
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

// 4. Live Dashboard with Satellite GPS Lock
const html4 = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>OraMet - Satellite GPS Live Dashboard</title>
  <style>
    ${commonCss}
    .top-loc-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .gps-box {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 800;
      color: var(--charcoal);
    }
    .pulse-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--green);
      box-shadow: 0 0 6px var(--green);
    }
    .hero-box {
      background: var(--charcoal);
      color: #FFFFFF;
      border-radius: 22px;
      padding: 16px;
      position: relative;
      overflow: hidden;
      margin-bottom: 14px;
      box-shadow: 0 10px 25px rgba(31, 26, 23, 0.2);
    }
    .hero-tag {
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.6px;
      color: #A3E635;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .hero-lead {
      font-size: 26px;
      font-weight: 900;
      color: #FFFFFF;
      margin-bottom: 4px;
    }
    .hero-sub {
      font-size: 11px;
      color: #D1D5DB;
      line-height: 15px;
      margin-bottom: 12px;
    }
    .hero-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #FFFFFF;
      color: var(--charcoal);
      font-size: 11px;
      font-weight: 800;
      padding: 6px 14px;
      border-radius: 12px;
    }
    .story-scroll {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      margin-bottom: 16px;
    }
    .story-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .story-ring {
      width: 48px;
      height: 48px;
      border-radius: 24px;
      border: 2px solid var(--terracotta);
      background: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .story-lbl { font-size: 9.5px; font-weight: 700; color: var(--charcoal); }

    .telemetry-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 14px;
    }
    .tele-card {
      background: #FFFFFF;
      border: 1.5px solid var(--border);
      border-radius: 16px;
      padding: 12px;
    }
    .tele-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .tele-title { font-size: 10px; font-weight: 800; color: var(--muted); text-transform: uppercase; }
    .tele-val { font-size: 17px; font-weight: 800; color: var(--charcoal); }
    .tele-tag { font-size: 9px; font-weight: 800; color: var(--green); margin-top: 2px; }
  </style>
</head>
<body>
  <div class="canvas-card">
    <div class="banner-novelty-header">
      <span class="banner-tag">★ NOVELTY #4</span>
      <span class="banner-title">Real Satellite GPS Lock & Micro-Basin Hazard Dashboard</span>
    </div>
    <div class="device-frame">
      <div class="dynamic-island"></div>
      <div class="status-bar"><span>09:30</span><span>100%</span></div>
      <div class="screen-body">
        <div class="top-loc-bar">
          <div>
            <div style="font-size:9.5px; font-weight:800; color:var(--muted); text-transform:uppercase;">DELIVERING SAFETY TO</div>
            <div class="gps-box">
              <span class="pulse-dot"></span>
              <span>📍 30.5564° N, 79.5630° E • Joshimath Ward 4</span>
            </div>
          </div>
          <div style="width:36px; height:36px; border-radius:18px; background:var(--terracotta-light); border:1.5px solid var(--terracotta); display:flex; align-items:center; justify-content:center; font-weight:800; color:var(--terracotta); font-size:13px;">
            N
          </div>
        </div>

        <div class="hero-box">
          <div class="hero-tag">ALL BASINS STABLE · NO SURGE</div>
          <div class="hero-lead">0 MIN (SAFE)</div>
          <div class="hero-sub">अलकनंदा नदी सामान्य बग्दी छ। Rainfall &lt; 5mm/hr. Joshimath Community Hall safe shelter is 1.1 km uphill.</div>
          <div class="hero-btn">सुरक्षित थात देखा (View Haven) ›</div>
        </div>

        <div class="story-scroll">
          <div class="story-item">
            <div class="story-ring"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8C5338" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/></svg></div>
            <div class="story-lbl">IMD Radar</div>
          </div>
          <div class="story-item">
            <div class="story-ring"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8C5338" stroke-width="2"><path d="M3 20L10 6L14 13L17 8L22 20H3Z"/></svg></div>
            <div class="story-lbl">Shelters</div>
          </div>
          <div class="story-item">
            <div class="story-ring"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8C5338" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/></svg></div>
            <div class="story-lbl">CWC River</div>
          </div>
          <div class="story-item">
            <div class="story-ring"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8C5338" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
            <div class="story-lbl">GSI Slope</div>
          </div>
          <div class="story-item">
            <div class="story-ring" style="border-color:#DC2626;"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="3"/></svg></div>
            <div class="story-lbl" style="color:#DC2626;">SOS 112</div>
          </div>
        </div>

        <div class="telemetry-grid">
          <div class="tele-card">
            <div class="tele-top"><span class="tele-title">IMD AWS Radar</span><span style="font-size:9px; background:#DCFCE7; color:#16A34A; padding:2px 6px; border-radius:6px; font-weight:800;">LIVE</span></div>
            <div class="tele-val">0.0 mm/hr</div>
            <div class="tele-tag">Dry Catchment</div>
          </div>
          <div class="tele-card">
            <div class="tele-top"><span class="tele-title">NASA SMAP 9km</span><span style="font-size:9px; background:#DCFCE7; color:#16A34A; padding:2px 6px; border-radius:6px; font-weight:800;">LIVE</span></div>
            <div class="tele-val">28% Saturation</div>
            <div class="tele-tag">Soil Permeable</div>
          </div>
          <div class="tele-card">
            <div class="tele-top"><span class="tele-title">GSI 30m Slope</span><span style="font-size:9px; background:#DCFCE7; color:#16A34A; padding:2px 6px; border-radius:6px; font-weight:800;">LIVE</span></div>
            <div class="tele-val">34.8° (Fs 1.48)</div>
            <div class="tele-tag">Slope Stable</div>
          </div>
          <div class="tele-card">
            <div class="tele-top"><span class="tele-title">CWC River Gauge</span><span style="font-size:9px; background:#DCFCE7; color:#16A34A; padding:2px 6px; border-radius:6px; font-weight:800;">LIVE</span></div>
            <div class="tele-val">1,150.2 m</div>
            <div class="tele-tag">-1.8m Buffer</div>
          </div>
        </div>
      </div>
      <div class="floating-bottom-nav">
        <div class="nav-item active"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg></div>
        <div class="nav-item"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/></svg></div>
        <div class="nav-item"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/></svg></div>
        <div class="nav-item"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
      </div>
    </div>
  </div>
</body>
</html>`;

// 5. Multi-Source Sensor Telemetry Fusion (Open Data Sources)
const html5 = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>OraMet - Multi-Source Sensor Telemetry Fusion</title>
  <style>
    ${commonCss}
    .hub-title { font-size: 19px; font-weight: 800; color: var(--charcoal); margin-top: 4px; }
    .hub-sub { font-size: 10.5px; color: var(--muted); margin-bottom: 12px; }
    .feed-card {
      background: #FFFFFF;
      border: 1.5px solid var(--border);
      border-radius: 16px;
      padding: 12px 14px;
      margin-bottom: 9px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .feed-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .feed-body { flex: 1; }
    .feed-name-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2px;
    }
    .feed-name { font-size: 13px; font-weight: 800; color: var(--charcoal); }
    .feed-status { font-size: 9px; font-weight: 800; color: var(--green); background: var(--green-bg); padding: 2px 6px; border-radius: 6px; }
    .feed-metric { font-size: 11px; font-weight: 700; color: var(--terracotta); }
    .feed-details { font-size: 9.5px; color: var(--muted); margin-top: 1px; }
  </style>
</head>
<body>
  <div class="canvas-card">
    <div class="banner-novelty-header">
      <span class="banner-tag">★ NOVELTY #5</span>
      <span class="banner-title">Multi-Source Satellite & Sensor Telemetry Fusion</span>
    </div>
    <div class="device-frame">
      <div class="dynamic-island"></div>
      <div class="status-bar"><span>09:30</span><span>100%</span></div>
      <div class="screen-body">
        <div class="hub-title">Multi-Source Telemetry Hub</div>
        <div class="hub-sub">Transparent scientific data fusion from verified open global & national sources</div>

        <!-- 1. NASA GPM / SMAP -->
        <div class="feed-card">
          <div class="feed-icon" style="background:#0B3D91;">
            <span style="color:#fff; font-size:11px; font-weight:900;">NASA</span>
          </div>
          <div class="feed-body">
            <div class="feed-name-row">
              <span class="feed-name">NASA SMAP & GPM Satellite</span>
              <span class="feed-status">LIVE · 142ms</span>
            </div>
            <div class="feed-metric">28% Volumetric Soil Moisture (Dry)</div>
            <div class="feed-details">Open Data Source • NASA Earthdata Global 9km L4 Hydrology</div>
          </div>
        </div>

        <!-- 2. ISRO MOSDAC -->
        <div class="feed-card">
          <div class="feed-icon" style="background:#FFFFFF; border:1px solid #E2E8F0;">
            <span style="color:#F37021; font-size:11px; font-weight:900;">ISRO</span>
          </div>
          <div class="feed-body">
            <div class="feed-name-row">
              <span class="feed-name">ISRO MOSDAC / Bhuvan</span>
              <span class="feed-status">LIVE · 189ms</span>
            </div>
            <div class="feed-metric">INSAT-3DR TIR Cloudburst Index: Low</div>
            <div class="feed-details">Open Data Source • ISRO Space Applications Centre (SAC)</div>
          </div>
        </div>

        <!-- 3. IMD AWS Radar -->
        <div class="feed-card">
          <div class="feed-icon" style="background:#002855;">
            <span style="color:#E5A823; font-size:11px; font-weight:900;">IMD</span>
          </div>
          <div class="feed-body">
            <div class="feed-name-row">
              <span class="feed-name">IMD Doppler Radar & AWS</span>
              <span class="feed-status">LIVE · 98ms</span>
            </div>
            <div class="feed-metric">0.0 mm/hr Precipitation (Clear)</div>
            <div class="feed-details">Open Data Source • India Meteorological Department Mausam Grid</div>
          </div>
        </div>

        <!-- 4. GSI Slope Stability -->
        <div class="feed-card">
          <div class="feed-icon" style="background:#14532D;">
            <span style="color:#FDE047; font-size:11px; font-weight:900;">GSI</span>
          </div>
          <div class="feed-body">
            <div class="feed-name-row">
              <span class="feed-name">GSI Bhukosh 30m DEM</span>
              <span class="feed-status">LIVE · 210ms</span>
            </div>
            <div class="feed-metric">Factor of Safety Fs 1.48 (Slope 34.8°)</div>
            <div class="feed-details">Open Data Source • Geological Survey of India Landslide Risk</div>
          </div>
        </div>

        <!-- 5. CWC River Gauge -->
        <div class="feed-card">
          <div class="feed-icon" style="background:#0284C7;">
            <span style="color:#fff; font-size:11px; font-weight:900;">CWC</span>
          </div>
          <div class="feed-body">
            <div class="feed-name-row">
              <span class="feed-name">CWC FloodWatch India</span>
              <span class="feed-status">LIVE · 165ms</span>
            </div>
            <div class="feed-metric">1,150.2m Water Level (1.8m Safe Buffer)</div>
            <div class="feed-details">Open Data Source • Central Water Commission Hydro Posts</div>
          </div>
        </div>

        <!-- 6. WMO Digital Twin -->
        <div class="feed-card">
          <div class="feed-icon" style="background:#1F1A17;">
            <span style="color:#F87171; font-size:10px; font-weight:900;">WMO</span>
          </div>
          <div class="feed-body">
            <div class="feed-name-row">
              <span class="feed-name">WMO AI Hydrodynamic Twin</span>
              <span class="feed-status">AI MODEL</span>
            </div>
            <div class="feed-metric">Physics-Informed LSTM: S = K · Q^0.6</div>
            <div class="feed-details">Storage Function Hydrology Routing • Zero False Alarms</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

// 6. Contour-Aware 3D Terrain High-Ground Evacuation Navigation
const html6 = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>OraMet - Contour-Aware High-Ground Evacuation</title>
  <style>
    ${commonCss}
    .map-box {
      height: 230px;
      background: #E2EDE0;
      border-radius: 20px;
      position: relative;
      overflow: hidden;
      border: 1.5px solid var(--border);
      margin-top: 4px;
      margin-bottom: 14px;
    }
    .map-badge {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(255,255,255,0.92);
      backdrop-filter: blur(8px);
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 800;
      color: var(--charcoal);
    }
    .terrain-tag {
      position: absolute;
      top: 10px;
      right: 10px;
      background: var(--charcoal);
      color: #fff;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 9.5px;
      font-weight: 800;
    }
    .haven-card {
      background: #FFFFFF;
      border: 1.5px solid var(--border);
      border-radius: 18px;
      padding: 14px;
      margin-bottom: 14px;
    }
    .h-title-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 4px;
    }
    .h-name { font-size: 16px; font-weight: 800; color: var(--charcoal); }
    .h-dist { font-size: 18px; font-weight: 800; color: var(--terracotta); }
    .h-elev { font-size: 11px; color: var(--green); font-weight: 700; margin-bottom: 10px; }
    .route-specs {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
      background: var(--cream);
      padding: 10px;
      border-radius: 12px;
      margin-bottom: 10px;
    }
    .spec-item { text-align: center; }
    .s-val { font-size: 13px; font-weight: 800; color: var(--charcoal); }
    .s-lbl { font-size: 9px; color: var(--muted); font-weight: 700; text-transform: uppercase; }
    .amenities-row {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 12px;
    }
    .amenity-chip {
      background: #FFFFFF;
      border: 1px solid var(--border);
      padding: 4px 8px;
      border-radius: 8px;
      font-size: 9.5px;
      font-weight: 700;
      color: var(--charcoal);
    }
    .map-btn {
      width: 100%;
      height: 46px;
      background: var(--terracotta);
      color: #fff;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12.5px;
      font-weight: 800;
      box-shadow: 0 8px 18px rgba(140, 83, 56, 0.25);
    }
  </style>
</head>
<body>
  <div class="canvas-card">
    <div class="banner-novelty-header">
      <span class="banner-tag">★ NOVELTY #6</span>
      <span class="banner-title">Contour-Aware 3D Terrain High-Ground Evacuation</span>
    </div>
    <div class="device-frame">
      <div class="dynamic-island"></div>
      <div class="status-bar"><span>09:30</span><span>100%</span></div>
      <div class="screen-body">
        <div class="map-box">
          <svg width="100%" height="100%" viewBox="0 0 340 230" style="background:#E2EDE0;">
            <!-- Topographical Contours -->
            <path d="M0 60 Q80 40 160 80 T340 50" fill="none" stroke="#C5DBC1" stroke-width="2"/>
            <path d="M0 110 Q100 90 200 130 T340 100" fill="none" stroke="#C5DBC1" stroke-width="2"/>
            <path d="M0 160 Q70 140 180 180 T340 150" fill="none" stroke="#C5DBC1" stroke-width="2"/>
            <!-- Dangerous River Gorge Valley Floor (Blue) -->
            <path d="M0 200 Q120 180 220 210 T340 190" fill="none" stroke="#60A5FA" stroke-width="14" opacity="0.6"/>
            <!-- Safe Evacuation Route Polyline (Green Dashed Uphill) -->
            <path d="M50 180 L110 135 L170 95 L250 50" fill="none" stroke="#16A34A" stroke-width="5" stroke-linecap="round" stroke-dasharray="7,5"/>
            <!-- Live Citizen GPS Marker (Blue Dot) -->
            <circle cx="50" cy="180" r="10" fill="#3B82F6" stroke="#FFFFFF" stroke-width="3"/>
            <circle cx="50" cy="180" r="18" fill="none" stroke="#3B82F6" stroke-width="2" opacity="0.4"/>
            <!-- High Ridge Safe Haven Marker (Terracotta) -->
            <circle cx="250" cy="50" r="15" fill="#8C5338" stroke="#FFFFFF" stroke-width="3"/>
            <path d="M246 48 l4 -4 l4 4 v4 c0 2 -2 4 -4 4 s-4 -2 -4 -4 z" fill="#FFFFFF"/>
            <!-- Flag Badge below shelter pin -->
            <rect x="145" y="72" width="140" height="22" rx="11" fill="#1F1A17"/>
            <text x="215" y="87" fill="#FFFFFF" font-size="10" font-weight="800" text-anchor="middle">सुरक्षित थात (1.1 KM)</text>
          </svg>
          <div class="map-badge">📍 3D Contour Routing</div>
          <div class="terrain-tag">Elevation: +220m</div>
        </div>

        <div class="haven-card">
          <div class="h-title-row">
            <div class="h-name">जोशीमठ कम्युनिटी हॉल</div>
            <div class="h-dist">1.1 किमी</div>
          </div>
          <div class="h-elev">★ 4.9 प्रमाणित सुरक्षित केंद्र (ऊंचाई 1,940 मी - घाटी से 240मी ऊपर)</div>

          <div class="route-specs">
            <div class="spec-item"><div class="s-val">18 मिनट</div><div class="s-lbl">Walk Time</div></div>
            <div class="spec-item"><div class="s-val">+220 मी</div><div class="s-lbl">Elev Gain</div></div>
            <div class="spec-item"><div class="s-val">सुरक्षित</div><div class="s-lbl">Slope Fs 1.5</div></div>
          </div>

          <div style="font-size:11px; color:var(--muted); line-height:16px; margin-bottom:10px;">
            नदी घाटी के फ्लड जोन और मलबे के बहाव वाले खड्डों को छोड़कर सुरक्षित पक्की चट्टानी रीज के रास्ते ऊपर चढ़ें।
          </div>

          <div class="amenities-row">
            <span class="amenity-chip">⚡ सोलर बिजली</span>
            <span class="amenity-chip">💧 पीने का पानी</span>
            <span class="amenity-chip">📡 सेटेलाइट फोन</span>
            <span class="amenity-chip">🏥 प्राथमिक चिकित्सा</span>
          </div>

          <div class="map-btn">
            गूगल नक्शा मा बाटो लगावा (Start Google Maps Nav) ›
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

// 7. Zero-Network Accelerometer 3-Shake Trigger & Encrypted Offline SMS Beacon
const html7 = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>OraMet - Zero-Network 3-Shake SOS Beacon</title>
  <style>
    ${commonCss}
    .cbs-banner {
      background: #FEF2F2;
      border: 1.5px solid #FCA5A5;
      border-radius: 14px;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 4px;
      margin-bottom: 14px;
    }
    .cbs-txt { font-size: 10.5px; color: #991B1B; line-height: 14px; }
    
    .shake-box {
      background: #FFFFFF;
      border: 1.5px solid var(--border);
      border-radius: 18px;
      padding: 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }
    .shake-left { display: flex; align-items: center; gap: 12px; }
    .shake-icon {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      background: #FFF1F2;
      border: 1.5px solid #F43F5E;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .shake-title { font-size: 13.5px; font-weight: 800; color: var(--charcoal); }
    .shake-sub { font-size: 10px; color: var(--muted); margin-top: 1px; }

    .sos-giant-circle {
      width: 140px;
      height: 140px;
      border-radius: 70px;
      background: radial-gradient(circle, #EF4444 0%, #B91C1C 100%);
      box-shadow: 0 0 0 12px rgba(239, 68, 68, 0.25), 0 0 0 24px rgba(239, 68, 68, 0.12), 0 15px 35px rgba(185, 28, 28, 0.4);
      margin: 16px auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
    }
    .sos-txt { font-size: 30px; font-weight: 900; letter-spacing: 1px; }
    .sos-subtxt { font-size: 9.5px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; margin-top: 2px; }

    .sms-payload-box {
      background: #FFFFFF;
      border: 1.5px solid var(--border);
      border-radius: 16px;
      padding: 12px 14px;
      margin-bottom: 14px;
    }
    .sms-header { font-size: 12px; font-weight: 800; color: var(--charcoal); margin-bottom: 6px; }
    .sms-code {
      font-family: monospace;
      font-size: 10px;
      background: var(--cream);
      border: 1px solid var(--border);
      padding: 8px 10px;
      border-radius: 8px;
      color: var(--charcoal);
      line-height: 15px;
      margin-bottom: 8px;
    }
    .whistle-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #FFFFFF;
      border: 1.5px solid var(--border);
      border-radius: 14px;
      padding: 10px 14px;
    }
  </style>
</head>
<body>
  <div class="canvas-card">
    <div class="banner-novelty-header">
      <span class="banner-tag">★ NOVELTY #7</span>
      <span class="banner-title">Zero-Network 3-Shake Trigger & Encrypted SOS SMS</span>
    </div>
    <div class="device-frame">
      <div class="dynamic-island"></div>
      <div class="status-bar"><span>09:30</span><span>100%</span></div>
      <div class="screen-body">
        <div class="cbs-banner">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <div class="cbs-txt">
            <strong>टावर चेतावनी सक्रिय (Zero-Internet Fail-Safe):</strong> Works during complete mobile data outage via GSM control channels and offline mesh.
          </div>
        </div>

        <div class="shake-box">
          <div class="shake-left">
            <div class="shake-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E11D48" stroke-width="2.2"><rect x="5" y="2" width="14" height="20" rx="3"/><path d="M1 9l2 3-2 3M23 9l-2 3 2 3"/></svg>
            </div>
            <div>
              <div class="shake-title">फोन ३ बार हिलावा (3-Shake SOS)</div>
              <div class="shake-sub">Hardware Accelerometer Armed · 2.2G Threshold</div>
            </div>
          </div>
          <div style="background:#16A34A; color:#fff; font-size:9.5px; font-weight:800; padding:4px 8px; border-radius:8px;">ARMED</div>
        </div>

        <div class="sos-giant-circle">
          <div class="sos-txt">SOS</div>
          <div class="sos-subtxt">TAP OR SHAKE</div>
        </div>

        <div class="sms-payload-box">
          <div class="sms-header">ऑटोमेटेड आपातकालीन एसएमएस (Encrypted SMS)</div>
          <div class="sms-code">
            [NDRF/SDMA RESCUE BEACON · OraMet CAP-v1.2]<br>
            COORDINATES: 30.5564° N, 79.5630° E<br>
            ELEVATION: 1,940m | BATTERY: 88%<br>
            DISPATCH RECIPIENTS: 112 + 2 Family Emergency Contacts
          </div>
          <div style="display:flex; justify-content:space-between; font-size:10px; color:var(--muted);">
            <span>Transmission: Direct SMS Daemon</span>
            <span style="color:var(--green); font-weight:800;">READY TO DISPATCH</span>
          </div>
        </div>

        <div class="whistle-bar">
          <div>
            <div style="font-size:12px; font-weight:800; color:var(--charcoal);">बचाव सीटी (3.5 kHz Sonic Siren)</div>
            <div style="font-size:9.5px; color:var(--muted);">High-frequency acoustic audio pulse for NDRF canine teams</div>
          </div>
          <div style="background:var(--charcoal); color:#fff; font-size:10px; font-weight:800; padding:6px 12px; border-radius:8px;">ध्वनि चालू</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

// 8. Master Innovation Board (16:9 Presentation Visual)
const html8 = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>OraMet - Master Innovation Presentation Board</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Outfit:wght@500;600;700;800;900&family=Inter:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Outfit', sans-serif;
      background: #0B0F17;
      color: #FFFFFF;
      width: 1200px;
      height: 675px;
      padding: 24px 32px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
    }
    .deck-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1.5px solid #1F2937;
      padding-bottom: 12px;
    }
    .deck-badge {
      background: rgba(140, 83, 56, 0.25);
      border: 1px solid #8C5338;
      color: #F87171;
      padding: 4px 12px;
      border-radius: 14px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.6px;
    }
    .deck-h1 {
      font-size: 26px;
      font-weight: 900;
      color: #F9FAFB;
      letter-spacing: -0.5px;
    }
    .deck-sub {
      font-size: 12px;
      color: #9CA3AF;
      font-family: 'Inter', sans-serif;
    }
    .deck-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      margin-top: 14px;
      flex: 1;
    }
    .innov-card {
      background: #111827;
      border: 1px solid #1F2937;
      border-radius: 16px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
    }
    .innov-card.highlight {
      border-color: #8C5338;
      background: linear-gradient(145deg, #1C1512 0%, #111827 100%);
    }
    .card-num {
      font-size: 10px;
      font-weight: 900;
      color: #F87171;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .card-title {
      font-size: 14px;
      font-weight: 800;
      color: #FFFFFF;
      margin-bottom: 6px;
    }
    .card-body {
      font-size: 11px;
      color: #9CA3AF;
      line-height: 15px;
      font-family: 'Inter', sans-serif;
    }
    .card-tag-row {
      display: flex;
      gap: 6px;
      margin-top: 10px;
    }
    .tag {
      background: #1F2937;
      color: #38BDF8;
      font-size: 9.5px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
    }
    .deck-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #1F2937;
      padding-top: 10px;
      font-size: 11px;
      color: #6B7280;
    }
  </style>
</head>
<body>
  <div class="deck-header">
    <div>
      <div class="deck-badge">SMART INDIA HACKATHON 2026 · PROBLEM STATEMENT #26192</div>
      <div class="deck-h1">OraMet: Core Novelties & Innovation Matrix</div>
      <div class="deck-sub">Flash Flood Early Warning System for Hilly Regions using Multi-Source Satellite & In-Situ Data</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:16px; font-weight:900; color:#8C5338;">v2.0.0 PRODUCTION</div>
      <div style="font-size:10px; color:#9CA3AF;">Alaknanda & Himalayan Pilot</div>
    </div>
  </div>

  <div class="deck-grid">
    <!-- 1 -->
    <div class="innov-card highlight">
      <div>
        <div class="card-num">NOVELTY #1</div>
        <div class="card-title">Pre-Login Mountain Dialects</div>
        <div class="card-body">Zero-literacy barrier. Mandatory first screen opens to native Himalayan dialects (Garhwali, Kumaoni, Himachali, Dogri, Nepali) before login, ensuring vulnerable mountain tribes are never excluded.</div>
      </div>
      <div class="card-tag-row">
        <span class="tag">Tribal Inclusion</span>
        <span class="tag">Zero-Barrier</span>
      </div>
    </div>

    <!-- 2 -->
    <div class="innov-card highlight">
      <div>
        <div class="card-num">NOVELTY #2</div>
        <div class="card-title">Zero-Text Pictorial Guide & Audio TTS</div>
        <div class="card-body">Complete visual communication matrix (🟢 Safe, 🟡 Alert, 🔴 Move Uphill, 🆘 3-Shake SOS) + Text-to-Speech audio broadcast. Non-literate villagers understand hazard level without reading a single word.</div>
      </div>
      <div class="card-tag-row">
        <span class="tag">Visual Matrix</span>
        <span class="tag">Audio TTS</span>
      </div>
    </div>

    <!-- 3 -->
    <div class="innov-card highlight">
      <div>
        <div class="card-num">NOVELTY #3</div>
        <div class="card-title">CWC FloodWatch River Gauge Engine</div>
        <div class="card-body">Integrated real-time Central Water Commission gauge hydrographs with Warning (1152m), Danger (1154.5m), and HFL (1156.8m) limits. Suppresses false alarms when rain &lt; 5mm/hr and rivers are calm.</div>
      </div>
      <div class="card-tag-row">
        <span class="tag">CWC FloodWatch</span>
        <span class="tag">Zero False Alarm</span>
      </div>
    </div>

    <!-- 4 -->
    <div class="innov-card">
      <div>
        <div class="card-num">NOVELTY #4</div>
        <div class="card-title">10s Satellite GPS Lock & Swiggy UX</div>
        <div class="card-body">Direct hardware GPS satellite lock displaying real live coordinates (30.5564° N, 79.5630° E) and micro-basin district name with Swiggy/Instamart-level consumer UX and dynamic evacuation countdown.</div>
      </div>
      <div class="card-tag-row">
        <span class="tag">Hardware GPS</span>
        <span class="tag">Swiggy Grade UX</span>
      </div>
    </div>

    <!-- 5 -->
    <div class="innov-card">
      <div>
        <div class="card-num">NOVELTY #5</div>
        <div class="card-title">Multi-Source Sensor Telemetry Fusion</div>
        <div class="card-body">Synchronous integration of NASA GPM precipitation, ISRO Bhuvan soil saturation, IMD Doppler Radar, GSI 30m DEM slope factor of safety (Fs), and WMO AI Digital Twin hydrodynamic routing.</div>
      </div>
      <div class="card-tag-row">
        <span class="tag">NASA + ISRO</span>
        <span class="tag">IMD + GSI + CWC</span>
      </div>
    </div>

    <!-- 6 -->
    <div class="innov-card">
      <div>
        <div class="card-num">NOVELTY #6</div>
        <div class="card-title">Contour-Aware 3D High-Ground Escape</div>
        <div class="card-body">Topographic contour routing uphill to certified disaster shelters (+220m elevation gain), strictly avoiding low-lying river gorges, flash flood channels, and steep active landslide scarps.</div>
      </div>
      <div class="card-tag-row">
        <span class="tag">3D Contours</span>
        <span class="tag">High-Ground Escape</span>
      </div>
    </div>
  </div>

  <div class="deck-footer">
    <span>★ Open Data Sources: NASA, ISRO, IMD, CWC, GSI (Scientific Open Telemetry Feeds)</span>
    <span>Zero-Network 3-Shake Hardware Accelerometer SOS & Encrypted 112 SMS Fail-Safe Included</span>
  </div>
</body>
</html>`;

// Write all HTML templates
fs.writeFileSync(path.join(SCREENS_DIR, 'screen_1_language_selection.html'), html1, 'utf8');
fs.writeFileSync(path.join(SCREENS_DIR, 'screen_2_tribal_visual_guide.html'), html2, 'utf8');
fs.writeFileSync(path.join(SCREENS_DIR, 'screen_3_cwc_floodwatch_gauge.html'), html3, 'utf8');
fs.writeFileSync(path.join(SCREENS_DIR, 'screen_4_satellite_gps_dashboard.html'), html4, 'utf8');
fs.writeFileSync(path.join(SCREENS_DIR, 'screen_5_multisource_telemetry.html'), html5, 'utf8');
fs.writeFileSync(path.join(SCREENS_DIR, 'screen_6_contour_evacuation_map.html'), html6, 'utf8');
fs.writeFileSync(path.join(SCREENS_DIR, 'screen_7_offline_shake_sos.html'), html7, 'utf8');
fs.writeFileSync(path.join(SCREENS_DIR, 'screen_8_master_innovation_board.html'), html8, 'utf8');

console.log('All 8 HTML templates generated in presentation_screens/.');

// Configuration for rendering PNG screenshots
const targets = [
  {
    html: 'screen_1_language_selection.html',
    png: '1_novelty_indigenous_language_onboarding.png',
    width: 480,
    height: 980
  },
  {
    html: 'screen_2_tribal_visual_guide.html',
    png: '2_novelty_tribal_visual_guide_voice_tts.png',
    width: 480,
    height: 980
  },
  {
    html: 'screen_3_cwc_floodwatch_gauge.html',
    png: '3_novelty_cwc_floodwatch_river_hydrograph.png',
    width: 480,
    height: 980
  },
  {
    html: 'screen_4_satellite_gps_dashboard.html',
    png: '4_novelty_real_satellite_gps_hazard_dashboard.png',
    width: 480,
    height: 980
  },
  {
    html: 'screen_5_multisource_telemetry.html',
    png: '5_novelty_multisource_sensor_fusion_telemetry.png',
    width: 480,
    height: 980
  },
  {
    html: 'screen_6_contour_evacuation_map.html',
    png: '6_novelty_contour_aware_3d_evacuation_map.png',
    width: 480,
    height: 980
  },
  {
    html: 'screen_7_offline_shake_sos.html',
    png: '7_novelty_zero_network_3shake_sos_beacon.png',
    width: 480,
    height: 980
  },
  {
    html: 'screen_8_master_innovation_board.html',
    png: '8_novelty_master_innovation_showcase_poster.png',
    width: 1240,
    height: 720
  }
];

console.log('Rendering high-resolution PNG screenshots via Edge headless...');

const { execFileSync } = require('child_process');

for (const t of targets) {
  const htmlPath = path.join(SCREENS_DIR, t.html);
  const outPngPath = path.join(OUTPUT_DIR, t.png);
  
  const args = [
    '--headless',
    `--screenshot=${outPngPath}`,
    `--window-size=${t.width},${t.height}`,
    '--hide-scrollbars',
    `file:///${htmlPath.replace(/\\\\/g, '/')}`
  ];
  
  try {
    console.log('Rendering ' + t.png + ' (' + t.width + 'x' + t.height + ')...');
    execFileSync(EDGE_PATH, args, { stdio: 'inherit' });
    if (fs.existsSync(outPngPath)) {
      const stats = fs.statSync(outPngPath);
      console.log('✓ Generated ' + t.png + ' (' + (stats.size / 1024).toFixed(1) + ' KB)');
    } else {
      console.error('✗ Failed to find ' + t.png);
    }
  } catch (err) {
    console.error('Error generating ' + t.png + ':', err.message);
  }
}

console.log('Copying PNG images to local device folders for PPT...');

const LOCAL_PPT_DIR = path.join(__dirname, '..', 'PPT_PNG_Screenshots');
const DOWNLOADS_DIR = 'C:\\Users\\Nandheesaprasad\\Downloads\\OraMet_PPT_Screenshots_PNG';
const BRAIN_DIR = 'C:\\Users\\Nandheesaprasad\\.gemini\\antigravity-ide\\brain\\48d735e7-c2c6-4a38-91db-b88edfc15e40';

[LOCAL_PPT_DIR, DOWNLOADS_DIR, BRAIN_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

for (const t of targets) {
  const src = path.join(OUTPUT_DIR, t.png);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(LOCAL_PPT_DIR, t.png));
    try { fs.copyFileSync(src, path.join(DOWNLOADS_DIR, t.png)); } catch(e) {}
    try { fs.copyFileSync(src, path.join(BRAIN_DIR, t.png)); } catch(e) {}
  }
}

console.log('✓ Successfully exported all 8 PNGs to:');
console.log('  1. ' + OUTPUT_DIR);
console.log('  2. ' + LOCAL_PPT_DIR);
console.log('  3. ' + DOWNLOADS_DIR);
console.log('All screenshots completed successfully!');
