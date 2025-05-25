    import React, { useState, useEffect } from 'react';
    import { FaSearch, FaFilter } from 'react-icons/fa';

    const SearchFilterBar = ({
        onSearchChange,
        onSortChange,
        onApplyFilters,
        currentFilters, 
        availableGroups = [] 
    }) => {
        const [localSearchTerm, setLocalSearchTerm] = useState('');
        const [localSortBy, setLocalSortBy] = useState('default');
        const [showFilterInputs, setShowFilterInputs] = useState(false);
        const [editingFilters, setEditingFilters] = useState({});

        useEffect(() => {
            setEditingFilters(currentFilters || {});
        }, [showFilterInputs, currentFilters]);


        const handleSearchInputChange = (event) => {
            setLocalSearchTerm(event.target.value);
            if (onSearchChange) {
                onSearchChange(event.target.value);
            }
        };

        const handleSearchSubmit = (event) => {
            event.preventDefault();
        };

        const handleSortSelectChange = (event) => {
            const newSortOption = event.target.value;
            setLocalSortBy(newSortOption);
            if (onSortChange) {
                onSortChange(newSortOption);
            }
        };

        const toggleFilterInputs = () => {
            setShowFilterInputs(!showFilterInputs);
        };

        const handleFilterValueChange = (filterKey, value) => {
            setEditingFilters(prev => {
                const newEditingFilters = { ...prev };
                const trimmedValue = String(value).trim();

                if (trimmedValue === '') {
                    delete newEditingFilters[filterKey];
                } else {
                    if (filterKey === 'priceMax' || filterKey === 'priceMin') {
                        const numValue = parseFloat(trimmedValue);
                        if (!isNaN(numValue)) {
                            newEditingFilters[filterKey] = numValue;
                        } else {
                            delete newEditingFilters[filterKey]; 
                        }
                    } else {
                        newEditingFilters[filterKey] = trimmedValue; 
                    }
                }
                return newEditingFilters;
            });
        };

        const handleApplyCurrentFilters = () => {
            if (onApplyFilters) {
                const filtersToApply = {};
                for (const key in editingFilters) {
                    if (editingFilters[key] !== null && editingFilters[key] !== undefined && String(editingFilters[key]).trim() !== '') {
                        filtersToApply[key] = editingFilters[key];
                    }
                }
                onApplyFilters(filtersToApply);
            }
            setShowFilterInputs(false);
        };

        const handleClearFilters = () => {
            setEditingFilters({});
            if (onApplyFilters) {
                onApplyFilters({});
            }
            setShowFilterInputs(false);
        };

        return (
            <div className="bg-gray py-4 px-6">
                {/* Main Search, Sort, Filter Button Bar */}
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4">
                    <form onSubmit={handleSearchSubmit} className="flex items-center w-full md:w-auto md:flex-1 border border-gray-300 rounded-full overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-sky-400">
                        <input type="text" placeholder="Tìm kiếm theo tên sản phẩm, nhóm..." value={localSearchTerm} onChange={handleSearchInputChange} className="flex-grow px-5 py-2 text-sm text-gray-700 focus:outline-none bg-white rounded-l-full"/>
                        <button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-r-full transition-colors" aria-label="Search"> {/* Tăng py một chút */}
                            <FaSearch className="w-4 h-4" />
                        </button>
                    </form>
                    <div className="flex items-center gap-3 justify-center md:justify-end w-full md:w-auto">
                        <div className="flex items-center">
                            <select id="sort-by" value={localSortBy} onChange={handleSortSelectChange} className="text-sm border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 appearance-none">
                                <option value="default">Mặc định</option>
                                <option value="price-asc">Giá: Thấp → Cao</option>
                                <option value="price-desc">Giá: Cao → Thấp</option>
                                <option value="name-asc">Tên: A-Z</option>
                                <option value="name-desc">Tên: Z-A</option>
                                <option value="newest">Mới nhất</option>
                            </select>
                        </div>
                        <button onClick={toggleFilterInputs} className="flex items-center gap-1.5 text-sm text-sky-600 hover:text-sky-700 border border-sky-500 hover:border-sky-600 bg-white hover:bg-sky-50 rounded-full px-4 py-2 transition-colors font-medium">
                            <FaFilter className="w-3.5 h-3.5" />
                            <span>{showFilterInputs ? 'Đóng Lọc' : 'Bộ Lọc'}</span>
                        </button>
                    </div>
                </div>

                {/* Filter Inputs Form */}
                {showFilterInputs && (
                    <div className="max-w-4xl mx-auto mt-4 p-4 border border-gray-200 rounded-lg bg-slate-50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 mb-6">
                            <div>
                                <label htmlFor="filter-price-min" className="block text-xs font-medium text-gray-700 mb-1">Giá từ:</label>
                                <input
                                    type="number"
                                    id="filter-price-min"
                                    value={editingFilters.priceMin || ''}
                                    onChange={(e) => handleFilterValueChange('priceMin', e.target.value)}
                                    placeholder="VD: 0"
                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label htmlFor="filter-price-max" className="block text-xs font-medium text-gray-700 mb-1">Đến giá:</label>
                                <input
                                    type="number"
                                    id="filter-price-max"
                                    value={editingFilters.priceMax || ''}
                                    onChange={(e) => handleFilterValueChange('priceMax', e.target.value)}
                                    placeholder="VD: 100"
                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label htmlFor="filter-version" className="block text-xs font-medium text-gray-700 mb-1">Phiên bản:</label>
                                <input
                                    type="text"
                                    id="filter-version"
                                    value={editingFilters.version || ''}
                                    onChange={(e) => handleFilterValueChange('version', e.target.value)}
                                    placeholder="VD: Special"
                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                                />
                            </div>
                            {availableGroups && availableGroups.length > 0 && (
                                <div>
                                    <label htmlFor="filter-groupName" className="block text-xs font-medium text-gray-700 mb-1">Nhóm nhạc:</label>
                                    <select
                                        id="filter-groupName"
                                        value={editingFilters.groupName || ''}
                                        onChange={(e) => handleFilterValueChange('groupName', e.target.value)}
                                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500 appearance-none bg-white"
                                    >
                                        <option value="">Tất cả nhóm</option>
                                        {availableGroups.map(group => (
                                            <option key={group.id} value={group.name}>{group.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end items-center gap-3 pt-3 border-t border-gray-200">
                            <button onClick={handleClearFilters} className="text-sm text-gray-700 hover:text-gray-900 px-4 py-1.5 rounded-md border border-gray-300 hover:bg-gray-100 font-medium">
                                Xóa tất cả
                            </button>
                            <button onClick={handleApplyCurrentFilters} className="text-sm bg-sky-500 hover:bg-sky-600 text-white px-5 py-1.5 rounded-md font-medium">
                                Áp dụng
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    export default SearchFilterBar;