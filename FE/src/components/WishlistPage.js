import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaHeartBroken, FaPlusCircle, FaSortAmountDown, FaFilter, FaChevronLeft, FaChevronRight, FaTimesCircle } from 'react-icons/fa'; // FaHeartBroken cho nút rỗng
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const SimpleProductCard = ({ product, onRemove }) => { 
    return (
        <div
            className="bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 ease-in-out hover:translate-y-[-6px] hover:scale-[1.02] hover:shadow-xl"
        >
            <Link to={`/product/${product.id}`} className="flex flex-col h-full text-inherit no-underline">
                <div className="group relative w-full">
                    <div style={{ paddingTop: '135%' }} />
                    <div className="absolute inset-0 bg-[#f1f3f6] p-[10px] sm:p-[15px] md:p-[20px] box-border flex justify-center items-center overflow-hidden border-b border-[#ddd]">
                        <img
                            src={product.imageUrl || 'https://via.placeholder.com/300x400?text=No+Image'}
                            alt={product.name}
                            className="block max-w-full max-h-full object-cover rounded-lg transition-transform duration-300 ease-in-out group-hover:scale-105"
                        />
                    </div>
                    {onRemove && (
                         <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onRemove(product.id, product.name);
                            }}
                            title="Remove from Wishlist"
                            className="absolute top-2 right-2 bg-orange-500 text-white p-1.5 rounded-full hover:bg-orange-600 transition-colors z-10 shadow-md" // Màu cam cho wishlist
                            aria-label="Remove from Wishlist"
                        >
                            <FaTimesCircle className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <div className="p-[15px_18px_18px_18px] text-left flex-grow flex flex-col justify-between">
                    <div>
                        {product.group && typeof product.group === 'object' && product.group.name && (
                            <p className="text-[0.9em] font-medium text-gray-500 mb-[2px] truncate">{product.group.name}</p>
                        )}
                        <h3 className="text-[1.05em] font-semibold text-slate-800 mb-2 leading-tight min-h-[calc(1.05em*1.3*2)] overflow-hidden" title={product.name}>
                            <span className="line-clamp-2">{product.name}</span>
                        </h3>
                        {product.version && (
                            <p className="text-xs text-slate-500 mt-0.5">
                                Ver. {product.version}
                            </p>
                        )}
                    </div>
                    <div className="mt-auto pt-2">
                        <div className="flex items-baseline flex-wrap gap-2">
                            <p className="text-[1.2em] font-bold text-[#e91e63] m-0">
                                ${typeof product.price === 'number' ? product.price.toFixed(2) : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};


const WishlistPage = () => {
    const [wishlistedProducts, setWishlistedProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOption, setSortOption] = useState('date_added_desc');

    const MOCK_USER_ID = 2; 
    const ITEMS_PER_PAGE = 10; 

    const fetchWishlistedProducts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/users/${MOCK_USER_ID}/wishlist`, {
                params: { sortBy: sortOption }
            });
            setWishlistedProducts(response.data || []);
        } catch (err) {
            console.error("Error fetching wishlisted products:", err);
            setError(err.response?.data?.message || err.message || 'Không thể tải danh sách yêu thích.');
            setWishlistedProducts([]);
        } finally {
            setIsLoading(false);
        }
    }, [MOCK_USER_ID, sortOption]);

    useEffect(() => {
        fetchWishlistedProducts();
    }, [fetchWishlistedProducts]);

    const handleRemoveFromWishlist = async (productId, productName) => {
        if (!window.confirm(`Bạn có chắc muốn xóa "${productName}" khỏi danh sách yêu thích không?`)) {
            return;
        }
        try {
            await axios.delete(`${API_BASE_URL}/users/${MOCK_USER_ID}/wishlist/${productId}`);
            setWishlistedProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
            alert(`"${productName}" đã được xóa khỏi danh sách yêu thích của bạn.`);

            const newTotalItems = wishlistedProducts.length - 1;
            const newTotalPages = Math.ceil(newTotalItems / ITEMS_PER_PAGE);

            if (currentPage > newTotalPages && newTotalPages > 0) {
                setCurrentPage(newTotalPages);
            } else if (newTotalItems === 0) {
                setCurrentPage(1);
            } else {
                 const currentItemsOnPageAfterDeletion = wishlistedProducts.filter(p => p.id !== productId).slice(indexOfFirstItem, indexOfLastItem).length;
                 if (currentItemsOnPageAfterDeletion === 0 && currentPage > 1) {
                    setCurrentPage(prev => prev - 1);
                }
            }
        } catch (err)
        {
            console.error("Error removing product from wishlist:", err);
            alert(`Lỗi khi xóa sản phẩm khỏi danh sách yêu thích: ${err.response?.data?.message || err.message}`);
        }
    };

    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentDisplayProducts = wishlistedProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(wishlistedProducts.length / ITEMS_PER_PAGE);

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleSortChange = (e) => {
        setSortOption(e.target.value);
        setCurrentPage(1);
    };

    if (isLoading) {
        return (
            <div className="text-center text-lg text-gray-600 p-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                Đang tải danh sách yêu thích...
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-lg text-red-600 p-10 bg-red-50 shadow rounded-lg">
                <FaTimesCircle className="mx-auto text-4xl text-red-400 mb-4" />
                <p>Đã xảy ra lỗi:</p>
                <p className="text-sm">{error}</p>
                <button
                    onClick={fetchWishlistedProducts}
                    className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-slate-100 to-slate-200 font-['Arial',_sans-serif] min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 p-4 bg-white shadow rounded-lg text-center">
                    <p className="text-lg text-slate-700">
                        Bạn có <span className="font-bold text-orange-600">{wishlistedProducts.length}</span> sản phẩm trong danh sách yêu thích.
                    </p>
                </div>

                <div className="mb-6 p-4 bg-white shadow rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center text-slate-700">
                        <FaFilter className="mr-2 h-5 w-5 text-indigo-600" />
                        <span className="font-semibold mr-3">Lọc theo:</span>
                        <select
                            className="p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            disabled
                        >
                            <option value="">Tất cả Nhóm</option>
                        </select>
                    </div>
                    <div className="flex items-center text-slate-700">
                        <FaSortAmountDown className="mr-2 h-5 w-5 text-indigo-600" />
                        <span className="font-semibold mr-3">Sắp xếp:</span>
                        <select
                            value={sortOption}
                            onChange={handleSortChange}
                            className="p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        >
                            <option value="date_added_desc">Mới nhất thêm vào</option>
                            <option value="name_asc">Tên A-Z (Sắp xếp ở FE nếu API không hỗ trợ)</option>
                        </select>
                    </div>
                </div>


                {wishlistedProducts.length === 0 && !isLoading ? (
                     <div className="text-center text-lg text-gray-500 p-10 bg-white shadow rounded-lg">
                        <FaHeartBroken className="mx-auto text-4xl text-slate-400 mb-4" />
                        Danh sách yêu thích của bạn hiện đang trống.
                        <br />
                        <Link to="/products" className="text-indigo-600 hover:text-indigo-800 font-semibold">
                            Khám phá sản phẩm và thêm vào yêu thích ngay!
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4 sm:gap-6">
                            {currentDisplayProducts.map(product => (
                                <SimpleProductCard
                                    key={product.id}
                                    product={product}
                                    onRemove={handleRemoveFromWishlist}
                                />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex justify-center items-center mt-8 sm:mt-10 gap-1 sm:gap-2 text-xs sm:text-sm font-medium">
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-2 sm:px-3 py-1 rounded border text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FaChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-0" />
                                    <span className="hidden sm:inline">Trước</span>
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                  .filter(page => {
                                    if (totalPages <= 5) return true;
                                    if (page <= 2 || page >= totalPages -1 || Math.abs(page - currentPage) <=1){
                                        return true;
                                    }
                                    if ((page === currentPage - 2 && currentPage > 3) || (page === currentPage + 2 && currentPage < totalPages - 2)){
                                         return 'ellipsis'; 
                                    }
                                    return false;
                                  })
                                  .reduce((acc, pageOrEllipsis, index, arr) => { 
                                    if (pageOrEllipsis === 'ellipsis') {
                                        if (acc.length === 0 || acc[acc.length -1].type !== 'span') { 
                                            acc.push(<span key={`ellipsis-${index}`} className="px-2 sm:px-3 py-1">...</span>);
                                        }
                                    } else {
                                        acc.push(
                                            <button
                                                key={pageOrEllipsis}
                                                onClick={() => goToPage(pageOrEllipsis)}
                                                className={`px-2.5 sm:px-3 py-1 rounded border ${currentPage === pageOrEllipsis ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
                                            >
                                                {pageOrEllipsis}
                                            </button>
                                        );
                                    }
                                    return acc;
                                  }, [])
                                }
                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-2 sm:px-3 py-1 rounded border text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                     <span className="hidden sm:inline">Sau</span>
                                    <FaChevronRight className="h-3 w-3 sm:h-4 sm:w-4 inline ml-1 sm:ml-0" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;