import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
    const [activeTab, setActiveTab] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login, register } = useAuth();
    const avatarInputRef = useRef(null);

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

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setAvatarFile(null);
            setAvatarPreview(null);
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
        const formData = new FormData();
        formData.append('username', username);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('phoneNumber', phoneNumber);
        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }
        try {
            await register(formData);
            alert('Registration successful! Please login.');
            setActiveTab('login');
            resetFormFields();
        } catch (err) {
            setError(err.message || 'Failed to register. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetFormFields = () => {
        setEmail('');
        setPassword('');
        setUsername('');
        setConfirmPassword('');
        setPhoneNumber('');
        setAvatarFile(null);
        setAvatarPreview(null);
        if (avatarInputRef.current) {
            avatarInputRef.current.value = "";
        }
        setError('');
    };

    const commonInputClass = "w-full px-4 py-3 rounded-lg bg-gray-200 mt-1 border focus:border-indigo-500 focus:bg-white focus:outline-none text-sm";
    const commonButtonClass = "w-full block bg-indigo-600 hover:bg-indigo-500 focus:bg-indigo-500 text-white font-semibold rounded-lg px-4 py-3 transition-colors duration-300 mt-6";
    const commonLabelClass = "block text-sm font-medium text-gray-700";

    const LeftColumnContent = () => (
        <div className="w-full h-full bg-indigo-600 p-8 md:p-12 text-white flex flex-col justify-center items-center rounded-l-xl lg:rounded-r-none">
            <Link to="/" className="mb-6 md:mb-8 block"> 
                <img
                    className="mx-auto h-14 w-auto md:h-16" 
                    src="/assets/img/bite.png" 
                    alt="K-Clz Logo"
                />
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 md:mb-6 text-center">
                {activeTab === 'login' ? 'Welcome Back!' : 'Join Our Community!'}
            </h1>
            <p className="text-center text-indigo-200 text-base md:text-lg leading-relaxed max-w-xs md:max-w-sm">
                {activeTab === 'login'
                    ? "Sign in to access your K-Clz account and explore the world of K-Pop."
                    : "Create an account to start your K-Clz journey. It's quick and easy!"}
            </p>
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="flex flex-col lg:flex-row w-full max-w-sm lg:max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden">
                <div className="hidden lg:flex lg:w-5/12"> 
                   <LeftColumnContent />
                </div>

                <div className="w-full lg:w-7/12 p-6 sm:p-8 md:p-10"> 
                    <div className="lg:hidden mb-6">
                        <Link to="/" className="flex justify-center">
                            <img
                                className="mx-auto h-12 w-auto"
                                src="/assets/img/bite.png"
                                alt="K-Clz Logo"
                            />
                        </Link>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
                        {activeTab === 'login' ? 'Sign In' : 'Create Account'}
                    </h2>

                    <div className="flex border-b border-gray-300 mt-3 mb-5"> 
                        <button
                            onClick={() => { setActiveTab('login'); resetFormFields(); }}
                            className={`flex-1 py-2.5 text-sm font-medium text-center focus:outline-none transition-colors duration-300
                                ${activeTab === 'login'
                                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                                    : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => { setActiveTab('register'); resetFormFields(); }}
                            className={`flex-1 py-2.5 text-sm font-medium text-center focus:outline-none transition-colors duration-300
                                ${activeTab === 'register'
                                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                                    : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Register
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2.5 rounded relative text-sm mb-4" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    {activeTab === 'login' ? (
                        <form className="space-y-5" onSubmit={handleLoginSubmit}> 
                            <div>
                                <label htmlFor="login-email" className={commonLabelClass}>Email address</label>
                                <input
                                    id="login-email" type="email" autoComplete="email" required
                                    className={commonInputClass} placeholder="you@example.com"
                                    value={email} onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="login-password" className={commonLabelClass}>Password</label>
                                <input
                                    id="login-password" type="password" autoComplete="current-password" required
                                    className={commonInputClass} placeholder="Password"
                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center justify-end text-sm pt-1"> 
                                <Link to="/reset-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                                    Forgot your password?
                                </Link>
                            </div>
                            <button type="submit" className={commonButtonClass} disabled={loading}>
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>
                    ) : (
                        <form className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4" onSubmit={handleRegisterSubmit}> {/* Adjusted gap-y */}
                            <div className="md:col-span-2">
                                <label htmlFor="register-email" className={commonLabelClass}>Email address</label>
                                <input id="register-email" type="email" autoComplete="email" required className={commonInputClass} placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div>
                                <label htmlFor="register-username" className={commonLabelClass}>Username</label>
                                <input id="register-username" type="text" autoComplete="username" required className={commonInputClass} placeholder="Your username" value={username} onChange={(e) => setUsername(e.target.value)} />
                            </div>
                            <div>
                                <label htmlFor="register-phone" className={commonLabelClass}>Phone Number</label>
                                <input id="register-phone" type="tel" autoComplete="tel" required className={commonInputClass} placeholder="Your phone number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                            </div>
                            <div>
                                <label htmlFor="register-password" className={commonLabelClass}>Password</label>
                                <input id="register-password" type="password" autoComplete="new-password" required className={commonInputClass} placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                            <div>
                                <label htmlFor="confirm-password" className={commonLabelClass}>Confirm Password</label>
                                <input id="confirm-password" type="password" autoComplete="new-password" required className={commonInputClass} placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="register-avatar" className={commonLabelClass}>Avatar (Optional)</label>
                                <input
                                    id="register-avatar" name="avatar" type="file" accept="image/*" ref={avatarInputRef}
                                    className="w-full text-sm text-gray-500 mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                    onChange={handleAvatarChange}
                                />
                                {avatarPreview && (
                                    <div className="mt-2">
                                        <img src={avatarPreview} alt="Avatar Preview" className="h-16 w-16 rounded-full object-cover" />
                                    </div>
                                )}
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
                                resetFormFields();
                            }}
                            className="font-medium text-indigo-600 hover:text-indigo-500 ml-1 focus:outline-none"
                        >
                            {activeTab === 'login' ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;