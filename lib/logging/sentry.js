const hostname = require('os').hostname;
const hoek = require('hoek');
const Stream = require('stream');
const Raven = require('raven');

// Based on https://github.com/jsynowiec/good-sentry (MIT)
// @see https://github.com/getsentry/raven-node/blob/master/docs/usage.rst

class GoodSentry extends Stream.Writable {

    constructor({dsn = null, config = {}, captureUncaught = true} = {}) {
        super({objectMode: true, decodeStrings: false});

        const options = hoek.applyToDefaults(GoodSentry.defaults(), config);
        const args = (dsn === null) ? [options] : [dsn, options];
        this._client = Raven.config(...args);

        if (captureUncaught) {
            this._client.install();
        }
    }

    static defaults() {
        // @see https://docs.sentry.io/clients/node/config

        const defaults = {
            name: hostname(),
            logger: '',
            release: '',
            environment: '',
            captureUnhandledRejections: true,
        };

        return defaults;
    }

    _write(data, encoding, cb) {
        let {tags = []} = data;

        // Normalize event tags - if its a string then wrap in an array, default to an empty array
        if (typeof tags === 'string') tags = [tags];

        // Log level
        let level = 'debug';
        if (hoek.contain(tags, ['fatal'], {part: true})) {
            level = 'fatal';
        } else if (hoek.contain(tags, ['err', 'error'], {part: true})) {
            level = 'error';
        } else if (hoek.contain(tags, ['warn', 'warning'], {part: true})) {
            level = 'warning';
        } else if (hoek.contain(tags, ['info'], {part: true})) {
            level = 'info';
        }

        // Filter-out level tags and keep others
        // Then Convert array to {tag:true} form for sentry compatibility
        let sentry_tags = tags.filter(
            tag => ['fatal', 'error', 'warning', 'info', 'debug'].indexOf(tag) === -1
        ).reduce((acc, curr) => {
            if (curr && curr.key)
                acc[curr.key] = curr.val;
            else
                acc[curr] = true;
            return acc;
        }, {});

        // Additional data
        // @see https://docs.sentry.io/clients/node/usage/#additional-data
        const additionalData = {
            level,
            tags: sentry_tags,
        };

        // Attach user
        if (data.user) {
            additionalData.user = data.user;
            if (additionalData.user.toObject instanceof Function)
                additionalData.user = additionalData.user.toObject();
        }

        // Callback
        let callback = (sendErr, eventId) => {
            if (data.cb) data.cb({sendErr, eventId});
            cb();
        };

        // Capture
        if (data.error) {
            this._client.captureException(data.error, additionalData, callback);
        } else {
            this._client.captureMessage(data.message, additionalData, callback);
        }

    }
}

module.exports = GoodSentry;