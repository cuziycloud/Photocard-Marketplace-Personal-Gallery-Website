import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { FaBoxOpen, FaInfoCircle, FaRedo, FaShoppingBag, FaChevronDown, FaChevronUp, FaFilter, FaSearch } from 'react-icons/fa'; // Bỏ FaDollarSign vì formatCurrencyUSD đã có $

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    } catch (error) {
        console.error("Error formatting date:", dateString, error);
        return dateString;
    }
};

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

const getOrderStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
        case 'PENDING':
            return { text: 'Chờ xử lý', textColor: 'text-yellow-700', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-400' };
        case 'PROCESSING':
            return { text: 'Đang xử lý', textColor: 'text-blue-700', bgColor: 'bg-blue-100', borderColor: 'border-blue-400' };
        case 'PAID':
             return { text: 'Đã thanh toán', textColor: 'text-cyan-700', bgColor: 'bg-cyan-100', borderColor: 'border-cyan-400' };
        case 'SHIPPED':
            return { text: 'Đã giao hàng', textColor: 'text-teal-700', bgColor: 'bg-teal-100', borderColor: 'border-teal-400' };
        case 'DELIVERED':
            return { text: 'Đã nhận hàng', textColor: 'text-green-700', bgColor: 'bg-green-100', borderColor: 'border-green-400' };
        case 'COMPLETED':
            return { text: 'Hoàn thành', textColor: 'text-green-800', bgColor: 'bg-green-200', borderColor: 'border-green-500' };
        case 'CANCELLED':
            return { text: 'Đã hủy', textColor: 'text-red-700', bgColor: 'bg-red-100', borderColor: 'border-red-400' };
        default:
            return { text: status || 'Không xác định', textColor: 'text-gray-700', bgColor: 'bg-gray-100', borderColor: 'border-gray-400' };
    }
};

