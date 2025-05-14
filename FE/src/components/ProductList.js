import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaRegHeart, FaHeart, FaTimesCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';
const PRODUCTS_PER_PAGE = 20;

const MOCK_USER_ID_FOR_WISHLIST = 2; // lay id user

const ProductList = ({ selectedCategory }) => { 
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [wishlistStatus, setWishlistStatus] = useState({}); 
    const [currentPage, setCurrentPage] = useState(1);

    const fetchProductsAndWishlistStatus = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const groupId = selectedCategory ? selectedCategory.id : null;
            const productsResponse = await axios.get(`${API_BASE_URL}/products`, {
                params: { groupId: groupId } 
            });
            const fetchedProducts = Array.isArray(productsResponse.data) ? productsResponse.data : (productsResponse.data.content || []);
            setProducts(fetchedProducts);
            setCurrentPage(1);

            if (fetchedProducts.length > 0 && MOCK_USER_ID_FOR_WISHLIST) {
                const productIds = fetchedProducts.map(p => p.id);
                const newWishlistStatus = {};
                for (const productId of productIds) {
                    try {
                        const statusResponse = await axios.get(`${API_BASE_URL}/users/${MOCK_USER_ID_FOR_WISHLIST}/wishlist/check/${productId}`);
                        newWishlistStatus[productId] = statusResponse.data.isInWishlist;
                    } catch (checkErr) {
                        console.warn(`Could not check wishlist status for product ${productId}:`, checkErr);
                        newWishlistStatus[productId] = false; 
                    }
                }
                setWishlistStatus(newWishlistStatus);
            } else {
                setWishlistStatus({});
            }

        } catch (err) {
            console.error("Error fetching products or wishlist status:", err);
            setError("Không thể tải danh sách sản phẩm.");
            setProducts([]);
            setWishlistStatus({});
        } finally {
            setLoading(false);
        }
    }, [selectedCategory, MOCK_USER_ID_FOR_WISHLIST]);


    useEffect(() => {
        fetchProductsAndWishlistStatus();
    }, [fetchProductsAndWishlistStatus]); 


    const toggleWishlist = async (productId, productName) => {
        if (!MOCK_USER_ID_FOR_WISHLIST) {
            alert("Vui lòng đăng nhập để sử dụng chức năng này.");
            return;
        }

        const isInWishlist = wishlistStatus[productId];
        try {
            if (isInWishlist) {
                await axios.delete(`${API_BASE_URL}/users/${MOCK_USER_ID_FOR_WISHLIST}/wishlist/${productId}`);
                setWishlistStatus(prev => ({ ...prev, [productId]: false }));
            } else {
                await axios.post(`${API_BASE_URL}/users/${MOCK_USER_ID_FOR_WISHLIST}/wishlist/${productId}`);
                setWishlistStatus(prev => ({ ...prev, [productId]: true }));
            }
        } catch (err) {
            console.error("Error toggling wishlist:", err);
            alert(`Lỗi khi cập nhật Wishlist: ${err.response?.data?.message || err.message}`);
        }
    };

    const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
    const paginatedProducts = products.slice(
        (currentPage - 1) * PRODUCTS_PER_PAGE,
        currentPage * PRODUCTS_PER_PAGE
    );

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (loading) return (
        <div className="text-center text-lg text-gray-600 p-5 font-['Arial',_sans-serif]">
            Đang tải sản phẩm...
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mt-3"></div>
        </div>
    );

    if (error) return (
        <div className="text-center text-lg text-red-600 p-5 font-['Arial',_sans-serif] font-semibold">
            {error}
        </div>
    );

    if (products.length === 0 && !loading) return (
        <div className="text-center text-lg text-gray-600 p-5 font-['Arial',_sans-serif]">
            Không tìm thấy sản phẩm nào
            {selectedCategory && selectedCategory.name && selectedCategory.name !== 'Tất cả' ? ` cho nhóm "${selectedCategory.name}"` : ''}.
        </div>
    );


    return (
        <div className="p-5 bg-gradient-to-br from-slate-100 to-slate-200 font-['Arial',_sans-serif] min-h-screen">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-6">
                {paginatedProducts.map(product => (
                    <div
                        key={product.id}
                        className="bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 ease-in-out hover:translate-y-[-6px] hover:scale-[1.02] hover:shadow-xl"
                    >
                        <Link to={`/product/${product.id}`} className="flex flex-col h-full text-inherit no-underline">
                            <div className="group relative w-full">
                                <div style={{ paddingTop: '135%' }} />
                                <div className="absolute inset-0 bg-[#f1f3f6] p-[20px] box-border flex justify-center items-center overflow-hidden border-b border-[#ddd]">
                                    <img
                                        src={product.imageUrl || 'https://via.placeholder.com/300x400?text=No+Image'}
                                        alt={product.name}
                                        className="block max-w-full max-h-full object-cover rounded-lg transition-transform duration-300 ease-in-out group-hover:scale-105"
                                    />
                                </div>

                                <button
                                    className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm border-none rounded-full w-[34px] h-[34px] flex items-center justify-center cursor-pointer text-2xl text-slate-400 shadow-md transition-all duration-200 ease-in-out hover:text-pink-500 hover:bg-white"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        toggleWishlist(product.id, product.name);
                                    }}
                                    aria-label="Yêu thích"
                                >
                                    {wishlistStatus[product.id] 
                                        ? <FaHeart className="block w-[1em] h-[1em]" style={{ color: '#ff4d6d' }} />
                                        : <FaRegHeart className="block w-[1em] h-[1em]" />}
                                </button>
                            </div>

                            <div className="p-[15px_18px_18px_18px] text-left flex-grow flex flex-col justify-between">
                                <div>
                                    {product.group && (
                                        <p className="text-[0.9em] font-medium text-gray-500 mb-[2px] truncate">{product.group.name}</p>
                                    )}
                                    <h3 className="text-[1.05em] font-semibold text-slate-800 mb-2 leading-tight min-h-[calc(1.05em*1.3*2)] overflow-hidden" title={product.name}>
                                        <span className="line-clamp-2">{product.name}</span>
                                    </h3>
                                    {product.version && <p className="text-xs text-slate-500">{product.version}</p>}
                                </div>

                                <div className="mt-auto pt-2">
                                    <div className="flex items-baseline flex-wrap gap-2">
                                        <p className="text-[1.2em] font-bold text-[#e91e63] m-0">
                                            ${typeof product.price === 'number' ? product.price.toFixed(2) : 'N/A'}
                                        </p>
                                    </div>
                                    <p className="text-xs text-slate-600 mt-1">
                                        Còn lại: {product.stockQuantity}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </div>
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
                                 className={`px-2.5 sm:px-3 py-1 rounded border ${currentPage === pageOrEllipsis ? 'bg-pink-500 text-white' : 'text-gray-700 hover:bg-gray-200'}`} // Màu hồng cho trang hiện tại
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
        </div>
    );
};

export default ProductList;