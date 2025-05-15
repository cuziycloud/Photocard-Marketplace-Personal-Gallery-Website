import React, { useState } from 'react';
import { FaSearch, FaFilter, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

const SearchFilterBar = ({ onSearchChange, onSortChange, onApplyFilters }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('default');

    const handleSearchInputChange = (event) => {
        setSearchTerm(event.target.value);
        if (onSearchChange) {
            onSearchChange(event.target.value);
        }
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        if (onSearchChange) {
            onSearchChange(searchTerm); 
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

    const handleFilterClick = () => {
        console.log('Open filter options');
        alert('Chức năng filter sẽ được thêm sau!');
    };

    return (
        <div className="bg-white py-4 px-6 sticky z-30 mb-3" style={{ top: 'calc(4rem + 5rem)' }}>
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4">
                {/* Search Input */}
                <form
                onSubmit={handleSearchSubmit}
                className="flex items-center w-full md:w-/3 border border-gray-300 rounded-full overflow-hidden shadow-md transition-all duration-300 focus-within:ring-2 focus-within:ring-sky-400"
                >
                <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchTerm}
                    onChange={handleSearchInputChange}
                    className="flex-grow px-5 py-2 text-sm text-gray-700 focus:outline-none bg-white rounded-l-full"
                />
                <button
                    type="submit"
                    className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2 rounded-r-full transition-colors"
                    aria-label="Search"
                >
                    <FaSearch className="w-4 h-4" />
                </button>
                </form>

                {/* Sort & Filter */}
                <div className="flex items-center gap-3 justify-center md:justify-end w-full md:w-auto">
                {/* Sort */}
                <div className="flex items-center gap-2">
        
                    <select
                    id="sort-by"
                    value={sortBy}
                    onChange={handleSortSelectChange}
                    className="text-sm border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                    >
                    <option value="default">Mặc định</option>
                    <option value="price-asc">Giá: Thấp → Cao</option>
                    <option value="price-desc">Giá: Cao → Thấp</option>
                    <option value="name-asc">Tên: A-Z</option>
                    <option value="name-desc">Tên: Z-A</option>
                    <option value="newest">Mới nhất</option>
                    </select>
                </div>

                {/* Filter Button */}
                <button
                    onClick={handleFilterClick}
                    className="flex items-center gap-1.5 text-sm text-sky-700 hover:text-white border border-sky-500 bg-white hover:bg-sky-500 rounded-full px-4 py-2 transition-colors duration-300"
                >
                    <FaFilter className="w-4 h-4" />
                    <span>Lọc</span>
                </button>
                </div>
            </div>
        </div>
    );

};

export default SearchFilterBar;