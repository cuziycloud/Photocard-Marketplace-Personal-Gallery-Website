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
    useEffect(() => {
        console.log("AuthProvider useEffect: Checking stored user and token...");
        const storedUser = localStorage.getItem('kpopclz-user');
        const token = localStorage.getItem('kpopclz-token');

        if (storedUser && token) {
            try {
                setCurrentUser(JSON.parse(storedUser));
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                console.log("AuthProvider: User and token loaded from localStorage.");
            } catch (e) {
                console.error("AuthProvider: Failed to parse stored user", e);
                localStorage.removeItem('kpopclz-user');
                localStorage.removeItem('kpopclz-token');
                delete axios.defaults.headers.common['Authorization']; 
            }
        } else {
            console.log("AuthProvider: No user or token found in localStorage.");
        }
        setLoadingAuth(false); 
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, {
                email,
                password,
            });
            if (response.data && response.data.user && response.data.token) {
                const userData = response.data.user;
                const token = response.data.token;

                setCurrentUser(userData);
                localStorage.setItem('kpopclz-user', JSON.stringify(userData));
                localStorage.setItem('kpopclz-token', token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                console.log("AuthProvider: Login successful, user and token set.");
                return userData;
            } else {
                throw new Error(response.data?.message || 'Invalid response from server during login');
            }
        } catch (error) {
            console.error('Login failed:', error.response?.data?.message || error.message);
            localStorage.removeItem('kpopclz-user');
            localStorage.removeItem('kpopclz-token');
            delete axios.defaults.headers.common['Authorization'];
            setCurrentUser(null); 
            throw new Error(error.response?.data?.message || 'Login failed. Please check your credentials.');
        }
    };

    const register = async (username, email, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/register`, {
                username,
                email,
                password,
            });
            if (response.data && response.data.message) {
                console.log("AuthProvider: Registration successful.");
                return response.data;
            } else {
                throw new Error(response.data?.message || 'Invalid response from server during registration');
            }
        } catch (error) {
            console.error('Registration failed:', error.response?.data?.message || error.message);
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

    const value = {
        currentUser,
        isLoggedIn: !!currentUser,
        login,
        register,
        logout,
        getToken, 
        loadingAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {!loadingAuth && children}
        </AuthContext.Provider>
    );
};