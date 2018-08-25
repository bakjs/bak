import Joi from 'joi'
import { Controller } from '../../..'

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
    this.get('/error', this.error)

    this.get('/validate', this.validate, {
      validate: {
        query: {
          name: Joi.string().required()
        }
      }
    })
  }

  validate () {
    return 'OK'
  }

  hello (request, h) {
    return 'Hello ' + request.params.name
  }

  error (request, h) {
    return h('foo')
  }
}
