import React from 'react';
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

    const handleQuantityChange = async (orderItemId, currentQuantity, change, stockQuantity) => {
        const newQuantity = currentQuantity + change;
        if (newQuantity < 1 || newQuantity > stockQuantity) return;
        await updateItemQuantity(orderItemId, newQuantity);
    };

    const handleRemoveItem = async (orderItemId, productName) => {
        if (window.confirm(`Xóa "${productName}" khỏi giỏ hàng?`)) {
            await removeItemFromCart(orderItemId);
        }
    };

    const handleProceedToCheckout = () => {
        if (cart?.items?.length > 0) {
            alert("Chức năng thanh toán chưa được triển khai!");
        } else {
            alert("Giỏ hàng đang trống.");
        }
    };

    if (loadingCart && !cart) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen py-24">
                <FaSpinner className="animate-spin text-5xl text-indigo-500 mb-4" />
                <p className="text-lg text-gray-600">Đang tải giỏ hàng...</p>
            </div>
        );
    }

    if (cartError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
                <FaExclamationCircle className="text-6xl text-red-400 mb-4" />
                <h2 className="text-2xl font-bold text-red-600 mb-2">Đã xảy ra lỗi</h2>
                <p className="text-gray-700 mb-4">{cartError}</p>
                <button onClick={fetchCart} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Thử lại</button>
            </div>
        );
    }

    const items = cart?.items || [];
    const totalQuantity = cart?.totalQuantity || 0;
    const totalAmount = parseFloat(cart?.totalAmount || 0);
    const shippingFee = items.length ? 5.0 : 0;
    const totalDisplay = totalAmount + shippingFee;

    if (!loadingCart && items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center py-24">
                <FaShoppingCart className="text-6xl text-gray-300 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Giỏ hàng trống</h2>
                <p className="text-gray-600 mb-6">Hãy thêm sản phẩm để bắt đầu mua sắm.</p>
                <Link to="/" className="bg-indigo-500 text-white px-6 py-2 rounded-md hover:bg-indigo-600">Khám phá sản phẩm</Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-16 px-4 lg:px-16">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">Giỏ hàng</h1>
                    <p className="text-slate-600">Tổng cộng <span className="text-indigo-600 font-semibold">{totalQuantity}</span> sản phẩm</p>
                </div>
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Items */}
                    <div className="w-full lg:w-2/3 bg-white p-6 rounded-xl shadow">
                        {items.map(item => {
                            const isUpdating = updatingItem?.[item.orderItemId];
                            const isRemoving = removingItem?.[item.orderItemId];
                            const isLoading = isUpdating || isRemoving;

                            return (
                                <div key={item.orderItemId} className={`flex items-center gap-4 py-4 border-b ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <Link to={`/products/${item.productId}`} className="w-24 h-24 flex-shrink-0">
                                        <img src={item.imageUrl || 'https://via.placeholder.com/120'} alt={item.productName} className="w-full h-full object-cover rounded-md" />
                                    </Link>
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
                                        <div>
                                            <Link to={`/products/${item.productId}`} className="font-semibold text-slate-800 hover:text-indigo-600">{item.productName}</Link>
                                            <p className="text-sm text-slate-500">Đơn giá: ${parseFloat(item.unitPrice || 0).toFixed(2)}</p>
                                            <p className="text-xs text-slate-400">Tồn kho: {item.stockQuantity}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex border rounded">
                                                <button disabled={item.quantity <= 1 || isLoading} onClick={() => handleQuantityChange(item.orderItemId, item.quantity, -1, item.stockQuantity)} className="px-3 py-1 hover:bg-slate-100">-</button>
                                                <div className="px-4 py-1 text-center">{item.quantity}</div>
                                                <button disabled={item.quantity >= item.stockQuantity || isLoading} onClick={() => handleQuantityChange(item.orderItemId, item.quantity, 1, item.stockQuantity)} className="px-3 py-1 hover:bg-slate-100">+</button>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-slate-800 font-medium">${(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}</span>
                                                <button onClick={() => handleRemoveItem(item.orderItemId, item.productName)} disabled={isLoading} className="text-red-500 hover:text-red-700">
                                                    {isRemoving ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Summary */}
                    <div className="w-full lg:w-1/3 bg-white p-6 rounded-xl shadow h-fit">
                        <h2 className="text-xl font-semibold mb-4 text-slate-800">Tóm tắt đơn hàng</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Tạm tính</span>
                                <span>${totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Phí vận chuyển</span>
                                <span>${shippingFee.toFixed(2)}</span>
                            </div>
                            <div className="border-t border-slate-200 my-2"></div>
                            <div className="flex justify-between font-semibold text-slate-800">
                                <span>Tổng cộng</span>
                                <span>${totalDisplay.toFixed(2)}</span>
                            </div>
                        </div>
                        <button onClick={handleProceedToCheckout} className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md transition-colors">Tiến hành thanh toán</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
