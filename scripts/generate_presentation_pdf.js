// Replaced the legacy presentation generator, which claimed integrations not present in the app.
require('./generate_sih_submission_assets');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
fs.copyFileSync(path.join(root, 'OraMet_SIH2026_Submission_Presentation.pdf'), path.join(root, 'HydroSentinel_SIH2026_Presentation.pdf'));
fs.copyFileSync(path.join(root, 'OraMet_SIH2026_Submission_Presentation.html'), path.join(root, 'HydroSentinel_SIH2026_Presentation.html'));
console.log('Updated legacy presentation filenames with the current prototype description.');
