import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
});

export const getAccounts = () => api.get('/accounts');
export const createAccount = (data) => api.post('/accounts', data);
export const searchAccounts = (query) => api.get(`/accounts/search?query=${query}`);

export const getItems = () => api.get('/items');
export const createItem = (data) => api.post('/items', data);
export const searchItems = (query) => api.get(`/items/search?query=${query}`);

export const createSale = (data) => api.post('/sales', data);
export const getSales = () => api.get('/sales');

export const createPurchase = (data) => api.post('/purchase', data);
export const getPurchases = () => api.get('/purchase');

export default api;
