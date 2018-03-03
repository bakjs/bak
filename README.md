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
const  {Controller} = require("bak")

class APIController extends Controller {
  init () {
    this.get('/hello/{name}', this.hello)
  }

  hello (request, reply) {
    return 'Hello ' + request.params.name
  }
}

module.exports = APIController
```

Start server:

```bash
yarn bak start
```

Your API is up! Now you can visit [http://localhost:3000/api/hello/world](http://localhost:3000/api/hello/world) for the results.

<h2 align="center">Adding nodemon</h2>

Install `nodemon` package:

```bash
yarn add nodemon
```

Change `scripts` in `package.json` like this:

```json
"scripts": {
    "start": "bak start",
    "dev": "nodemon"
}
```

Start server with `nodemon`:

```bash
yarn dev
``` 
<h2 align="center">License</h2>
      
Copyright (c) 2016-2017 Fandogh - Pooya Parsa

Released under The MIT [LICENSE](./LICENSE)
