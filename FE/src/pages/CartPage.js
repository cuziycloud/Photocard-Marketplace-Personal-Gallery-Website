import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';

const initialCartItems = [
    {
        id: 1,
        name: 'IVE EMPATHY Sony Music',
        price: 12.50,
        quantity: 2,
        image: 'https://ndc.infludeo.com/media/photocard_blur/2025/02/18/f8dc1e8a4efb4a11946b92fbf0dc4bf4.jpg?f=auto&q=75&w=640',
        group: 'IVE'
    },
    {
        id: 2,
        name: 'MY WORLD Barnes and Noble',
        price: 328.25,
        quantity: 1,
        image: 'https://ndc.infludeo.com/media/photocard_blur/2023/07/04/fe86025b9c8f4b70989d46b60df750c9.jpg?f=auto&q=75&w=640',
        group: 'Aespa'
    },
    {
        id: 3, 
        name: 'The Album Ktown4U',
        price: 33.15,
        quantity: 1,
        image: 'https://ndc.infludeo.com/media/photocard_blur/2023/07/25/0fd26a85a1064352ad4087c1332e85e3.jpg?f=auto&q=75&w=640',
        group: 'BLACKPINK'
    }
];

const CartPage = () => {
    const [cartItems, setCartItems] = useState(initialCartItems);

    const handleQuantityChange = (itemId, newQuantity) => {
        if (newQuantity < 1) return; 
        setCartItems(
            cartItems.map(item =>
                item.id === itemId ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    const handleRemoveItem = (itemId) => {
        setCartItems(cartItems.filter(item => item.id !== itemId));
    };

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = cartItems.length > 0 ? 5.00 : 0; 
    const total = subtotal + shippingFee;

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center" style={{ paddingTop: '100px' }}>
                <h1 className="text-3xl font-semibold mb-6 text-gray-800">Giỏ hàng của bạn</h1>
                <p className="text-xl text-gray-600 mb-8">Giỏ hàng của bạn hiện đang trống.</p>
                <Link
                    to="/products" 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-md transition-colors duration-300"
                >
                    Tiếp tục mua sắm
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12" style={{ paddingTop: '100px' }}> 
            <h1 className="text-3xl font-semibold mb-8 text-gray-800">Giỏ hàng của bạn</h1>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Cart Items List */}
                <div className="lg:w-2/3">
                    <div className="space-y-6">
                        {cartItems.map(item => (
                            <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border border-gray-200 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow">
                                <div className="flex items-center mb-4 sm:mb-0">
                                    <img
                                        src={item.image || 'https://via.placeholder.com/100'}
                                        alt={item.name}
                                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-md mr-4 sm:mr-6"
                                    />
                                    <div>
                                        <h2 className="text-lg font-medium text-gray-900">{item.name}</h2>
                                        <p className="text-sm text-gray-500">{item.group}</p>
                                        <p className="text-sm text-indigo-600 font-semibold">${item.price.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row items-center sm:space-x-4 w-full sm:w-auto">
                                    <div className="flex items-center my-2 sm:my-0">
                                        <button
                                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                            className="px-3 py-1 border border-gray-300 rounded-l-md text-gray-700 hover:bg-gray-100"
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            readOnly 
                                            className="w-12 text-center border-t border-b border-gray-300 py-1 text-gray-700"
                                        />
                                        <button
                                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                            className="px-3 py-1 border border-gray-300 rounded-r-md text-gray-700 hover:bg-gray-100"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <p className="text-md font-semibold text-gray-800 sm:w-24 text-center sm:text-right my-2 sm:my-0">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </p>
                                    <button
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-full hover:bg-red-100"
                                        aria-label="Remove item"
                                    >
                                        <FaTrash className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:w-1/3">
                    <div className="bg-gray-50 p-6 rounded-lg shadow-sm sticky top-28">
                        <h2 className="text-xl font-semibold mb-6 text-gray-800">Tóm tắt đơn hàng</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between text-gray-600">
                                <span>Tạm tính</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Phí vận chuyển</span>
                                <span>${shippingFee.toFixed(2)}</span>
                            </div>
                            <hr className="my-3 border-gray-300" />
                            <div className="flex justify-between text-xl font-bold text-gray-900">
                                <span>Tổng cộng</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>
                        <button
                            className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-md transition-colors duration-300 text-lg"
                        >
                            Tiến hành thanh toán
                        </button>
                        <Link
                            to="/products" 
                            className="mt-4 block text-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                        >
                            Tiếp tục mua sắm
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;