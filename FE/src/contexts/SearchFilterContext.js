// src/contexts/SearchFilterContext.js
import React, { createContext, useState, useContext } from 'react';

const SearchFilterContext = createContext();

export const useSearchFilter = () => useContext(SearchFilterContext);

export const SearchFilterProvider = ({ children }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('default');
    const [activeFilters, setActiveFilters] = useState({});

    const handleSetSearchTerm = (term) => setSearchTerm(term);
    const handleSetSortOption = (option) => setSortOption(option);

    // Sửa lại hàm này:
    const handleSetActiveFilters = (newFilters) => {
        setActiveFilters(newFilters);
    };
    // Hoặc nếu bạn vẫn muốn merge, nhưng có cách để xóa:
    // const handleSetActiveFilters = (filtersToUpdate, replaceAll = false) => {
    //     if (replaceAll) {
    //         setActiveFilters(filtersToUpdate);
    //     } else {
    //         setActiveFilters(prev => ({ ...prev, ...filtersToUpdate }));
    //     }
    // };
    // Và khi xóa hết: onApplyFilters({}, true);

    const value = {
        searchTerm,
        sortOption,
        activeFilters,
        setSearchTerm: handleSetSearchTerm,
        setSortOption: handleSetSortOption,
        setActiveFilters: handleSetActiveFilters, // Sử dụng hàm đã sửa
    };

    return (
        <SearchFilterContext.Provider value={value}>
            {children}
        </SearchFilterContext.Provider>
    );
};