import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true); 

    const setUserAndStorage = (userData, token) => {
        console.log("Setting user data in AuthProvider:", userData); 
        setCurrentUser(userData);
        localStorage.setItem('kpopclz-user', JSON.stringify(userData));
        if (token) {
            localStorage.setItem('kpopclz-token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    };

    const fetchCurrentUser = async () => {
        const token = localStorage.getItem('kpopclz-token');
        if (!token) {
            return null;
        }
        try {
            const response = await axios.get(`${API_BASE_URL}/users/me`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            if (response.data) {
                setUserAndStorage(response.data, token); 
                console.log("AuthProvider: Current user refreshed from API (/users/me).");
                return response.data;
            }
        } catch (error) {
            console.error("AuthProvider: Failed to fetch current user from /users/me, logging out.", error.response?.data || error.message);
            logout(); 
        }
        return null;
    };


    useEffect(() => {
        console.log("AuthProvider useEffect: Checking stored user and token...");
        const token = localStorage.getItem('kpopclz-token');

        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchCurrentUser().finally(() => setLoadingAuth(false));
        } else {
            console.log("AuthProvider: No token found in localStorage.");
            setLoadingAuth(false);
        }
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, {
                email,
                password,
            });
            if (response.data && response.data.user && response.data.token) {
                const userDataFromApi = response.data.user;
                const token = response.data.token;

                console.log("User data from LOGIN API in AuthProvider:", userDataFromApi);

                setUserAndStorage(userDataFromApi, token);
                console.log("AuthProvider: Login successful, user and token set.");
                return userDataFromApi;
            } else {
                throw new Error(response.data?.message || 'Invalid response from server during login');
            }
        } catch (error) {
            console.error('Login failed:', error.response?.data?.message || error.message);
            logout();
            throw new Error(error.response?.data?.message || 'Login failed. Please check your credentials.');
        }
    };

    const register = async (formData) => { 
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/register`, formData, {
            });

            if (response.data && response.data.message) {
                console.log("AuthProvider: Registration successful.", response.data);
                return response.data; 
            } else {
                throw new Error(response.data?.message || 'Invalid response from server during registration');
            }
        } catch (error) {
            console.error('Registration failed in AuthContext:', error.response?.data?.message || error.message);
            throw new Error(error.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    const logout = () => { 
        setCurrentUser(null);
        localStorage.removeItem('kpopclz-user');
        localStorage.removeItem('kpopclz-token');
        delete axios.defaults.headers.common['Authorization'];
        console.log("AuthProvider: User logged out.");
    };

    const getToken = () => {
        return localStorage.getItem('kpopclz-token');
    };

    const refreshCurrentUser = async () => {
        console.log("AuthProvider: Attempting to refresh current user...");
        setLoadingAuth(true); 
        await fetchCurrentUser();
        setLoadingAuth(false);
    };

    const value = {
        currentUser,
        isLoggedIn: !!currentUser,
        login,
        register,
        logout,
        getToken, 
        loadingAuth,
        refreshCurrentUser 
    };

    return (
        <AuthContext.Provider value={value}>
            {!loadingAuth && children}
        </AuthContext.Provider>
    );
};