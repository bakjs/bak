const { Controller } = require('bak')

class $AuthController extends Controller {
  constructor (authProvider) {
    super({
      prefix: '/api',
      default: {
        auth: false
      },
      routes: {
        auth_user: {
          auth: {mode: 'required'}
        },
        auth_login_post: {
          enabled: authProvider.loginSupported
        },
        auth_logout: {
          auth: {mode: 'required'},
          enabled: authProvider.loginSupported
        },
        oauth_$clientID_login: {
          enabled: authProvider.oauthSupported
        },
        oauth_$clientID_authorize: {
          enabled: authProvider.oauthSupported
        }
      }
    })

    this.authProvider = authProvider
  }

  async auth_login_post (request, reply) {
    let {username, password} = request.payload
    let {token} = await this.authProvider.login({username, password, request})
    reply({token})
  }

  async auth_logout (request, reply) {
    let {session, user} = request
    await this.authProvider.logout({user, session})
    reply('LOGGED_OUT')
  }

  auth_user (request, reply) {
    reply({user: request.user})
  }

  async oauth_$clientID_login_any (request, reply, {clientID}) {
    let redirect_uri = await this.authProvider.oauthLogin(clientID)
    reply({redirect_uri})
  }

  async oauth_$clientID_authorize_any (request, reply, {clientID}) {
    let {token, user} = await this.authProvider.oauthAuthorize(clientID, request)
    reply({token, user})
  }
}

module.exports = $AuthController
