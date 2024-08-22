import axios from 'axios';
import Api from '@/api/instance.js';

export default class GeoApi extends Api {
    constructor() {
        const ax = axios.create({
            baseURL: 'https://ipapi.co/json/',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        super(ax);
    }

    async getUserCountryCode() {
        try {
            const response = await this.request('');
            return response?.country_code;
        } catch (error) {
            console.error(error);
        }
    }
}
