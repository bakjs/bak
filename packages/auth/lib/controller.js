const { Controller } = require('bak')
const Joi = require('joi')

class $AuthController extends Controller {
  constructor (authProvider, authOptions) {
    super()
    this.authProvider = authProvider
    this.authOptions = authOptions
  }

  init () {
    this.prefix = '/api'
    this.defaults.auth = false
    this.defaults.tags = ['api', 'Authentication']

    this.get('/auth/user', this.user, {
      description: 'Get the currently authenticated user',
      auth: {
        mode: 'required'
      }
    })

    if (this.authProvider.loginSupported) {
      this.post('/auth/login', this.login, {
        description: 'Login user with the provided credentials',
        validate: {
          payload: {
            username: Joi.string().description('Username or Email').example('test@example.com'),
            password: Joi.string().description('Password').example('123456')
          }
        }
      })

      this.post('/auth/logout', this.logout, {
        description: 'Logout the currently authenticated user',
        auth: {
          mode: 'required'
        }
      })
    }

    if (this.authProvider.oauthSupported) {
      this.get('/oauth/{clientID}/login', this.oauthLogin)
      this.post('/oauth/{clientID}/authorize', this.oauthAuthorize)
    }
  }

  async login (request, h) {
    let { username, password } = request.payload || {}
    let { token } = await this.authProvider.login({ username, password, request })

    if (this.authOptions.state) {
      h.state(this.authOptions.accessTokenName || 'token', token, Object.assign({
        isSecure: false,
        ttl: null,
        path: '/'
      }, this.authOptions.state))
    }

    return h.response({ token })
  }

  async logout (request, h) {
    let { session, user } = request
    await this.authProvider.logout({ user, session })
    return 'LOGGED_OUT'
  }

  async user (request, h) {
    return { user: request.user }
  }

  async oauthLogin (request, h) {
    let redirect_uri = await this.authProvider.oauthLogin(request.params.clientID)
    return { redirect_uri }
  }

  async oauthAuthorize (request, h) {
    let { token, user } = await this.authProvider.oauthAuthorize(request.params.clientID, request)
    return { token, user }
  }
}

module.exports = $AuthController
