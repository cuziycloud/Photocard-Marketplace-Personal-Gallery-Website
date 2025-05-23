import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    FaRegHeart,
    FaHeart,
    FaShoppingCart,
    FaChevronLeft,
    FaChevronRight,
    FaPlusSquare,
    FaCheckSquare,
    FaSpinner
} from 'react-icons/fa';
import axios from 'axios';
import { useCategory } from '../contexts/CategoryContext';
import { useSearchFilter } from '../contexts/SearchFilterContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../contexts/WishlistContext'; 
import ProductDetailModal from '../components/ProductDetailModal';

const API_BASE_URL = 'http://localhost:8080/api';
const PRODUCTS_PER_PAGE = 15;

const shuffleArray = (array) => {
  if (!array || array.length === 0) return [];
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const HomePage = () => {
    const { selectedCategory } = useCategory();
    const { searchTerm, sortOption, activeFilters, setSearchTerm, setActiveFilters: contextSetActiveFilters } = useSearchFilter();
    const { addToCart, addingToCart: cartAddingStatus, cartError: cartContextError } = useCart();
    const { currentUser, isLoggedIn, loadingAuth } = useAuth();
    const {
        addProductToWishlist,
        removeProductFromWishlist,
        isProductInWishlist,
        togglingWishlist: wishlistTogglingStatus
    } = useWishlist();

    const [allFetchedProducts, setAllFetchedProducts] = useState([]);
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [collectionStatus, setCollectionStatus] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedProductForModal, setSelectedProductForModal] = useState(null);
    const [feedbackMessage, setFeedbackMessage] = useState({ type: '', text: '', productId: null });

    const isNewDataLoad = useRef(true);


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

    const fetchProductsAndAllStatuses = useCallback(async (currentGroupId, shouldShuffleOnFetch) => {
        setLoading(true);
        setError(null);
        if (shouldShuffleOnFetch) {
            setAllFetchedProducts([]);
        }

        try {
            const params = currentGroupId ? { groupId: currentGroupId } : {};
            const productsResponse = await axios.get(`${API_BASE_URL}/products`, { params });
            let fetchedProducts = Array.isArray(productsResponse.data) ? productsResponse.data : (productsResponse.data.content || []);

            if (shouldShuffleOnFetch) {
                fetchedProducts = shuffleArray(fetchedProducts);
            }

            setAllFetchedProducts(fetchedProducts);

            if (isLoggedIn && currentUser && fetchedProducts.length > 0) {
                const productIds = fetchedProducts.map(p => p.id);
                const userId = currentUser.id;

                const collectionPromises = productIds.map(productId =>
                    axios.get(`${API_BASE_URL}/users/${userId}/collections/check/${productId}`)
                        .then(res => ({ [productId]: res.data.isInCollection }))
                        .catch(() => ({ [productId]: false }))
                );
                const collectionResults = await Promise.all(collectionPromises);
                setCollectionStatus(Object.assign({}, ...collectionResults));
            } else {
                setCollectionStatus({});
            }
        } catch (err) {
            console.error("Error fetching products or collection statuses:", err);
            setError("Không thể tải danh sách sản phẩm hoặc trạng thái collection.");
            setAllFetchedProducts([]);
            setCollectionStatus({});
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn, currentUser]);

    useEffect(() => {
        if (loadingAuth) return;

        const groupId = selectedCategory ? selectedCategory.id : null;
        isNewDataLoad.current = true;

        const handler = setTimeout(() => {
            fetchProductsAndAllStatuses(groupId, true);
        }, 50);

        return () => clearTimeout(handler);
    }, [selectedCategory, fetchProductsAndAllStatuses, loadingAuth]);

    useEffect(() => {
        if (loading || loadingAuth) {
            return;
        }
        if (allFetchedProducts.length === 0 && !loading) {
            setDisplayedProducts([]);
            setCurrentPage(1);
            return;
        }
        let productsToProcess = [...allFetchedProducts];
        if (searchTerm && searchTerm.trim() !== '') {
            const lowerSearchTerm = searchTerm.toLowerCase();
            productsToProcess = productsToProcess.filter(product =>
                (product.name && product.name.toLowerCase().includes(lowerSearchTerm)) ||
                (product.group?.name && product.group.name.toLowerCase().includes(lowerSearchTerm))
            );
        }
        if (Object.keys(activeFilters).length > 0) {
            productsToProcess = productsToProcess.filter(product => {
                return Object.entries(activeFilters).every(([filterKey, filterValue]) => {
                    if (filterValue === null || filterValue === undefined || String(filterValue).trim() === '') return true;
                    const productPrice = parseFloat(product.price);
                    switch (filterKey) {
                        case 'priceMax': return !isNaN(productPrice) && !isNaN(parseFloat(filterValue)) && productPrice <= parseFloat(filterValue);
                        case 'priceMin': return !isNaN(productPrice) && !isNaN(parseFloat(filterValue)) && productPrice >= parseFloat(filterValue);
                        case 'version': return product.version && product.version.toLowerCase() === String(filterValue).toLowerCase();
                        default: return true;
                    }
                });
            });
        }
        if (sortOption !== 'default' && sortOption) {
            switch (sortOption) {
                case 'price-asc': productsToProcess.sort((a, b) => (parseFloat(a.price) || Infinity) - (parseFloat(b.price) || Infinity)); break;
                case 'price-desc': productsToProcess.sort((a, b) => (parseFloat(b.price) || -Infinity) - (parseFloat(a.price) || -Infinity)); break;
                case 'name-asc': productsToProcess.sort((a, b) => (a.name || "").localeCompare(b.name || "")); break;
                case 'name-desc': productsToProcess.sort((a, b) => (b.name || "").localeCompare(a.name || "")); break;
                case 'newest': productsToProcess.sort((a, b) => (b.id || 0) - (a.id || 0)); break;
                default: break;
            }
        }
        setDisplayedProducts(productsToProcess);
        if(isNewDataLoad.current || searchTerm || Object.keys(activeFilters).length > 0 || sortOption !== 'default') {
            setCurrentPage(1);
        }
        isNewDataLoad.current = false;
    }, [allFetchedProducts, searchTerm, sortOption, activeFilters, loading, loadingAuth]);

    const handleResetFiltersAndSearch = () => {
        setSearchTerm('');
        contextSetActiveFilters({});
    };

    const handleToggleWishlist = async (product) => {
        setFeedbackMessage({ type: '', text: '', productId: null });
        const currentlyInWishlist = isProductInWishlist(product.id);
        let success;
        if (currentlyInWishlist) {
            success = await removeProductFromWishlist(product.id);
        } else {
            success = await addProductToWishlist(product);
        }

        if (success) {
            setFeedbackMessage({
                type: 'success',
                text: currentlyInWishlist ? 'Đã xóa khỏi Wishlist!' : 'Đã thêm vào Wishlist!',
                productId: product.id
            });
        } else {
             setFeedbackMessage({
                type: 'error',
                text: 'Lỗi cập nhật Wishlist!',
                productId: product.id
            });
        }
        setTimeout(() => setFeedbackMessage({ type: '', text: '', productId: null }), 1500);
    };


    const toggleCollection = async (productId, productName) => {
        if (!isLoggedIn || !currentUser) {
            alert("Vui lòng đăng nhập để sử dụng chức năng Collection.");
            return;
        }
        const userId = currentUser.id;
        const currentStatus = collectionStatus[productId];
        setCollectionStatus(prev => ({ ...prev, [productId]: !currentStatus }));
        try {
            if (currentStatus) {
                await axios.delete(`${API_BASE_URL}/users/${userId}/collections/${productId}`);
            } else {
                await axios.post(`${API_BASE_URL}/users/${userId}/collections/${productId}`);
            }
        } catch (err) {
            console.error("Error toggling collection:", err);
            setCollectionStatus(prev => ({ ...prev, [productId]: currentStatus }));
            alert(`Lỗi cập nhật Bộ sưu tập: ${err.response?.data?.message || err.message}`);
        }
    };

    const updateProductStockAfterCartAction = (productId, newStockQuantity) => {
        setAllFetchedProducts(prevProducts =>
            prevProducts.map(p =>
                p.id === productId ? { ...p, stockQuantity: newStockQuantity } : p
            )
        );
        if (selectedProductForModal && selectedProductForModal.id === productId) {
            setSelectedProductForModal(prev => prev ? { ...prev, stockQuantity: newStockQuantity } : null);
        }
    };

    const handleAddToCart = useCallback(async (product, event, quantity = 1) => {
        if (event && typeof event.stopPropagation === 'function') event.stopPropagation();
        if (event && typeof event.preventDefault === 'function') event.preventDefault();

        if (!product || !product.id) {
            setFeedbackMessage({ type: 'error', text: 'Sản phẩm không hợp lệ!', productId: product?.id || null });
            setTimeout(() => setFeedbackMessage({ type: '', text: '', productId: null }), 1000);
            return false;
        }
        if (product.stockQuantity === 0 && quantity > 0) {
            setFeedbackMessage({ type: 'error', text: 'Hết hàng!', productId: product.id });
            setTimeout(() => setFeedbackMessage({ type: '', text: '', productId: null }), 1000);
            return false;
        }
        if (product.stockQuantity < quantity) {
            setFeedbackMessage({ type: 'error', text: `Chỉ còn ${product.stockQuantity} sản phẩm!`, productId: product.id });
            setTimeout(() => setFeedbackMessage({ type: '', text: '', productId: null }), 1000);
            return false;
        }
        const success = await addToCart(product, quantity);
        if (success) {
            setFeedbackMessage({ type: 'success', text: 'Đã thêm vào giỏ!', productId: product.id });
            const newStock = Math.max(0, product.stockQuantity - quantity);
            updateProductStockAfterCartAction(product.id, newStock);
        } else {
            setFeedbackMessage({ type: 'error', text: cartContextError || 'Lỗi khi thêm vào giỏ!', productId: product.id });
        }
        setTimeout(() => setFeedbackMessage({ type: '', text: '', productId: null }), 1000);
        return success;
    }, [addToCart, cartContextError]);

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
        } else if (page < 1 && totalPages > 0) {
            setCurrentPage(1);
        } else if (page > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    };

    const renderPaginationButtons = () => {
        const pageNumbers = [];
        const SIBLING_COUNT = 1;
        const TOTAL_NUMBERS_TO_SHOW = SIBLING_COUNT * 2 + 3;
        const SHOW_LEFT_ELLIPSIS = 'SHOW_LEFT_ELLIPSIS';
        const SHOW_RIGHT_ELLIPSIS = 'SHOW_RIGHT_ELLIPSIS';

        if (totalPages <= 1) return null;

        if (totalPages <= TOTAL_NUMBERS_TO_SHOW) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            const leftSiblingIndex = Math.max(currentPage - SIBLING_COUNT, 1);
            const rightSiblingIndex = Math.min(currentPage + SIBLING_COUNT, totalPages);
            const shouldShowLeftEllipsis = leftSiblingIndex > 2;
            const shouldShowRightEllipsis = rightSiblingIndex < totalPages - 2;

            pageNumbers.push(1);
            if (shouldShowLeftEllipsis) {
                pageNumbers.push(SHOW_LEFT_ELLIPSIS);
            }

            let startPage = shouldShowLeftEllipsis ? leftSiblingIndex : 2;
            let endPage = shouldShowRightEllipsis ? rightSiblingIndex : totalPages - 1;

            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }

            if (shouldShowRightEllipsis) {
                pageNumbers.push(SHOW_RIGHT_ELLIPSIS);
            }
            pageNumbers.push(totalPages);
        }

        return pageNumbers.map((page, index) => {
            if (page === SHOW_LEFT_ELLIPSIS || page === SHOW_RIGHT_ELLIPSIS) {
                return <span key={`${page}-${index}`} className="px-2 py-2 text-slate-500 text-sm">...</span>;
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
    };


    if (loadingAuth || (loading && displayedProducts.length === 0 && !error)) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
                <FaSpinner className="animate-spin text-4xl text-pink-600" />
                <p className="ml-3 text-gray-700 text-sm">Đang tải dữ liệu...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-10 bg-red-50 rounded-lg shadow max-w-md mx-auto">
                <p className="text-lg font-semibold text-red-700">Rất tiếc, đã xảy ra lỗi!</p>
                <p className="text-sm mt-1 text-red-600">{error}</p>
                <button
                    onClick={() => {
                        setError(null);
                        isNewDataLoad.current = true;
                        fetchProductsAndAllStatuses(selectedCategory ? selectedCategory.id : null, true);
                    }}
                    className="mt-4 px-4 py-2 bg-pink-600 text-white text-sm rounded-md hover:bg-pink-700 transition-colors"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className="px-4 pb-4 pt-0 sm:px-6 sm:pb-6 sm:pt-0 font-['Inter',_sans-serif] min-h-screen">
            {!loading && displayedProducts.length === 0 && (
                <div className="text-center p-10 bg-white rounded-lg shadow max-w-md mx-auto mt-10">
                    <FaShoppingCart className="mx-auto text-5xl text-slate-300 mb-4" />
                    <p className="text-lg font-medium text-slate-700">
                        Không tìm thấy sản phẩm nào phù hợp.
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 transition-opacity duration-300">
                        {paginatedProducts.map(product => (
                            <div
                                key={product.id}
                                className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col group transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 relative"
                                onClick={() => handleOpenProductModal(product)}
                                style={{ cursor: 'pointer' }}
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
                                        className={`absolute top-2.5 right-2.5 bg-white/80 backdrop-blur-sm p-1.5 rounded-full shadow-md hover:bg-white transition-colors text-slate-500 hover:text-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 z-10
                                            ${wishlistTogglingStatus[product.id] ? 'cursor-wait' : ''}`}
                                        onClick={(e) => { e.stopPropagation(); handleToggleWishlist(product); }}
                                        aria-label={isProductInWishlist(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                                        disabled={wishlistTogglingStatus[product.id]}
                                    >
                                        {wishlistTogglingStatus[product.id] ? (
                                            <FaSpinner className="animate-spin w-4 h-4 text-pink-500" />
                                        ) : isProductInWishlist(product.id) ? (
                                            <FaHeart className="w-4 h-4 text-pink-500" />
                                        ) : (
                                            <FaRegHeart className="w-4 h-4" />
                                        )}
                                    </button>

                                    {isLoggedIn && currentUser && (
                                        <button
                                            className={`absolute bottom-2.5 right-2.5 bg-white/80 backdrop-blur-sm p-1.5 rounded-full shadow-md hover:bg-white transition-colors focus:outline-none focus:ring-1 z-10
                                                ${collectionStatus[product.id] ? 'text-teal-500 hover:text-teal-600 focus:ring-teal-500' : 'text-slate-500 hover:text-teal-500 focus:ring-teal-500'}`}
                                            onClick={(e) => { e.stopPropagation(); toggleCollection(product.id, product.name); }}
                                            aria-label={collectionStatus[product.id] ? "Remove from Collection" : "Add to Collection"}
                                        >
                                            {collectionStatus[product.id] ? <FaCheckSquare className="w-4 h-4" /> : <FaPlusSquare className="w-4 h-4" />}
                                        </button>
                                    )}
                                    <button
                                        className={`absolute bottom-2.5 left-2.5 bg-indigo-500 text-white p-1.5 rounded-full shadow-md hover:bg-indigo-600 transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500 z-10
                                            ${product.stockQuantity === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                                            ${cartAddingStatus && cartAddingStatus[product.id] ? 'opacity-70 animate-pulse' : ''}`}
                                        onClick={(e) => handleAddToCart(product, e)}
                                        aria-label="Add to Cart"
                                        disabled={product.stockQuantity === 0 || !!(cartAddingStatus && cartAddingStatus[product.id])}
                                    >
                                        {cartAddingStatus && cartAddingStatus[product.id] ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <FaShoppingCart className="w-4 h-4" />}
                                    </button>

                                </div>
                                <div className="p-3.5 flex-grow flex flex-col justify-between">
                                    <div>
                                        {product.group && (<p className="text-xs font-medium text-indigo-500 mb-1 truncate tracking-wide">{product.group.name.toUpperCase()}</p>)}
                                        <h3 className="text-[0.95rem] font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2 min-h-[2.4em]" title={product.name}>
                                            {product.name}
                                        </h3>
                                        {product.version && (<p className="text-xs text-slate-500 mt-0.5">Ver: {product.version}</p>)}
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
                                {feedbackMessage.productId === product.id && feedbackMessage.text && (
                                    <div className={`absolute bottom-12 left-1/2 -translate-x-1/2 px-2 py-1 text-xs rounded-md shadow-lg z-20 pointer-events-none
                                        ${feedbackMessage.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
                                        transition-opacity duration-300 ${feedbackMessage.text ? 'opacity-100' : 'opacity-0'}`}>
                                        {feedbackMessage.text}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-8 flex justify-center items-center space-x-1.5">
                            <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-md border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" aria-label="Previous Page">
                                <FaChevronLeft className="h-4 w-4" />
                            </button>
                            {renderPaginationButtons()}
                            <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-md border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" aria-label="Next Page">
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
                    onAddToCart={(productFromModal, event, quantityFromModal) =>
                        handleAddToCart(productFromModal, event, quantityFromModal)
                    }
                    isAddingToCart={!!(cartAddingStatus && cartAddingStatus[selectedProductForModal.id])}
                    wishlistStatus={isProductInWishlist(selectedProductForModal.id)}
                    onToggleWishlist={() => handleToggleWishlist(selectedProductForModal)} 
                    collectionStatus={isLoggedIn && currentUser ? collectionStatus[selectedProductForModal.id] : false}
                    onToggleCollection={toggleCollection} 
                    isLoggedIn={isLoggedIn}
                />
            )}
        </div>
    );
};

export default HomePage;