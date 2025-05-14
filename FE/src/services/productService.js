// src/services/productService.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/products';

// Sửa đổi getAllProducts để chấp nhận groupId
const getAllProducts = (groupId = null) => {
    let url = API_URL;
    if (groupId) {
        url += `?groupId=${groupId}`;
    }
    return axios.get(url);
};

// ... các hàm khác giữ nguyên ...
const getProductById = (id) => {
    return axios.get(`${API_URL}/${id}`);
};

const createProduct = (product) => {
    return axios.post(API_URL, product);
};

const updateProduct = (id, product) => {
    return axios.put(`${API_URL}/${id}`, product);
};

const deleteProduct = (id) => {
    return axios.delete(`${API_URL}/${id}`);
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};