export default class Api {
    constructor(axios) {
        this.axios = axios;
    }

    request(url = '', data = null, method = 'get', timeout = 20000, controller) {
        const options = {
            method,
            url,
            timeout,
        }
        if (data) {
            options.data = data;
        }
        if (controller) {
            options.signal = controller.signal
        }
        return this.axios(options).then(res => res.data);
    }

    requestWithHeaders(url = '', data = null, headers = {}, method = 'get', timeout = 20000, controller) {
        const options = {
            method,
            url,
            timeout,
            headers,
        }
        if (data) {
            options.data = data;
        }
        if (controller) {
            options.signal = controller.signal
        }
        return this.axios(options).then(res => res.data);
    }
}