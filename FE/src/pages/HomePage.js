import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { FaRegHeart, FaHeart, FaShoppingCart, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import axios from 'axios';
import { useCategory } from '../contexts/CategoryContext';
import { useSearchFilter } from '../contexts/SearchFilterContext';
import ProductDetailModal from '../components/ProductDetailModal'; 

const API_BASE_URL = 'http://localhost:8080/api';
const PRODUCTS_PER_PAGE = 15;
const MOCK_USER_ID = 2;

const shuffleArray = (array) => {
  if (!array || array.length === 0) return [];
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const ProductList = () => {
    const { selectedCategory } = useCategory();
    const { searchTerm, sortOption, activeFilters, setSearchTerm, setActiveFilters: contextSetActiveFilters } = useSearchFilter();

    const [allFetchedProducts, setAllFetchedProducts] = useState([]);
    const [shuffledInitialProducts, setShuffledInitialProducts] = useState([]);
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false); 
    const [error, setError] = useState(null);
    const [wishlistStatus, setWishlistStatus] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    const [selectedProductForModal, setSelectedProductForModal] = useState(null);

    useEffect(() => {
        if (selectedProductForModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [selectedProductForModal]);


    const fetchProductsAndWishlistStatus = useCallback(async (currentGroupId) => {
        try {
            const params = { groupId: currentGroupId };
            const productsResponse = await axios.get(`${API_BASE_URL}/products`, { params });
            const fetchedProducts = Array.isArray(productsResponse.data) ? productsResponse.data : (productsResponse.data.content || []);
            
            setAllFetchedProducts(fetchedProducts); 
            setShuffledInitialProducts(shuffleArray(fetchedProducts)); 

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
            setError(null); 
        } catch (err) {
            console.error("Error fetching products or wishlist status:", err);
            setError("Không thể tải danh sách sản phẩm.");
            setAllFetchedProducts([]);
            setShuffledInitialProducts([]);
            setWishlistStatus({});
        } 
    }, [MOCK_USER_ID]);

    useEffect(() => {
        setLoading(true); 
        setIsProcessing(true);
        const groupId = selectedCategory ? selectedCategory.id : null;
        fetchProductsAndWishlistStatus(groupId).finally(() => {
            setLoading(false);
        });
    }, [selectedCategory, fetchProductsAndWishlistStatus]);

    useEffect(() => {
        if (loading) { 
            return;
        }
        
        setIsProcessing(true);
        let productsToProcess = [...shuffledInitialProducts]; 

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
                            return true;
                    }
                });
            });
        }

        if (sortOption !== 'default') { 
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
            }
        }
        
        setDisplayedProducts(productsToProcess);
        setCurrentPage(1);
        setIsProcessing(false);
    }, [shuffledInitialProducts, searchTerm, sortOption, activeFilters, loading]); 

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
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
        
        if (product.stockQuantity === 0) {
            alert("Sản phẩm này đã hết hàng!");
            return;
        }
        if (selectedProductForModal && selectedProductForModal.id === product.id) {
            handleCloseModal();
        }
    };

    const handleOpenProductModal = (product) => {
        setSelectedProductForModal(product);
    };

    const handleCloseModal = () => {
        setSelectedProductForModal(null);
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

    const renderPaginationButtons = () => {
        const pageNumbers = [];
        const SIBLING_COUNT = 1;
        const TOTAL_NUMBERS_TO_SHOW = SIBLING_COUNT * 2 + 3; 
        const SHOW_LEFT_ELLIPSIS = 'SHOW_LEFT_ELLIPSIS';
        const SHOW_RIGHT_ELLIPSIS = 'SHOW_RIGHT_ELLIPSIS';

        if (totalPages <= TOTAL_NUMBERS_TO_SHOW) { 
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else { 
            const leftSiblingIndex = Math.max(currentPage - SIBLING_COUNT, 1);
            const rightSiblingIndex = Math.min(currentPage + SIBLING_COUNT, totalPages);

            const shouldShowLeftEllipsis = leftSiblingIndex > 2; 
            const shouldShowRightEllipsis = rightSiblingIndex < totalPages - 1; 

            pageNumbers.push(1); 

            if (shouldShowLeftEllipsis) {
                pageNumbers.push(SHOW_LEFT_ELLIPSIS);
            }

            let startPageForRange = leftSiblingIndex;
            if (shouldShowLeftEllipsis && startPageForRange === 2) startPageForRange++; 
            
            let endPageForRange = rightSiblingIndex;
            if (shouldShowRightEllipsis && endPageForRange === totalPages -1) endPageForRange--; 

            for (let i = startPageForRange; i <= endPageForRange; i++) {
                if (i > 1 && i < totalPages) { 
                     if(!pageNumbers.includes(i)) pageNumbers.push(i);
                }
            }
            
            if (shouldShowRightEllipsis) {
                if (pageNumbers[pageNumbers.length-1] !== totalPages -1) {
                     pageNumbers.push(SHOW_RIGHT_ELLIPSIS);
                }
            }

            if (totalPages > 1 && !pageNumbers.includes(totalPages)) { 
                 pageNumbers.push(totalPages);
            }
            
            const cleanedPageNumbers = [];
            let lastPushed = null;
            for (const p of pageNumbers) {
                if (typeof p === 'string' && p.startsWith('SHOW_') && typeof lastPushed === 'string' && lastPushed.startsWith('SHOW_')) continue; // consecutive ellipsis
                if (typeof p === 'number' && p === lastPushed) continue; 
                
                if (p === SHOW_LEFT_ELLIPSIS && cleanedPageNumbers.includes(2) && cleanedPageNumbers[cleanedPageNumbers.length-1] === 1) {
                    const lastNumIndex = cleanedPageNumbers.lastIndexOf(1);
                    if (pageNumbers.includes(2) && pageNumbers.indexOf(2) === pageNumbers.indexOf(p) + 1) {
                         cleanedPageNumbers.push(2);
                         lastPushed = 2;
                         continue;
                    }
                }
                 if (p === SHOW_RIGHT_ELLIPSIS && cleanedPageNumbers.includes(totalPages - 1) && cleanedPageNumbers[cleanedPageNumbers.length-1] === totalPages -1) {
                     if (pageNumbers.includes(totalPages) && pageNumbers.indexOf(totalPages) === pageNumbers.indexOf(p) + 1) {
                         lastPushed = p; 
                         continue;
                     }
                 }

                cleanedPageNumbers.push(p);
                lastPushed = p;
            }
            if (cleanedPageNumbers.length > 2) {
                if (cleanedPageNumbers[1] === SHOW_LEFT_ELLIPSIS && cleanedPageNumbers[2] === 2) {
                    cleanedPageNumbers.splice(1, 1); 
                }
                const lastIdx = cleanedPageNumbers.length -1;
                if (cleanedPageNumbers[lastIdx-1] === SHOW_RIGHT_ELLIPSIS && cleanedPageNumbers[lastIdx-2] === totalPages -1) {
                     cleanedPageNumbers.splice(lastIdx-1, 1);
                }
            }


            return cleanedPageNumbers.map((page, index) => {
                if (page === SHOW_LEFT_ELLIPSIS || page === SHOW_RIGHT_ELLIPSIS) {
                    return <span key={page + `-${index}`} className="px-2 py-2 text-slate-500 text-sm">...</span>;
                }
                return (
                    <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-3.5 py-2 rounded-md border text-sm font-medium transition-colors ${currentPage === page ? 'bg-pink-600 text-white border-pink-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
                    >
                        {page}
                    </button>
                );
            });

        }


        return pageNumbers.map(page => (
            <button
                key={page}
                onClick={() => goToPage(page)}
                className={`px-3.5 py-2 rounded-md border text-sm font-medium transition-colors ${currentPage === page ? 'bg-pink-600 text-white border-pink-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
            >
                {page}
            </button>
        ));
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
        <div className="px-4 pb-4 pt-0 sm:px-6 sm:pb-6 sm:pt-0 bg-white-100 font-['Inter',_sans-serif] min-h-screen">
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
                                onClick={() => handleOpenProductModal(product)} 
                                style={{cursor: 'pointer'}} 
                            >
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
                                            e.stopPropagation();
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
                                        onClick={(e) => {
                                            handleAddToCart(product, e);
                                        }}
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
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                         <div className="mt-8 flex justify-center items-center space-x-1.5">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-md border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                aria-label="Previous Page"
                            >
                                <FaChevronLeft className="h-4 w-4" />
                            </button>

                            {renderPaginationButtons()}

                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-md border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                aria-label="Next Page"
                            >
                                <FaChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </>
            )}

            {selectedProductForModal && (
                <ProductDetailModal
                    product={selectedProductForModal}
                    onClose={handleCloseModal}
                    onAddToCart={handleAddToCart}
                    wishlistStatus={wishlistStatus[selectedProductForModal.id]}
                    onToggleWishlist={toggleWishlist}
                />
            )}
        </div>
    
    );
};
export default ProductList;