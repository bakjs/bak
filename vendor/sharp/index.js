const path = require('path');

let sharp = {};

try {
    sharp = require('sharp');
} catch (e) {

}

// Setup security policy rules for ImageMagick
process.env.MAGICK_CONFIGURE_PATH = path.resolve(__dirname, 'policy.xml');

// Export sharp by default
module.exports = sharp;