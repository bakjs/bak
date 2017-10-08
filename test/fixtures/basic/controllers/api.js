const { Controller } = require('bak')

class APIController extends Controller {
  hello_$$name (request, reply) {
    return 'Hello ' + request.params.name
  }
}

module.exports = APIController
