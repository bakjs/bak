module.exports.trimSlash = function trimslash(s) {
    return s[s.length - 1] === '/' ? s.slice(0, s.length - 1) : s
};

module.exports.normalizePath = function normalizePath(path) {
    return trimslash(path.replace(/\/+/g, '/'));
};

module.exports.fatal = function fatal(msg, error, additional) {
    console.error(msg);
    console.error(additional);
    if (error) console.error(error);
    process.exit(1);
};
