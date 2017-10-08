module.exports = {
  relativeTo: __dirname,
  prefix: '/api',
  routes: [
    './controllers/api'
  ],
  server: {
    port: '6565'
  }
}
