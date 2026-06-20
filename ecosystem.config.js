module.exports = {
  apps: [{
    name: 'laoli-family',
    script: 'server.js',
    cwd: '/Users/chensijing/WorkBuddy/2026-06-20-23-15-15',
    interpreter: '/Users/chensijing/.workbuddy/binaries/node/versions/22.12.0/bin/node',
    env: {
      NODE_PATH: '/Users/chensijing/.workbuddy/binaries/node/workspace/node_modules',
      PORT: '3456'
    },
    max_restarts: 10,
    restart_delay: 5000,
    autorestart: true,
    watch: false
  }]
};
