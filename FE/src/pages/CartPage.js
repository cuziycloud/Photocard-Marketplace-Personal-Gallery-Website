import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaSpinner, FaShoppingCart, FaPlus, FaMinus, FaExclamationCircle, FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa'; // Thêm FaCheckCircle
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const provinces = [
    { value: 'TP. Hồ Chí Minh', label: 'TP. Hồ Chí Minh', region: 'TPHCM' },
    { value: 'Đồng Nai', label: 'Đồng Nai', region: 'MIEN_NAM_KHAC' },
    { value: 'Bình Dương', label: 'Bình Dương', region: 'MIEN_NAM_KHAC' },
    { value: 'Bà Rịa - Vũng Tàu', label: 'Bà Rịa - Vũng Tàu', region: 'MIEN_NAM_KHAC' },
    { value: 'Long An', label: 'Long An', region: 'MIEN_NAM_KHAC' },
    { value: 'Tiền Giang', label: 'Tiền Giang', region: 'MIEN_NAM_KHAC' },
    { value: 'Cần Thơ', label: 'Cần Thơ', region: 'MIEN_NAM_KHAC' },
    { value: 'Hà Nội', label: 'Hà Nội', region: 'KHAC' },
    { value: 'Đà Nẵng', label: 'Đà Nẵng', region: 'KHAC' },
    { value: 'Hải Phòng', label: 'Hải Phòng', region: 'KHAC' },
    { value: 'Khánh Hòa', label: 'Khánh Hòa', region: 'KHAC' },
];

const formatCurrencyUSD = (amount) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (typeof numericAmount !== 'number' || isNaN(numericAmount)) return 'N/A';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(numericAmount);
};

