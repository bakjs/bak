# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.7.5](https://github.com/bakjs/bak/compare/bak@4.7.4...bak@4.7.5) (2019-04-16)


### Bug Fixes

* pin esm to 3.2.20 ([aa407b9](https://github.com/bakjs/bak/commit/aa407b9))





## [4.7.4](https://github.com/bakjs/bak/compare/bak@4.7.3...bak@4.7.4) (2019-04-16)


### Bug Fixes

* **cli:** use cjs dedefault ([829294e](https://github.com/bakjs/bak/commit/829294e))





## [4.7.3](https://github.com/bakjs/bak/compare/bak@4.7.2...bak@4.7.3) (2019-03-09)


### Bug Fixes

* **cli:** workaround for esm[#740](https://github.com/bakjs/bak/issues/740) ([54e6622](https://github.com/bakjs/bak/commit/54e6622))





## [4.7.2](https://github.com/bakjs/bak/compare/bak@4.7.1...bak@4.7.2) (2019-03-09)

**Note:** Version bump only for package bak





## [4.7.1](https://github.com/bakjs/bak/compare/bak@4.7.0...bak@4.7.1) (2018-12-16)

**Note:** Version bump only for package bak





# [4.7.0](https://github.com/bakjs/bak/compare/bak@4.6.2...bak@4.7.0) (2018-12-05)


### Features

* listerner.keepAliveTimeout (fixes [#28](https://github.com/bakjs/bak/issues/28)) ([70e2042](https://github.com/bakjs/bak/commit/70e2042))





## [4.6.2](https://github.com/bakjs/bak/compare/bak@4.6.1...bak@4.6.2) (2018-12-03)

**Note:** Version bump only for package bak





## [4.6.1](https://github.com/bakjs/bak/compare/bak@4.6.0...bak@4.6.1) (2018-11-19)

**Note:** Version bump only for package bak





# [4.6.0](https://github.com/bakjs/bak/compare/bak@1.1.4...bak@4.6.0) (2018-11-19)


### Features

* improve DX ([3efae66](https://github.com/bakjs/bak/commit/3efae66))
* improve logging plugin ([94d64f2](https://github.com/bakjs/bak/commit/94d64f2))
* log and send validation errors by default ([6ad26a1](https://github.com/bakjs/bak/commit/6ad26a1))





# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="4.5.0"></a>
# [4.5.0](https://github.com/bakjs/bak/compare/v4.4.0...v4.5.0) (2018-11-05)


### Features

* use consola.wrapConsle ([73c0964](https://github.com/bakjs/bak/commit/73c0964))



<a name="4.4.0"></a>
# [4.4.0](https://github.com/bakjs/bak/compare/v4.3.0...v4.4.0) (2018-11-05)



<a name="4.3.0"></a>
# [4.3.0](https://github.com/bakjs/bak/compare/v4.2.1...v4.3.0) (2018-09-15)


### Bug Fixes

* **cli/dev:** listen on nodemon events after stating ([27642ed](https://github.com/bakjs/bak/commit/27642ed))


### Features

* **cli/dev:** restart server using r ([5fe6c29](https://github.com/bakjs/bak/commit/5fe6c29))



<a name="4.2.1"></a>
## [4.2.1](https://github.com/bakjs/bak/compare/v4.2.0...v4.2.1) (2018-09-14)


### Bug Fixes

* **controller:** inert directory support ([67c4d73](https://github.com/bakjs/bak/commit/67c4d73))



<a name="4.2.0"></a>
# [4.2.0](https://github.com/bakjs/bak/compare/v4.1.2...v4.2.0) (2018-08-26)


### Bug Fixes

* **controller:** remove validate.payload for GET and HEAD requests ([04f35a9](https://github.com/bakjs/bak/commit/04f35a9))


### Features

* **cli:** support extra args ([2c8398e](https://github.com/bakjs/bak/commit/2c8398e))



<a name="4.1.2"></a>
## [4.1.2](https://github.com/bakjs/bak/compare/v4.1.1...v4.1.2) (2018-07-03)


### Bug Fixes

* **server.js:** check for nested plugin props ([#14](https://github.com/bakjs/bak/issues/14)) ([ce3a3ca](https://github.com/bakjs/bak/commit/ce3a3ca))



<a name="4.1.1"></a>
## [4.1.1](https://github.com/bakjs/bak/compare/v4.1.0...v4.1.1) (2018-05-31)


### Bug Fixes

* **server:** support array as options for plugin registration ([056edb8](https://github.com/bakjs/bak/commit/056edb8))



<a name="4.1.0"></a>
# [4.1.0](https://github.com/bakjs/bak/compare/v4.0.2...v4.1.0) (2018-05-27)


### Bug Fixes

* default config value to 'bak.config.js' ([30d0388](https://github.com/bakjs/bak/commit/30d0388))
* don't replace 0.0.0.0 with hostname ([2addad5](https://github.com/bakjs/bak/commit/2addad5))
* **bak:** disable relative resolve by default ([aa2fd4e](https://github.com/bakjs/bak/commit/aa2fd4e))
* use simpler type checkings ([260d756](https://github.com/bakjs/bak/commit/260d756))


### Features

* **cli:** development mode support with `bak dev` ([d90c729](https://github.com/bakjs/bak/commit/d90c729))
* fully support esm for route, controllers and plugins ([3cd74d7](https://github.com/bakjs/bak/commit/3cd74d7))
* use [@bakjs](https://github.com/bakjs)/dev-errors ([0869214](https://github.com/bakjs/bak/commit/0869214))
* use consola ([eccbdcd](https://github.com/bakjs/bak/commit/eccbdcd))
* use std-env to detect dev mode by default ([d260238](https://github.com/bakjs/bak/commit/d260238))
* **cli:** support esm in bak.config.js ([023f9c6](https://github.com/bakjs/bak/commit/023f9c6))
* **cli:** use rootdir/bak.config.js as default value ([a3d8986](https://github.com/bakjs/bak/commit/a3d8986))
* **server:** support esm export default for plugins and routes ([345bbc0](https://github.com/bakjs/bak/commit/345bbc0))



<a name="4.0.2"></a>
## [4.0.2](https://github.com/bakjs/bak/compare/v4.0.1...v4.0.2) (2018-04-12)



<a name="4.0.1"></a>
## [4.0.1](https://github.com/bakjs/bak/compare/v4.0.0...v4.0.1) (2018-02-08)



<a name="4.0.0"></a>
# [4.0.0](https://github.com/bakjs/bak/compare/v3.1.0...v4.0.0) (2018-02-08)


### Features

* devErrors ([73b2ea7](https://github.com/bakjs/bak/commit/73b2ea7))


### misc

* **server:** remove implicit config option handling ([8ea4a5a](https://github.com/bakjs/bak/commit/8ea4a5a))


### BREAKING CHANGES

* **server:** plugin options should be explicitly defined in bak.config.js



<a name="3.1.0"></a>
# [3.1.0](https://github.com/bakjs/bak/compare/v3.0.7...v3.1.0) (2018-02-08)


### Features

* upgrade [@bakjs](https://github.com/bakjs)/logging ([ef23430](https://github.com/bakjs/bak/commit/ef23430))



<a name="3.0.7"></a>
## [3.0.7](https://github.com/bakjs/bak/compare/v3.0.6...v3.0.7) (2018-01-28)



<a name="3.0.6"></a>
## [3.0.6](https://github.com/bakjs/bak/compare/v3.0.5...v3.0.6) (2018-01-26)



<a name="3.0.5"></a>
## [3.0.5](https://github.com/bakjs/bak/compare/v3.0.4...v3.0.5) (2017-12-19)



<a name="3.0.4"></a>
## [3.0.4](https://github.com/bakjs/bak/compare/v3.0.3...v3.0.4) (2017-12-18)


### Bug Fixes

* **controller:** use defaultsDeep for route.config ([80d0cde](https://github.com/bakjs/bak/commit/80d0cde))



<a name="3.0.3"></a>
## [3.0.3](https://github.com/bakjs/bak/compare/v3.0.2...v3.0.3) (2017-12-18)


### Bug Fixes

* **server:** await on routes ([e58d3e3](https://github.com/bakjs/bak/commit/e58d3e3))



<a name="3.0.2"></a>
## [3.0.2](https://github.com/bakjs/bak/compare/v3.0.1...v3.0.2) (2017-12-18)


### Bug Fixes

* **controller:** minor fixes ([f9a2566](https://github.com/bakjs/bak/commit/f9a2566))



<a name="3.0.1"></a>
## [3.0.1](https://github.com/bakjs/bak/compare/v3.0.0...v3.0.1) (2017-12-18)


### Bug Fixes

* **controller:** call to init() after contructor() ([5ad8c72](https://github.com/bakjs/bak/commit/5ad8c72))


### Performance Improvements

* **controller:** routes are no longer async ([7b8bc11](https://github.com/bakjs/bak/commit/7b8bc11))



<a name="3.0.0"></a>
# [3.0.0](https://github.com/bakjs/bak/compare/v2.0.3...v3.0.0) (2017-12-18)


### Features

* new Controller API ([0c4a663](https://github.com/bakjs/bak/commit/0c4a663))


### BREAKING CHANGES

* every project relies on Current auto routing should now defind routes in init() method. See readme and examples.



<a name="2.0.3"></a>
## [2.0.3](https://github.com/bakjs/bak/compare/v2.0.2...v2.0.3) (2017-11-29)


### Bug Fixes

* **controller:** support using hapi syntax for route paths ([835fec7](https://github.com/bakjs/bak/commit/835fec7))



<a name="2.0.2"></a>
## [2.0.2](https://github.com/bakjs/bak/compare/v2.0.1...v2.0.2) (2017-11-29)



<a name="2.0.1"></a>
## [2.0.1](https://github.com/bakjs/bak/compare/2.0.0...2.0.1) (2017-11-09)



<a name="1.1.4"></a>
## [1.1.4](https://github.com/bakjs/bak/compare/bak@1.1.3...bak@1.1.4) (2017-09-12)




**Note:** Version bump only for package bak

<a name="1.1.3"></a>
## [1.1.3](https://github.com/bakjs/bak/compare/bak@1.1.2...bak@1.1.3) (2017-09-06)


### Bug Fixes

* install mongo by default for core ([b82810c](https://github.com/bakjs/bak/commit/b82810c))




<a name="1.1.2"></a>
## [1.1.2](https://github.com/bakjs/bak/compare/bak@1.1.1...bak@1.1.2) (2017-09-06)


### Bug Fixes

* make [@bakjs](https://github.com/bakjs)/mongo a peer dependency ([f7ec5c4](https://github.com/bakjs/bak/commit/f7ec5c4))




<a name="1.1.1"></a>
## [1.1.1](https://github.com/bakjs/bak/compare/bak@1.1.0...bak@1.1.1) (2017-09-06)


### Bug Fixes

* routes constructor ([a92a626](https://github.com/bakjs/bak/commit/a92a626))




<a name="1.1.0"></a>
# [1.1.0](https://github.com/bakjs/bak/compare/bak@1.0.1...bak@1.1.0) (2017-09-06)


### Features

* use process.env PORT and HOST if provided ([cedaa97](https://github.com/bakjs/bak/commit/cedaa97))




<a name="1.0.1"></a>
## 1.0.1 (2017-09-05)




**Note:** Version bump only for package bak

<a name="1.0.0"></a>
# 1.0.0 (2017-09-04)




**Note:** Version bump only for package bak
