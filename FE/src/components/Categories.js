import React, { useState, useEffect } from 'react';
import groupService from '../services/groupService';
import { useCategory } from '../contexts/CategoryContext';

const Categories = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { selectedCategory, selectCategory } = useCategory();

    const [currentPage, setCurrentPage] = useState(0);
    const groupsPerPage = 6; 

    useEffect(() => {
        const fetchAllGroups = async () => {
            try {
                setLoading(true);
                const data = await groupService.getAllGroups();
                if (data && Array.isArray(data)) {
                    setGroups(data);
                } else if (data?.data && Array.isArray(data.data)) {
                    setGroups(data.data);
                } else {
                    setGroups([]);
                }
                setError(null);
            } catch (err)
                {
                console.error("Categories.js: Failed to fetch groups:", err);
                setError("Không thể tải danh sách nhóm. Vui lòng thử lại sau.");
                setGroups([]);
            } finally {
                setLoading(false);
            }
        };
        fetchAllGroups();
    }, []);

    const totalPages = Math.ceil(groups.length / groupsPerPage);

    const handlePrev = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 0));
    };

    const handleNext = () => {
        const maxPage = totalPages > 0 ? totalPages - 1 : 0;
        setCurrentPage((prev) => Math.min(prev + 1, maxPage));
    };

    const handleCategoryClick = (groupId, groupName) => {
        selectCategory({ id: groupId, name: groupName });
    };

    const paginatedGroups = groups.slice(
        currentPage * groupsPerPage,
        currentPage * groupsPerPage + groupsPerPage
    );

    const renderCategoryItem = (group, isAllButton = false) => {
        const categoryId = isAllButton ? null : group?.id;
        const categoryName = isAllButton ? 'Tất cả' : group?.name;
        const logoUrl = isAllButton ? null : group?.logoImageUrl;
        const isActive = selectedCategory.id === categoryId;

        return (
            <div
                key={categoryId === null ? 'all-categories' : categoryId}
                className="flex flex-col items-center w-24 sm:w-28 cursor-pointer group flex-shrink-0" 
                onClick={() => handleCategoryClick(categoryId, categoryName)}
                title={isAllButton ? 'Xem tất cả sản phẩm' : `Xem sản phẩm của ${categoryName}`}
            >
                <div
                    className={`
                        w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center
                        overflow-hidden border-2 transition-all duration-200 ease-in-out
                        group-hover:shadow-lg group-hover:border-sky-500 group-hover:scale-105
                        ${isActive
                            ? 'border-sky-600 shadow-md ring-2 ring-sky-600 ring-offset-2'
                            : 'border-slate-300 bg-slate-200'
                        }
                    `}
                >
                    {(!logoUrl && !isAllButton && categoryName) && (
                        <span className={`text-xl sm:text-2xl font-semibold ${isActive ? 'text-sky-600' : 'text-slate-500'}`}>
                            {categoryName.charAt(0).toUpperCase()}
                        </span>
                    )}
                    {isAllButton && (
                        <span className={`text-xl sm:text-2xl font-semibold ${isActive ? 'text-sky-600' : 'text-slate-500'}`}>
                            All
                        </span>
                    )}
                    {logoUrl && !isAllButton && (
                        <img
                            src={logoUrl}
                            alt={categoryName}
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>
                {categoryName && (
                    <p className={`
                        mt-2 text-xs sm:text-sm text-center font-medium transition-colors duration-200
                        group-hover:text-sky-600 truncate w-full
                        ${isActive ? 'text-sky-700 font-semibold' : 'text-slate-600'}
                    `}>
                        {categoryName}
                    </p>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="py-6 text-center">
                <p className="text-gray-500">Đang tải danh mục nhóm...</p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mt-2"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-6 text-center text-red-500">{error}</div>
        );
    }

    const noGroupsFetched = !groups || groups.length === 0;
    const showNavigationButtons = totalPages > 1;

    if (noGroupsFetched && !loading && !error) { 
        return (
            <section className="mt-0 py-4 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex justify-center">
                        {renderCategoryItem(null, true)}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="mt-0 py-4 bg-white">
            <div className="container mx-auto px-2 sm:px-4">
                <div className="flex items-center justify-center relative">
                    {showNavigationButtons && currentPage > 0 && (
                        <button
                            onClick={handlePrev}
                            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white hover:bg-slate-100 transition-colors shadow-md border border-slate-200 flex items-center justify-center"
                            aria-label="Previous categories"
                            style={{ width: '36px', height: '36px' }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5 text-slate-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                        </button>
                    )}
                    <div className="flex justify-center items-start gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-8 w-full overflow-x-auto py-2 px-10 sm:px-12 md:px-14 scrollbar-hide">
                        {renderCategoryItem(null, true)}
                        {paginatedGroups.map((group) => renderCategoryItem(group))}
                    </div>

                    {/* Nút Next */}
                    {showNavigationButtons && currentPage < totalPages - 1 && (
                        <button
                            onClick={handleNext}

                            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white hover:bg-slate-100 transition-colors shadow-md border border-slate-200 flex items-center justify-center"
                            aria-label="Next categories"
                            style={{ width: '36px', height: '36px' }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5 text-slate-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Categories;