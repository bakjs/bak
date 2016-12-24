import request from 'request-promise';
import cache from './cache';

const s3_base = 'https://cdn.chavosh.fandogh.org';
const img_base = 'http://img.chavosh.fandogh.org';

export async function image(path, width) {
    let hash = path + '_' + width;

    let url = await cache(hash, async() => {
        try {
            let uri = `${img_base}/get?url=${s3_base + '/' + path}&w=${width}&op=resize`;
            let json = await request({uri, json: true,});
            return json.url;
        } catch (e) {
            return 'http://'
        }
    });

    return url;
}