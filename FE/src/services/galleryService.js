import axios from 'axios';

const API_URL = 'http://localhost:8080/api/gallery-posts';

const getAllGalleryPosts = () => {
    return axios.get(API_URL);
};

const createGalleryPost = (postData) => {
    return axios.post(API_URL, postData);
};

export default {
    getAllGalleryPosts,
    createGalleryPost,
};