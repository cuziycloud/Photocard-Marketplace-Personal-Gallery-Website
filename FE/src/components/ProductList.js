import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { FaRegHeart, FaHeart, FaEye, FaPlus, FaShoppingCart, FaChevronLeft, FaChevronRight} from 'react-icons/fa';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';
const PRODUCTS_PER_PAGE = 20;
const MOCK_USER_ID = 2; 

const ProductList = ({ selectedCategory }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [wishlistStatus, setWishlistStatus] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate(); 

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

            if (fetchedProducts.length > 0 && MOCK_USER_ID) {
                const productIds = fetchedProducts.map(p => p.id);
                const newWishlistStatus = {};
                for (const productId of productIds) {
                    try {
                        const statusResponse = await axios.get(`${API_BASE_URL}/users/${MOCK_USER_ID}/wishlist/check/${productId}`);
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
    }, [selectedCategory, MOCK_USER_ID]);


    useEffect(() => {
        fetchProductsAndWishlistStatus();
    }, [fetchProductsAndWishlistStatus]);


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
        <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-600"></div>
            <p className="ml-3 text-gray-700 text-sm">Đang tải sản phẩm...</p>
        </div>
    );

    if (error) return (
        <div className="text-center p-10 bg-red-50 rounded-lg shadow max-w-md mx-auto">
            <p className="text-lg font-semibold text-red-700">Rất tiếc, đã xảy ra lỗi!</p>
            <p className="text-sm mt-1 text-red-600">{error}</p>
            <button
                onClick={fetchProductsAndWishlistStatus}
                className="mt-4 px-4 py-2 bg-pink-600 text-white text-sm rounded-md hover:bg-pink-700 transition-colors"
            >
                Thử lại
            </button>
        </div>
    );

    if (products.length === 0 && !loading) return (
        <div className="text-center p-10 bg-white rounded-lg shadow max-w-md mx-auto"> 
            <FaShoppingCart className="mx-auto text-5xl text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-700">Không tìm thấy sản phẩm nào</p>
            {selectedCategory && selectedCategory.name && selectedCategory.name !== 'Tất cả' ?
                <p className="text-sm mt-1 text-slate-500">cho nhóm "{selectedCategory.name}".</p>
                : <p className="text-sm mt-1 text-slate-500">Vui lòng thử lại hoặc chọn danh mục khác.</p>
            }
        </div>
    );


    return (
        <div className="p-4 sm:p-6 bg-slate-50 font-['Inter',_sans-serif] min-h-screen">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"> 
                {paginatedProducts.map(product => (
                    <div
                        key={product.id}
                        className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col group transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1"
                    >
                        <Link to={`/product/${product.id}`} className="flex flex-col h-full text-inherit no-underline">
                            <div className="relative">
                                <div style={{ paddingTop: '135%' }} />
                                    <div className="absolute inset-0 bg-[#f1f3f6] p-[20px] box-border flex justify-center items-center overflow-hidden border-b border-[#ddd]">
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

                            {/* Product Info Section */}
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
                    <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-md border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Previous Page"
                    >
                        <FaChevronLeft className="h-4 w-4" />
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
                      .reduce((acc, pageOrEllipsis, index) => {
                        if (pageOrEllipsis === 'ellipsis') {
                            if (acc.length === 0 || (acc[acc.length -1] && acc[acc.length -1].key && !acc[acc.length -1].key.startsWith('ellipsis')) ) {
                                acc.push(<span key={`ellipsis-${index}`} className="px-2.5 py-2 text-slate-500 text-sm">...</span>);
                            }
                        } else if (typeof pageOrEllipsis === 'number') {
                            acc.push(
                                <button
                                    key={pageOrEllipsis}
                                    onClick={() => goToPage(pageOrEllipsis)}
                                    className={`px-3.5 py-2 rounded-md border text-sm font-medium transition-colors
                                        ${currentPage === pageOrEllipsis
                                            ? 'bg-pink-600 text-white border-pink-600'
                                            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                                        }`}
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
                        className="p-2 rounded-md border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Next Page"
                    >
                        <FaChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProductList;