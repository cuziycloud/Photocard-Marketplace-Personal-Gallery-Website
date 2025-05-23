import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const API_BASE_URL = 'http://localhost:8080/api';
const LOCAL_STORAGE_WISHLIST_KEY = 'kpopclz-guest-wishlist';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState([]); 
    const [loadingWishlist, setLoadingWishlist] = useState(true);
    const [wishlistError, setWishlistError] = useState(null);
    const [togglingWishlist, setTogglingWishlist] = useState({});

    const { currentUser, isLoggedIn, loadingAuth } = useAuth();

    const getGuestWishlist = useCallback(() => {
        try {
            const storedWishlist = localStorage.getItem(LOCAL_STORAGE_WISHLIST_KEY);
            return storedWishlist ? JSON.parse(storedWishlist) : [];
        } catch (e) {
            console.error("Error parsing guest wishlist from localStorage", e);
            return [];
        }
    }, []);

    const saveGuestWishlist = useCallback((items) => {
        try {
            localStorage.setItem(LOCAL_STORAGE_WISHLIST_KEY, JSON.stringify(items));
        } catch (e) {
            console.error("Error saving guest wishlist to localStorage", e);
        }
    }, []);

    const fetchWishlist = useCallback(async () => {
        if (loadingAuth) return;
        setLoadingWishlist(true);
        setWishlistError(null);

        if (isLoggedIn && currentUser) {
            try {
                const response = await axios.get(`${API_BASE_URL}/users/${currentUser.id}/wishlist`);
                setWishlistItems(response.data || []); 
            } catch (error) {
                console.error("Error fetching user wishlist:", error);
                setWishlistError("Không thể tải danh sách yêu thích.");
                setWishlistItems([]);
            }
        } else {
            setWishlistItems(getGuestWishlist());
        }
        setLoadingWishlist(false);
    }, [isLoggedIn, currentUser, loadingAuth, getGuestWishlist]);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    const addProductToWishlist = async (product) => {
        if (!product || !product.id) return false;

        setTogglingWishlist(prev => ({ ...prev, [product.id]: true }));
        let success = false;

        if (isLoggedIn && currentUser) {
            try {
                await axios.post(`${API_BASE_URL}/users/${currentUser.id}/wishlist/${product.id}`);
                setWishlistItems(prevItems => {
                    if (prevItems.find(item => item.id === product.id)) return prevItems;
                    return [product, ...prevItems];
                });
                success = true;
            } catch (error) {
                console.error("Error adding to user wishlist:", error);
                setWishlistError(error.response?.data?.message || "Lỗi khi thêm vào yêu thích.");
            }
        } else {
            setWishlistItems(prevItems => {
                if (prevItems.find(item => item.id === product.id)) return prevItems;
                const newWishlist = [product, ...prevItems];
                saveGuestWishlist(newWishlist);
                return newWishlist;
            });
            success = true;
        }
        setTogglingWishlist(prev => ({ ...prev, [product.id]: false }));
        return success;
    };

    const removeProductFromWishlist = async (productId) => {
        if (!productId) return false;
        setTogglingWishlist(prev => ({ ...prev, [productId]: true }));
        let success = false;

        if (isLoggedIn && currentUser) {
            try {
                await axios.delete(`${API_BASE_URL}/users/${currentUser.id}/wishlist/${productId}`);
                setWishlistItems(prevItems => prevItems.filter(item => item.id !== productId));
                success = true;
            } catch (error) {
                console.error("Error removing from user wishlist:", error);
                setWishlistError(error.response?.data?.message || "Lỗi khi xóa khỏi yêu thích.");
            }
        } else {
            setWishlistItems(prevItems => {
                const newWishlist = prevItems.filter(item => item.id !== productId);
                saveGuestWishlist(newWishlist);
                return newWishlist;
            });
            success = true;
        }
        setTogglingWishlist(prev => ({ ...prev, [productId]: false }));
        return success;
    };

    const isProductInWishlist = (productId) => {
        return wishlistItems.some(item => item.id === productId);
    };

    // đồng bộ wishlist từ localStorage lên server khi đăng nhập
    const syncGuestWishlistToServer = useCallback(async () => {
        if (!isLoggedIn || !currentUser) return;

        const guestItems = getGuestWishlist();
        if (guestItems.length === 0) return;

        try {
            const serverWishlistResponse = await axios.get(`${API_BASE_URL}/users/${currentUser.id}/wishlist`);
            const serverItems = serverWishlistResponse.data || [];
            const serverItemIds = new Set(serverItems.map(item => item.id));

            const itemsToSync = guestItems.filter(guestItem => !serverItemIds.has(guestItem.id));

            if (itemsToSync.length > 0) {
                for (const item of itemsToSync) {
                    await axios.post(`${API_BASE_URL}/users/${currentUser.id}/wishlist/${item.id}`);
                }
                fetchWishlist();
            }
            localStorage.removeItem(LOCAL_STORAGE_WISHLIST_KEY);

        } catch (error) {
            console.error("Error syncing guest wishlist to server:", error);
        }
    }, [isLoggedIn, currentUser, getGuestWishlist, fetchWishlist]);

    useEffect(() => {
        if (isLoggedIn && !loadingAuth) { 
            syncGuestWishlistToServer();
        }
    }, [isLoggedIn, loadingAuth, syncGuestWishlistToServer]);


    const value = {
        wishlistItems,
        loadingWishlist,
        wishlistError,
        addProductToWishlist,
        removeProductFromWishlist,
        isProductInWishlist,
        togglingWishlist,
        fetchWishlist
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};

// C1: timestamp xóa wishlist
// const getGuestWishlist = useCallback(() => {
//     try {
//         const storedData = localStorage.getItem(LOCAL_STORAGE_WISHLIST_KEY);
//         if (!storedData) return [];

//         const { items, timestamp } = JSON.parse(storedData);
//         const EXPIRATION_TIME_MS = 7 * 24 * 60 * 60 * 1000; // 7 ngày

//         if (timestamp && (Date.now() - timestamp > EXPIRATION_TIME_MS)) {
//             localStorage.removeItem(LOCAL_STORAGE_WISHLIST_KEY); 
//             return [];
//         }
//         return items || [];
//     } catch (e) {
//         console.error("Error parsing guest wishlist from localStorage", e);
//         localStorage.removeItem(LOCAL_STORAGE_WISHLIST_KEY); // Xóa nếu lỗi parse
//         return [];
//     }
// }, []);

// const saveGuestWishlist = useCallback((items) => {
//     try {
//         const dataToStore = {
//             items: items,
//             timestamp: Date.now() // Lưu timestamp khi ghi
//         };
//         localStorage.setItem(LOCAL_STORAGE_WISHLIST_KEY, JSON.stringify(dataToStore));
//     } catch (e) {
//         console.error("Error saving guest wishlist to localStorage", e);
//     }
// }, []);


// C2: Sử dụng sessionStorage thay vì localStorage:
// Dữ liệu trong sessionStorage sẽ tự động bị xóa khi người dùng đóng tab hoặc đóng trình duyệt. 
// Điều này có thể phù hợp nếu bạn muốn wishlist tạm thời chỉ tồn tại trong một phiên duyệt web.
// Chỉ cần thay thế localStorage bằng sessionStorage trong WishlistContext.js.