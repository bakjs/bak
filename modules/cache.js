import fs from 'fs';

let _cache = {};
let _writing = false;

export default async function cache(key, resolve) {
    if (_cache[key]) return _cache[key];
    let val = await resolve();
    _cache[key] = val;
    save_cache();
    return val;
}

fs.readFile('.cache.json', _cache, (err, data) => {
    if (err)return;
    _cache = JSON.parse(data);
});

function save_cache() {
    if (_writing) return;
    if (Object.keys(_cache).length == 0) return;
    _writing = true;
    fs.writeFile('.cache.json', JSON.stringify(_cache), () => {
        _writing = false;
    });
}

process.once('SIGUSR2', save_cache); // nodemon
process.once('SIGINT', save_cache);