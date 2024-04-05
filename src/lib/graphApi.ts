import axios from 'axios';

import { graphApiCong } from '../config/graphApiConfig';

export const graphApi = axios.create({
  baseURL: graphApiCong.url
});