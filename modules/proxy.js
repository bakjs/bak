module.exports = function proxy(opts) {
    return [{
        path: '/{proxy*}',
        method: 'GET',
        handler: {
            proxy: opts
        }
    }];
};