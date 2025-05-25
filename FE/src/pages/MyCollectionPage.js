import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    FaPlusCircle,
    FaFilter,
    FaTimesCircle,
    FaChevronLeft,
    FaChevronRight,
    FaCheckCircle,
    FaLock,
    FaSpinner,
} from 'react-icons/fa';
import axios from 'axios';
import ProductDetailModal from '../components/ProductDetailModal';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useSearchFilter } from '../contexts/SearchFilterContext';
import SearchFilterBar from '../components/SearchFilterBar';

const API_BASE_URL = 'http://localhost:8080/api';
const ITEMS_PER_PAGE = 10;

const SimpleProductCard = ({ product, onRemove, onClickCard, isRemoving }) => (
    <div
        className={`bg-white rounded-xl shadow-lg overflow-hidden flex flex-col group transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 relative ${isRemoving ? 'opacity-50 pointer-events-none' : ''}`}
        onClick={!isRemoving ? () => onClickCard(product) : undefined}
        style={{ cursor: !isRemoving ? 'pointer' : 'default' }}
    >
        {isRemoving && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20 rounded-xl">
                <FaSpinner className="animate-spin text-teal-500 text-3xl" />
            </div>
        )}
        <div className="relative">
            <div style={{ paddingTop: '135%' }} />
            <div className="absolute inset-0 bg-[#e5e7eb] p-[20px] sm:p-[30px] md:p-[40px] box-border flex justify-center items-center overflow-hidden border-b border-[#ddd]">
                <img
                    src={product.imageUrl || 'https://via.placeholder.com/300x400?text=No+Image'}
                    alt={product.name}
                    className="block max-w-full max-h-full object-contain rounded-lg transition-transform duration-300 ease-in-out group-hover:scale-105"
                />
            </div>
        </div>

        <div className="p-3 flex-grow flex flex-col">
            {product.group?.name && (
                <p className="text-[0.65rem] text-slate-400 mb-0.5 truncate tracking-wide">
                    {product.group.name.toUpperCase()}
                </p>
            )}
            <h3
                className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors duration-300 leading-tight line-clamp-2 min-h-[2.5em]"
                title={product.name}
            >
                {product.name}
            </h3>
            {product.version && (
                <p className="text-[0.7rem] text-slate-500 mt-0.5 mb-1">Ver: {product.version}</p>
            )}

            <p className="text-base font-bold text-pink-600 mt-1 mb-2">
                ${typeof product.price === 'number' ? product.price.toFixed(2) : 'N/A'}
            </p>

            {onRemove && (
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!isRemoving) {
                            onRemove(product.id, product.name);
                        }
                    }}
                    title="Xóa khỏi Bộ sưu tập"
                    disabled={isRemoving}
                    className="mt-auto w-full text-xs sm:text-sm py-2 px-3 rounded-md border border-teal-400 bg-teal-50 text-teal-600 flex items-center justify-center gap-1.5 hover:bg-teal-100 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    <FaCheckCircle className="w-3.5 h-3.5" />
                    <span>Collected</span>
                </button>
            )}
        </div>
    </div>
);

