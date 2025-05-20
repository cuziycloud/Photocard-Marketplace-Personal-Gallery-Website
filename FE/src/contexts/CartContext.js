import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';
const MOCK_USER_ID = 2; 

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null); 
    const [loadingCart, setLoadingCart] = useState(false);
    const [cartError, setCartError] = useState(null);
    const [addingToCart, setAddingToCart] = useState({}); 

    const fetchCart = useCallback(async () => {
        if (!MOCK_USER_ID) return;
        setLoadingCart(true);
        setCartError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/users/${MOCK_USER_ID}/cart`);
            if (response.data && response.data.items) {
                setCart({
                    orderId: response.data.orderId,
                    items: response.data.items,
                    totalQuantity: response.data.totalQuantity || 0,
                    totalAmount: response.data.totalAmount || 0,
                });
            } else {
                setCart({ orderId: null, items: [], totalQuantity: 0, totalAmount: 0 });
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setCart({ orderId: null, items: [], totalQuantity: 0, totalAmount: 0 });
            } else {
                console.error("Error fetching cart:", error);
                setCartError("Không thể tải giỏ hàng.");
                setCart({ orderId: null, items: [], totalQuantity: 0, totalAmount: 0 }); 
            }
        } finally {
            setLoadingCart(false);
        }
    }, []);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const addToCart = async (product, quantity = 1) => {
        if (!MOCK_USER_ID || !product || !product.id) {
            setCartError("Thông tin sản phẩm không hợp lệ hoặc người dùng chưa đăng nhập.");
            return false;
        }
        if (product.stockQuantity < quantity) {
            alert("Sản phẩm không đủ số lượng trong kho.");
            return false;
        }

        setAddingToCart(prev => ({ ...prev, [product.id]: true }));
        setCartError(null);
        try {
            const response = await axios.post(`${API_BASE_URL}/users/${MOCK_USER_ID}/cart/items`, {
                productId: product.id,
                quantity: quantity,
            });
            if (response.data && response.data.items) {
                 setCart({
                    orderId: response.data.orderId,
                    items: response.data.items,
                    totalQuantity: response.data.totalQuantity || 0,
                    totalAmount: response.data.totalAmount || 0,
                });
            } else {
                await fetchCart();
            }
            return true; 
        } catch (error) {
            console.error("Error adding to cart:", error);
            const errorMessage = error.response?.data?.message || "Không thể thêm sản phẩm vào giỏ hàng.";
            setCartError(errorMessage);
            alert(`Lỗi: ${errorMessage}`);
            return false; 
        } finally {
            setAddingToCart(prev => ({ ...prev, [product.id]: false }));
        }
    };

    const cartItemCount = cart ? cart.totalQuantity : 0;

    return (
        <CartContext.Provider value={{ cart, cartItemCount, addToCart, fetchCart, loadingCart, cartError, addingToCart }}>
            {children}
        </CartContext.Provider>
    );
};