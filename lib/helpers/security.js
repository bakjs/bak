const Bcrypt = require('bcryptjs');
const JWT = require('jsonwebtoken');

// -------------------------
// bcrypt
// -------------------------

/**
 *
 * @param data
 * @returns {Promise}
 */
export function bcrypt_hash(data) {
    return new Promise((resolve, reject) => {
        Bcrypt.genSalt(10, function (err, salt) {
            if (err) return reject(err);
            Bcrypt.hash(data, salt, function (err, hash) {
                if (err) return reject(err);
                resolve(hash);
            });
        });
    });
}

/**
 *
 * @param data
 * @param hash
 * @returns {Promise}
 */
export function bcrypt_compare(data, hash) {
    return new Promise((resolve, reject) => {
        Bcrypt.compare(data, hash, (err, isValid) => {
            if (err) return reject(err);
            return resolve(isValid);
        });
    });
}

// -------------------------
// jwt
// -------------------------

/**
 *
 * @param message
 * @param key
 * @returns {*}
 */
export function jwt_sign(message, key) {
    return JWT.sign(message, key);
}

/**
 *
 * @param message
 * @returns {*}
 */
export function jwt_decode(message) {
    return JWT.decode(message);
}

/**
 *
 * @param message
 * @param key
 * @returns {Promise}
 */
export function jwt_verify(message, key) {
    return new Promise((resolve, reject) => {
        JWT.verify(message, key, (err, data) => {
            if (err)return resolve(false);
            resolve(data);
        });
    });
}

// -------------------------
// General hashing
// -------------------------

/**
 *
 * @param password
 * @param _hash in this format: password_hash[|hash_method]
 * @returns {Promise}
 */
export function hash_verify(password, _hash) {
    let hash = _hash.split('|');
    switch (hash[1]) {
        case 'bcrypt':
            return bcrypt_compare(password, hash[0]);
        default:
            return new Promise(r => r((password) === (hash[0])));
    }
}