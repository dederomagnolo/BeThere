import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.thingspeak.com/update'
});

export default api;