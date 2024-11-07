import axios from 'axios';
import Api from '@/api/instance.js';

export default class TokensApi extends Api {
  constructor() {
    const ax = axios.create({
      baseURL: 'https://tokens.swap.coffee',
    });

    super(ax);
  }

  getTokenList() {
    return this.request('/api/v1/tokens/1/tokens', null, 'GET');
  }

  getTokenListV2(params) {
    let query = new URLSearchParams(params).toString();

    return this.request(`/api/v2/tokens?${query}`, null, 'GET');
  }

  createCursor(jettons) {
    return this.request('/api/v2/tokens/cursor', { jettons: jettons }, 'POST');
  }

    getStakingPool(pool_id) {
        return this.request(`/api/v1/tokens/stacking/pool/${pool_id}`, null, "GET");
    }

    getLabels() {
        let opts = {
            page: 1,
            size: 100
        }
        return this.request(`/api/v2/labels?page=${opts.page}&size=${opts.size}`, null, "GET");
    }
}
