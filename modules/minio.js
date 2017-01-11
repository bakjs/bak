import Config from 'config';
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
export default client;

// Generate public url using client config
const public_url = `${client.protocol}//${client.host}:${client.port}`;

/**
 * Upload buffer to client
 * @param bucket
 * @param objName
 * @param buff
 * @returns {Promise}
 */
export async function upload(bucket, objName, buff) {
    return new Promise((resolve, reject) => {
        client.putObject(bucket, objName, buff, (err, etag) => {
            if (err) return reject(err);
            resolve(etag);
        });
    });
}

/**
 * Generate public URL
 * @param bucket
 * @param objName
 * @param etag
 * @returns {string}
 */
export function url(bucket, objName, etag, content_type) {
    let suffix = (etag || content_type) ? '?' : '';
    if (etag)
        suffix += `etag=${etag}`;
    if (content_type)
        suffix += `&response-content-type=${content_type}`;

    return `${public_url}/${bucket}/${objName}${suffix}`;
}