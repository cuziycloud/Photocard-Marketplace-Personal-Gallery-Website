// src/components/ProductDetailModal.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FaTimes, FaShoppingCart, FaRegHeart, FaHeart } from 'react-icons/fa';

const ProductDetailModal = ({ product, onClose, onAddToCart, wishlistStatus, onToggleWishlist }) => {
    if (!product) return null;

    const handleModalContentClick = (e) => e.stopPropagation();

    const handleAddToCartInModal = (e) => {
        onAddToCart(product, e);
    };

    const handleToggleWishlistInModal = (e) => {
        e.stopPropagation();
        onToggleWishlist(product.id, product.name);
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 md:p-8 animate-modalFadeInScaleUp transition-all"
                onClick={handleModalContentClick}
            >
                <div className="flex flex-col sm:flex-row gap-8">
                    {/* Left Image */}
                    <div className="sm:w-2/5 relative">
                        <div className="aspect-[3/4] bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 shadow-md">
                            <div className="p-10 box-border w-full h-full flex items-center justify-center">
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
                        <div className="flex justify-between items-start mb-3">
                            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800">
                                {product.name}
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                                aria-label="Close modal"
                            >
                                <FaTimes className="w-6 h-6" />
                            </button>
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

                        <div className="text-sm text-slate-700 mb-4 prose max-w-none max-h-32 overflow-y-auto custom-scrollbar rounded-md p-2 bg-slate-50 shadow-inner">
                            {product.description && product.description.trim() !== ''
                                ? product.description
                                : 'No detailed description available for this product.'}
                        </div>

                        <p className={`text-sm font-semibold mb-5 ${product.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {product.stockQuantity > 0
                                ? `In Stock (${product.stockQuantity} available)`
                                : 'Out of Stock'}
                        </p>

                        {/* Actions */}
                        <div className="mt-auto pt-5 border-t border-slate-200 flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleAddToCartInModal}
                                disabled={product.stockQuantity === 0}
                                className={`w-full sm:flex-1 bg-indigo-600 text-white px-5 py-3 rounded-xl font-semibold text-base
                                            hover:bg-indigo-700 transition-colors
                                            disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md`}
                            >
                                <FaShoppingCart className="w-5 h-5" />
                                Add to Cart
                            </button>
                            <button
                                onClick={handleToggleWishlistInModal}
                                className={`w-full sm:w-auto border px-5 py-3 rounded-xl font-medium flex items-center justify-center gap-2
                                            transition-all duration-200
                                            ${
                                                wishlistStatus
                                                    ? 'border-pink-400 bg-pink-50 text-pink-600 hover:bg-pink-100'
                                                    : 'border-slate-300 text-slate-600 hover:border-pink-400 hover:text-pink-500'
                                            }`}
                            >
                                {wishlistStatus ? <FaHeart className="w-5 h-5" /> : <FaRegHeart className="w-5 h-5" />}
                                <span className="hidden sm:inline">
                                    {wishlistStatus ? 'In Wishlist' : 'Wishlist'}
                                </span>
                            </button>
                        </div>

                        <Link
                            to={`/product/${product.id}`}
                            className="mt-4 text-center text-sm text-indigo-600 hover:underline hover:text-indigo-700"
                        >
                            View full product page
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;
