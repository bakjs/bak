module.exports = {
  relativeTo: __dirname,
  prefix: '/api',
  routes: [
    './controllers/api'
  ],
  connection: {
    port: 4050
  }
}
