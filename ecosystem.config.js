module.exports = {
  apps: [
    {
      name: 'backend',
      script: './dist/src/main.js',
      watch: false,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
}