const MyOrdersPage = () => {
    const { currentUser, getToken, loadingAuth } = useAuth();
    const [allOrders, setAllOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState('');
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const token = await getToken();
            if (!token) {
                throw new Error("Không thể lấy token xác thực. Vui lòng đăng nhập lại.");
            }

            const response = await fetch('/api/orders/my-orders', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            
            if (response.status === 204) {
                setAllOrders([]);
                setFilteredOrders([]);
                return; 
            }

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                     throw new Error('Phiên đăng nhập hết hạn hoặc không có quyền. Vui lòng đăng nhập lại.');
                }
                let errorMessage = `Lỗi ${response.status}: Không thể tải đơn hàng.`;
                try {
                    const errData = await response.json();
                    errorMessage = errData.message || errorMessage;
                } catch (parseError) {}
                throw new Error(errorMessage);
            }
            
            const data = await response.json();
            const ordersData = data || [];
            const sortedOrders = ordersData.sort((a, b) => {
                const dateA = new Date(a.orderDate);
                const dateB = new Date(b.orderDate);
                if (isNaN(dateA) && isNaN(dateB)) return 0;
                if (isNaN(dateA)) return 1; 
                if (isNaN(dateB)) return -1;
                return dateB - dateA;
            });
            setAllOrders(sortedOrders);
            setFilteredOrders(sortedOrders);
        } catch (err) {
            setError(err.message || 'Đã xảy ra lỗi không mong muốn khi tải đơn hàng.');
            console.error("Fetch orders error:", err);
        } finally {
            setLoading(false);
        }
    }, [getToken]); 

    useEffect(() => {
        if (loadingAuth) {
            setLoading(true); 
            return;
        }
        if (!currentUser) {
            setLoading(false);
            setError("Bạn cần đăng nhập để xem đơn hàng.");
            return;
        }
        fetchOrders();
    }, [currentUser, loadingAuth, fetchOrders]);

    useEffect(() => {
        let tempOrders = [...allOrders];
        if (statusFilter) {
            tempOrders = tempOrders.filter(order => order.status?.toUpperCase() === statusFilter.toUpperCase());
        }
        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            tempOrders = tempOrders.filter(order =>
                order.id.toString().toLowerCase().includes(lowerSearchTerm) ||
                (order.items && order.items.some(item => item.productName?.toLowerCase().includes(lowerSearchTerm)))
            );
        }
        setFilteredOrders(tempOrders);
    }, [statusFilter, searchTerm, allOrders]);

    const toggleOrderDetails = (orderId) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    if (loading) { 
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
                <FaRedo className="text-4xl text-sky-600 animate-spin mb-4" />
                <p className="text-lg text-gray-700">Đang tải danh sách đơn hàng...</p>
            </div>
        );
    }
    if (error) { 
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
                <FaInfoCircle className="text-5xl text-red-500 mb-4" />
                <p className="text-xl text-red-700 mb-2">Lỗi!</p>
                <p className="text-md text-gray-600 mb-6">{error}</p>
                <button
                    onClick={fetchOrders}
                    className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors flex items-center"
                >
                    <FaRedo className="mr-2" /> Thử lại
                </button>
            </div>
        );
    }
    if (allOrders.length === 0 && !loading && !error) { 
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
                <FaShoppingBag className="text-6xl text-gray-400 mb-6" />
                <h2 className="text-2xl font-semibold text-gray-700 mb-3">Bạn chưa có đơn hàng nào</h2>
                <p className="text-gray-500 mb-6">Hãy bắt đầu mua sắm để xem các đơn hàng của bạn tại đây.</p>
                <Link
                    to="/products" 
                    className="px-8 py-3 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 transition-colors shadow-md"
                >
                    Khám phá sản phẩm
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <header className="mb-10 md:mb-12">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                        <div className="flex items-center gap-3">
                            <FaBoxOpen className="text-4xl sm:text-5xl text-sky-600" />
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
                                Đơn Hàng Của Bạn
                            </h1>
                        </div>
                        {allOrders.length > 0 && (
                            <p className="text-md sm:text-lg text-gray-500">
                                Bạn có tổng cộng {allOrders.length} đơn hàng.
                            </p>
                        )}
                    </div>
                </header>
                
                {allOrders.length > 0 && (
                    <section className="mb-8 p-4 sm:p-6 bg-white rounded-xl shadow-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-center">
                            <div className="relative">
                                <FaFilter className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 appearance-none text-gray-700"
                                    aria-label="Lọc theo trạng thái"
                                >
                                    <option value="">Tất cả trạng thái</option>
                                    <option value="PENDING">Chờ xử lý</option>
                                    <option value="PAID">Đã thanh toán</option>
                                    <option value="PROCESSING">Đang xử lý</option>
                                    <option value="SHIPPED">Đã giao</option>
                                    <option value="DELIVERED">Đã nhận</option>
                                    <option value="COMPLETED">Hoàn thành</option>
                                    <option value="CANCELLED">Đã hủy</option>
                                </select>
                            </div>
                            <div className="relative">
                                <FaSearch className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Tìm mã đơn, tên sản phẩm..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-gray-700"
                                    aria-label="Tìm kiếm đơn hàng"
                                />
                            </div>
                        </div>
                    </section>
                )}

                <main>
                    {filteredOrders.length > 0 ? (
                        <div className="space-y-6">
                            {filteredOrders.map((order) => {
                                const statusStyle = getOrderStatusStyle(order.status);
                                const isExpanded = expandedOrderId === order.id;
                                return (
                                    <article key={order.id} className="bg-white shadow-xl rounded-xl transition-all duration-300 ease-in-out overflow-hidden hover:shadow-2xl">
                                        <header
                                            className="p-5 sm:p-6 hover:bg-slate-50 cursor-pointer border-b border-gray-200"
                                            onClick={() => toggleOrderDetails(order.id)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyPress={(e) => e.key === 'Enter' && toggleOrderDetails(order.id)}
                                            aria-expanded={isExpanded}
                                            aria-controls={`order-details-${order.id}`}
                                        >
                                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-4">
                                                <div className="flex-grow">
                                                    <div className="flex items-baseline mb-1">
                                                        <span className="text-xs font-medium text-gray-500 mr-1.5 uppercase">Mã đơn:</span>
                                                        <h2 className="text-md sm:text-lg font-semibold text-sky-700">{order.id}</h2>
                                                    </div>
                                                    <p className="text-xs sm:text-sm text-gray-500">
                                                        Ngày đặt: {formatDate(order.orderDate)}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-start sm:items-end gap-1 text-right">
                                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusStyle.bgColor} ${statusStyle.textColor} border ${statusStyle.borderColor}`}>
                                                        {statusStyle.text.toUpperCase()}
                                                    </span>
                                                    <p className="text-lg sm:text-xl font-bold text-gray-800">{formatCurrencyUSD(order.grandTotal)}</p>
                                                </div>
                                                <div className="p-1 text-gray-500 hover:text-sky-600 sm:ml-2 self-center sm:self-auto">
                                                    {isExpanded ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
                                                </div>
                                            </div>
                                        </header>

                                        {isExpanded && (
                                            <section id={`order-details-${order.id}`} className="p-5 sm:p-6 bg-slate-50/70 border-t border-gray-200">
                                                <h3 className="text-md sm:text-lg font-semibold text-gray-700 mb-4">Chi tiết đơn hàng</h3>
                                                <div className="space-y-4 mb-6">
                                                    {order.items && order.items.map((item, index) => ( 
                                                        <div key={item.productId + '-' + index} className="flex items-start sm:items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                                            <img
                                                                src={item.imageUrl || 'https://via.placeholder.com/64?text=N/A'}
                                                                alt={item.productName || 'Sản phẩm'}
                                                                className="w-16 h-16 object-contain bg-gray-100 rounded-md border border-gray-200 flex-shrink-0"
                                                            />
                                                            <div className="flex-grow min-w-0"> 
                                                                <Link to={`/products/${item.productId}`} className="font-semibold text-gray-800 hover:text-sky-600 transition-colors block truncate" title={item.productName}>
                                                                    {item.productName || 'Tên sản phẩm không có'}
                                                                </Link>
                                                                <p className="text-xs sm:text-sm text-gray-500">Số lượng: {item.quantity}</p>
                                                                <p className="text-xs sm:text-sm text-gray-500">Đơn giá: {formatCurrencyUSD(item.unitPrice)}</p>
                                                            </div>
                                                            <p className="text-sm sm:text-md font-semibold text-gray-700 flex-shrink-0 ml-auto">
                                                                {formatCurrencyUSD(item.quantity * (typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice) : item.unitPrice))}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mb-6 pt-4 border-t border-gray-200 space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Tiền hàng (Subtotal):</span>
                                                        <span className="font-medium text-gray-800">{formatCurrencyUSD(order.subTotalProducts)}</span> 
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Phí vận chuyển:</span>
                                                        <span className="font-medium text-gray-800">{formatCurrencyUSD(order.shippingFee)}</span>
                                                    </div>
                                                    <div className="flex justify-between font-bold text-md">
                                                        <span className="text-gray-800">Tổng cộng:</span>
                                                        <span className="text-sky-700">{formatCurrencyUSD(order.grandTotal)}</span>
                                                    </div>
                                                </div>


                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-gray-600 mb-1">Địa chỉ giao hàng:</h4>
                                                        <p className="text-sm text-gray-800">{order.shippingAddress || 'Chưa có thông tin'}</p>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-gray-600 mb-1">Số điện thoại:</h4>
                                                        <p className="text-sm text-gray-800">{order.phoneNumber || 'Chưa có thông tin'}</p>
                                                    </div>
                                                </div>
                                                <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                                                </div>
                                            </section>
                                        )}
                                    </article>
                                );
                            })}
                        </div>
                    ) : (
                        allOrders.length > 0 &&
                        <div className="text-center py-12 px-6 bg-white rounded-xl shadow-lg">
                            <FaSearch className="text-5xl text-gray-400 mx-auto mb-5" />
                            <p className="text-xl font-semibold text-gray-700 mb-2">Không tìm thấy đơn hàng nào khớp</p>
                            <p className="text-gray-500">Vui lòng thử lại với bộ lọc hoặc từ khóa tìm kiếm khác.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default MyOrdersPage;