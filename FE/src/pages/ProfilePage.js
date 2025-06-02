import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaUserEdit, FaLock, FaImage, FaCamera } from 'react-icons/fa'; 

const ProfileInformation = ({ currentUser, onUpdateSuccess, onUpdateError }) => {
    const [username, setUsername] = useState(currentUser?.username || '');
    const [email, setEmail] = useState(currentUser?.email || '');
    const [loading, setLoading] = useState(false);
    const [fullName, setFullName] = useState(currentUser?.fullName || '');
    const [bio, setBio] = useState(currentUser?.bio || '');


    useEffect(() => {
        setUsername(currentUser?.username || '');
        setEmail(currentUser?.email || '');
        setFullName(currentUser?.fullName || '');
        setBio(currentUser?.bio || '');
    }, [currentUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        onUpdateError('');
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log("Profile updated with:", { username, email, fullName, bio });
            onUpdateSuccess('Thông tin cá nhân đã được cập nhật!');
        } catch (error) {
            onUpdateError(error.message || 'Đã xảy ra lỗi khi cập nhật.');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white text-gray-800 placeholder-gray-400";
    const readOnlyInputClass = "mt-1 block w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm sm:text-sm bg-gray-100 text-gray-500 cursor-not-allowed";


    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Tên người dùng
                </label>
                <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} className={inputClass} required />
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                </label>
                <input type="email" id="email" value={email} readOnly className={readOnlyInputClass} />
                <p className="mt-1 text-xs text-gray-500">Email không thể thay đổi.</p>
            </div>
            <div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-400 transition-colors"
                >
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
            </div>
        </form>
    );
};

const ChangePassword = ({ onUpdateSuccess, onUpdateError }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        onUpdateError('');
        if (newPassword !== confirmPassword) {
            onUpdateError('Mật khẩu mới không khớp.'); return;
        }
        if (newPassword.length < 6) {
            onUpdateError('Mật khẩu mới phải có ít nhất 6 ký tự.'); return;
        }
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log("Password change attempted");
            onUpdateSuccess('Mật khẩu đã được thay đổi thành công!');
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        } catch (error) {
            onUpdateError(error.message || 'Đã xảy ra lỗi khi đổi mật khẩu.');
        } finally {
            setLoading(false);
        }
    };
    const inputClass = "mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white text-gray-800";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu hiện tại
                </label>
                <input type="password" id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputClass} required />
            </div>
            <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu mới
                </label>
                <input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} required />
            </div>
            <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Xác nhận mật khẩu mới
                </label>
                <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} required />
            </div>
            <div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-400 transition-colors"
                >
                    {loading ? 'Đang đổi...' : 'Đổi mật khẩu'}
                </button>
            </div>
        </form>
    );
};

const AvatarUpload = ({ currentUser, onUpdateSuccess, onUpdateError }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const defaultAvatar = '/assets/img/cloudy.png'; 
    const [preview, setPreview] = useState(currentUser?.avatarUrl || defaultAvatar);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        setPreview(currentUser?.avatarUrl || defaultAvatar);
    }, [currentUser?.avatarUrl]); 

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => { setPreview(reader.result); };
            reader.readAsDataURL(file);
            onUpdateError('');
        } else {
            setSelectedFile(null);
            setPreview(currentUser?.avatarUrl || defaultAvatar);
            if (file) onUpdateError('Vui lòng chọn một file ảnh hợp lệ.');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) { onUpdateError('Vui lòng chọn ảnh để tải lên.'); return; }
        setLoading(true);
        onUpdateError('');
        const formData = new FormData();
        formData.append('avatar', selectedFile);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const newAvatarUrl = preview;
            console.log("Avatar uploaded, new URL (simulated):", newAvatarUrl);
            onUpdateSuccess('Ảnh đại diện đã được cập nhật!');
            setSelectedFile(null);
        } catch (error) {
            onUpdateError(error.message || 'Đã xảy ra lỗi khi tải ảnh lên.');
        } finally {
            setLoading(false);
        }
    };
    const triggerFileSelect = () => fileInputRef.current?.click();

    return (
        <div className="space-y-6 flex flex-col items-center">
            <div className="relative group">
                <img
                    src={preview}
                    alt="Avatar Preview"
                    className="w-40 h-40 rounded-full object-cover border-4 border-sky-500 shadow-lg group-hover:opacity-75 transition-opacity"
                />
                <button 
                    onClick={triggerFileSelect}
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-full transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
                    aria-label="Change avatar"
                >
                    <FaCamera className="text-white text-3xl" />
                </button>
            </div>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
            
            {selectedFile && (
                <div className="text-center">
                    <p className="text-sm text-gray-600">Đã chọn: {selectedFile.name}</p>
                    <p className="text-xs text-gray-500">({(selectedFile.size / 1024).toFixed(1)} KB)</p>
                </div>
            )}
            
            <button
                onClick={handleUpload}
                disabled={!selectedFile || loading}
                className="w-full max-w-xs mt-2 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-300 disabled:cursor-not-allowed transition-colors"
            >
                {loading ? 'Đang tải lên...' : 'Tải lên ảnh mới'}
            </button>
        </div>
    );
};

