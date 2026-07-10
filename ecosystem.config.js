module.exports = {
  apps: [
    {
      name: 'mlitech_backend',
      script: 'dist/server.js',
      instances: 1, // Can be set to 'max' or a specific number to run in cluster mode if needed
      exec_mode: 'fork', // 'fork' is recommended for cron jobs and websockets; use 'cluster' for stateless API scaling
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
};
