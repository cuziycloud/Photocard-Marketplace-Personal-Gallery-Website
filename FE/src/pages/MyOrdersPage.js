import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { FaBoxOpen, FaInfoCircle, FaRedo, FaShoppingBag, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    } catch (error) {
        return dateString;
    }
};

const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const getOrderStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
        case 'PENDING':
            return { text: 'Chờ xử lý', textColor: 'text-yellow-700', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-500' };
        case 'PROCESSING':
            return { text: 'Đang xử lý', textColor: 'text-blue-700', bgColor: 'bg-blue-100', borderColor: 'border-blue-500' };
        case 'SHIPPED':
            return { text: 'Đã giao hàng', textColor: 'text-teal-700', bgColor: 'bg-teal-100', borderColor: 'border-teal-500' };
        case 'DELIVERED':
            return { text: 'Đã nhận hàng', textColor: 'text-green-700', bgColor: 'bg-green-100', borderColor: 'border-green-500' };
        case 'COMPLETED':
            return { text: 'Hoàn thành', textColor: 'text-green-800', bgColor: 'bg-green-200', borderColor: 'border-green-600' };
        case 'CANCELLED':
            return { text: 'Đã hủy', textColor: 'text-red-700', bgColor: 'bg-red-100', borderColor: 'border-red-500' };
        default:
            return { text: status || 'Không xác định', textColor: 'text-gray-700', bgColor: 'bg-gray-100', borderColor: 'border-gray-500' };
    }
};


