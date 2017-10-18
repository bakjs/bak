const { capitalize } = require('lodash')

exports.register = function (server, config = { models: [] }) {
  server.decorate('request', 'input', function (paramNames) {
    const request = this
    let queue = []
    let resolvedParams = {}

    paramNames.forEach((paramName) => {
      // Optional params
      const isOptional = paramName.endsWith('?')
      if (isOptional) {
        paramName = paramName.substr(0, paramName.length - 2)
      }

      // Get user input
      let requestParam = request.params[paramName]

      // Skip optional params if are not provided
      if (isOptional && !requestParam) {
        resolvedParams[paramName] = null
        return
      }

      // Find param model
      let model = config.models[capitalize(paramName)]

      // Directly resolve params without model
      if (!model) {
        resolvedParams[paramName] = requestParam
        return
      }

      // Prepare query
      let routeKey = model.$routeKey || '_id'
      if (routeKey instanceof Function) routeKey = routeKey()
      let query = {}
      query[routeKey] = requestParam.toString()

      // Push find job to queue
      queue.push(model.findOne(query).then((item) => {
        if (!item) {
          throw new Error('no records found for ' + paramName)
        }
        resolvedParams[paramName] = item
      }))
    })

    return Promise.all(queue)
  })
}

exports.name = 'bak-input'
