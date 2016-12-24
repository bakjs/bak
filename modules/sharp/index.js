import path from 'path';
import sharp from 'sharp';

// Setup security policy rules for ImageMagick
process.env.MAGICK_CONFIGURE_PATH = path.relative(__dirname, 'policy.xml');

// Export sharp by default
export default sharp;

// Parse image to ensure validate
export async function parseImage(data) {
    let img = null;
    let meta = null;
    try {
        img = sharp(data);
        meta = await img.metadata();
    } catch (e) {
        console.error(e);
        throw {error: "Invalid image file"}
    }
    return img;
}