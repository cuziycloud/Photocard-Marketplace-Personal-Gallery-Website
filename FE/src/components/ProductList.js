import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaRegHeart, FaHeart, FaShoppingCart, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import axios from 'axios';
import { useCategory } from '../contexts/CategoryContext';
import { useSearchFilter } from '../contexts/SearchFilterContext'; 

const API_BASE_URL = 'http://localhost:8080/api';
const PRODUCTS_PER_PAGE = 20;
const MOCK_USER_ID = 2;

const ProductList = () => {
    const { selectedCategory } = useCategory();
    const { searchTerm, sortOption, activeFilters, setSearchTerm, setActiveFilters: contextSetActiveFilters } = useSearchFilter();

    const [allFetchedProducts, setAllFetchedProducts] = useState([]); 
    const [displayedProducts, setDisplayedProducts] = useState([]);   
    const [loading, setLoading] = useState(true);                     
    const [isProcessing, setIsProcessing] = useState(false);          
    const [error, setError] = useState(null);
    const [wishlistStatus, setWishlistStatus] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    const fetchProductsAndWishlistStatus = useCallback(async (currentGroupId) => {
        console.log('ProductList: Fetching products with groupId:', currentGroupId);
        setLoading(true);
        setIsProcessing(true);
        setError(null);
        try {
            const params = { groupId: currentGroupId };
            const productsResponse = await axios.get(`${API_BASE_URL}/products`, { params });
            const fetchedProducts = Array.isArray(productsResponse.data) ? productsResponse.data : (productsResponse.data.content || []);
            setAllFetchedProducts(fetchedProducts);

            if (fetchedProducts.length > 0 && MOCK_USER_ID) {
                const productIds = fetchedProducts.map(p => p.id);
                const newWishlistStatus = {};
                await Promise.all(productIds.map(async (productId) => {
                    try {
                        const statusResponse = await axios.get(`${API_BASE_URL}/users/${MOCK_USER_ID}/wishlist/check/${productId}`);
                        newWishlistStatus[productId] = statusResponse.data.isInWishlist;
                    } catch (checkErr) {
                        newWishlistStatus[productId] = false;
                    }
                }));
                setWishlistStatus(newWishlistStatus);
            } else {
                setWishlistStatus({});
            }
        } catch (err) {
            console.error("Error fetching products or wishlist status:", err);
            setError("Không thể tải danh sách sản phẩm.");
            setAllFetchedProducts([]);
            setWishlistStatus({});
        } finally {
            setLoading(false);
        }
    }, [MOCK_USER_ID]); 

    useEffect(() => {
        const groupId = selectedCategory ? selectedCategory.id : null;
        fetchProductsAndWishlistStatus(groupId);
    }, [selectedCategory, fetchProductsAndWishlistStatus]);

    useEffect(() => {
        setIsProcessing(true);
        let productsToProcess = [...allFetchedProducts];

        if (searchTerm && searchTerm.trim() !== '') {
            productsToProcess = productsToProcess.filter(product =>
                (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (product.group?.name && product.group.name.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (Object.keys(activeFilters).length > 0) {
            productsToProcess = productsToProcess.filter(product => {
                return Object.entries(activeFilters).every(([filterKey, filterValue]) => {
                    if (filterValue === null || filterValue === undefined || String(filterValue).trim() === '') {
                        return true; 
                    }

                    const productPrice = parseFloat(product.price); 

                    switch (filterKey) {
                        case 'priceMax':
                            if (isNaN(productPrice) || isNaN(parseFloat(filterValue))) return false; 
                            return productPrice <= parseFloat(filterValue);
                        case 'priceMin':
                            if (isNaN(productPrice) || isNaN(parseFloat(filterValue))) return false;
                            return productPrice >= parseFloat(filterValue);
                        case 'version':
                            return product.version && product.version.toLowerCase() === String(filterValue).toLowerCase();
                        default:
                            console.warn(`ProductList: Unknown filter key: ${filterKey}`);
                            return true; 
                    }
                });
            });
        }

        // sx theo sortOption
        switch (sortOption) {
            case 'price-asc':
                productsToProcess.sort((a, b) => (parseFloat(a.price) || Infinity) - (parseFloat(b.price) || Infinity));
                break;
            case 'price-desc':
                productsToProcess.sort((a, b) => (parseFloat(b.price) || -Infinity) - (parseFloat(a.price) || -Infinity));
                break;
            case 'name-asc':
                productsToProcess.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
                break;
            case 'name-desc':
                productsToProcess.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
                break;
            case 'newest':
                productsToProcess.sort((a, b) => (b.id || 0) - (a.id || 0));
                break;
            default: 
                break;
        }
        console.log("Output - DisplayedProducts count:", productsToProcess.length);
        setDisplayedProducts(productsToProcess);
        setCurrentPage(1); 
        setIsProcessing(false);
    }, [allFetchedProducts, searchTerm, sortOption, activeFilters]);

    const handleResetFiltersAndSearch = () => {
        setSearchTerm('');          
        contextSetActiveFilters({}); 
    };

    const toggleWishlist = async (productId, productName) => {
        if (!MOCK_USER_ID) {
            alert("Vui lòng đăng nhập để sử dụng chức năng này.");
            return;
        }
        const isInWishlist = wishlistStatus[productId];
        try {
            if (isInWishlist) {
                await axios.delete(`${API_BASE_URL}/users/${MOCK_USER_ID}/wishlist/${productId}`);
                setWishlistStatus(prev => ({ ...prev, [productId]: false }));
            } else {
                await axios.post(`${API_BASE_URL}/users/${MOCK_USER_ID}/wishlist/${productId}`);
                setWishlistStatus(prev => ({ ...prev, [productId]: true }));
            }
        } catch (err) {
            console.error("Error toggling wishlist:", err);
            alert(`Lỗi khi cập nhật Wishlist: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleAddToCart = (product, e) => {
        e.preventDefault();
        e.stopPropagation();
        if (product.stockQuantity === 0) {
            alert("Sản phẩm này đã hết hàng!");
            return;
        }
        console.log("Added to cart (simulated):", product.name, product.id);
        alert(`Đã thêm "${product.name}" vào giỏ hàng (mô phỏng).`);
    };

    const handleViewDetailsSeparate = (productId, e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/product/${productId}`);
    };

    const totalPages = Math.ceil(displayedProducts.length / PRODUCTS_PER_PAGE);
    const paginatedProducts = displayedProducts.slice(
        (currentPage - 1) * PRODUCTS_PER_PAGE,
        currentPage * PRODUCTS_PER_PAGE
    );

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (loading) { 
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-600"></div>
                <p className="ml-3 text-gray-700 text-sm">Đang tải sản phẩm...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-10 bg-red-50 rounded-lg shadow max-w-md mx-auto">
                <p className="text-lg font-semibold text-red-700">Rất tiếc, đã xảy ra lỗi!</p>
                <p className="text-sm mt-1 text-red-600">{error}</p>
                <button
                    onClick={() => fetchProductsAndWishlistStatus(selectedCategory ? selectedCategory.id : null)}
                    className="mt-4 px-4 py-2 bg-pink-600 text-white text-sm rounded-md hover:bg-pink-700 transition-colors"
                >
                    Thử lại
                </button>
            </div>
        );
    }
    
    return (
        <div className="px-4 pb-4 pt-0 sm:px-6 sm:pb-6 sm:pt-4 bg-slate-100 font-['Inter',_sans-serif] min-h-screen">
            {isProcessing && !loading && ( 
                <div className="text-center py-2">
                    <p className="text-sm text-slate-500">Đang cập nhật danh sách...</p>
                </div>
            )}

            {displayedProducts.length === 0 && !loading && !isProcessing && ( 
                 <div className="text-center p-10 bg-white rounded-lg shadow max-w-md mx-auto mt-5">
                    <FaShoppingCart className="mx-auto text-5xl text-slate-300 mb-4" />
                    <p className="text-lg font-medium text-slate-700">
                        Không tìm thấy sản phẩm nào phù hợp với tiêu chí của bạn.
                    </p>
                    {(searchTerm || Object.keys(activeFilters).length > 0) && (
                        <button
                            onClick={handleResetFiltersAndSearch}
                            className="mt-4 px-4 py-2 bg-sky-500 text-white text-sm rounded-md hover:bg-sky-600 transition-colors"
                        >
                            Xóa bộ lọc và tìm kiếm
                        </button>
                    )}
                </div>
            )}

            {displayedProducts.length > 0 && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                        {paginatedProducts.map(product => (
                            <div
                                key={product.id}
                                className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col group transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1"
                            >
                                <Link to={`/product/${product.id}`} className="flex flex-col h-full text-inherit no-underline">
                                    <div className="relative">
                                        <div style={{ paddingTop: '135%' }} />
                                            <div className="absolute inset-0 bg-[#e5e7eb] p-[40px] box-border flex justify-center items-center overflow-hidden border-b border-[#ddd]">
                                                <img
                                                    src={product.imageUrl || 'https://via.placeholder.com/300x400?text=No+Image'}
                                                    alt={product.name}
                                                    className="block max-w-full max-h-full object-cover rounded-lg transition-transform duration-300 ease-in-out group-hover:scale-105"
                                                />
                                                </div>

                                        <button
                                            className="absolute top-2.5 right-2.5 bg-white/80 backdrop-blur-sm p-1.5 rounded-full shadow-md hover:bg-white transition-colors text-slate-500 hover:text-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
                                            onClick={(e) => {
                                                e.preventDefault(); e.stopPropagation();
                                                toggleWishlist(product.id, product.name);
                                            }}
                                            aria-label={wishlistStatus[product.id] ? "Remove from Wishlist" : "Add to Wishlist"}
                                        >
                                            {wishlistStatus[product.id]
                                                ? <FaHeart className="w-4 h-4 text-pink-500" />
                                                : <FaRegHeart className="w-4 h-4" />}
                                        </button>

                                        <button
                                            className={`absolute bottom-2.5 left-2.5 bg-indigo-500 text-white p-1.5 rounded-full shadow-md hover:bg-indigo-600 transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500
                                                ${product.stockQuantity === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                                            `}
                                            onClick={(e) => handleAddToCart(product, e)}
                                            aria-label="Add to Cart"
                                            disabled={product.stockQuantity === 0}
                                        >
                                            <FaShoppingCart className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="p-3.5 flex-grow flex flex-col justify-between">
                                        <div>
                                            {product.group && (
                                                <p className="text-xs font-medium text-indigo-500 mb-1 truncate tracking-wide">{product.group.name.toUpperCase()}</p>
                                            )}
                                            <h3
                                                className="text-[0.95rem] font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2 min-h-[2.4em]"
                                                title={product.name}
                                            >
                                                {product.name}
                                            </h3>
                                            {product.version && (
                                                <p className="text-xs text-slate-500 mt-0.5">Ver: {product.version}</p>
                                            )}
                                        </div>
                                        <div className="mt-2.5">
                                            <div className="flex justify-between items-center">
                                                <p className="text-md font-bold text-pink-600">
                                                    ${typeof product.price === 'number' ? product.price.toFixed(2) : 'N/A'}
                                                </p>
                                                <p className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${product.stockQuantity > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                    {product.stockQuantity > 0 ? `Còn ${product.stockQuantity}` : 'Hết hàng'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-8 flex justify-center items-center space-x-1.5">
                            <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>Prev</button>
                            <span> Page {currentPage} of {totalPages} </span>
                            <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ProductList;