const MyOrdersPage = () => {
    const { currentUser, getToken } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    const fetchOrders = async () => {
        if (!currentUser) return;
        setLoading(true);
        setError('');
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const mockOrders = [
                {
                    id: 'ORD001', orderDate: '2025-05-20T10:30:00Z', totalAmount: 1250000, status: 'DELIVERED',
                    shippingAddress: '123 Đường ABC, Phường X, Quận Y, TP.HCM', phoneNumber: '090xxxxxxx',
                    items: [
                        { id: 1, productId: 'P001', productName: 'Album Kpop Vol.1', quantity: 1, unitPrice: 550000, imageUrl: 'https://via.placeholder.com/80?text=Album1' },
                        { id: 2, productId: 'P002', productName: 'Lightstick XYZ', quantity: 1, unitPrice: 700000, imageUrl: 'https://via.placeholder.com/80?text=Lightstick' },
                    ]
                },
                {
                    id: 'ORD002', orderDate: '2025-06-01T14:00:00Z', totalAmount: 780000, status: 'SHIPPED',
                     shippingAddress: '456 Đường DEF, Phường A, Quận B, TP. Hà Nội', phoneNumber: '091xxxxxxx',
                    items: [
                        { id: 3, productId: 'P003', productName: 'Photocard Set (Random)', quantity: 2, unitPrice: 390000, imageUrl: 'https://via.placeholder.com/80?text=Photocard' },
                    ]
                },
                {
                    id: 'ORD003', orderDate: '2025-06-02T09:15:00Z', totalAmount: 350000, status: 'PENDING',
                     shippingAddress: '789 Đường GHI, Phường C, Quận D, TP. Đà Nẵng', phoneNumber: '098xxxxxxx',
                    items: [
                        { id: 4, productId: 'P004', productName: 'Poster Idol ABC', quantity: 1, unitPrice: 350000, imageUrl: 'https://via.placeholder.com/80?text=Poster' },
                    ]
                },
                 {
                    id: 'ORD004', orderDate: '2025-04-10T11:20:00Z', totalAmount: 620000, status: 'CANCELLED',
                     shippingAddress: '111 Đường KLM, Phường E, Quận F, TP. Cần Thơ', phoneNumber: '097xxxxxxx',
                    items: [
                        { id: 5, productId: 'P005', productName: 'Special Keychain', quantity: 2, unitPrice: 310000, imageUrl: 'https://via.placeholder.com/80?text=Keychain' },
                    ]
                }
            ];
            setOrders(mockOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)));
        } catch (err) {
            setError(err.message || 'Đã xảy ra lỗi khi tải đơn hàng.');
            console.error("Fetch orders error:", err);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchOrders();
    }, [currentUser]);

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
    if (error) {}
    if (orders.length === 0 && !loading) {}


    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-slate-50 to-stone-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto"> 
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
                        <FaBoxOpen className="text-5xl text-sky-600 mx-auto mb-3" /> Đơn Hàng Của Bạn
                    </h1>
                </div>
                
                <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <select className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500">
                        <option value="">Tất cả trạng thái</option>
                        <option value="PENDING">Chờ xử lý</option>
                        <option value="SHIPPED">Đã giao</option>
                        <option value="DELIVERED">Đã nhận</option>
                        <option value="CANCELLED">Đã hủy</option>
                    </select>
                    <input type="text" placeholder="Tìm kiếm đơn hàng (theo ID, sản phẩm...)" className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 w-full sm:w-auto"/>
                </div>
               

                <div className="space-y-6">
                    {orders.map((order) => {
                        const statusStyle = getOrderStatusStyle(order.status);
                        const isExpanded = expandedOrderId === order.id;
                        return (
                            <div key={order.id} className="bg-white shadow-xl rounded-xl transition-all duration-300 ease-in-out overflow-hidden">
                                {/* Order Summary - Clickable Area */}
                                <div
                                    className="p-6 hover:bg-slate-50 cursor-pointer border-b border-gray-200"
                                    onClick={() => toggleOrderDetails(order.id)}
                                >
                                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                        <div className="flex-grow">
                                            <div className="flex items-center mb-1">
                                                <span className="text-sm font-medium text-gray-500 mr-2">Mã đơn:</span>
                                                <span className="text-lg font-semibold text-sky-700">{order.id}</span>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                Ngày đặt: {formatDate(order.orderDate)}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-start md:items-end gap-1 md:gap-2">
                                             <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusStyle.bgColor} ${statusStyle.textColor} border ${statusStyle.borderColor}`}>
                                                {statusStyle.text.toUpperCase()}
                                            </span>
                                            <p className="text-xl font-bold text-gray-800">{formatCurrency(order.totalAmount)}</p>
                                        </div>
                                        <button 
                                            aria-label={isExpanded ? "Thu gọn" : "Xem chi tiết"}
                                            className="p-2 text-gray-500 hover:text-sky-600 md:ml-4"
                                        >
                                            {isExpanded ? <FaChevronUp size={18} /> : <FaChevronDown size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Order Details - Conditional Rendering */}
                                {isExpanded && (
                                    <div className="p-6 bg-slate-50/70 border-t border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Chi tiết đơn hàng</h3>
                                        
                                        {/* Items List */}
                                        <div className="space-y-4 mb-6">
                                            {order.items.map((item) => (
                                                <div key={item.id} className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                                                    <img
                                                        src={item.imageUrl || 'https://via.placeholder.com/64?text=N/A'}
                                                        alt={item.productName}
                                                        className="w-16 h-16 object-cover rounded-md border border-gray-200"
                                                    />
                                                    <div className="flex-grow">
                                                        <Link to={`/product/${item.productId}`} className="font-semibold text-gray-800 hover:text-sky-600 transition-colors">
                                                            {item.productName}
                                                        </Link>
                                                        <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                                                        <p className="text-sm text-gray-500">Đơn giá: {formatCurrency(item.unitPrice)}</p>
                                                    </div>
                                                    <p className="text-md font-semibold text-gray-700">{formatCurrency(item.quantity * item.unitPrice)}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Shipping Info */}
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

                                        {/* Order Actions (Example) */}
                                        <div className="mt-6 flex justify-end space-x-3">
                                            {order.status?.toUpperCase() === 'PENDING' && (
                                                <button
                                                    className="px-5 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors shadow-sm"
                                                >
                                                    Hủy đơn
                                                </button>
                                            )}
                                            {(order.status?.toUpperCase() === 'DELIVERED' || order.status?.toUpperCase() === 'COMPLETED') && (
                                                <button
                                                    className="px-5 py-2 text-sm font-medium text-sky-700 bg-sky-100 hover:bg-sky-200 rounded-lg transition-colors shadow-sm"
                                                >
                                                    Mua lại
                                                </button>
                                            )}
                                             <Link 
                                                to={`/order-tracking/${order.id}`} 
                                                className="px-5 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors shadow-sm"
                                            >
                                                Theo dõi đơn hàng
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MyOrdersPage;