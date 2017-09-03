const { Controller } = require('../../..')

class APIController extends Controller {
  hello_$$name (request, reply) {
    reply('Hello ' + request.params.name)
  }
}

module.exports = APIController
