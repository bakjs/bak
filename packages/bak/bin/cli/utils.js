const path = require('path')
const esm = require('esm')

const _requireESM = esm(module, {
  cjs: {
    dedefault: true
  }
})

const requireESM = (path) => {
  const m = _requireESM(path)
  return m.default || m
}

module.exports.parseArgs = (argv) => {
  const rootDir = path.resolve(process.cwd(), argv.dir || '')
  const configPath = path.resolve(rootDir, argv.config)
  const config = requireESM(configPath)

  // Extra args
  const extraArgs = []
  let extra = false
  for (let arg of process.argv) {
    if (arg === '--') {
      extra = true
      continue
    }
    if (extra) {
      extraArgs.push(arg)
    }
  }

  // Root Dir
  if (!config.relativeTo) {
    config.relativeTo = rootDir
  }

  return {
    rootDir,
    configPath,
    config,
    extraArgs
  }
}
