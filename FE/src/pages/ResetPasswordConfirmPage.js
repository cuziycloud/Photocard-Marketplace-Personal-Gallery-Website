import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

const ResetPasswordConfirmPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Token đặt lại mật khẩu không hợp lệ hoặc bị thiếu. Vui lòng yêu cầu lại.');
        }
    }, [token]);

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!newPassword || !confirmPassword) {
            setError('Vui lòng nhập mật khẩu mới và xác nhận mật khẩu.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Mật khẩu mới và mật khẩu xác nhận không khớp.');
            return;
        }
        if (newPassword.length < 6) { 
            setError('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }
        if (!token) {
             setError('Token không hợp lệ. Vui lòng thử yêu cầu lại link reset.');
             return;
        }


        setLoading(true);
        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, newPassword }),
            });

            const responseText = await response.text();

            if (response.ok) {
                setSuccessMessage(responseText || 'Mật khẩu của bạn đã được đặt lại thành công!');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(responseText || 'Không thể đặt lại mật khẩu. Token có thể đã hết hạn hoặc không hợp lệ.');
            }
        } catch (err) {
            console.error("Lỗi đặt lại mật khẩu:", err);
            setError(err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const commonInputClass = "w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:border-blue-500 focus:bg-white focus:outline-none";
    const commonButtonClass = "w-full block bg-indigo-600 hover:bg-indigo-500 focus:bg-indigo-500 text-white font-semibold rounded-lg px-4 py-3 transition-colors duration-300";


    if (!token && !error) { 
         return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-12 px-4">
                <p className="text-red-500">Đường dẫn không hợp lệ. Thiếu token đặt lại mật khẩu.</p>
                <Link to="/forgot-password" className="mt-4 text-indigo-600 hover:text-indigo-500">Yêu cầu link mới</Link>
            </div>
        );
    }


    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-xl shadow-2xl">
                <div>
                     <Link to="/" className="flex justify-center">
                        <img className="mx-auto h-16 w-auto" src="/assets/img/bite.png" alt="K-Clz Logo"/>
                    </Link>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Đặt Lại Mật Khẩu Của Bạn
                    </h2>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                {successMessage && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{successMessage}</span>
                        <p className="mt-2">Bạn sẽ được chuyển đến trang đăng nhập sau vài giây...</p>
                    </div>
                )}

                {!successMessage && (
                    <form className="mt-6 space-y-6" onSubmit={handleResetSubmit}>
                        <div>
                            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
                            <input
                                id="new-password"
                                name="newPassword"
                                type="password"
                                required
                                className={commonInputClass}
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
                            <input
                                id="confirm-password"
                                name="confirmPassword"
                                type="password"
                                required
                                className={commonInputClass}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <button type="submit" className={commonButtonClass} disabled={loading || !token}>
                                {loading ? 'Đang xử lý...' : 'Đặt Lại Mật Khẩu'}
                            </button>
                        </div>
                    </form>
                )}
                 <p className="mt-6 text-center text-sm text-gray-600">
                    Quay lại {' '}
                    <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ResetPasswordConfirmPage;