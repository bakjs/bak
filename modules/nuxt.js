import Nuxt from "nuxt";
import Boom from 'boom';
import {get} from 'hapi-decorators';

export default class NuxtController {

    constructor(nuxt_config) {
        let nuxt = new Nuxt(nuxt_config);
        nuxt.build().then(()=> {
            this.nuxt = nuxt;
            this._ready = true;
        }).catch(e=> {
            console.error(e);
        });
    }

    @get('/{nuxt*}')
    _render(request, response) {
        if (!this._ready) return reply(Boom.serverUnavailable('Server Working!'));
        const {req, res} = request.raw;
        this.nuxt.render(req, res);
    }

}
