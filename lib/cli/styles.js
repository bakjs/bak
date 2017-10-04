const chalk = require('chalk')

module.exports = {
  // Style usage components
  usagePrefix: str => chalk.white(str.slice(0, 6)) + ' ' + chalk.magenta(str.slice(7)),
  usageCommandPlaceholder: str => chalk.magenta(str),
  usagePositionals: str => chalk.green(str),
  usageArgsPlaceholder: str => chalk.green(str),
  usageOptionsPlaceholder: str => chalk.green.dim(str),

  // Style normal help text
  group: str => chalk.white(str),
  flags: (str, type) => {
    // Magenta for commands
    // Green for args
    // Dim green for options
    if (type.datatype === 'command') {
      return str.split(' ').map(flag => flag.startsWith('[') || flag.startsWith('<') ? chalk.green(flag) : chalk.magenta(flag)).join(' ')
    }
    let style = chalk.green
    if (str.startsWith('-')) style = style.dim
    return style(str)
  },
  desc: str => chalk.cyan(str),
  hints: str => chalk.dim(str),
  example: str => chalk.yellow(str.slice(0, 2)) +
        str.slice(2).split(' ').map(word => word.startsWith('-') ? chalk.green.dim(word) : chalk.gray(word)).join(' '),

  // Use different style when a type is invalid
  groupError: str => chalk.red(str),
  flagsError: str => chalk.red(str),
  descError: str => chalk.yellow(str),
  hintsError: str => chalk.red(str),

  // Style error messages
  messages: str => chalk.red(str)
}
