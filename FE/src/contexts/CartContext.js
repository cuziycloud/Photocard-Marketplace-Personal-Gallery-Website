import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';
const MOCK_USER_ID = 2;

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const [loadingCart, setLoadingCart] = useState(true); 
    const [cartError, setCartError] = useState(null);
    const [addingToCart, setAddingToCart] = useState({});
    const [updatingItem, setUpdatingItem] = useState({});
    const [removingItem, setRemovingItem] = useState({});

    // Hàm helper để cập nhật state cart từ dữ liệu server
    const updateCartStateFromServer = (dataFromServer) => {
        if (dataFromServer && typeof dataFromServer.items !== 'undefined') { // Kiểm tra items để chắc chắn là cấu trúc cart
            setCart({
                orderId: dataFromServer.orderId,
                items: dataFromServer.items, // Backend nên đảm bảo items được sắp xếp (ví dụ theo orderItemId)
                totalQuantity: dataFromServer.totalQuantity || 0,
                totalAmount: dataFromServer.totalAmount || 0,
                status: dataFromServer.status || 'PENDING' // Lấy status nếu có, hoặc mặc định
            });
        } else {
            // Nếu dữ liệu không đúng cấu trúc, có thể là lỗi hoặc backend không trả về như mong đợi
            console.warn("Received unexpected cart data structure from server. Refetching cart.");
            fetchCart(); // Gọi lại fetchCart như một fallback an toàn
        }
    };


    const fetchCart = useCallback(async () => {
        if (!MOCK_USER_ID) {
            setLoadingCart(false); // Không có user ID, không fetch
            setCart({ orderId: null, items: [], totalQuantity: 0, totalAmount: 0, status: 'PENDING' });
            return;
        }
        if (!cart) setLoadingCart(true); 
        setCartError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/users/${MOCK_USER_ID}/cart`);
            updateCartStateFromServer(response.data);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setCart({ orderId: null, items: [], totalQuantity: 0, totalAmount: 0, status: 'PENDING' });
            } else {
                console.error("Error fetching cart:", error);
                setCartError("Không thể tải giỏ hàng. Vui lòng thử lại.");
                if (!cart) setCart({ orderId: null, items: [], totalQuantity: 0, totalAmount: 0, status: 'PENDING' });
            }
        } finally {
            setLoadingCart(false);
        }
    }, [MOCK_USER_ID, cart]);

    useEffect(() => {
        if (MOCK_USER_ID) {
            fetchCart();
        }
    }, [MOCK_USER_ID]);


    const addToCart = async (product, quantity = 1) => {
        if (!MOCK_USER_ID || !product || !product.id) {
            setCartError("Thông tin không hợp lệ."); 
            return false;
        }
        if (product.stockQuantity < quantity) {
            alert(`Sản phẩm "${product.name}" không đủ số lượng trong kho (còn ${product.stockQuantity}).`);
            return false;
        }

        setAddingToCart(prev => ({ ...prev, [product.id]: true }));
        setCartError(null);
        try {
            const response = await axios.post(`${API_BASE_URL}/users/${MOCK_USER_ID}/cart/items`, {
                productId: product.id,
                quantity: quantity,
            });
            updateCartStateFromServer(response.data);
            return true;
        } catch (error) {
            console.error("Error adding to cart:", error);
            const errorMessage = error.response?.data?.message || "Lỗi khi thêm vào giỏ hàng.";
            alert(`Lỗi: ${errorMessage}`);
            return false;
        } finally {
            setAddingToCart(prev => ({ ...prev, [product.id]: false }));
        }
    };

    const updateItemQuantity = async (orderItemId, newQuantity) => {
        if (!MOCK_USER_ID || !orderItemId || newQuantity < 1) {
            alert("Dữ liệu không hợp lệ.");
            return false;
        }
        setUpdatingItem(prev => ({ ...prev, [orderItemId]: true }));
        setCartError(null);
        try {
            const response = await axios.put(`${API_BASE_URL}/users/${MOCK_USER_ID}/cart/items/${orderItemId}`, {
                quantity: newQuantity,
            });
            updateCartStateFromServer(response.data); 
            return true;
        } catch (error) {
            console.error("Error updating item quantity:", error);
            const errorMessage = error.response?.data?.message || "Lỗi cập nhật số lượng.";
            alert(`Lỗi: ${errorMessage}`);
            return false;
        } finally {
            setUpdatingItem(prev => ({ ...prev, [orderItemId]: false }));
        }
    };

    const removeItemFromCart = async (orderItemId) => {
        if (!MOCK_USER_ID || !orderItemId) {
            alert("Dữ liệu không hợp lệ.");
            return false;
        }
        setRemovingItem(prev => ({ ...prev, [orderItemId]: true }));
        setCartError(null);
        try {
            const response = await axios.delete(`${API_BASE_URL}/users/${MOCK_USER_ID}/cart/items/${orderItemId}`);
            updateCartStateFromServer(response.data);
            return true;
        } catch (error) {
            console.error("Error removing item from cart:", error);
            const errorMessage = error.response?.data?.message || "Lỗi xóa sản phẩm.";
            alert(`Lỗi: ${errorMessage}`);
            return false;
        } finally {
            setRemovingItem(prev => ({ ...prev, [orderItemId]: false }));
        }
    };

    //const cartItemCount = cart ? cart.totalQuantity : 0;
    const cartItemCount = cart && cart.items ? cart.items.length : 0;

    return (
        <CartContext.Provider value={{
            cart, cartItemCount, addToCart, fetchCart, loadingCart, cartError,
            addingToCart, updateItemQuantity, removeItemFromCart, updatingItem, removingItem
        }}>
            {children}
        </CartContext.Provider>
    );
};