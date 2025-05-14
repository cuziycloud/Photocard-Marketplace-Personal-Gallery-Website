// src/services/groupService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api'; // Base URL cho API của bạn

const getAllGroups = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/groups`);
        return response.data; // Giả sử API trả về trực tiếp mảng [groups]
    } catch (error) {
        console.error("Error fetching groups from API:", error);
        // Có thể throw lỗi hoặc trả về mảng rỗng/mock data
        // Ví dụ trả về mảng rỗng nếu lỗi
        return [];
        // throw error;
    }
};

// Mock data (có thể xóa đi nếu API đã hoạt động)
// const mockGroups = [
//     { id: 1, name: 'NewJeans', imageUrl: '...' },
//     // ...
// ];

export default {
    getAllGroups,
};