// Replaced the legacy dossier generator, which claimed integrations not present in the app.
require('./generate_sih_submission_assets');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
fs.copyFileSync(path.join(root, 'OraMet_SIH2026_Submission_Dossier.pdf'), path.join(root, 'HydroSentinel_SIH2026_Project_Details.pdf'));
fs.copyFileSync(path.join(root, 'OraMet_SIH2026_Submission_Dossier.pdf'), path.join(root, 'OraMet_SIH2026_Technical_Dossier.pdf'));
console.log('Updated legacy dossier filenames with the current prototype description.');
