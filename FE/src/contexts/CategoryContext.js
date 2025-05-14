// src/contexts/CategoryContext.js
import React, { createContext, useState, useContext, useMemo } from 'react';

// 1. Tạo Context
const CategoryContext = createContext(null);

// 2. Tạo Hook tùy chỉnh để dễ dàng sử dụng Context
export const useCategory = () => {
    const context = useContext(CategoryContext);
    if (!context) {
        throw new Error("useCategory must be used within a CategoryProvider");
    }
    return context;
};

// 3. Tạo Provider Component
export const CategoryProvider = ({ children }) => {
    // State để lưu trữ category đang được chọn
    // Khởi tạo với id: null và name: 'Tất cả' cho trạng thái mặc định
    const [selectedCategory, setSelectedCategory] = useState({ id: null, name: 'Tất cả' });

    // Hàm để cập nhật category đã chọn
    const selectCategory = (category) => {
        setSelectedCategory(category);
        console.log("CategoryContext: Category selected:", category);
    };

    // useMemo để đảm bảo object value chỉ được tạo lại khi selectedCategory hoặc selectCategory thay đổi
    // Điều này giúp tối ưu hóa, tránh re-render không cần thiết ở các component con
    const contextValue = useMemo(() => ({
        selectedCategory,
        selectCategory
    }), [selectedCategory]); // Không cần thêm selectCategory vào dependency array vì nó ổn định

    return (
        <CategoryContext.Provider value={contextValue}>
            {children}
        </CategoryContext.Provider>
    );
};