const ProfilePage = () => {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState('info');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const defaultAvatar = '/assets/img/cloudy.png'; 

    useEffect(() => {
    }, [currentUser]);

    const handleSuccess = (message) => {
        setSuccessMessage(message);
        setErrorMessage('');
        setTimeout(() => setSuccessMessage(''), 3500);
    };

    const handleError = (message) => {
        setErrorMessage(message);
        setSuccessMessage('');
        setTimeout(() => setErrorMessage(''), 5000);
    };

    if (!currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <p className="text-xl text-gray-600">Đang tải hồ sơ hoặc chưa xác thực...</p>
            </div>
        );
    }

    const tabButtonClass = (tabName) =>
        `px-4 py-3 font-semibold text-sm rounded-t-lg transition-all duration-200 ease-in-out focus:outline-none
        ${activeTab === tabName
            ? 'bg-white text-sky-600 border-b-2 border-sky-600 shadow-sm'
            : 'text-gray-500 hover:text-sky-600 hover:bg-gray-100'}`;
    
    const iconClass = "inline mr-2 text-base align-middle";

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-slate-50 to-stone-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white shadow-lg rounded-xl p-6 md:p-8 mb-8 text-center md:text-left md:flex md:items-center md:space-x-6">
                    <div className="relative mx-auto md:mx-0 mb-4 md:mb-0">
                        <img
                            src={currentUser.avatarUrl || defaultAvatar}
                            alt={`${currentUser.username}'s avatar`}
                            className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover ring-4 ring-sky-500 ring-offset-2 ring-offset-white"
                        />
                    </div>
                    <div className="flex-grow">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                            {currentUser.username || 'Người dùng'}
                        </h1>
                        <p className="text-md text-gray-500 mt-1">
                            {currentUser.email || 'Không có email'}
                        </p>
                    </div>
                </div>

                {/* Thông báo */}
                {successMessage && (
                    <div className="mb-6 p-4 rounded-lg bg-green-50 border-l-4 border-green-500 text-green-700 shadow">
                        <p className="font-medium">Thành công!</p>
                        {successMessage}
                    </div>
                )}
                {errorMessage && (
                    <div className="mb-6 p-4 rounded-lg bg-red-50 border-l-4 border-red-500 text-red-700 shadow">
                         <p className="font-medium">Lỗi!</p>
                        {errorMessage}
                    </div>
                )}

                {/* Tabs và Content */}
                <div className="bg-white shadow-xl rounded-xl overflow-hidden">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-1 px-4 pt-2" aria-label="Tabs">
                            <button onClick={() => setActiveTab('info')} className={tabButtonClass('info')}>
                                <FaUserEdit className={iconClass} /> Thông tin cá nhân
                            </button>
                            <button onClick={() => setActiveTab('password')} className={tabButtonClass('password')}>
                                <FaLock className={iconClass} /> Đổi mật khẩu
                            </button>
                            <button onClick={() => setActiveTab('avatar')} className={tabButtonClass('avatar')}>
                                <FaImage className={iconClass} /> Cập nhật ảnh đại diện
                            </button>
                        </nav>
                    </div>

                    <div className="p-6 md:p-8">
                        {activeTab === 'info' && (
                            <ProfileInformation
                                currentUser={currentUser}
                                onUpdateSuccess={handleSuccess}
                                onUpdateError={handleError}
                            />
                        )}
                        {activeTab === 'password' && (
                            <ChangePassword
                                onUpdateSuccess={handleSuccess}
                                onUpdateError={handleError}
                            />
                        )}
                        {activeTab === 'avatar' && (
                            <AvatarUpload
                                currentUser={currentUser}
                                onUpdateSuccess={handleSuccess}
                                onUpdateError={handleError}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;