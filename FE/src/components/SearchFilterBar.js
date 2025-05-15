// src/components/SearchFilterBar.js
import React, { useState } from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';

const SearchFilterBar = ({ onSearchChange, onSortChange, onApplyFilters, currentFilters }) => {
    // States cục bộ cho các input/select trong SearchFilterBar
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const [localSortBy, setLocalSortBy] = useState('default');

    // States cục bộ cho các giá trị filter đang được chọn (trước khi áp dụng)
    const [tempPriceMax, setTempPriceMax] = useState(currentFilters?.priceMax || ''); // Lấy giá trị từ context nếu có
    const [tempVersion, setTempVersion] = useState(currentFilters?.version || '');   // Lấy giá trị từ context nếu có

    // State để kiểm soát việc hiển thị form filter đơn giản
    const [showFilterInputs, setShowFilterInputs] = useState(false);

    const handleSearchInputChange = (event) => {
        setLocalSearchTerm(event.target.value);
        if (onSearchChange) { // Cập nhật context ngay khi gõ (real-time search)
            onSearchChange(event.target.value);
        }
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        // Nếu chỉ muốn search khi submit, gọi onSearchChange(localSearchTerm) ở đây
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
        // Khi mở lại form filter, cập nhật giá trị từ context (nếu có)
        if (!showFilterInputs) {
            setTempPriceMax(currentFilters?.priceMax || '');
            setTempVersion(currentFilters?.version || '');
        }
    };

    const handleApplyCurrentFilters = () => {
        const filtersToApply = {};
        if (tempPriceMax.trim() !== '') {
            const price = parseFloat(tempPriceMax);
            if (!isNaN(price)) {
                filtersToApply.priceMax = price;
            }
        }
        if (tempVersion.trim() !== '') {
            filtersToApply.version = tempVersion.trim();
        }
        // Thêm các filter khác từ temp states ở đây

        if (onApplyFilters) {
            onApplyFilters(filtersToApply); // Gửi object filter này lên context
        }
        setShowFilterInputs(false); // Đóng form filter sau khi áp dụng
        alert('Đã áp dụng filter!');
    };

    const handleClearFilters = () => {
        setTempPriceMax('');
        setTempVersion('');
        // Xóa các temp filter khác
        if (onApplyFilters) {
            onApplyFilters({}); // Gửi object rỗng để xóa hết filter trong context
        }
        setShowFilterInputs(false);
        alert('Đã xóa tất cả filter!');
    }

    return (
        <div className="bg-white py-4 px-6">
            {/* Main Search, Sort, Filter Button Bar */}
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4">
                <form onSubmit={handleSearchSubmit} className="flex items-center w-full md:w-2/3 border border-gray-300 rounded-full overflow-hidden shadow-md focus-within:ring-2 focus-within:ring-sky-400">
                    <input type="text" placeholder="Tìm kiếm sản phẩm..." value={localSearchTerm} onChange={handleSearchInputChange} className="flex-grow px-5 py-2 text-sm text-gray-700 focus:outline-none bg-white rounded-l-full"/>
                    <button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2 rounded-r-full transition-colors" aria-label="Search">
                        <FaSearch className="w-4 h-4" />
                    </button>
                </form>
                <div className="flex items-center gap-3 justify-center md:justify-end w-full md:w-auto">
                    <div className="flex items-center gap-2">
                        <select id="sort-by" value={localSortBy} onChange={handleSortSelectChange} className="text-sm border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-sky-500">
                            <option value="default">Mặc định</option>
                            <option value="price-asc">Giá: Thấp → Cao</option>
                            <option value="price-desc">Giá: Cao → Thấp</option>
                            {/* ... các sort options khác ... */}
                        </select>
                    </div>
                    <button onClick={toggleFilterInputs} className="flex items-center gap-1.5 text-sm text-sky-700 hover:text-white border border-sky-500 bg-white hover:bg-sky-500 rounded-full px-4 py-2 transition-colors">
                        <FaFilter className="w-4 h-4" />
                        <span>{showFilterInputs ? 'Đóng Lọc' : 'Lọc'}</span>
                    </button>
                </div>
            </div>

            {/* Simple Filter Inputs Form (hiển thị khi showFilterInputs là true) */}
            {showFilterInputs && (
                <div className="max-w-4xl mx-auto mt-4 p-4 border border-gray-200 rounded-lg shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="filter-price-max" className="block text-sm font-medium text-gray-700 mb-1">Giá tối đa:</label>
                            <input
                                type="number"
                                id="filter-price-max"
                                value={tempPriceMax}
                                onChange={(e) => setTempPriceMax(e.target.value)}
                                placeholder="Ví dụ: 50"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="filter-version" className="block text-sm font-medium text-gray-700 mb-1">Phiên bản (Version):</label>
                            <input
                                type="text"
                                id="filter-version"
                                value={tempVersion}
                                onChange={(e) => setTempVersion(e.target.value)}
                                placeholder="Ví dụ: Limited"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                            />
                        </div>
                        {/* THÊM CÁC INPUT/SELECT CHO CÁC TIÊU CHÍ LỌC KHÁC Ở ĐÂY */}
                        {/* Ví dụ:
                        <div>
                            <label htmlFor="filter-brand" className="block text-sm font-medium text-gray-700 mb-1">Thương hiệu:</label>
                            <select id="filter-brand" value={tempBrand} onChange={(e) => setTempBrand(e.target.value)} className="w-full ...">
                                <option value="">Tất cả</option>
                                <option value="BrandA">Brand A</option>
                                <option value="BrandB">Brand B</option>
                            </select>
                        </div>
                        */}
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={handleClearFilters}
                            className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
                        >
                            Xóa hết Filter
                        </button>
                        <button
                            onClick={handleApplyCurrentFilters}
                            className="text-sm bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-md"
                        >
                            Áp dụng Filter
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchFilterBar;