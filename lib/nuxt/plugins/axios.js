import Axios from "axios";
import Vue from "vue";

const inBrowser = typeof window !== 'undefined';

// ----------------------------------------
// Global axios
// ----------------------------------------

// Defaults
Object.assign(Axios.defaults, {
    baseURL: (inBrowser ? '' : process.env.ENDPOINT) + '/api',
});

// Throw better error
function onError(e) {
    let response = {};
    if (e.response) response = e.response.data;

    const err = Object.assign({
        statusCode: 500,
        message: 'Request error'
    }, response);

    throw err;
}

// wrapPromise
function wrapPromise(p) {
    return p.then(res => res.data || {}).catch(onError);
}

// create wrappers
export const get = (url, opts) => wrapPromise(Axios.get(url, opts));
export const post = (url, opts) => wrapPromise(Axios.post(url, opts));
export const del = (url, opts) => wrapPromise(Axios.del(url, opts));
export const put = (url, opts) => wrapPromise(Axios.put(url, opts));


// ----------------------------------------
// Vue Plugin
// ----------------------------------------
const VueAxios = {
    install(Vue) {
        // Globally register as $http
        Vue.prototype.$http = Axios;

        // Mixins
        Vue.mixin({get, post, del, put});
    }

};

// ----------------------------------------
// Set token helper
// ----------------------------------------
export const setToken = (token) => {
    Object.assign(Axios.defaults.headers.common, {
        Authorization: token ? `Bearer ${token}` : null,
    });
};

// ----------------------------------------
// Install vue plugin
// ----------------------------------------
Vue.use(VueAxios);