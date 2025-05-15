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
    const handleSetActiveFilters = (filters) => setActiveFilters(prev => ({ ...prev, ...filters }));

    const value = {
        searchTerm,
        sortOption,
        activeFilters,
        setSearchTerm: handleSetSearchTerm,
        setSortOption: handleSetSortOption,
        setActiveFilters: handleSetActiveFilters,
    };

    return (
        <SearchFilterContext.Provider value={value}>
            {children}
        </SearchFilterContext.Provider>
    );
};