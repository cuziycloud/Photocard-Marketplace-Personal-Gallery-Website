import React, { useState, useEffect } from 'react';
import groupService from '../services/groupService';
import { useCategory } from '../contexts/CategoryContext'; 

const Categories = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { setSelectedCategory, selectedCategory, selectCategory } = useCategory();
    const handleSelect = (category) => {
        setSelectedCategory(category); 
    };

    useEffect(() => {
        const fetchAllGroups = async () => {
            try {
                setLoading(true);
                const data = await groupService.getAllGroups();
                if (data && Array.isArray(data)) {
                    setGroups(data);
                } else if (data && data.data && Array.isArray(data.data)) {
                    setGroups(data.data);
                } else {
                    setGroups([]);
                }
                setError(null);
            } catch (err) {
                console.error("Categories.js: Failed to fetch groups:", err);
                setError("Không thể tải danh sách nhóm. Vui lòng thử lại sau.");
                setGroups([]);
            } finally {
                setLoading(false);
            }
        };
        fetchAllGroups();
    }, []);

    const handleCategoryClick = (groupId, groupName) => {
        selectCategory({ id: groupId, name: groupName }); 
    };

    if (loading) {
        return <div className="mt-16 py-6 text-center"> <p className="text-gray-500">Đang tải danh mục nhóm...</p> <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mt-2"></div> </div>;
    }
    if (error) {
        return <div className="mt-16 py-6 text-center text-red-500">{error}</div>;
    }
    if (!groups || groups.length === 0) {
        if (!loading && !error) {
            return <div className="mt-16 py-6 text-center text-gray-500">Không có nhóm nào để hiển thị.</div>;
        }
        return null;
    }

    const renderCategoryItem = (group, isAllButton = false) => {
        const categoryId = isAllButton ? null : group.id;
        const categoryName = isAllButton ? 'Tất cả' : group.name;
        const logoUrl = isAllButton ? null : group.logoImageUrl;
        const isActive = selectedCategory.id === categoryId;

        return (
            <div
                key={categoryId === null ? 'all-categories' : categoryId}
                className="flex flex-col items-center w-24 sm:w-28 cursor-pointer group"
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
                    {(!logoUrl && !isAllButton) && (
                        <span className={`text-xl sm:text-2xl font-semibold ${isActive ? 'text-sky-600' : 'text-slate-500'}`}>
                            {categoryName.charAt(0).toUpperCase()}
                        </span>
                    )}
                    {isAllButton && (
                         <span className={`text-xl sm:text-2xl font-semibold ${isActive ? 'text-sky-600' : 'text-slate-500'}`}>
                            All
                        </span>
                    )}
                    {logoUrl && (
                        <img
                            src={logoUrl}
                            alt={categoryName}
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>
                <p className={`
                    mt-2 text-xs sm:text-sm text-center font-medium transition-colors duration-200
                    group-hover:text-sky-600
                    ${isActive ? 'text-sky-700 font-semibold' : 'text-slate-600'}
                `}>
                    {categoryName}
                </p>
            </div>
        );
    };

    return (
        <section className="mt-0 py-4 bg-white"> 
            <div className="container mx-auto px-4">
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-8">
                    {renderCategoryItem(null, true)}
                    {groups.map((group) => renderCategoryItem(group))}
                </div>
            </div>
        </section>
    );
};

export default Categories;