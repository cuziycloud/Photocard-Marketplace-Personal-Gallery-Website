// src/components/Categories.js
import React, { useState, useEffect } from 'react';
// ... các imports khác ...
import groupService from '../services/groupService';

const Categories = ({ onSelectCategory }) => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedGroupId, setSelectedGroupId] = useState(null);

    useEffect(() => {
        // ... (useEffect fetchAllGroups giữ nguyên như trước) ...
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
                console.error("Failed to fetch groups:", err);
                setError("Không thể tải danh sách nhóm. Vui lòng thử lại sau.");
                setGroups([]);
            } finally {
                setLoading(false);
            }
        };
        fetchAllGroups();
    }, []);


    const handleCategoryClick = (groupId, groupName) => {
        setSelectedGroupId(groupId);
        if (onSelectCategory) {
            onSelectCategory({ id: groupId, name: groupName });
        }
        console.log(`Selected group: ${groupName} (ID: ${groupId})`);
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

    const renderCategoryItem = (group) => (
        <div
            key={group ? group.id : 'all-categories'}
            className="flex flex-col items-center w-24 sm:w-28 cursor-pointer group" 
            onClick={() => handleCategoryClick(group ? group.id : null, group ? group.name : 'Tất cả')}
            title={group ? `Xem sản phẩm của ${group.name}` : 'Xem tất cả sản phẩm'}
        >
            <div
                className={`
                    w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center
                    overflow-hidden border-2 transition-all duration-200 ease-in-out
                    group-hover:shadow-lg group-hover:border-sky-500 group-hover:scale-105
                    ${(group && selectedGroupId === group.id) || (!group && selectedGroupId === null)
                        ? 'border-sky-600 shadow-md ring-2 ring-sky-600 ring-offset-2' 
                        : 'border-slate-300 bg-slate-200' 
                    }
                `}
            >
                {(!group || !group.logoImageUrl) && (
                    <span className={`text-xl sm:text-2xl font-semibold ${
                        (group && selectedGroupId === group.id) || (!group && selectedGroupId === null)
                        ? 'text-sky-600'
                        : 'text-slate-500'
                    }`}>
                        {group ? group.name.charAt(0).toUpperCase() : 'All'}
                    </span>
                )}
                {group && group.logoImageUrl && (
                    <img
                        src={group.logoImageUrl}
                        alt={group.name}
                        className="w-full h-full object-cover"
                    />
                )}
            </div>
            <p className={`
                mt-2 text-xs sm:text-sm text-center font-medium transition-colors duration-200
                group-hover:text-sky-600
                ${(group && selectedGroupId === group.id) || (!group && selectedGroupId === null)
                    ? 'text-sky-700 font-semibold'
                    : 'text-slate-600'
                }
            `}>
                {group ? group.name : 'All'}
            </p>
        </div>
    );


    return (
        <section className="mt-16 py-8 bg-white"> 
            <div className="container mx-auto px-4">
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-8"> 
                    {renderCategoryItem(null)}
                    {groups.map((group) => renderCategoryItem(group))}
                </div>
            </div>
        </section>
    );
};

export default Categories;