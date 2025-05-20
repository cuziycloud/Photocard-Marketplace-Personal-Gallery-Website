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
        if (newQuantity < 1) return; 

        if (newQuantity > stockQuantity) {
            alert(`Số lượng yêu cầu (${newQuantity}) vượt quá số lượng tồn kho (${stockQuantity}). Chỉ còn ${stockQuantity} sản phẩm.`);
            
            return;
        }
        await updateItemQuantity(orderItemId, newQuantity);
    };

    const handleRemoveItem = async (orderItemId, productName) => {
        if (!window.confirm(`Bạn có chắc muốn xóa "${productName}" khỏi giỏ hàng?`)) {
            return;
        }
        await removeItemFromCart(orderItemId);
    };

    const handleProceedToCheckout = () => {
        if(cart && cart.items && cart.items.length > 0) {
            console.log("Proceeding to checkout with cart:", cart);
            alert("Chức năng thanh toán chưa được triển khai!");
        } else {
            alert("Giỏ hàng của bạn đang trống. Không thể tiến hành thanh toán.");
        }
    };

    // --- RENDER LOGIC ---

    if (loadingCart && !cart) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center flex flex-col justify-center items-center min-h-[calc(100vh-160px)]" style={{ paddingTop: '100px' }}>
                <FaSpinner className="animate-spin text-5xl text-indigo-500 mb-4" />
                <p className="text-xl text-gray-600">Đang tải giỏ hàng của bạn...</p>
            </div>
        );
    }

    if (cartError) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center" style={{ paddingTop: '100px' }}>
                <FaExclamationCircle className="mx-auto text-6xl text-red-400 mb-6" />
                <h1 className="text-3xl font-semibold mb-4 text-red-600">Oops! Đã có lỗi xảy ra</h1>
                <p className="text-lg text-gray-700 mb-8">{cartError}</p>
                <button
                    onClick={fetchCart}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-md transition-colors duration-300 shadow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    const cartItemsToDisplay = cart?.items || [];
    const totalCartQuantity = cart?.totalQuantity || 0;
    const backendTotalAmount = cart?.totalAmount !== undefined && cart?.totalAmount !== null ? parseFloat(cart.totalAmount) : 0;

    const subtotalFrontend = cartItemsToDisplay.reduce((sum, item) => {
        const price = parseFloat(item.unitPrice || 0); 
        return sum + (price * item.quantity);
    }, 0);

    const shippingFee = cartItemsToDisplay.length > 0 ? 5.00 : 0;
    const finalTotalToDisplay = backendTotalAmount + shippingFee; 

    if (!loadingCart && cartItemsToDisplay.length === 0) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center flex flex-col justify-center items-center min-h-[calc(100vh-160px)]" style={{ paddingTop: '100px' }}>
                 <FaShoppingCart className="mx-auto text-6xl text-gray-300 mb-6" />
                <h1 className="text-3xl font-semibold mb-6 text-gray-800">Giỏ hàng của bạn vẫn còn trống</h1>
                <p className="text-lg text-gray-600 mb-8">Hãy khám phá và thêm những sản phẩm yêu thích vào giỏ nhé!</p>
                <Link
                    to="/"
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-8 rounded-md transition-colors duration-300 shadow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                >
                    Khám phá sản phẩm
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen" style={{ paddingTop: '80px' }}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-8 text-center lg:text-left">
                    <h1 className="text-3xl lg:text-4xl font-bold text-slate-800">Giỏ hàng của bạn</h1>
                    {totalCartQuantity > 0 && (
                        <p className="text-slate-600 mt-2">
                            Hiện có <span className="font-semibold text-indigo-600">{totalCartQuantity}</span> sản phẩm.
                        </p>
                    )}
                </div>


                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Cart Items List */}
                    <div className="lg:w-2/3">
                        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg space-y-1">
                            {cartItemsToDisplay.map(item => {
                                const isItemUpdating = updatingItem && updatingItem[item.orderItemId];
                                const isItemRemoving = removingItem && removingItem[item.orderItemId];
                                const isLoading = isItemUpdating || isItemRemoving;

                                return (
                                <div key={item.orderItemId}
                                    className={`relative flex flex-col sm:flex-row items-center gap-4 p-4 border-b border-slate-200 last:border-b-0 transition-opacity duration-300 ${isLoading ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
                                    <Link to={`/products/${item.productId}`} className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 block">
                                        <img
                                            src={item.imageUrl || 'https://via.placeholder.com/120?text=No+Image'}
                                            alt={item.productName || 'Sản phẩm'}
                                            className="w-full h-full object-cover rounded-md border border-slate-100"
                                        />
                                    </Link>
                                    <div className="flex-grow flex flex-col sm:flex-row justify-between items-start sm:items-center w-full">
                                        <div className="sm:max-w-xs mb-3 sm:mb-0 text-center sm:text-left w-full sm:w-auto">
                                            <Link to={`/products/${item.productId}`} className="hover:text-indigo-600">
                                                <h3 className="text-md font-semibold text-slate-800 line-clamp-2">{item.productName || 'Tên sản phẩm không có'}</h3>
                                            </Link>
                                            <p className="text-sm text-slate-500 mt-1">Đơn giá: <span className="font-medium text-indigo-500">${parseFloat(item.unitPrice || 0).toFixed(2)}</span></p>
                                            <p className="text-xs text-slate-400 mt-0.5">Còn lại: {item.stockQuantity}</p>
                                        </div>

                                        <div className="flex flex-col items-center sm:items-end gap-3 w-full sm:w-auto">
                                            {/* Quantity Control */}
                                            <div className="flex items-center border border-slate-300 rounded-md shadow-sm">
                                                <button
                                                    onClick={() => handleQuantityChange(item.orderItemId, item.quantity, -1, item.stockQuantity)}
                                                    className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-l-md disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-indigo-300"
                                                    disabled={item.quantity <= 1 || isLoading}
                                                    aria-label="Giảm số lượng"
                                                >
                                                    <FaMinus size="0.75em"/>
                                                </button>
                                                <input
                                                    type="text"
                                                    value={item.quantity}
                                                    readOnly
                                                    className="w-10 text-center py-1.5 border-l border-r border-slate-300 text-sm font-medium text-slate-700 focus:outline-none bg-white"
                                                    aria-label={`Số lượng ${item.productName}`}
                                                />
                                                <button
                                                    onClick={() => handleQuantityChange(item.orderItemId, item.quantity, 1, item.stockQuantity)}
                                                    className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-r-md disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-indigo-300"
                                                    disabled={item.quantity >= item.stockQuantity || isLoading}
                                                    aria-label="Tăng số lượng"
                                                >
                                                    <FaPlus size="0.75em"/>
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <p className="text-md font-semibold text-slate-800 w-24 text-right">
                                                    ${(parseFloat(item.unitPrice || 0) * item.quantity).toFixed(2)}
                                                </p>
                                                <button
                                                    onClick={() => handleRemoveItem(item.orderItemId, item.productName)}
                                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-red-300"
                                                    disabled={isLoading}
                                                    aria-label={`Xóa ${item.productName}`}
                                                >
                                                    {isItemRemoving ? <FaSpinner className="animate-spin w-4 h-4"/> : <FaTrash className="w-4 h-4"/>}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {isItemUpdating && (
                                        <div className="absolute inset-0 bg-white bg-opacity-60 flex justify-center items-center rounded-lg z-10">
                                            <FaSpinner className="animate-spin text-xl text-indigo-500"/>
                                        </div>
                                    )}
                                </div>
                            )})}
                        </div>
                    </div>

                    {/* Order Summary */}
                    {cartItemsToDisplay.length > 0 && (
                        <div className="lg:w-1/3">
                            <div className="bg-white p-6 rounded-xl shadow-lg sticky top-28">
                                <h2 className="text-xl font-semibold text-slate-700 mb-6 border-b border-slate-200 pb-4">Tóm tắt đơn hàng</h2>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between text-slate-600">
                                        <span>Tạm tính ({totalCartQuantity} sản phẩm)</span>
                                        <span className="font-medium text-slate-800">${subtotalFrontend.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Phí vận chuyển</span>
                                        <span className="font-medium text-slate-800">${shippingFee.toFixed(2)}</span>
                                    </div>
                                    <hr className="my-4 border-slate-200" />
                                    <div className="flex justify-between text-lg font-bold text-slate-800">
                                        <span>Tổng cộng</span>
                                        <span>${finalTotalToDisplay.toFixed(2)}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleProceedToCheckout}
                                    className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-300 text-base shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                                >
                                    Tiến hành thanh toán
                                </button>
                                <Link
                                    to="/"
                                    className="mt-4 block text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                                >
                                    Hoặc tiếp tục mua sắm
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CartPage;