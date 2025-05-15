import React, { createContext, useState, useContext, useMemo } from 'react';

const CategoryContext = createContext(null);

export const useCategory = () => {
    const context = useContext(CategoryContext);
    if (!context) {
        throw new Error("useCategory must be used within a CategoryProvider");
    }
    return context;
};

export const CategoryProvider = ({ children }) => {
    const [selectedCategory, setSelectedCategory] = useState({ id: null, name: 'Tất cả' });
    const selectCategory = (category) => {
        setSelectedCategory(category);
        console.log("CategoryContext: Category selected:", category);
    };

    const contextValue = useMemo(() => ({
        selectedCategory,
        selectCategory
    }), [selectedCategory]);
    
    return (
        <CategoryContext.Provider value={contextValue}>
            {children}
        </CategoryContext.Provider>
    );
};