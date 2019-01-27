import axios from 'axios';

export default class HttpService {

    makeGet(url, params) {
        const config = this.getConfiguration(params);
        return axios.get(url, config)
            .then((res) => {
                return Promise.resolve(res.data);
            })
            .catch((err) => {
                return Promise.reject(err);
            });
    }

    getConfiguration(params) {
        const config = {
            params: params,
            headers: {
                "Accept": "application/json"
            }
        }
        return config;
    }

}