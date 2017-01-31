const Chalk = require('chalk');
const TableMaster = require('table-master');

const COLORS = ['yellow', 'green', 'magenta', 'red', 'blue', 'cyan'];
const METHODS = ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'];

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
        let auth = '-';
        if (route.settings.auth)
            auth = route.settings.auth.mode;
        return ({
            Controller: controller,
            Method: route.method.toUpperCase(),
            Path: route.path,
            Function: fn,
            Auth: auth.toUpperCase(),
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
        let m = route.Method;
        route.Controller = controller_color(route.Controller);
        route.Method = Chalk.bold(method_color(m));
        route.Path = method_color(m, route.Path);
        // route.Function = Chalk[COLORS[_counter++ % COLORS.length]](route.Function);
        route.Function = Chalk.grey(route.Function);
    });

    // Print table
    TableMaster.setDefaults({indent: 0, rowSpace: 1});
    console.table(_routes);
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
    pkg: {
        name: 'bak-routes',
    }
};

module.exports = RoutesPlugin;