module.exports = {
  apps: [
    {
      name: 'bullcrux_backend_prod',
      script: './dist/src/main.js',
      watch: false,
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'bullcrux_backend_dev',
      script: './dist/src/main.js',
      watch: true,
      env: {
        NODE_ENV: 'development'
      }
    },
    {
      name: 'bullcrux_backend_test',
      script: './dist/src/main.js',
      watch: false,
      env: {
        NODE_ENV: 'testing'
      }
    }
  ]
}