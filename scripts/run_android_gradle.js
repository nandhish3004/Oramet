const { spawnSync } = require('child_process');
const path = require('path');

const task = process.argv[2];
const allowedTasks = new Set(['assembleDebug', 'assembleStaging', 'assembleRelease']);

if (!allowedTasks.has(task)) {
  console.error(`Usage: node scripts/run_android_gradle.js ${[...allowedTasks].join('|')}`);
  process.exit(2);
}

const isWindows = process.platform === 'win32';
const wrapper = isWindows ? 'gradlew.bat' : './gradlew';
const result = spawnSync(wrapper, [task], {
  cwd: path.join(__dirname, '..', 'android'),
  stdio: 'inherit',
  shell: isWindows,
});

if (result.error) {
  console.error(`Could not start the Android Gradle wrapper: ${result.error.message}`);
  process.exit(1);
}
process.exit(result.status == null ? 1 : result.status);
