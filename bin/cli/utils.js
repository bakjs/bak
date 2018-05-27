const path = require('path')

module.exports.parseArgs = (argv) => {
  const rootDir = path.resolve(process.cwd(), argv.dir || '')
  const configPath = path.resolve(rootDir, argv.config)
  const config = require(configPath)

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
