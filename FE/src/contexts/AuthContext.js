import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api'; 

const AuthContext = createContext(null);

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true); 
    useEffect(() => {
        const storedUser = localStorage.getItem('kpopclz-user');
        const token = localStorage.getItem('kpopclz-token');
        if (storedUser && token) {
            try {
                setCurrentUser(JSON.parse(storedUser));
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            } catch (e) {
                console.error("Failed to parse stored user", e);
                localStorage.removeItem('kpopclz-user');
                localStorage.removeItem('kpopclz-token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, {
                email,
                password,
            });
            if (response.data && response.data.user && response.data.token) {
                setCurrentUser(response.data.user);
                localStorage.setItem('kpopclz-user', JSON.stringify(response.data.user));
                localStorage.setItem('kpopclz-token', response.data.token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                return response.data.user; 
            } else {
                throw new Error(response.data.message || 'Invalid response from server');
            }
        } catch (error) {
            console.error('Login failed:', error.response?.data?.message || error.message);
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
            if (response.data && response.data.message === 'User registered successfully') {
                return response.data; 
            } else {
                throw new Error(response.data.message || 'Invalid response from server');
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
    };

    const value = {
        currentUser,
        isLoggedIn: !!currentUser,
        login,
        register,
        logout,
        loadingAuth: loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children} 
        </AuthContext.Provider>
    );
};