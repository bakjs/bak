import Joi from 'joi'
import { Controller } from 'bak'

export default class APIController extends Controller {
  init () {
    this.defaults = {
      validate: {
        payload: {
          foo: Joi.string()
        }
      }
    }

    this.get('/hello/{name}', this.hello)
  }

  hello (request, reply) {
    return 'Hello ' + request.params.name
  }
}
