module.exports = [{
    path: '/__webpack_hmr',
    method: 'GET',
    config: {
        auth: false
    },
    handler(req, reply){
        reply.redirect(`http://${req.server.info.host}:3001/__webpack_hmr`);
    }
}];