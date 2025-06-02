import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ResetPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleRequestResetSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!email) {
            setError('Vui lòng nhập địa chỉ email của bạn.');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Vui lòng nhập một địa chỉ email hợp lệ.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email }),
            });

            const responseText = await response.text(); 

            if (response.ok) {
                setSuccessMessage(responseText || 'Nếu tài khoản với email này tồn tại, một liên kết đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư đến (và thư mục spam).');
                setEmail(''); 
            } else {
                setError(responseText || 'Không thể yêu cầu đặt lại mật khẩu. Vui lòng thử lại.');
            }
        } catch (err) {
            console.error("Lỗi yêu cầu quên mật khẩu:", err);
            setError(err.message || 'Đã xảy ra lỗi. Vui lòng kiểm tra kết nối và thử lại.');
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
                        Forgot Your Password?
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        No worries! Enter your email address below and we'll send you a link to reset your password.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                {successMessage && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{successMessage}</span>
                    </div>
                )}

                {!successMessage && ( 
                    <form className="mt-6 space-y-6" onSubmit={handleRequestResetSubmit}>
                        <div>
                            <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700">Email address</label>
                            <input
                                id="reset-email"
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

                        <div>
                            <button type="submit" className={commonButtonClass} disabled={loading}>
                                {loading ? 'Sending Link...' : 'Send Password Reset Link'}
                            </button>
                        </div>
                    </form>
                )}

                <p className="mt-6 text-center text-sm text-gray-600">
                    Remembered your password?{' '}
                    <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ResetPasswordPage;