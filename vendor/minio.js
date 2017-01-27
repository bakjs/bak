const Config = require('config');
const Minio = require('minio');

// Create and export client by default using env config
const default_config = {
    endPoint: 'localhost',
    port: 9000,
    secure: false,
    accessKey: '',
    secretKey: ''
};
const config = Object.assign({}, default_config, Config.has('minio') ? Config.get('minio') : null);
config.port = parseInt(config.port);
config.secure = Boolean(config.secure);

const client = new Minio.Client(config);
module.exports = client;

// Generate public url using client config (if not provided)
const public_url = config.public_url || `${client.protocol}//${client.host}:${client.port}`;

/**
 * Upload buffer to client
 * @param bucket
 * @param objName
 * @param buff
 * @returns {Promise.<String>}
 */
module.exports.upload = function upload(bucket, objName, buff, contentType = 'application/octet-stream') {
    return new Promise((resolve, reject) => {
        client.putObject(bucket, objName, buff, contentType, (err, etag) => {
            if (err) return reject(err);
            resolve(etag);
        });
    });
};

/**
 * Generate public URL
 * @param bucket
 * @param objName
 * @param etag
 * @param content_type
 * @returns {string}
 */
module.exports.url = function url(bucket, objName, etag, content_type) {
    let suffix = (etag || content_type) ? '?' : '';
    if (etag)
        suffix += `etag=${etag}`;
    if (content_type)
        suffix += `&response-content-type=${content_type}`;

    return `${public_url}/${bucket}/${objName}${suffix}`;
};