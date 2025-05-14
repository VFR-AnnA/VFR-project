module.exports = {
  apps: [{
    name: 'vfr-frontend',
    script: 'node_modules\\next\\dist\\bin\\next',
    args: 'dev --turbopack --hostname 0.0.0.0',
    watch: false,
    env: {
      NODE_ENV: 'development',
    },
    // Restart the app if it uses too much memory
    max_memory_restart: '1G',
    // Restart the app if it crashes
    autorestart: true,
  }]
}