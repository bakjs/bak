const Chalk = require('chalk');
const _ = require('lodash');
const Utils = require('../utils')

const NONE = Chalk.grey('▪')
const COLORS = ['yellow', 'green', 'magenta', 'red', 'blue', 'cyan'];
const METHODS = ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'];
const AUTH_MAP = {
    required: Chalk.green('✔'),
    optional: Chalk.yellow('OPTIONAL'),
    try: Chalk.red('TRY'),
    '': NONE
};

function colorize(str, collection, shift = 0, alt) {
    let color = COLORS[((collection.indexOf(str) + 1) + shift) % COLORS.length];
    if (!Chalk[color]) return colorize(str, collection, shift + 1, alt);
    return Chalk[color](alt || str);
}

let _controllers = [];

function controller_color(controller) {
    if (_controllers.indexOf(controller) === -1)
        _controllers.push(controller);
    return colorize(controller, _controllers, 4);
}

function method_color(method, alt) {
    return colorize(method, METHODS, 0, alt);
}

function print_route_table(routes) {
    // Extract routes
    let _routes = routes.map((route) => {
        let controller, fn
        let id = route.settings.id || '';
        let s = id.split('.');

        controller = (s[0] && s[0].length) ? s[0] : 'Default';
        s.shift();
        fn = s.length ? s.join('_') : NONE

        // Auth
        let auth = NONE;
        let scope = NONE;
        if (route.settings.auth) {
            auth = route.settings.auth.mode;
            // Scope
            if (route.settings.auth.access) {
                scope = route.settings.auth.access.map(acl => String(acl.scope.selection)).join('|');
            }
        }

        return ({
            Method: route.method.toUpperCase(),
            Path: route.path,
            Auth: AUTH_MAP[auth] || AUTH_MAP[''],
            Access: scope,
            Controller: controller,
            Function: fn
        });
    });

    // Sort before formatting
    _routes.sort((a, b) => {
        if (a.Controller > b.Controller) return 1;
        if (a.Controller < b.Controller) return -1;

        if (a.Path > b.Path) return 1;
        if (a.Path < b.Path) return -1;

        let aI = METHODS.indexOf(a.Method);
        let bI = METHODS.indexOf(b.Method);
        if (aI > bI) return 1;
        if (aI < bI) return -1;

        return 0;
    });

    // Colorize
    // let _counter = 0;
    _routes.forEach((route) => {
        const m = route.Method;
        route.Method = `[ ${Chalk(method_color(m))} ]`;
        route.Path = method_color(m, route.Path);

        // route.Controller = controller_color(route.Controller);
        route.Function = Chalk.grey(route.Function);
    });

    // Separate by controller
    let groupedRoutes = _.groupBy(_routes, 'Controller');
    _routes.forEach(r => {
        delete r.Controller;
    });

    let groupedArray = [];
    Object.keys(groupedRoutes).forEach(controller => {
        if (controller[0] === '_') {
            return;
        }
        groupedArray.push(null);
        groupedArray.push(controller)
        groupedArray.push(null)
        groupedArray = groupedArray.concat(groupedRoutes[controller]);
    });

    Utils.table.printTable(groupedArray, 'llccl', null, { indent: 0, rowSpace: 1 });

    console.log();
}

const RoutesPlugin = {
    register(server, config, next) {
        // Print routes table on server start for each connection
        server.ext('onPostStart', (_server, _next) => {
            _server.table().forEach(connection => {
                print_route_table(connection.table);
            });
            _next();
        });

        // Next
        if (next) next();
    }
};

RoutesPlugin.register.attributes = {
    name: 'bak-routes',
};

module.exports = RoutesPlugin;