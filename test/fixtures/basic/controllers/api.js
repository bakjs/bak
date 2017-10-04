const { Controller } = require('bak')

class APIController extends Controller {
  hello_$$name (request, reply) {
    reply('Hello ' + request.params.name)
  }
}

module.exports = APIController
