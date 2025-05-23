import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const API_BASE_URL = 'http://localhost:8080/api';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const [loadingCart, setLoadingCart] = useState(true);
    const [cartError, setCartError] = useState(null);
    const [addingToCart, setAddingToCart] = useState({});
    const [updatingItem, setUpdatingItem] = useState({});
    const [removingItem, setRemovingItem] = useState({});

    const { currentUser, isLoggedIn, loadingAuth } = useAuth();

    const updateCartStateFromServer = useCallback((dataFromServer) => {
        if (dataFromServer && typeof dataFromServer.items !== 'undefined') {
            setCart({
                orderId: dataFromServer.orderId,
                items: dataFromServer.items,
                totalQuantity: dataFromServer.totalQuantity || 0,
                totalAmount: dataFromServer.totalAmount || 0,
                status: dataFromServer.status || 'PENDING'
            });
        } else if (dataFromServer === null || (dataFromServer && Object.keys(dataFromServer).length === 0)) {
            setCart({ orderId: null, items: [], totalQuantity: 0, totalAmount: 0, status: 'PENDING' });
        }
    }, []); 

    const fetchCartAPI = useCallback(async (userId) => {
        setLoadingCart(true);
        setCartError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/users/${userId}/cart`);
            updateCartStateFromServer(response.data);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                updateCartStateFromServer(null); 
            } else {
                console.error("CartContext: Error fetching cart:", error);
                setCartError("Không thể tải giỏ hàng. Vui lòng thử lại.");
            }
        } finally {
            setLoadingCart(false);
        }
    }, [updateCartStateFromServer]); 

    useEffect(() => {
        if (loadingAuth) {
            return; 
        }

        if (isLoggedIn && currentUser) {
            fetchCartAPI(currentUser.id);
        } else {
            setCart({ orderId: null, items: [], totalQuantity: 0, totalAmount: 0, status: 'PENDING' });
            setLoadingCart(false); 
            setCartError(null);
        }
    }, [isLoggedIn, currentUser, loadingAuth, fetchCartAPI]); 
    const addToCart = async (product, quantity = 1) => {
        if (!isLoggedIn || !currentUser) {
            alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
            return false;
        }
        const userId = currentUser.id;
        setAddingToCart(prev => ({ ...prev, [product.id]: true }));
        setCartError(null);
        try {
            const response = await axios.post(`${API_BASE_URL}/users/${userId}/cart/items`, {
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
         if (!isLoggedIn || !currentUser || !orderItemId || newQuantity < 1) {
            alert("Dữ liệu không hợp lệ hoặc bạn chưa đăng nhập.");
            return false;
        }
        const userId = currentUser.id;
        setUpdatingItem(prev => ({ ...prev, [orderItemId]: true }));
        setCartError(null);
        try {
            const response = await axios.put(`${API_BASE_URL}/users/${userId}/cart/items/${orderItemId}`, {
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
        if (!isLoggedIn || !currentUser || !orderItemId) {
            alert("Dữ liệu không hợp lệ hoặc bạn chưa đăng nhập.");
            return false;
        }
        const userId = currentUser.id;
        setRemovingItem(prev => ({ ...prev, [orderItemId]: true }));
        setCartError(null);
        try {
            const response = await axios.delete(`${API_BASE_URL}/users/${userId}/cart/items/${orderItemId}`);
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
    
    const cartItemCount = cart && cart.items ? cart.items.reduce((count, item) => count + item.quantity, 0) : 0;

    return (
        <CartContext.Provider value={{
            cart, cartItemCount, addToCart, 
            fetchCart: () => { 
                if (isLoggedIn && currentUser) fetchCartAPI(currentUser.id);
            }, 
            loadingCart, cartError,
            addingToCart, updateItemQuantity, removeItemFromCart, updatingItem, removingItem
        }}>
            {children}
        </CartContext.Provider>
    );
};