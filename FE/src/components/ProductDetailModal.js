import React, { useState, useEffect } from 'react'; 
import { Link } from 'react-router-dom';
import { FaTimes, FaShoppingCart, FaRegHeart, FaHeart, FaSpinner, FaCheckSquare, FaPlusSquare } from 'react-icons/fa'; 

const ProductDetailModal = ({
    product,
    onClose,
    onAddToCart,        
    wishlistStatus,
    onToggleWishlist,
    isAddingToCart,   
    collectionStatus,   
    onToggleCollection 
}) => {
    const [modalFeedback, setModalFeedback] = useState({ type: '', text: '' });

    useEffect(() => {
        if (product) {
            setModalFeedback({ type: '', text: '' });
        }
    }, [product]); 

    if (!product) return null;

    const handleModalContentClick = (e) => e.stopPropagation();

    const handleAddToCartInModal = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setModalFeedback({ type: '', text: '' });

        if (!onAddToCart) {
            console.error("Modal: onAddToCart prop is missing!");
            setModalFeedback({ type: 'error', text: 'Lỗi hệ thống (M1).' });
            setTimeout(() => setModalFeedback({ type: '', text: '' }), 3000);
            return;
        }

        try {
            const success = await onAddToCart(product, e, 1); 
            console.log("ProductDetailModal: onAddToCart returned ->", success); 

            if (success === true) { 
                setModalFeedback({ type: 'success', text: 'Đã thêm vào giỏ!' });
            } else if (success === false) { 
                setModalFeedback({ type: 'error', text: 'Không thể thêm. Vui lòng thử lại. (M2)' });
            } else {
                console.warn("ProductDetailModal: onAddToCart returned unexpected value:", success);
                setModalFeedback({ type: 'error', text: 'Có lỗi xảy ra. Vui lòng thử lại. (M3)' });
            }
        } catch (error) {
            console.error("ProductDetailModal: Error calling onAddToCart:", error);
            setModalFeedback({ type: 'error', text: 'Lỗi nghiêm trọng khi xử lý. (M4)' });
        }
        setTimeout(() => setModalFeedback({ type: '', text: '' }), 3000);
    };

    const handleToggleWishlistInModal = (e) => {
        e.stopPropagation();
        onToggleWishlist(product.id, product.name);
    };

    const handleToggleCollectionInModal = (e) => {
        e.stopPropagation();
        if (onToggleCollection) { 
            onToggleCollection(product.id, product.name);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 md:p-8 animate-modalFadeInScaleUp transition-all relative"
                onClick={handleModalContentClick}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors z-10 p-2 rounded-full hover:bg-slate-100"
                    aria-label="Close modal"
                >
                    <FaTimes className="w-5 h-5" />
                </button>

                <div className="flex flex-col sm:flex-row gap-6 md:gap-8">
                    {/* Left Image */}
                    <div className="sm:w-2/5 relative">
                        <div className="aspect-[3/4] bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 shadow-md">
                            <div className="p-6 sm:p-10 box-border w-full h-full flex items-center justify-center">
                                <img
                                    src={product.imageUrl || 'https://via.placeholder.com/300x400?text=No+Image'}
                                    alt={product.name}
                                    className="block max-w-full max-h-full object-contain rounded-lg transition-transform duration-300 ease-in-out hover:scale-105"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className="sm:w-3/5 flex flex-col">
                        <div className="mb-3">
                            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800">
                                {product.name}
                            </h2>
                        </div>

                        {product.group && (
                            <p className="text-sm text-indigo-600 font-medium mb-1 uppercase tracking-wide">
                                {product.group.name}
                            </p>
                        )}
                        {product.version && (
                            <p className="text-xs text-slate-500 mb-3">Version: {product.version}</p>
                        )}

                        <p className="text-3xl font-extrabold text-pink-600 mb-4">
                            ${typeof product.price === 'number' ? product.price.toFixed(2) : 'N/A'}
                        </p>

                        <div className="text-sm text-slate-700 mb-4 prose max-w-none max-h-28 sm:max-h-32 overflow-y-auto custom-scrollbar rounded-md p-3 bg-slate-50 shadow-inner border border-slate-200">
                            {product.description && product.description.trim() !== ''
                                ? product.description
                                : 'Hiện chưa có mô tả chi tiết cho sản phẩm này.'}
                        </div>

                        <p className={`text-sm font-semibold mb-5 ${product.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {product.stockQuantity > 0
                                ? `Còn hàng (${product.stockQuantity} sản phẩm)`
                                : 'Hết hàng'}
                        </p>

                        {/* Feedback Message trong Modal */}
                        {modalFeedback.text && (
                            <div className={`mb-3 p-2 text-xs rounded-md text-center
                                ${modalFeedback.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
                                {modalFeedback.text}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="mt-auto pt-5 border-t border-slate-200 flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleAddToCartInModal}
                                disabled={product.stockQuantity === 0 || isAddingToCart}
                                className={`w-full sm:flex-1 bg-indigo-600 text-white px-5 py-3 rounded-xl font-semibold text-base
                                            hover:bg-indigo-700 transition-colors
                                            disabled:bg-slate-300 disabled:cursor-not-allowed disabled:text-slate-500
                                            flex items-center justify-center gap-2 shadow-md`}
                            >
                                {isAddingToCart ? (
                                    <FaSpinner className="animate-spin w-5 h-5" />
                                ) : (
                                    <FaShoppingCart className="w-5 h-5" />
                                )}
                                {isAddingToCart ? 'Đang thêm...' : 'Thêm vào giỏ'}
                            </button>
                            <button
                                onClick={handleToggleWishlistInModal}
                                className={`w-full sm:w-auto border px-5 py-3 rounded-xl font-medium flex items-center justify-center gap-2
                                            transition-all duration-200
                                            ${
                                                wishlistStatus
                                                    ? 'border-pink-400 bg-pink-50 text-pink-600 hover:bg-pink-100 shadow-sm'
                                                    : 'border-slate-300 text-slate-600 hover:border-pink-400 hover:text-pink-500 hover:shadow-md'
                                            }`}
                            >
                                {wishlistStatus ? <FaHeart className="w-5 h-5" /> : <FaRegHeart className="w-5 h-5" />}
                                <span className="hidden sm:inline">
                                    {wishlistStatus ? 'Trong Wishlist' : 'Wishlist'}
                                </span>
                            </button>
                            {/* Nút Collection */}
                            {onToggleCollection && ( 
                                <button
                                    onClick={handleToggleCollectionInModal}
                                    className={`w-full sm:w-auto border px-5 py-3 rounded-xl font-medium flex items-center justify-center gap-2
                                                transition-all duration-200
                                                ${
                                                    collectionStatus
                                                        ? 'border-teal-400 bg-teal-50 text-teal-600 hover:bg-teal-100 shadow-sm'
                                                        : 'border-slate-300 text-slate-600 hover:border-teal-400 hover:text-teal-500 hover:shadow-md'
                                                }`}
                                >
                                    {collectionStatus ? <FaCheckSquare className="w-5 h-5" /> : <FaPlusSquare className="w-5 h-5" />}
                                    <span className="hidden sm:inline">
                                        {collectionStatus ? 'Trong Bộ sưu tập' : 'Bộ sưu tập'}
                                    </span>
                                </button>
                            )}
                        </div>

                        {product.id && (
                            <Link
                                to={`/products/${product.id}`} 
                                className="mt-4 text-center text-sm text-indigo-600 hover:underline hover:text-indigo-700"
                                onClick={onClose}
                            >
                                Xem trang chi tiết sản phẩm
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;