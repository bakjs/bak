const { Controller } = require('../../..')

class APIController extends Controller {
  hello_$$name (request, h) {
    return {
      name: request.params.name
    }
  }
}

module.exports = APIController
