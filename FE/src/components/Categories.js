import React, { useState, useEffect } from 'react';
import groupService from '../services/groupService';

const Categories = ({ onSelectCategory }) => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedGroupId, setSelectedGroupId] = useState(null);

    useEffect(() => {
        const fetchAllGroups = async () => {
            try {
                setLoading(true);
                const data = await groupService.getAllGroups();
                setGroups(Array.isArray(data) ? data : (data.data || []));
                setError(null);
            } catch (err) {
                console.error("Failed to fetch groups:", err);
                setError("Không thể tải danh sách nhóm. Vui lòng thử lại sau.");
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
        return (
            <div className="pt-16 py-6 text-center"> 
                <p className="text-gray-500">Đang tải danh mục nhóm...</p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mt-2"></div>
            </div>
        );
    }

    if (error) {
        return <div className="pt-16 py-6 text-center text-red-500">{error}</div>; 
    }

    if (!groups || groups.length === 0) {
        return <div className="pt-16 py-6 text-center text-gray-500">Không có nhóm nào để hiển thị.</div>; 
    }

    return (
        <section className="pt-20 pb-8 bg-slate-50"> 
            <div className="container mx-auto px-4">
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                    <button
                        onClick={() => handleCategoryClick(null, 'Tất cả')}
                        className={`
                            px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-sm sm:text-base font-medium
                            transition-all duration-200 ease-in-out
                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500
                            ${selectedGroupId === null
                                ? 'bg-sky-600 text-white shadow-md hover:bg-sky-700'
                                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 hover:border-slate-400'
                            }
                        `}
                    >
                        All
                    </button>

                    {/* Các nhóm nhạc */}
                    {groups.map((group) => (
                        <button
                            key={group.id}
                            onClick={() => handleCategoryClick(group.id, group.name)}
                            className={`
                                px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-sm sm:text-base font-medium
                                transition-all duration-200 ease-in-out
                                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500
                                ${selectedGroupId === group.id
                                    ? 'bg-sky-600 text-white shadow-md hover:bg-sky-700' 
                                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 hover:border-slate-400'
                                }
                            `}
                            title={`Xem sản phẩm của ${group.name}`}
                        >
                            {group.name}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Categories;