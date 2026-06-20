module.exports = {
  apps: [{
    name: 'laoli-family',
    script: 'server.js',
    cwd: __dirname,
    watch: false,
    max_memory_restart: '200M',
    env: { NODE_ENV: 'production', PORT: 3456 },
    autorestart: true,
    max_restarts: 10,
    restart_delay: 5000,
  }],
};