const MyCollectionPage = () => {
    const [allCollectedProducts, setAllCollectedProducts] = useState([]);
    const [displayedCollectedProducts, setDisplayedCollectedProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedProductForModal, setSelectedProductForModal] = useState(null);
    const [removingProductId, setRemovingProductId] = useState(null);
    const [availableGroupsForFilter, setAvailableGroupsForFilter] = useState([]);

    const { addToCart: contextAddToCart, addingToCart: cartAddingStatus } = useCart();
    const { currentUser, isLoggedIn, loadingAuth } = useAuth();
    const {
        isProductInWishlist,
        addProductToWishlist,
        removeProductFromWishlist: removeFromWishlistContext,
    } = useWishlist();
    const { searchTerm, sortOption: globalSortOption, activeFilters, setSearchTerm, setActiveFilters, setSortOption } = useSearchFilter();


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

    const fetchCollectedProducts = useCallback(async () => {
        if (!isLoggedIn || !currentUser) {
            setIsLoading(false);
            setAllCollectedProducts([]);
            setDisplayedCollectedProducts([]);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/users/${currentUser.id}/collections`);
            setAllCollectedProducts(response.data || []);
        } catch (err) {
            console.error("Error fetching collection:", err);
            if (err.response && err.response.status === 403) {
                setError("Bạn không có quyền truy cập vào tài nguyên này. Vui lòng đăng nhập lại.");
            } else {
                setError(err.response?.data?.message || err.message || 'Không thể tải bộ sưu tập.');
            }
            setAllCollectedProducts([]);
        } finally {
            setIsLoading(false);
        }
    }, [isLoggedIn, currentUser]);

    useEffect(() => {
        if (loadingAuth) return;
        fetchCollectedProducts();
    }, [fetchCollectedProducts, loadingAuth]);
    
    useEffect(() => {
        if (allCollectedProducts.length > 0) {
            const groups = new Map();
            allCollectedProducts.forEach(p => {
                if (p.group && p.group.id && p.group.name) {
                    groups.set(p.group.id, { id: p.group.id, name: p.group.name });
                }
            });
            setAvailableGroupsForFilter(Array.from(groups.values()));
        } else {
            setAvailableGroupsForFilter([]);
        }
    }, [allCollectedProducts]);

    useEffect(() => {
        if (isLoading || loadingAuth) {
            return;
        }
        if (allCollectedProducts.length === 0 && !isLoading) {
            setDisplayedCollectedProducts([]);
            setCurrentPage(1);
            return;
        }

        let productsToProcess = [...allCollectedProducts];

        if (searchTerm && searchTerm.trim() !== '') {
            const lowerSearchTerm = searchTerm.toLowerCase();
            productsToProcess = productsToProcess.filter(product =>
                (product.name && product.name.toLowerCase().includes(lowerSearchTerm)) ||
                (product.group?.name && product.group.name.toLowerCase().includes(lowerSearchTerm)) ||
                (product.member && product.member.toLowerCase().includes(lowerSearchTerm))
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
                        case 'member': return product.member && product.member.toLowerCase() === String(filterValue).toLowerCase();
                        case 'version': return product.version && product.version.toLowerCase().includes(String(filterValue).toLowerCase());
                        case 'groupName': return product.group?.name && product.group.name.toLowerCase() === String(filterValue).toLowerCase();
                        default: return true;
                    }
                });
            });
        }
        
        if (globalSortOption !== 'default' && globalSortOption) {
            switch (globalSortOption) {
                case 'price-asc': productsToProcess.sort((a, b) => (parseFloat(a.price) || Infinity) - (parseFloat(b.price) || Infinity)); break;
                case 'price-desc': productsToProcess.sort((a, b) => (parseFloat(b.price) || -Infinity) - (parseFloat(a.price) || -Infinity)); break;
                case 'name-asc': productsToProcess.sort((a, b) => (a.name || "").localeCompare(b.name || "")); break;
                case 'name-desc': productsToProcess.sort((a, b) => (b.name || "").localeCompare(a.name || "")); break;
                case 'newest': 
                    productsToProcess.sort((a, b) => (new Date(b.collected_at || 0).getTime() || (b.id || 0)) - (new Date(a.collected_at || 0).getTime() || (a.id || 0)));
                    break;
                case 'date_added_desc': 
                    productsToProcess.sort((a, b) => new Date(b.collected_at || 0).getTime() - new Date(a.collected_at || 0).getTime());
                    break;
                case 'date_added_asc': 
                    productsToProcess.sort((a, b) => new Date(a.collected_at || 0).getTime() - new Date(b.collected_at || 0).getTime());
                    break;
                default:
                    if (globalSortOption === 'default') {
                         productsToProcess.sort((a, b) => new Date(b.collected_at || 0).getTime() - new Date(a.collected_at || 0).getTime());
                    }
                    break;
            }
        } else if (globalSortOption === 'default') {
             productsToProcess.sort((a, b) => new Date(b.collected_at || 0).getTime() - new Date(a.collected_at || 0).getTime());
        }


        setDisplayedCollectedProducts(productsToProcess);
        if (searchTerm || Object.keys(activeFilters).length > 0 || globalSortOption !== 'default') {
            setCurrentPage(1);
        }
    }, [allCollectedProducts, searchTerm, globalSortOption, activeFilters, isLoading, loadingAuth]);


    const handleRemoveFromCollection = async (id, name) => {
        if (!isLoggedIn || !currentUser) {
            alert("Vui lòng đăng nhập để thực hiện thao tác này.");
            return;
        }
        if (!window.confirm(`Bạn có chắc muốn xóa "${name}" khỏi bộ sưu tập không?`)) return;

        setRemovingProductId(id);
        try {
            await axios.delete(`${API_BASE_URL}/users/${currentUser.id}/collections/${id}`);
            setAllCollectedProducts(prev => prev.filter(p => p.id !== id)); 
            if (selectedProductForModal && selectedProductForModal.id === id) {
                handleCloseModal();
            }
        } catch (err) {
            console.error("Error removing from collection:", err);
            alert(`Lỗi khi xóa: ${err.response?.data?.message || err.message}`);
        } finally {
            setRemovingProductId(null);
        }
    };

    const handleOpenProductModal = (product) => {
        setSelectedProductForModal(product);
    };

    const handleCloseModal = () => {
        setSelectedProductForModal(null);
    };

    const handleAddToCartFromCollectionModal = async (product, event, quantity = 1) => {
        if (!isLoggedIn) {
            alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
            return false;
        }
        if (event && typeof event.preventDefault === 'function') event.preventDefault();
        if (event && typeof event.stopPropagation === 'function') event.stopPropagation();

        if (!product || !product.id) {
            alert('Sản phẩm không hợp lệ.');
            return false;
        }
        if (product.stockQuantity === 0) {
            alert(`Sản phẩm "${product.name}" đã hết hàng.`);
            return false;
        }
        if (product.stockQuantity < quantity) {
            alert(`Chỉ còn ${product.stockQuantity} sản phẩm "${product.name}".`);
            return false;
        }

        const success = await contextAddToCart(product, quantity);
        if (success) {
            const newStock = Math.max(0, product.stockQuantity - quantity);
            setSelectedProductForModal(prev => prev ? { ...prev, stockQuantity: newStock } : null);
            setAllCollectedProducts(prevProds => prevProds.map(p =>
                p.id === product.id ? { ...p, stockQuantity: newStock } : p
            ));
        }
        return success;
    };

    const handleToggleWishlistInModal = async (product) => {
        if (!product) return;
        const currentlyInWishlist = isProductInWishlist(product.id);
        if (currentlyInWishlist) {
            await removeFromWishlistContext(product.id);
        } else {
            await addProductToWishlist(product);
        }
    };

    const handleResetFiltersAndSearch = () => {
        setSearchTerm('');
        setActiveFilters({});
        setSortOption('default'); 
    };

    const totalItems = displayedCollectedProducts.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentDisplay = displayedCollectedProducts.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    const goToPage = page => {
        if (page < 1 || page > totalPages) {
            if (totalPages === 0 && page === 1) {
                setCurrentPage(1);
                return;
            }
            if (page < 1 && totalPages > 0) {
                setCurrentPage(1);
                return;
            }
            if (page > totalPages && totalPages > 0) {
                setCurrentPage(totalPages);
                return;
            }
            return;
        }
        setCurrentPage(page);
    };


    if (loadingAuth || (isLoading && allCollectedProducts.length === 0)) return (
        <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
            <FaSpinner className="animate-spin text-pink-500 text-4xl" />
            <p className="ml-3 text-gray-600">Đang tải bộ sưu tập...</p>
        </div>
    );

    if (!loadingAuth && !isLoggedIn) {
        return (
            <div className="min-h-screen bg-gray-100 py-8 px-4 flex items-center justify-center">
                <div className="text-center p-10 bg-white rounded-lg shadow-xl max-w-md">
                    <FaLock className="mx-auto text-5xl text-sky-400 mb-6" />
                    <h2 className="text-2xl font-semibold text-slate-800 mb-3">
                        Bộ sưu tập riêng tư
                    </h2>
                    <p className="text-gray-600 mb-8">
                        Vui lòng <Link to="/login" className="text-sky-600 hover:underline font-medium">đăng nhập</Link> để xem và quản lý bộ sưu tập của bạn.
                    </p>
                </div>
            </div>
        );
    }


    if (error) return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-red-50 rounded-lg shadow text-center">
            <FaTimesCircle className="mx-auto text-4xl text-red-400 mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Rất tiếc, đã xảy ra lỗi!</h3>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <button
                onClick={() => {
                    if (isLoggedIn && currentUser) {
                        fetchCollectedProducts();
                    }
                }}
                className="px-4 py-2 bg-pink-600 text-white text-sm rounded hover:bg-pink-700 transition-colors"
            >
                Thử lại
            </button>
        </div>
    );

    return (
        <div className="min-h-screen pt-0 pb-8 px-4 sm:px-6 lg:px-8">
          
          <div className="w-full mx-auto pt-8">
            <header className="mb-6 pb-4 border-b border-gray-200">
                <h1 className="text-3xl font-bold text-gray-800 text-center sm:text-left">Bộ sưu tập của tôi</h1>
                <p className="text-center sm:text-left text-gray-500 mt-1">
                    {isLoading ? "Đang tải..." :
                        (searchTerm || Object.keys(activeFilters).length > 0) ?
                            `Tìm thấy ${totalItems} sản phẩm phù hợp.` :
                            `Hiện có ${allCollectedProducts.length} sản phẩm trong bộ sưu tập.`
                    }
                </p>
            </header>
            {isLoggedIn && (
                 <SearchFilterBar
                    onSearchChange={setSearchTerm}
                    onSortChange={setSortOption}
                    onApplyFilters={setActiveFilters}
                    currentFilters={activeFilters}
                    availableGroups={availableGroupsForFilter}
                />
            )}
            <div className="max-w-7xl mx-auto mt-6">
                {displayedCollectedProducts.length === 0 && !isLoading && !error && !(searchTerm || Object.keys(activeFilters).length > 0) ? (
                    <div className="flex flex-col items-center justify-center p-10 bg-white rounded-lg shadow min-h-[300px]">
                        <FaPlusCircle className="text-6xl text-gray-300 mb-6" />
                        <p className="text-xl text-gray-600 mb-3">Bộ sưu tập của bạn trống trơn!</p>
                        <p className="text-gray-500 mb-6 text-center max-w-sm">
                            Hãy bắt đầu khám phá và thêm những sản phẩm yêu thích vào bộ sưu tập nhé.
                        </p>
                        <Link
                            to="/"
                            className="px-6 py-3 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition-colors text-lg shadow-md hover:shadow-lg"
                        >
                            Khám phá sản phẩm
                        </Link>
                    </div>
                ) : displayedCollectedProducts.length === 0 && !isLoading && !error && (searchTerm || Object.keys(activeFilters).length > 0) ? (
                    <div className="text-center p-10 bg-white rounded-lg shadow max-w-md mx-auto">
                        <FaFilter className="mx-auto text-5xl text-slate-300 mb-4" />
                        <p className="text-lg font-medium text-slate-700">
                            Không tìm thấy sản phẩm nào trong bộ sưu tập phù hợp.
                        </p>
                        <button
                            onClick={handleResetFiltersAndSearch}
                            className="mt-4 px-4 py-2 bg-sky-500 text-white text-sm rounded-md hover:bg-sky-600 transition-colors"
                        >
                            Xóa bộ lọc và tìm kiếm
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
                            {currentDisplay.map(product => (
                                <SimpleProductCard
                                    key={product.id}
                                    product={product}
                                    onRemove={handleRemoveFromCollection}
                                    onClickCard={handleOpenProductModal}
                                    isRemoving={removingProductId === product.id}
                                />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex justify-center items-center space-x-1.5 sm:space-x-2 mt-8 pt-6 border-t border-gray-200">
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2.5 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    aria-label="Previous Page"
                                >
                                    <FaChevronLeft className="w-4 h-4" />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => goToPage(page)}
                                        className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${currentPage === page
                                                ? 'bg-pink-600 text-white border-pink-600'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-2.5 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    aria-label="Next Page"
                                >
                                    <FaChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {selectedProductForModal && (
                <ProductDetailModal
                    product={selectedProductForModal}
                    onClose={handleCloseModal}
                    onAddToCart={handleAddToCartFromCollectionModal}
                    isAddingToCart={cartAddingStatus && cartAddingStatus[selectedProductForModal.id]}
                    wishlistStatus={isProductInWishlist(selectedProductForModal.id)}
                    onToggleWishlist={() => handleToggleWishlistInModal(selectedProductForModal)}
                    collectionStatus={true}
                    onToggleCollection={(productId, productName) => {
                        handleRemoveFromCollection(productId, productName);
                        if (selectedProductForModal && selectedProductForModal.id === productId) {
                            handleCloseModal();
                        }
                    }}
                    isLoggedIn={isLoggedIn}
                />
            )}
          </div>
        </div>
    );
};

export default MyCollectionPage;