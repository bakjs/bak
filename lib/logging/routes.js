const Chalk = require('chalk');
const {printTable} = require('../helpers/table');
const _ = require('lodash');

const COLORS = ['yellow', 'green', 'magenta', 'red', 'blue', 'cyan'];
const METHODS = ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'];
const AUTH_MAP = {
    required: '✔',
    try: '❓',
    '': '⚪'
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
        let id = route.settings.id || '';
        let s = id.split('.');
        let controller = '-';
        let fn = id;
        if (s.length > 0) {
            controller = s[0];
            s.shift();
            fn = s.join('_');
        }

        // Auth
        let auth = '-';
        let access = '';
        if (route.settings.auth) {
            auth = route.settings.auth.mode;

            // Access
            if (route.settings.auth.access) {
                access = route.settings.auth.access.map(acl => String(acl.scope.selection)).join('|');
            }
        }

        return ({
            Method: route.method.toUpperCase(),
            Path: route.path,
            Auth: AUTH_MAP[auth] || AUTH_MAP[''],
            Access: access,
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
        if (aI > bI)return 1;
        if (aI < bI)return -1;

        return 0;
    });

    // Colorize
    // let _counter = 0;
    _routes.forEach((route) => {
        const m = route.Method;
        route.Method = Chalk.bold(method_color(m));
        route.Path = method_color(m, route.Path);
        route.Auth = method_color(m, route.Auth);
        route.Access = method_color(m, route.Access || '-');

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
        groupedArray.push(controller);
        groupedArray = groupedArray.concat(groupedRoutes[controller]);
    });

    printTable(groupedArray, null, null, {indent: 0, rowSpace: 1});

    console.log();
}

const RoutesPlugin = {
    register(server, config, next){
        // Keep a copy of routes
        let routes = [];
        server.on('route', (route) => {
            routes.push(route);
        });

        // Print routes table on server start
        server.ext('onPostStart', (_server, _next) => {
            print_route_table(routes);
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