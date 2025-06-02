import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const API_BASE_URL = 'http://localhost:8080/api';
const LOCAL_STORAGE_CART_KEY = 'kpopclz-guest-cart';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const createGuestCartItem = (product, quantity) => ({
    productId: product.id,
    productName: product.name,
    imageUrl: product.imageUrl,
    unitPrice: product.price,
    quantity: quantity,
    stockQuantity: product.stockQuantity,
    group: product.group,
    version: product.version,
});

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({ orderId: null, items: [], totalQuantity: 0, totalAmount: 0, status: 'PENDING' });
    const [loadingCart, setLoadingCart] = useState(true);
    const [cartError, setCartError] = useState(null);
    const [addingToCart, setAddingToCart] = useState({});
    const [updatingItem, setUpdatingItem] = useState({});
    const [removingItem, setRemovingItem] = useState({});

    const { currentUser, isLoggedIn, loadingAuth } = useAuth();

    const getGuestCart = useCallback(() => {
        try {
            const storedCart = localStorage.getItem(LOCAL_STORAGE_CART_KEY);
            const parsedCart = storedCart ? JSON.parse(storedCart) : { items: [], totalQuantity: 0, totalAmount: 0 };
            return {
                orderId: null,
                items: parsedCart.items || [],
                totalQuantity: parsedCart.totalQuantity || 0,
                totalAmount: parsedCart.totalAmount || 0,
                status: 'PENDING'
            };
        } catch (e) {
            console.error("Error parsing guest cart from localStorage", e);
            return { orderId: null, items: [], totalQuantity: 0, totalAmount: 0, status: 'PENDING' };
        }
    }, []);

    const calculateCartTotals = (items) => {
        let totalQuantity = 0;
        let totalAmount = 0;
        items.forEach(item => {
            totalQuantity += item.quantity;
            totalAmount += (parseFloat(item.unitPrice) * item.quantity);
        });
        return { totalQuantity, totalAmount: parseFloat(totalAmount.toFixed(2)) };
    };

    const saveGuestCart = useCallback((currentItems) => {
        try {
            const { totalQuantity, totalAmount } = calculateCartTotals(currentItems);
            const cartToStore = { items: currentItems, totalQuantity, totalAmount };
            localStorage.setItem(LOCAL_STORAGE_CART_KEY, JSON.stringify(cartToStore));
            setCart({ orderId: null, items: currentItems, totalQuantity, totalAmount, status: 'PENDING' });
        } catch (e) {
            console.error("Error saving guest cart to localStorage", e);
        }
    }, []); 

    const updateCartStateFromServer = useCallback((dataFromServer) => {
        if (dataFromServer && typeof dataFromServer.items !== 'undefined') {
            setCart({
                orderId: dataFromServer.orderId,
                userId: dataFromServer.userId,
                items: dataFromServer.items.map(item => ({
                    orderItemId: item.orderItemId,
                    productId: item.productId,
                    productName: item.productName,
                    imageUrl: item.imageUrl,
                    unitPrice: parseFloat(item.unitPrice),
                    quantity: item.quantity,
                    stockQuantity: item.stockQuantity,
                })),
                totalQuantity: dataFromServer.totalQuantity || 0,
                totalAmount: parseFloat(dataFromServer.totalAmount || 0),
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

    const syncGuestCartToServer = useCallback(async (userId) => {
        const guestCartData = getGuestCart(); 
        if (guestCartData.items.length === 0) {
            await fetchCartAPI(userId);
            return;
        }
        try {
            let finalServerCart = null;
            for (const guestItem of guestCartData.items) {
                const response = await axios.post(`${API_BASE_URL}/users/${userId}/cart/items`, {
                    productId: guestItem.productId,
                    quantity: guestItem.quantity,
                });
                finalServerCart = response.data;
            }
            if (finalServerCart) {
                updateCartStateFromServer(finalServerCart);
            } else {
                await fetchCartAPI(userId);
            }
            localStorage.removeItem(LOCAL_STORAGE_CART_KEY);
        } catch (error) {
            console.error("Error syncing guest cart to server:", error);
            await fetchCartAPI(userId);
        }
    }, [getGuestCart, fetchCartAPI, updateCartStateFromServer]); 

    useEffect(() => {
        if (loadingAuth) {
            return;
        }
        if (isLoggedIn && currentUser) {
            syncGuestCartToServer(currentUser.id);
        } else {
            setCart(getGuestCart());
            setLoadingCart(false);
            setCartError(null);
        }
    }, [isLoggedIn, currentUser, loadingAuth, getGuestCart, syncGuestCartToServer]); 

    
    const addToCart = useCallback(async (product, quantity = 1) => {
        console.log(product);
        if (!product || !product.id) return false;
        setAddingToCart(prev => ({ ...prev, [product.id]: true }));
        setCartError(null);
        let success = false;

        if (isLoggedIn && currentUser) {
            try {
                const response = await axios.post(`${API_BASE_URL}/users/${currentUser.id}/cart/items`, {
                    productId: product.id,
                    quantity: quantity,
                });
                updateCartStateFromServer(response.data);
                success = true;
            } catch (error) {
                console.error("Error adding to cart (user):", error);
                const errorMessage = error.response?.data?.message || "Lỗi khi thêm vào giỏ hàng.";
                alert(`Lỗi: ${errorMessage}`);
            }
        } else {
            const currentGuestItems = getGuestCart().items;
            const existingItemIndex = currentGuestItems.findIndex(item => item.productId === product.id);
            let newItems;

            if (existingItemIndex > -1) {
                newItems = currentGuestItems.map((item, index) =>
                    index === existingItemIndex
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                newItems = [...currentGuestItems, createGuestCartItem(product, quantity)];
            }
            saveGuestCart(newItems);
            success = true;
        }
        setAddingToCart(prev => ({ ...prev, [product.id]: false }));
        return success;
    }, [isLoggedIn, currentUser, getGuestCart, saveGuestCart, updateCartStateFromServer]); 

    const updateItemQuantity = useCallback(async (identifier, newQuantity) => {
        if (!identifier || newQuantity < 1) return false;
        setUpdatingItem(prev => ({ ...prev, [identifier]: true }));
        setCartError(null);
        let success = false;

        if (isLoggedIn && currentUser) {
            const orderItemId = identifier;
            try {
                const response = await axios.put(`${API_BASE_URL}/users/${currentUser.id}/cart/items/${orderItemId}`, {
                    quantity: newQuantity,
                });
                updateCartStateFromServer(response.data);
                success = true;
            } catch (error) {
                console.error("Error updating item quantity (user):", error);
                const errorMessage = error.response?.data?.message || "Lỗi cập nhật số lượng.";
                alert(`Lỗi: ${errorMessage}`);
            }
        } else {
            const productId = identifier;
            const currentGuestItems = getGuestCart().items;
            const newItems = currentGuestItems.map(item =>
                item.productId === productId ? { ...item, quantity: newQuantity } : item
            ).filter(item => item.quantity > 0); 
            saveGuestCart(newItems);
            success = true;
        }
        setUpdatingItem(prev => ({ ...prev, [identifier]: false }));
        return success;
    }, [isLoggedIn, currentUser, getGuestCart, saveGuestCart, updateCartStateFromServer]);

    const removeItemFromCart = useCallback(async (identifier) => {
        if (!identifier) return false;
        setRemovingItem(prev => ({ ...prev, [identifier]: true }));
        setCartError(null);
        let success = false;

        if (isLoggedIn && currentUser) {
            const orderItemId = identifier;
            try {
                const response = await axios.delete(`${API_BASE_URL}/users/${currentUser.id}/cart/items/${orderItemId}`);
                updateCartStateFromServer(response.data);
                success = true;
            } catch (error) {
                console.error("Error removing item from cart (user):", error);
                const errorMessage = error.response?.data?.message || "Lỗi xóa sản phẩm.";
                alert(`Lỗi: ${errorMessage}`);
            }
        } else {
            const productId = identifier;
            const currentGuestItems = getGuestCart().items;
            const newItems = currentGuestItems.filter(item => item.productId !== productId);
            saveGuestCart(newItems);
            success = true;
        }
        setRemovingItem(prev => ({ ...prev, [identifier]: false }));
        return success;
    }, [isLoggedIn, currentUser, getGuestCart, saveGuestCart, updateCartStateFromServer]);

    const exposedFetchCart = useCallback(() => {
        if (loadingAuth) return; 
        if (isLoggedIn && currentUser) {
            fetchCartAPI(currentUser.id);
        } else if (!isLoggedIn) {
            setCart(getGuestCart()); 
            setLoadingCart(false);
        }
    }, [isLoggedIn, currentUser, loadingAuth, fetchCartAPI, getGuestCart]);


    const cartItemCount = cart?.totalQuantity || 0;

    const contextValue = { 
        cart,
        cartItemCount,
        addToCart,
        fetchCart: exposedFetchCart, 
        loadingCart,
        cartError,
        addingToCart,
        updateItemQuantity,
        removeItemFromCart,
        updatingItem,
        removingItem
    };

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};