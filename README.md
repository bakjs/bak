<p align="center">
<a href="https://bak.js.org">
    <img src="./.assets/logo.webp" width="300px" alt="Bak.js">
</a>
</p>

<p align="center">Delightful modern web applications framework for hapi.js</p>

<p align="center">
<a href="https://github.com/bakjs/bak">
    <img alt="" src="https://david-dm.org/bakjs/bak.svg?style=flat-square">
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
<a href="https://circleci.com/gh/bakjs/bak">
    <img alt="" src="https://img.shields.io/circleci/project/github/bakjs/bak.svg?style=flat-square">
</a>
<a href="https://codecov.io/gh/bakjs/bak">
    <img alt="" src="https://img.shields.io/codecov/c/github/bakjs/bak.svg?style=flat-square">
</a>
<a href="https://hapijs.com/">
    <img alt="" src="https://img.shields.io/badge/hapi.js-17.x-yellow.svg?style=flat-square">
</a>
</p>

<h2 align="center">Features</h2>

✓ Built on top of [hapi.js](https://hapijs.com), A rich framework for building applications and services

✓ Optionally using Controllers for routing

✓ Single file configuration without need to extra boilerplate

✓ CLI & Dev friendly tools

✓ Stable and rich echo-system of hapi compatible [plugins](https://github.com/bakjs/plugins)

✓ Modular design without modifying core

<h2 align="center">Getting started</h2>

Install `bak` package:

```bash
yarn add bak
```

Create `bak.config.js`;

```js
module.exports = {
  prefix: '/api',
  routes: [
    './controllers/api'
  ]
}
```

Create `controllers/api.js`:

```js
const { Controller } = require('bak')

module.exports class APIController extends Controller {

  // Auto magically creates /api/hello/{name} route
  hello_$name (request, h) {
    return 'Hello ' + request.params.name
  }

}
```

Start server:

```bash
yarn bak start
```

Your API is up! Now you can visit [http://localhost:3000/api/hello/world](http://localhost:3000/api/hello/world) for the results.

<p align="center">
    <img src="https://user-images.githubusercontent.com/5158436/31769331-02954518-b4e0-11e7-80c1-b3776a868e5d.png" width="500px">
</p>

<h2 align="center">License</h2>
      
Copyright (c) 2016-2017 Fandogh - Pooya Parsa

Released under The MIT [LICENSE](./LICENSE)