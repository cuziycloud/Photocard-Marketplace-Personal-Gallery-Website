import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api'; 

const getAllGroups = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/groups`);
        return response.data; 
    } catch (error) {
        return [];
    }
};
export default {
    getAllGroups,
};