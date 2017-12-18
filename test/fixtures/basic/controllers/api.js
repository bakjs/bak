const { Controller } = require('bak')

class APIController extends Controller {
  init () {
    this.get('/hello/{name}', this.hello)
  }

  hello (request, reply) {
    return 'Hello ' + request.params.name
  }
}

module.exports = APIController
