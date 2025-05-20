import React, { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaSpinner, FaShoppingCart, FaPlus, FaMinus, FaExclamationCircle } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';

const CartPage = () => {
    const {
        cart,
        loadingCart,
        cartError,
        fetchCart,
        updateItemQuantity,
        removeItemFromCart,
        updatingItem,
        removingItem
    } = useCart();
    const navigate = useNavigate();

    const handleQuantityChange = useCallback(async (item, change) => {
        const newQuantity = item.quantity + change;
        if (newQuantity < 1) return;
        if (newQuantity > item.stockQuantity) {
            alert(`Số lượng "${item.productName}" yêu cầu (${newQuantity}) vượt quá tồn kho (${item.stockQuantity}).`);
            return;
        }
        await updateItemQuantity(item.orderItemId, newQuantity);
    }, [updateItemQuantity]);

    const handleRemoveItem = useCallback(async (orderItemId, productName) => {
        if (window.confirm(`Bạn có chắc muốn xóa "${productName}" khỏi giỏ hàng?`)) {
            await removeItemFromCart(orderItemId);
        }
    }, [removeItemFromCart]);

    const handleProceedToCheckout = () => {
        if (cart?.items?.length > 0) {
            alert("Chức năng thanh toán chưa được triển khai!");
        } else {
            alert("Giỏ hàng đang trống.");
        }
    };


    if (loadingCart && !cart) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen py-24 bg-gray-50">
                <FaSpinner className="animate-spin text-5xl text-indigo-500 mb-4" />
                <p className="text-lg text-gray-600">Đang tải giỏ hàng...</p>
            </div>
        );
    }

    if (cartError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 bg-gray-50">
                <FaExclamationCircle className="text-6xl text-red-400 mb-4" />
                <h2 className="text-2xl font-bold text-red-600 mb-2">Đã xảy ra lỗi</h2>
                <p className="text-gray-700 mb-4">{cartError}</p>
                <button onClick={fetchCart} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">Thử lại</button>
            </div>
        );
    }

    const items = cart?.items || [];
    const totalQuantityFromContext = cart?.totalQuantity || 0;
    const numberOfUniqueItems = items.length; 

    const totalAmount = parseFloat(cart?.totalAmount || 0); 
    const shippingFee = items.length > 0 ? 5.0 : 0; 
    const finalTotalToDisplay = totalAmount + shippingFee;


    if (items.length === 0 && !loadingCart) { 
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center py-24 bg-gray-50">
                <FaShoppingCart className="text-6xl text-gray-300 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Giỏ hàng của bạn trống</h2>
                <p className="text-gray-600 mb-6">Hãy thêm sản phẩm để bắt đầu mua sắm.</p>
                <Link to="/" className="bg-indigo-500 text-white px-6 py-3 rounded-md hover:bg-indigo-600 transition-all duration-300 shadow-md hover:shadow-lg">Khám phá sản phẩm</Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-extrabold text-slate-900">Giỏ hàng của bạn</h1>
                    {numberOfUniqueItems > 0 && (
                        <p className="mt-2 text-lg text-slate-600">
                            Có <span className="font-semibold text-indigo-600">{numberOfUniqueItems}</span> loại sản phẩm trong giỏ.
                        </p>
                    )}
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items */}
                    <div className="lg:w-2/3 space-y-5">
                        {items.map(item => {
                            const isUpdating = updatingItem?.[item.orderItemId];
                            const isRemoving = removingItem?.[item.orderItemId];
                            const isProcessing = isUpdating || isRemoving;

                            return (
                                <div key={item.orderItemId} className={`relative bg-white rounded-xl shadow p-4 flex flex-col sm:flex-row gap-4 transition-opacity ${isRemoving ? 'opacity-40' : ''}`}>
                                    {isRemoving && (
                                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 rounded-xl">
                                            <FaSpinner className="animate-spin text-red-500 text-2xl" />
                                        </div>
                                    )}

                                    <Link to={`/products/${item.productId}`} className="relative w-full sm:w-36 aspect-[3/4] block flex-shrink-0 bg-[#e5e7eb] p-5 box-border flex justify-center items-center overflow-hidden rounded-md">
                                        <img
                                            src={item.imageUrl || 'https://via.placeholder.com/300x400?text=No+Image'}
                                            alt={item.productName}
                                            className="block max-w-full max-h-full object-cover rounded-lg transition-transform duration-300 ease-in-out group-hover:scale-105"
                                        />
                                    </Link>

                                    <div className="flex-grow flex flex-col justify-between w-full">
                                        <div>
                                            <Link to={`/products/${item.productId}`} className="text-lg font-semibold text-slate-800 hover:text-indigo-600 line-clamp-2">
                                                {item.productName}
                                            </Link>
                                            <p className="text-sm text-slate-500 mt-1">Đơn giá: ${parseFloat(item.unitPrice || 0).toFixed(2)}</p>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1 sm:hidden">Tồn kho: {item.stockQuantity}</p>
                                    </div>

                                    <div className="flex flex-col items-start sm:items-end justify-between sm:min-w-[180px] w-full sm:w-auto pt-2 sm:pt-0">
                                        <p className="text-md font-bold text-slate-800 mb-2 sm:mb-0">${(parseFloat(item.unitPrice || 0) * item.quantity).toFixed(2)}</p>
                                        <div className="flex items-center gap-2">
                                            <div className="relative flex items-center border rounded-md shadow-sm">
                                                <button
                                                    disabled={item.quantity <= 1 || isProcessing}
                                                    onClick={() => handleQuantityChange(item, -1)}
                                                    className="px-3 py-1.5 text-slate-600 hover:bg-gray-100 disabled:opacity-40 rounded-l-md"
                                                >
                                                    <FaMinus size="0.8em" />
                                                </button>
                                                <span className="px-3 py-1.5 text-sm w-10 text-center bg-white border-l border-r">{item.quantity}</span>
                                                <button
                                                    disabled={item.quantity >= item.stockQuantity || isProcessing}
                                                    onClick={() => handleQuantityChange(item, 1)}
                                                    className="px-3 py-1.5 text-slate-600 hover:bg-gray-100 disabled:opacity-40 rounded-r-md"
                                                >
                                                    <FaPlus size="0.8em" />
                                                </button>
                                                {isUpdating && (
                                                    <div className="absolute inset-0 bg-white/75 flex items-center justify-center rounded-md z-10">
                                                        <FaSpinner className="animate-spin text-indigo-500" />
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleRemoveItem(item.orderItemId, item.productName)}
                                                disabled={isProcessing}
                                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full"
                                                title="Xóa sản phẩm"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1 hidden sm:block">Tồn kho: {item.stockQuantity}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Order Summary */}
                    {items.length > 0 && ( 
                        <div className="lg:w-1/3">
                            <div className="bg-white p-6 rounded-xl shadow-lg sticky top-24">
                                <h2 className="text-xl font-semibold text-slate-800 mb-4 border-b pb-2">Tóm tắt đơn hàng</h2>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between text-slate-600">
                                        <span>Tạm tính ({totalQuantityFromContext} sản phẩm)</span>
                                        <span>${totalAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Phí vận chuyển</span>
                                        <span>${shippingFee.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t pt-3 mt-3 flex justify-between text-base font-bold text-slate-800">
                                        <span>Tổng thanh toán</span>
                                        <span>${finalTotalToDisplay.toFixed(2)}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleProceedToCheckout}
                                    disabled={items.length === 0}
                                    className="mt-6 w-full bg-indigo-600 text-white py-2.5 rounded-md hover:bg-indigo-700 transition-all text-center font-medium"
                                >
                                    Tiến hành thanh toán
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CartPage;