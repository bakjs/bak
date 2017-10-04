<p align="center">
<a href="https://bak.js.org">
    <img src="./.assets/logo.webp" width="400px">
</a>

<br> <p align="center">Delightful and modern web applications framework based on Hapi.js</p> <br>

<p align="center">
<a href="https://github.com/bakjs/bak">
    <img alt="" src="https://david-dm.org/bakjs/bak.svg?style=flat-square">
</a>
<a href="https://circleci.com/gh/bakjs/bak">
    <img alt="" src="https://img.shields.io/circleci/project/github/bakjs/bak/master.svg?style=flat-square">
</a>
<a href="https://www.npmjs.com/package/bak">
    <img alt="" src="https://img.shields.io/npm/dt/bak.svg?style=flat-square">
</a>
<a href="https://www.npmjs.com/package/bak">
    <img alt="" src="https://img.shields.io/npm/v/bak.svg?style=flat-square">
</a>
<a href="https://github.com/bakjs/bak">
    <img alt="" src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square">
</a>
</p>

<h1 align="center">Features</h1>

- Built on top of [hapi.js](https://hapijs.com), A rich framework for building applications and services
- Designed for modern Node.js APIs. Supporting native async/await and promises
- Controller support for routing
- Single file configuration without need to extra boilerplate
- Lots of ready to use and stable plugins
- CLI & Dev friendly tools

<h1 align="center">Getting started</h1>

Install `bak` dependency

```bash
>_ yarn add bak@next
```

Create `bak.config.js`

```js
module.exports = {
  prefix: '/api',
  routes: [
    './controllers/api'
  ]
}
```

Create `controllers/api.js`

```js
const { Controller } = require('bak')

module.exports class APIController extends Controller {

  // Auto magically creates /api/hello/{name} route
  hello_$$name (request, reply) {
    reply('Hello ' + request.params.name)
  }

}
```

Start server

```bash
>_ yarn bak start
```

Your API is up! Now you can visit [http://localhost:3000/api/hello/world](http://localhost:3000/api/hello/world) for the results.

![image](https://user-images.githubusercontent.com/5158436/30007047-00bb3d3a-911b-11e7-85c6-2cdeddfdeed9.png)

# Plugins

For common and production ready hapi plugins that can be used with BAK, see [hapi-plugins](https://github.com/bakjs/hapi-plugins).

# License
Released under The MIT [LICENSE](./LICENSE).       
Copyright (c) 2016-2017 Fandogh - Pooya Parsa