/**
 * Installs dependencies for the root, server and client.
 * Runs each `npm install` in its own directory with npm's `allow_scripts`
 * environment override removed (npm 12 rejects it for nested project installs).
 */
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const root = path.join(__dirname, '..');
const env = { ...process.env };
for (const key of Object.keys(env)) {
  if (key.toLowerCase() === 'npm_config_allow_scripts') delete env[key];
}

for (const dir of [root, path.join(root, 'server'), path.join(root, 'client')]) {
  console.log(`\n> npm install (${path.relative(root, dir) || 'root'})`);
  const r = spawnSync('npm install', { cwd: dir, env, stdio: 'inherit', shell: true });
  if (r.status !== 0) process.exit(r.status || 1);
}
console.log('\nAll dependencies installed.');
