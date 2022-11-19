import config from '../config/config.js'
import axios from 'axios';

const instance = axios.create({
  baseURL: `${config.strapi.url}/api/`
});

export default instance;