const CartPage = () => {
    const {
        cart,
        loadingCart,
        cartError,
        fetchCart,
        updateItemQuantity,
        removeItemFromCart,
        updatingItem,
        removingItem,
        clearCart
    } = useCart();
    const { currentUser, isLoggedIn, loadingAuth, getToken } = useAuth();
    const navigate = useNavigate();

    const [selectedProvince, setSelectedProvince] = useState('');
    const [shippingAddress, setShippingAddress] = useState('');
    const [calculatedShippingFee, setCalculatedShippingFee] = useState(0);
    const [shippingTime, setShippingTime] = useState('');
    const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
    const [checkoutError, setCheckoutError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [setCreatedOrderId] = useState(null);


    const fetchCartCallback = useCallback(() => {
        if (isLoggedIn) {
            fetchCart();
        } else if (!loadingAuth && !isLoggedIn) {

        }
    }, [isLoggedIn, loadingAuth, fetchCart]);

    useEffect(() => {
        if (!loadingAuth) {
            fetchCartCallback();
        }
    }, [loadingAuth, fetchCartCallback]);

    const handleQuantityChange = useCallback(async (item, change) => {
        const newQuantity = item.quantity + change;
        if (newQuantity < 1) return;
        const currentStock = item.stockQuantity;
        if (currentStock !== undefined && newQuantity > currentStock) {
            alert(`Số lượng "${item.productName}" yêu cầu (${newQuantity}) vượt quá tồn kho (${currentStock}).`);
            return;
        }
        const identifier = isLoggedIn && item.orderItemId ? item.orderItemId : item.productId;
        await updateItemQuantity(identifier, newQuantity);
    }, [updateItemQuantity, isLoggedIn]);

    const handleRemoveItem = useCallback(async (item) => {
        const identifier = isLoggedIn && item.orderItemId ? item.orderItemId : item.productId;
        await removeItemFromCart(identifier);
    }, [removeItemFromCart, isLoggedIn]);

    const calculateShipping = useCallback((provinceValue) => {
        if (!cart?.items || cart.items.length === 0) {
            setCalculatedShippingFee(0);
            setShippingTime('');
            return;
        }
        const provinceData = provinces.find(p => p.value === provinceValue);
        if (!provinceData) {
            setCalculatedShippingFee(0);
            setShippingTime('Vui lòng chọn tỉnh/thành');
            return;
        }
        let fee = 0;
        let time = '';
        switch (provinceData.region) {
            case 'TPHCM': fee = 5.00; time = 'Dự kiến 3 ngày'; break;
            case 'MIEN_NAM_KHAC': fee = 7.00; time = 'Dự kiến 5 ngày'; break;
            case 'KHAC': fee = 10.00; time = 'Dự kiến 7 ngày'; break;
            default: fee = 0; time = 'Không hỗ trợ vận chuyển';
        }
        setCalculatedShippingFee(fee);
        setShippingTime(time);
        return { fee, time };
    }, [cart?.items]);

    useEffect(() => {
        if (selectedProvince && cart?.items?.length > 0) {
            calculateShipping(selectedProvince);
        } else {
            setCalculatedShippingFee(0);
            setShippingTime(cart?.items?.length > 0 ? 'Vui lòng chọn tỉnh/thành' : '');
        }
    }, [selectedProvince, calculateShipping, cart?.items?.length]);

    const handleProceedToCheckout = async () => {
        if (!isLoggedIn || !currentUser) {
            alert("Vui lòng đăng nhập để tiến hành thanh toán.");
            navigate('/login', { state: { from: '/cart' } });
            return;
        }
        if (!cart?.items || cart.items.length === 0) {
            alert("Giỏ hàng đang trống.");
            return;
        }
        if (!selectedProvince) {
            alert("Vui lòng chọn tỉnh/thành phố để giao hàng.");
            return;
        }
        if (!shippingAddress.trim()) {
            alert("Vui lòng nhập địa chỉ giao hàng chi tiết.");
            return;
        }
        if (calculatedShippingFee === 0 && shippingTime === 'Không hỗ trợ vận chuyển' && selectedProvince) {
            alert("Địa chỉ hiện tại không hỗ trợ vận chuyển.");
            return;
        }

        setIsSubmittingOrder(true);
        setCheckoutError('');

        const orderPayload = {
            cartItems: cart.items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
            })),
            shippingAddress: shippingAddress.trim(),
            selectedProvince: selectedProvince,
            phoneNumber: currentUser.phoneNumber || '',
            frontendCalculatedShippingFee: calculatedShippingFee,
        };

        console.log("Submitting order with payload:", orderPayload);

        try {
            const token = await getToken();
            if (!token) {
                throw new Error("Không thể lấy token xác thực. Vui lòng đăng nhập lại.");
            }

            const response = await fetch('/api/orders/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(orderPayload),
            });

            const responseText = await response.text();

            if (!response.ok) {
                let errorMessage = `Lỗi ${response.status} khi tạo đơn hàng.`;
                console.error(`Error creating order. Status: ${response.status}. Response body:`, responseText);
                try {
                    const errorData = JSON.parse(responseText);
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch (parseError) {
                    if (response.status === 403) {
                        errorMessage = "Bạn không có quyền thực hiện hành động này (403).";
                    } else if (responseText && responseText.length < 500 && (responseText.toLowerCase().includes('error') || responseText.toLowerCase().includes('exception'))) {
                        errorMessage = `Lỗi server (${response.status}). Chi tiết: ${responseText.substring(0,100)}...`;
                    }
                }
                throw new Error(errorMessage);
            }

            const createdOrderData = JSON.parse(responseText);
            console.log("Order created successfully:", createdOrderData);

            const orderId = createdOrderData.id || (createdOrderData.order && createdOrderData.order.id) || 'N/A';
            setCreatedOrderId(orderId);
            setShowSuccessModal(true); 

            if (typeof clearCart === 'function') {
                await clearCart(); 
            } else {
                fetchCart(); 
            }

        } catch (error) {
            console.error("Failed to create order:", error);
            setCheckoutError(error.message || "Đã có lỗi xảy ra trong quá trình đặt hàng. Vui lòng thử lại.");
        } finally {
            setIsSubmittingOrder(false);
        }
    };

    if (loadingAuth || loadingCart) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen py-24 bg-gray-50">
                <FaSpinner className="animate-spin text-5xl text-indigo-500 mb-4" />
                <p className="text-lg text-gray-600">Đang tải dữ liệu...</p>
            </div>
        );
    }

    if (cartError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 bg-gray-50">
                <FaExclamationCircle className="text-6xl text-red-400 mb-4" />
                <h2 className="text-2xl font-bold text-red-600 mb-2">Đã xảy ra lỗi</h2>
                <p className="text-gray-700 mb-4">{cartError}</p>
                <button onClick={fetchCartCallback} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">Thử lại</button>
            </div>
        );
    }

    const items = cart?.items || [];
    const totalAmount = parseFloat(cart?.totalAmount || 0);
    const finalTotalToDisplay = totalAmount + (items.length > 0 ? calculatedShippingFee : 0);
    const distinctProductCount = items.length;

    if (items.length === 0 && !loadingCart && !cartError && !showSuccessModal) {
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
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl text-center max-w-md w-full">
                        <FaCheckCircle className="text-5xl sm:text-6xl text-green-500 mx-auto mb-4 sm:mb-6" />
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Đặt hàng thành công!</h2>
                        <p className="text-slate-600 mb-3 sm:mb-4">
                            Đơn hàng của bạn đã được tiếp nhận.
                        </p>
                        <p className="text-sm text-slate-500 mb-6 sm:mb-8">
                            Cảm ơn bạn đã mua sắm! Bạn có thể theo dõi đơn hàng hoặc tiếp tục khám phá sản phẩm.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                            <Link
                                to="/"
                                onClick={() => setShowSuccessModal(false)}
                                className="w-full sm:w-auto bg-slate-200 hover:bg-slate-300 text-slate-700 px-5 py-2.5 rounded-lg font-medium transition-colors"
                            >
                                Về Trang Chủ
                            </Link>
                            <Link
                                to="/myorder"
                                onClick={() => setShowSuccessModal(false)}
                                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
                            >
                                Xem Đơn Hàng
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-extrabold text-slate-900">Giỏ hàng & Thanh toán</h1>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    <div className="lg:w-2/3">
                        {items.length > 0 ? ( 
                            <div>
                                <h2 className="text-2xl font-semibold text-slate-800 mb-6">Chi tiết giỏ hàng ({distinctProductCount} sản phẩm)</h2>
                                <div className="space-y-5">
                                    {items.map(item => {
                                        const itemIdentifier = isLoggedIn && item.orderItemId ? item.orderItemId : item.productId;
                                        const isUpdating = updatingItem?.[itemIdentifier];
                                        const isRemoving = removingItem?.[itemIdentifier];
                                        const isProcessing = isUpdating || isRemoving;
                                        const unitPriceUSD = parseFloat(item.unitPrice || 0);
                                        const itemTotalUSD = unitPriceUSD * item.quantity;
                                        const stockQuantity = item.stockQuantity || 0;

                                        return (
                                            <div key={itemIdentifier} className={`relative bg-white rounded-xl shadow p-4 flex flex-col sm:flex-row gap-4 transition-opacity ${isRemoving ? 'opacity-40' : ''}`}>
                                                {isRemoving && (
                                                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 rounded-xl">
                                                        <FaSpinner className="animate-spin text-red-500 text-2xl" />
                                                    </div>
                                                )}
                                                <Link to={`/products/${item.productId}`} className="relative w-full sm:w-32 h-auto sm:h-40 block flex-shrink-0 bg-gray-100 p-2 box-border flex justify-center items-center overflow-hidden rounded-md group">
                                                    <img
                                                        src={item.imageUrl || 'https://via.placeholder.com/300x400?text=No+Image'}
                                                        alt={item.productName}
                                                        className="block max-w-full max-h-full object-contain rounded-lg transition-transform duration-300 ease-in-out group-hover:scale-105"
                                                    />
                                                </Link>
                                                <div className="flex-grow flex flex-col justify-between w-full">
                                                    <div>
                                                        <Link to={`/products/${item.productId}`} className="text-lg font-semibold text-slate-800 hover:text-indigo-600 line-clamp-2">
                                                            {item.productName}
                                                        </Link>
                                                        <p className="text-sm text-slate-500 mt-1">Đơn giá: {formatCurrencyUSD(unitPriceUSD)}</p>
                                                    </div>
                                                    <p className="text-xs text-slate-400 mt-1 sm:hidden">Tồn kho: {stockQuantity}</p>
                                                </div>
                                                <div className="flex flex-col items-start sm:items-end justify-between sm:min-w-[170px] w-full sm:w-auto pt-2 sm:pt-0">
                                                    <p className="text-md font-bold text-slate-800 mb-2 sm:mb-0">{formatCurrencyUSD(itemTotalUSD)}</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="relative flex items-center border rounded-md shadow-sm">
                                                            <button
                                                                disabled={item.quantity <= 1 || isProcessing}
                                                                onClick={() => handleQuantityChange(item, -1)}
                                                                className="px-3 py-1.5 text-slate-600 hover:bg-gray-100 disabled:opacity-40 rounded-l-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                            > <FaMinus size="0.75em" /> </button>
                                                            <span className="px-3 py-1.5 text-sm w-10 text-center bg-white border-l border-r">{item.quantity}</span>
                                                            <button
                                                                disabled={item.quantity >= stockQuantity || isProcessing}
                                                                onClick={() => handleQuantityChange(item, 1)}
                                                                className="px-3 py-1.5 text-slate-600 hover:bg-gray-100 disabled:opacity-40 rounded-r-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                            > <FaPlus size="0.75em" /> </button>
                                                            {isUpdating && (
                                                                <div className="absolute inset-0 bg-white/75 flex items-center justify-center rounded-md z-10">
                                                                    <FaSpinner className="animate-spin text-indigo-500" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => handleRemoveItem(item)}
                                                            disabled={isProcessing}
                                                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full focus:outline-none focus:ring-1 focus:ring-red-500"
                                                            title="Xóa sản phẩm"
                                                        > <FaTrash /> </button>
                                                    </div>
                                                    <p className="text-xs text-slate-400 mt-1 hidden sm:block">Tồn kho: {stockQuantity}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            showSuccessModal && (
                                <div className="text-center py-10">
                                    <p className="text-slate-600">Đơn hàng đã được gửi. Giỏ hàng của bạn hiện trống.</p>
                                </div>
                            )
                        )}
                    </div>
                    <div className="lg:w-1/3">
                        <div className="bg-white p-6 rounded-xl shadow-lg lg:sticky lg:top-24 space-y-6">
                            <div>
                                <h3 className="text-xl font-semibold text-slate-800 mb-4">Thông tin giao hàng</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="province" className="block text-sm font-medium text-slate-600 mb-1">
                                            Tỉnh/Thành phố <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="province"
                                            name="province"
                                            value={selectedProvince}
                                            onChange={(e) => setSelectedProvince(e.target.value)}
                                            className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                            disabled={items.length === 0 || isSubmittingOrder || showSuccessModal}
                                        >
                                            <option value="">-- Chọn Tỉnh/Thành phố --</option>
                                            {provinces.map(province => (
                                                <option key={province.value} value={province.value}>
                                                    {province.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="address" className="block text-sm font-medium text-slate-600 mb-1">
                                            Địa chỉ cụ thể (Số nhà, tên đường, phường/xã, quận/huyện) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="address"
                                            name="address"
                                            value={shippingAddress}
                                            onChange={(e) => setShippingAddress(e.target.value)}
                                            placeholder="Ví dụ: 123 Đường ABC, Phường XYZ, Quận GHI"
                                            className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                            disabled={items.length === 0 || isSubmittingOrder || showSuccessModal}
                                        />
                                    </div>
                                    {selectedProvince && shippingTime && items.length > 0 && (
                                        <div className={`p-3 rounded-md text-sm ${calculatedShippingFee === 0 && shippingTime === 'Không hỗ trợ vận chuyển' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'}`}>
                                            <p><FaMapMarkerAlt className="inline mr-1.5 -mt-0.5" />Giao đến: <strong>{selectedProvince}</strong></p>
                                            <p>Phí vận chuyển: <strong>{formatCurrencyUSD(calculatedShippingFee)}</strong></p>
                                            <p>Thời gian vận chuyển: <strong>{shippingTime}</strong></p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-slate-800 mb-4 pt-4 border-t mt-6">Tóm tắt đơn hàng</h3>
                                <div className="bg-gray-50 p-4 rounded-lg space-y-3 text-sm border">
                                    <div className="flex justify-between text-slate-600">
                                        <span>Tạm tính ({distinctProductCount} sản phẩm)</span>
                                        <span>{formatCurrencyUSD(totalAmount)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Phí vận chuyển</span>
                                        <span>
                                            {selectedProvince && items.length > 0 ? formatCurrencyUSD(calculatedShippingFee) : (items.length > 0 ? "Chọn địa chỉ" : formatCurrencyUSD(0))}
                                        </span>
                                    </div>
                                    <div className="border-t border-gray-300 pt-3 mt-3 flex justify-between text-lg font-bold text-slate-800">
                                        <span>Tổng cộng</span>
                                        <span>{formatCurrencyUSD(finalTotalToDisplay)}</span>
                                    </div>
                                </div>
                                {checkoutError && (
                                    <p className="mt-4 text-sm text-red-600 text-center bg-red-50 p-3 rounded-md border border-red-300">
                                        {checkoutError}
                                    </p>
                                )}
                                <button
                                    onClick={handleProceedToCheckout}
                                    disabled={items.length === 0 || !selectedProvince || !shippingAddress.trim() || (calculatedShippingFee === 0 && shippingTime === 'Không hỗ trợ vận chuyển' && selectedProvince) || isSubmittingOrder || showSuccessModal}
                                    className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 transition-all text-center font-semibold text-base disabled:opacity-50 flex items-center justify-center"
                                >
                                    {isSubmittingOrder ? (
                                        <>
                                            <FaSpinner className="animate-spin mr-2" /> Đang xử lý...
                                        </>
                                    ) : (isLoggedIn ? "Tiến hành thanh toán" : "Đăng nhập để thanh toán")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;