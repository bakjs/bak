function parseRequest (request, timestamp) {
  let date = new Date(timestamp)
  let host = realIP(request)
  let ident = null
  let reqLine = request.method.toUpperCase() + ' ' + request.path
  let status = request.response ? request.response.statusCode : null
  let bytes = 0

  let authuser = null
  if (request.auth.credentials && request.auth.credentials.user) {
    const user = request.auth.credentials.user
    authuser = user.username || user.email || user.id || user._id
  }

  const reqInfo = { host, ident, authuser, date, request: reqLine, status, bytes }

  return reqInfo
}

function realIP (request) {
  return request.ip || request.headers['x-real-ip'] || request.headers['x-forwarded-for'] || request.info['remoteAddress']
}

function commonFormat (reqInfo) {
  return [
    reqInfo.host,
    reqInfo.ident,
    reqInfo.authuser,
    '[' + reqInfo.date.toUTCString() + ']',
    '"' + reqInfo.request + '"',
    reqInfo.status,
    reqInfo.bytes
  ].map(p => p || '-').join(' ')
}

module.exports = {
  realIP,
  commonFormat,
  parseRequest
}
