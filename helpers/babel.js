function babel(ignores) {
    if (!ignores) ignores = [];
    ignores.push('bak');

    require.call(global, "babel-register")({
        ignore: new RegExp(`/node_modules\\/(?!(${ignores.join('|')})).*`)
    });

    require.call(global, "babel-polyfill");
}

module.exports = babel;