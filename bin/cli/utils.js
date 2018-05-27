const path = require('path')
const esm = require('esm')(module, {})

const requireESM = path => {
  const m = esm(path)
  return m.default || m
}

module.exports.parseArgs = (argv) => {
  const rootDir = path.resolve(process.cwd(), argv.dir || '')
  const configPath = path.resolve(rootDir, argv.config)
  const config = requireESM(configPath)

  // Root Dir
  if (!config.relativeTo) {
    config.relativeTo = rootDir
  }

  return {
    rootDir,
    configPath,
    config
  }
}
