const fs = require('fs');
const path = require('path');

function ascii(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[–—]/g, '-')
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^\x20-\x7E]/g, '');
}
function esc(value) {
  return ascii(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}
function text(value, x, y, size = 12, bold = false, color = [0.12, 0.18, 0.27]) {
  const [r, g, b] = color;
  return `q ${r} ${g} ${b} rg BT /${bold ? 'F1' : 'F2'} ${size} Tf ${x} ${y} Td (${esc(value)}) Tj ET Q`;
}
function box(x, y, w, h, color, stroke = null) {
  const fill = `${color[0]} ${color[1]} ${color[2]} rg`;
  const outline = stroke ? `${stroke[0]} ${stroke[1]} ${stroke[2]} RG 1 w` : '';
  return `q ${fill} ${outline} ${x} ${y} ${w} ${h} re ${stroke ? 'B' : 'f'} Q`;
}
function wrap(value, max = 88) {
  const words = ascii(value).split(/\s+/);
  const rows = [];
  let row = '';
  for (const word of words) {
    if ((row ? row.length + 1 : 0) + word.length > max && row) {
      rows.push(row);
      row = word;
    } else row += `${row ? ' ' : ''}${word}`;
  }
  if (row) rows.push(row);
  return rows;
}

class PDF {
  constructor(width, height) { this.width = width; this.height = height; this.pages = []; }
  add(ops) { this.pages.push(ops.join('\n')); }
  generate() {
    const objects = [];
    const kids = this.pages.map((_, i) => `${3 + i * 2} 0 R`).join(' ');
    objects.push('<< /Type /Catalog /Pages 2 0 R >>');
    objects.push(`<< /Type /Pages /Kids [${kids}] /Count ${this.pages.length} >>`);
    this.pages.forEach((stream, i) => {
      const pageId = 3 + i * 2;
      const streamId = pageId + 1;
      objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${this.width} ${this.height}] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents ${streamId} 0 R >>`);
      objects.push({ stream, length: Buffer.byteLength(stream, 'utf8') });
    });
    let output = '%PDF-1.4\n';
    const offsets = [];
    objects.forEach((obj, i) => {
      offsets.push(Buffer.byteLength(output, 'utf8'));
      const id = i + 1;
      output += typeof obj === 'string'
        ? `${id} 0 obj\n${obj}\nendobj\n`
        : `${id} 0 obj\n<< /Length ${obj.length} >>\nstream\n${obj.stream}\nendstream\nendobj\n`;
    });
    const xref = Buffer.byteLength(output, 'utf8');
    output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.forEach((offset) => { output += `${String(offset).padStart(10, '0')} 00000 n \n`; });
    output += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
    return output;
  }
}

const slides = [
  {
    title: 'OraMet', subtitle: 'SIH 2026 | Problem Statement 26192 | Disaster Management',
    points: [
      'Android-first prototype for local situational awareness during flood emergencies in hilly communities.',
      'Project/app name: OraMet. Registered team name, team ID, institute, and member names must be added from the SIH portal.',
      'Prototype demonstration - not an operational early-warning or emergency-dispatch service.',
    ],
  },
  {
    title: 'The problem and our design goal', subtitle: 'A useful interface must make uncertainty visible',
    points: [
      'Residents need understandable local context, nearby mapped places, and quick access to emergency actions.',
      'A prototype without authorized river, shelter, and road data must not invent certainty or label a place safe.',
      'OraMet brings available location/weather context and manual emergency tools into one Android experience.',
    ],
  },
  {
    title: 'What works in the prototype today', subtitle: 'Android-first React Native application',
    points: [
      'Device location permission flow and approximate area selection.',
      'Open-Meteo current-weather lookup when reachable; app thresholds are heuristic only.',
      'OpenStreetMap/Overpass nearby mapped-place lookup with unverified status and straight-line distance.',
      'Local persistence, emergency guidance, 112 calling action, and a user-reviewed SMS draft.',
    ],
  },
  {
    title: 'A transparent resident workflow', subtitle: 'Location -> context -> options -> user action',
    points: [
      'Choose precise device location or an approximate area; approximate points are not used for local risk scoring or place sharing.',
      'View current weather only when a valid response is received; otherwise the app shows unavailable.',
      'Review nearby mapped places with an explicit notice: not authority-verified, safe, or confirmed open.',
      'Open generic map directions only after a warning; directions are not hazard-aware.',
      'Prepare an SMS draft or call 112 directly. User reviews and sends; delivery is not confirmed.',
    ],
  },
  {
    title: 'Data boundaries are explicit', subtitle: 'No fabricated official readings or all-clear claims',
    points: [
      'No authorized IMD, CWC river-gauge, GSI landslide, NHAI road-closure, ISRO/MOSDAC, or WMO forecast feed is configured.',
      'No validated flood-crest lead-time prediction, verified shelter directory, or safe evacuation route is available.',
      'No automatic shake detection, audible siren, background push, SMS delivery receipt, or 112/CAD dispatch integration.',
      'Open-Meteo and OpenStreetMap are public services; neither is an emergency authority.',
    ],
  },
  {
    title: 'Validation and next step', subtitle: 'Prototype validated; field deployment requires partnerships',
    points: [
      'TypeScript, lint, 8 tests, and Android Metro JavaScript bundle pass.',
      'Native Android Gradle build was not run in this environment because Java/JDK is unavailable.',
      'Next: agency approvals and data agreements; verified shelter/road data; secure backend and identity; approved alert delivery; field and accessibility validation.',
      'Operational use requires authority integration, security/privacy review, hosting, maintenance, and responder agreements.',
    ],
  },
];

const presentation = new PDF(842, 595);
slides.forEach((slide, index) => {
  const ops = [
    box(0, 0, 842, 595, [0.965, 0.976, 0.992]),
    box(0, 522, 842, 73, [0.055, 0.13, 0.24]),
    text('SMART INDIA HACKATHON 2026  |  PS #26192', 40, 568, 10, true, [0.45, 0.82, 0.98]),
    text(slide.title, 40, 539, 24, true, [1, 1, 1]),
    text(slide.subtitle, 42, 494, 12, false, [0.25, 0.38, 0.52]),
    box(42, 472, 758, 1, [0.83, 0.88, 0.93]),
    text(`ORA MET  /  PROTOTYPE STATUS  /  ${index + 1} OF ${slides.length}`, 42, 24, 9, true, [0.35, 0.43, 0.52]),
  ];
  let y = 440;
  slide.points.forEach((point) => {
    const rows = wrap(point, 92);
    ops.push(box(48, y - 3, 6, 6, [0.03, 0.58, 0.76]));
    rows.forEach((row, line) => {
      ops.push(text(row, 70, y - line * 19, 13, line === 0, [0.11, 0.17, 0.25]));
    });
    y -= rows.length * 19 + 29;
  });
  presentation.add(ops);
});

const dossier = new PDF(595, 842);
const dossierPages = [
  {
    title: 'Project summary',
    sections: [
      ['SIH registration', [
        'Problem Statement ID: 26192',
        'Problem statement: Flash Flood Prediction System for Hilly Regions using Multi-Source Data Theme',
        'Project/app name: OraMet',
        'Registered team name / ID / institute / members: FILL IN FROM SIH PORTAL',
      ]],
      ['Copy-ready summary', [
        'OraMet is an Android-first prototype for local situational awareness during flood emergencies in hilly communities. It combines device-location context, current weather estimates from Open-Meteo when available, nearby mapped places from OpenStreetMap, emergency guidance, and a user-reviewed SMS draft addressed to India 112. It shows missing and approximate data explicitly and does not present unvalidated predictions, shelters, or directions as safe.',
      ]],
      ['Purpose', [
        'The design goal is to bring available context and manual emergency actions into one resident-facing application while making source quality and uncertainty visible.',
      ]],
    ],
  },
  {
    title: 'Implemented prototype',
    sections: [
      ['Available flows', [
        'React Native Android-first app, local navigation, location permission flow, approximate area selection, and local persistence.',
        'Open-Meteo current-weather lookup when the public endpoint is reachable. Threshold labels are app heuristics only, not an IMD warning, gauge reading, or flood forecast.',
        'OpenStreetMap/Overpass nearby mapped places with straight-line distance. Listings are not authority-verified, safe, or confirmed open.',
        'Generic map directions with a warning that they are not hazard-aware and can encounter road closures or floodwater.',
        'Emergency call action and prefilled SMS composer. The user must review and tap Send; delivery is not confirmed.',
      ]],
      ['Explicitly not implemented', [
        'Authorized IMD/CWC/GSI/NHAI/ISRO/MOSDAC/WMO hazard feeds, validated flood lead time, or official shelter/route verification.',
        'Automatic accelerometer shake detection, audible rescue siren, background push, SMS delivery receipt, and 112/CAD dispatch.',
        'Production identity provider, hosted backend, responder dashboard, and emergency-service agreements.',
      ]],
    ],
  },
  {
    title: 'Architecture and limitations',
    sections: [
      ['Current data path', [
        'React Native screens -> Zustand state -> device location and Open-Meteo public weather lookup; nearby mapped places use OpenStreetMap/Overpass; SQLite/AsyncStorage provide local app persistence.',
        'Approximate selected areas are labeled and withheld from local risk scoring, nearby-place search, and location sharing. Missing live responses display unavailable instead of fabricated safe values.',
      ]],
      ['Required for operations', [
        'Agency-approved and validated IMD/CWC/GSI feeds, authorized road-closure data, and maintained authority-verified shelter locations/status.',
        'Hosted secure backend, identity, monitoring, privacy/security review, and compliant notification/communications provider.',
        'Emergency-response agreements, field validation, accessibility testing, operational maintenance, and Android device/release testing.',
      ]],
    ],
  },
  {
    title: 'Demo and validation',
    sections: [
      ['Suggested 90-second demo', [
        'Open the app and state that it is a prototype, not an operational warning service.',
        'Show approximate area selection and explain that precise device location is required for nearby-place search/sharing.',
        'Show live weather only if a valid response exists; otherwise show unavailable.',
        'Show mapped OpenStreetMap places with the unverified notice and generic directions warning.',
        'Show the missing official-feed state, then open and cancel an SMS draft. Do not claim dispatch or delivery.',
      ]],
      ['Validation evidence', [
        'TypeScript check passed; lint passed; git diff whitespace check passed; 8 automated tests passed; Android Metro JavaScript bundle passed.',
        'Native Android Gradle build was not run because the build environment has no Java/JDK. No release APK or device test is claimed.',
      ]],
      ['Submission hygiene', [
        'Fill all registered team details from the SIH portal. Use actual screenshots/video from the running app.',
        'Check the exact PDF copies before upload; cached exports created before the safety corrections may contain outdated claims.',
      ]],
    ],
  },
];

dossierPages.forEach((page, index) => {
  const ops = [
    box(0, 0, 595, 842, [0.98, 0.985, 0.995]),
    box(0, 770, 595, 72, [0.055, 0.13, 0.24]),
    text('ORAMET  |  SIH 2026  |  PS #26192', 34, 813, 10, true, [0.45, 0.82, 0.98]),
    text(page.title, 34, 785, 21, true, [1, 1, 1]),
    text(`PROTOTYPE STATUS  |  PAGE ${index + 1} OF ${dossierPages.length}`, 34, 20, 8, true, [0.35, 0.43, 0.52]),
  ];
  let y = 740;
  page.sections.forEach(([heading, paragraphs]) => {
    ops.push(text(heading, 36, y, 13, true, [0.02, 0.42, 0.64]));
    y -= 22;
    paragraphs.forEach((paragraph) => {
      const rows = wrap(paragraph, 88);
      rows.forEach((row) => {
        ops.push(text(row, 40, y, 9.5, false, [0.12, 0.18, 0.27]));
        y -= 13;
      });
      y -= 8;
    });
    y -= 9;
  });
  dossier.add(ops);
});

const root = path.join(__dirname, '..');
const files = [
  ['OraMet_SIH2026_Submission_Presentation.pdf', presentation.generate()],
  ['OraMet_SIH2026_Submission_Dossier.pdf', dossier.generate()],
];
for (const [name, data] of files) {
  fs.writeFileSync(path.join(root, name), data, 'binary');
  console.log(`Wrote ${name} (${(Buffer.byteLength(data) / 1024).toFixed(1)} KB)`);
}

const slideHtml = slides.map((slide, index) => `
  <section class="slide" id="slide-${index + 1}">
    <div class="eyebrow">SMART INDIA HACKATHON 2026 · PS #26192 · ${index + 1} / ${slides.length}</div>
    <h1>${slide.title}</h1><p class="subtitle">${slide.subtitle}</p>
    <ul>${slide.points.map((point) => `<li>${point}</li>`).join('')}</ul>
    <div class="footer">OraMet · prototype status · ${index + 1} of ${slides.length}</div>
  </section>`).join('\n');
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>OraMet | SIH 2026</title>
<style>*,*::before,*::after{box-sizing:border-box}body{margin:0;background:#0b1220;color:#142033;font-family:Inter,Arial,sans-serif}.slide{min-height:100vh;max-width:1100px;margin:auto;padding:9vh 9vw;display:flex;flex-direction:column;justify-content:center;background:linear-gradient(145deg,#fff,#eef5fc);border-bottom:8px solid #0786ad}.eyebrow{font-size:clamp(12px,1.4vw,16px);font-weight:800;letter-spacing:.12em;color:#08729a}h1{font-size:clamp(38px,6vw,72px);line-height:1.03;margin:28px 0 12px;color:#0e1c32}.subtitle{font-size:clamp(17px,2.2vw,25px);color:#496079;margin:0 0 36px}.slide ul{padding-left:1.2em;margin:0}.slide li{font-size:clamp(19px,2.3vw,27px);line-height:1.42;margin:0 0 18px}.footer{margin-top:42px;padding-top:16px;border-top:1px solid #d6e0eb;color:#62748a;font-size:13px;font-weight:700}@media print{body{background:white}.slide{height:100vh;min-height:0;page-break-after:always;break-after:page;max-width:none}.slide:last-child{page-break-after:auto;break-after:auto}}</style></head><body>${slideHtml}</body></html>`;
fs.writeFileSync(path.join(root, 'OraMet_SIH2026_Submission_Presentation.html'), html);
console.log('Wrote OraMet_SIH2026_Submission_Presentation.html');
