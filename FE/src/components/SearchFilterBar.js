// src/components/SearchFilterBar.js
import React, { useState } from 'react';
import { FaSearch, FaFilter, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

// Giả sử bạn sẽ truyền các hàm xử lý filter và search từ component cha
// Hoặc bạn có thể sử dụng một context riêng cho việc filter/search
const SearchFilterBar = ({ onSearchChange, onSortChange, onApplyFilters }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('default'); // 'price-asc', 'price-desc', 'name-asc', ...

    const handleSearchInputChange = (event) => {
        setSearchTerm(event.target.value);
        // Có thể gọi onSearchChange ngay lập tức hoặc sau khi người dùng ngừng gõ (debounce)
        if (onSearchChange) {
            onSearchChange(event.target.value);
        }
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        if (onSearchChange) {
            onSearchChange(searchTerm); // Hoặc gọi API tìm kiếm trực tiếp ở đây
        }
        console.log('Searching for:', searchTerm);
    };

    const handleSortSelectChange = (event) => {
        setSortBy(event.target.value);
        if (onSortChange) {
            onSortChange(event.target.value);
        }
        console.log('Sorting by:', event.target.value);
    };

    // Ví dụ cho nút filter (bạn có thể mở modal hoặc dropdown)
    const handleFilterClick = () => {
        console.log('Open filter options');
        // if (onApplyFilters) onApplyFilters(currentFilterState);
        alert('Chức năng filter sẽ được thêm sau!');
    };

    return (
        <div className="bg-white shadow-sm py-3 px-4 sticky" style={{ top: 'calc(4rem + 5rem)', zIndex: 30 }}>
            {/* 4rem là navbarHeight, 5rem là categoriesHeight (ước lượng) */}
            {/* Bạn cần điều chỉnh `top` này dựa trên chiều cao thực tế của Navbar và Categories */}
            <div className="container mx-auto flex flex-wrap items-center justify-between gap-4">
                {/* Search Input */}
                <form onSubmit={handleSearchSubmit} className="flex-grow sm:flex-grow-0 sm:w-auto flex items-center border border-slate-300 rounded-md overflow-hidden">
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchTerm}
                        onChange={handleSearchInputChange}
                        className="py-2 px-3 text-sm text-slate-700 focus:outline-none flex-grow"
                    />
                    <button
                        type="submit"
                        className="p-2 bg-sky-500 hover:bg-sky-600 text-white transition-colors"
                        aria-label="Search"
                    >
                        <FaSearch className="w-4 h-4" />
                    </button>
                </form>

                <div className="flex items-center gap-3 sm:gap-4">
                    {/* Sort Select */}
                    <div className="flex items-center">
                        <label htmlFor="sort-by" className="text-sm text-slate-600 mr-2 hidden sm:block">Sắp xếp:</label>
                        <select
                            id="sort-by"
                            value={sortBy}
                            onChange={handleSortSelectChange}
                            className="text-sm border border-slate-300 rounded-md py-2 px-2 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                        >
                            <option value="default">Mặc định</option>
                            <option value="price-asc">Giá: Thấp đến Cao</option>
                            <option value="price-desc">Giá: Cao đến Thấp</option>
                            <option value="name-asc">Tên: A-Z</option>
                            <option value="name-desc">Tên: Z-A</option>
                            <option value="newest">Mới nhất</option>
                        </select>
                    </div>

                    {/* Filter Button */}
                    <button
                        onClick={handleFilterClick}
                        className="flex items-center gap-1.5 text-sm text-slate-700 hover:text-sky-600 border border-slate-300 rounded-md py-2 px-3 hover:border-sky-500 transition-colors"
                    >
                        <FaFilter className="w-3.5 h-3.5" />
                        <span>Lọc</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SearchFilterBar;