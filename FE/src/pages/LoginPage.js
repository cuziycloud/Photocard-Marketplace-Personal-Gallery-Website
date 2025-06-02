import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
    const [activeTab, setActiveTab] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login, register } = useAuth();

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Failed to login. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match!');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await register(username, email, password);
            alert('Registration successful! Please login.');
            setActiveTab('login');
            setUsername('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.message || 'Failed to register. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const commonInputClass = "w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:border-blue-500 focus:bg-white focus:outline-none";
    const commonButtonClass = "w-full block bg-indigo-600 hover:bg-indigo-500 focus:bg-indigo-500 text-white font-semibold rounded-lg px-4 py-3 transition-colors duration-300";

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full space-y-6 bg-white p-8 sm:p-10 rounded-xl shadow-2xl">
                <div>
                    <Link to="/" className="flex justify-center">
                        <img
                            className="mx-auto h-16 w-auto"
                            src="/assets/img/bite.png" 
                            alt="K-Clz Logo"
                        />
                    </Link>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {activeTab === 'login' ? 'Sign in to your account' : 'Create a new account'}
                    </h2>
                </div>

                <div className="flex border-b border-gray-300">
                    <button
                        onClick={() => { setActiveTab('login'); setError(''); setEmail(''); setPassword(''); }}
                        className={`flex-1 py-3 text-sm font-medium text-center focus:outline-none transition-colors duration-300
                            ${activeTab === 'login'
                                ? 'border-b-2 border-indigo-600 text-indigo-600'
                                : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => { setActiveTab('register'); setError(''); setEmail(''); setPassword(''); setUsername(''); setConfirmPassword(''); }}
                        className={`flex-1 py-3 text-sm font-medium text-center focus:outline-none transition-colors duration-300
                            ${activeTab === 'register'
                                ? 'border-b-2 border-indigo-600 text-indigo-600'
                                : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Register
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {activeTab === 'login' ? (
                    <form className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 md:gap-x-6" onSubmit={handleLoginSubmit}>
                        <div className="md:col-span-1">
                            <label htmlFor="login-email" className="block text-sm font-medium text-gray-700">Email address</label>
                            <input
                                id="login-email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className={commonInputClass}
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="md:col-span-1">
                            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                id="login-password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className={commonInputClass}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center justify-end text-sm md:col-span-2">
                            <Link to="/reset-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Forgot your password?
                            </Link>
                        </div>

                        <div className="md:col-span-2">
                            <button type="submit" className={commonButtonClass} disabled={loading}>
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-y-8 md:gap-x-6" onSubmit={handleRegisterSubmit}>
                        <div className="md:col-span-1">
                            <label htmlFor="register-username" className="block text-sm font-medium text-gray-700">Username</label>
                            <input
                                id="register-username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                className={commonInputClass}
                                placeholder="Your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <div className="md:col-span-1">
                            <label htmlFor="register-email" className="block text-sm font-medium text-gray-700">Email address</label>
                            <input
                                id="register-email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className={commonInputClass}
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="md:col-span-1">
                            <label htmlFor="register-password" className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                id="register-password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className={commonInputClass}
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="md:col-span-1">
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                            <input
                                id="confirm-password"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                className={commonInputClass}
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <button type="submit" className={commonButtonClass} disabled={loading}>
                                {loading ? 'Creating account...' : 'Create Account'}
                            </button>
                        </div>
                    </form>
                )}
                <p className="mt-6 text-center text-sm text-gray-600">
                    {activeTab === 'login' ? "Don't have an account?" : "Already have an account?"}
                    <button
                        onClick={() => {
                            setActiveTab(activeTab === 'login' ? 'register' : 'login');
                            setError('');
                            setEmail(''); setPassword(''); setUsername(''); setConfirmPassword('');
                        }}
                        className="font-medium text-indigo-600 hover:text-indigo-500 ml-1 focus:outline-none"
                    >
                        {activeTab === 'login' ? 'Sign up' : 'Sign in'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;