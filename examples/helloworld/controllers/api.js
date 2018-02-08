const { Controller } = require('../../..')

class APIController extends Controller {
  init () {
    this.get('/hello/{name}', this.hello)
    this.get('/error', this.error)
  }

  hello (request, h) {
    return 'Hello ' + request.params.name
  }

  error (request, h) {
    return h('foo')
  }
}

module.exports = APIController
