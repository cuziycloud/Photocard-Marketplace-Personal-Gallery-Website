import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaUserEdit, FaLock, FaImage, FaCamera, FaPhone } from 'react-icons/fa';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const CheckCircleIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.06-1.06l-3.093 3.093-1.03-1.03a.75.75 0 0 0-1.06 1.061l1.56 1.56a.75.75 0 0 0 1.06 0l3.593-3.593Z" clipRule="evenodd" />
    </svg>
);

const ProfileInformation = ({ currentUser: initialCurrentUser, onUpdateSuccess, onUpdateError, refreshCurrentUserContext }) => {
    const { currentUser: contextCurrentUser, getToken } = useAuth();
    const currentUserToUse = contextCurrentUser || initialCurrentUser;

    const [username, setUsername] = useState(currentUserToUse?.username || '');
    const [email, setEmail] = useState(currentUserToUse?.email || '');
    const [phoneNumber, setPhoneNumber] = useState(currentUserToUse?.phonenumber || '');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentUserToUse) {
            setUsername(currentUserToUse.username || '');
            setEmail(currentUserToUse.email || '');
            setPhoneNumber(currentUserToUse.phonenumber || '');
        }
    }, [currentUserToUse]);

    const isValidPhoneNumber = (phone) => {
        if (!phone || phone.trim() === '') return true; 
        return /^\d{10,11}$/.test(phone.trim());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        onUpdateError('');
        const trimmedPhoneNumber = phoneNumber.trim();

        if (trimmedPhoneNumber && !isValidPhoneNumber(trimmedPhoneNumber)) {
            onUpdateError('Số điện thoại không hợp lệ. Vui lòng nhập 10 hoặc 11 chữ số, hoặc để trống.');
            return;
        }

        if (!currentUserToUse || !currentUserToUse.id) {
            onUpdateError('Không thể xác định người dùng để cập nhật. Vui lòng thử tải lại trang.');
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const updatedData = {
                username: username.trim(),
                phonenumber: trimmedPhoneNumber === '' ? null : trimmedPhoneNumber,
            };

            // console.log("ProfileInformation: Sending update data:", updatedData);
            const token = typeof getToken === 'function' ? getToken() : localStorage.getItem('kpopclz-token');

            if (!token) {
                onUpdateError('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
                setLoading(false);
                return;
            }

            const response = await axios.put(
                `${API_BASE_URL}/users/${currentUserToUse.id}/profile`,
                updatedData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            //console.log("ProfileInformation: Profile update API response:", response.data);

            if (typeof refreshCurrentUserContext === 'function') {
                await refreshCurrentUserContext();
            }

            onUpdateSuccess(response.data.message || 'Thông tin cá nhân đã được cập nhật thành công!');

        } catch (error) {
            let errorMessage = 'Đã xảy ra lỗi khi cập nhật thông tin.';
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            onUpdateError(errorMessage);
            console.error("ProfileInformation: Profile update failed:", error.response?.data || error.message || error);
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "mt-1 block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white text-gray-800 placeholder-gray-400";
    const readOnlyInputClass = "mt-1 block w-full px-3.5 py-2.5 border border-gray-200 rounded-lg shadow-sm sm:text-sm bg-gray-100 text-gray-500 cursor-not-allowed";
    const labelClass = "block text-xs font-medium text-gray-600 mb-0.5";

    return (
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            <div>
                <label htmlFor="profile-username" className={labelClass}>
                    Tên người dùng
                </label>
                <input
                    type="text"
                    id="profile-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={inputClass}
                    required
                />
            </div>
            <div>
                <label htmlFor="profile-email" className={labelClass}>
                    Email
                </label>
                <input
                    type="email"
                    id="profile-email"
                    value={email}
                    readOnly
                    className={readOnlyInputClass}
                />
                <p className="mt-1 text-xs text-gray-500">Email không thể thay đổi.</p>
            </div>
            <div>
                <label htmlFor="profile-phoneNumber" className={labelClass}>
                    Số điện thoại
                </label>
                <input
                    type="tel"
                    id="profile-phoneNumber"
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value)} 
                    className={inputClass}
                    placeholder="Nhập số điện thoại (VD: 0912345678)"
                />
            </div>
            <div className="pt-2">
                <button
                    type="submit"
                    disabled={loading || !currentUserToUse} 
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-400 transition-colors"
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
            //console.log("Password change attempted");
            onUpdateSuccess('Mật khẩu đã được thay đổi thành công!');
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        } catch (error) {
            onUpdateError(error.message || 'Đã xảy ra lỗi khi đổi mật khẩu.');
        } finally {
            setLoading(false);
        }
    };
    const inputClass = "mt-1 block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white text-gray-800";
    const labelClass = "block text-xs font-medium text-gray-600 mb-0.5";

    return (
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            <div>
                <label htmlFor="currentPassword" className={labelClass}>
                    Mật khẩu hiện tại
                </label>
                <input type="password" id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputClass} required />
            </div>
            <div>
                <label htmlFor="newPassword" className={labelClass}>
                    Mật khẩu mới
                </label>
                <input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} required />
            </div>
            <div>
                <label htmlFor="confirmPassword" className={labelClass}>
                    Xác nhận mật khẩu mới
                </label>
                <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} required />
            </div>
            <div className="pt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-400 transition-colors"
                >
                    {loading ? 'Đang đổi...' : 'Đổi mật khẩu'}
                </button>
            </div>
        </form>
    );
};

const AvatarUpload = ({ currentUser, onUpdateSuccess, onUpdateError, refreshCurrentUserContext }) => {
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
            //console.log("Avatar uploaded, preview is:", preview); 

            if (typeof refreshCurrentUserContext === 'function') {
                await refreshCurrentUserContext(); 
            }
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
        <div className="space-y-5 flex flex-col items-center">
            <div className="relative group">
                <img
                    src={preview}
                    alt="Avatar Preview"
                    className="w-32 h-32 md:w-36 md:h-36 rounded-full object-cover border-4 border-sky-500 shadow-lg group-hover:opacity-75 transition-opacity"
                />
                <button 
                    onClick={triggerFileSelect}
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-full transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
                    aria-label="Change avatar"
                >
                    <FaCamera className="text-white text-2xl" />
                </button>
            </div>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
            
            {selectedFile && (
                <div className="text-center">
                    <p className="text-xs text-gray-600">Đã chọn: {selectedFile.name}</p>
                    <p className="text-xs text-gray-500">({(selectedFile.size / 1024).toFixed(1)} KB)</p>
                </div>
            )}
            
            <button
                onClick={handleUpload}
                disabled={!selectedFile || loading}
                className="w-full max-w-[280px] mt-1 flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-300 disabled:cursor-not-allowed transition-colors"
            >
                {loading ? 'Đang tải lên...' : 'Tải lên ảnh mới'}
            </button>
        </div>
    );
};

const ProfilePage = () => {
    const { currentUser, refreshCurrentUser } = useAuth(); 
    const [activeTab, setActiveTab] = useState('info');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const defaultAvatar = '/assets/img/cloudy.png'; 

    const handleSuccess = async (message) => {
        setSuccessMessage(message);
        setErrorMessage('');
        setTimeout(() => setSuccessMessage(''), 3000);
        if (typeof refreshCurrentUser === 'function') {
            setTimeout(async () => {
                await refreshCurrentUser();
            }, 200);
        }
    };

    const handleError = (message) => {
        setErrorMessage(message);
        setSuccessMessage('');
        setTimeout(() => setErrorMessage(''), 4000);
    };
    
    useEffect(() => {
        if(currentUser) {
            //console.log("Current User Data in ProfilePage (useEffect):", currentUser);
        }
    }, [currentUser]);


    if (!currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <p className="text-lg text-gray-500">Đang tải hồ sơ...</p>
            </div>
        );
    }

    const tabButtonClass = (tabName) =>
        `px-3.5 py-2.5 font-medium text-xs sm:text-sm rounded-t-md transition-all duration-200 ease-in-out focus:outline-none whitespace-nowrap
        ${activeTab === tabName
            ? 'bg-white text-sky-600 border-b-2 border-sky-600 shadow-sm'
            : 'text-gray-500 hover:text-sky-600 hover:bg-gray-50'}`;
    
    const iconClass = "inline mr-1.5 text-sm align-middle";

    return (
        <div className="min-h-screen bg-slate-100 py-6 px-2 sm:px-4 lg:px-6">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white shadow-md rounded-lg p-4 md:p-6 mb-6 md:flex md:items-center md:space-x-4">
                    <div className="relative mx-auto md:mx-0 mb-3 md:mb-0 shrink-0">
                        <img
                            src={currentUser.avatarUrl || defaultAvatar}
                            alt={`${currentUser.username}'s avatar`}
                            className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover ring-2 ring-sky-400 ring-offset-2 ring-offset-white"
                        />
                    </div>
                    <div className="flex-grow text-center md:text-left">
                        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                            {currentUser.username || 'User Profile'}
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                            {currentUser.email || 'N/A'}
                        </p>
                        {currentUser.phonenumber && ( 
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 flex items-center justify-center md:justify-start">
                                <FaPhone className="w-3 h-3 mr-1.5 text-gray-400"/> 
                                {currentUser.phonenumber}
                            </p>
                        )}
                    </div>
                </div>

                {successMessage && (
                    <div className="mb-4 p-3 rounded-md bg-green-50 border-l-4 border-green-400 text-green-600 shadow-sm text-sm flex items-center">
                        <CheckCircleIcon className="w-4 h-4 mr-2 shrink-0"/>
                        <div>
                            <p className="font-medium">Thành công!</p>
                            {successMessage}
                        </div>
                    </div>
                )}
                {errorMessage && (
                    <div className="mb-4 p-3 rounded-md bg-red-50 border-l-4 border-red-400 text-red-600 shadow-sm text-sm">
                         <p className="font-medium">Lỗi!</p>
                        {errorMessage}
                    </div>
                )}

                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-0.5 px-2 pt-1.5" aria-label="Tabs">
                            <button onClick={() => setActiveTab('info')} className={tabButtonClass('info')}>
                                <FaUserEdit className={iconClass} /> Thông tin
                            </button>
                            <button onClick={() => setActiveTab('password')} className={tabButtonClass('password')}>
                                <FaLock className={iconClass} /> Mật khẩu
                            </button>
                            <button onClick={() => setActiveTab('avatar')} className={tabButtonClass('avatar')}>
                                <FaImage className={iconClass} /> Ảnh đại diện
                            </button>
                        </nav>
                    </div>

                    <div className="p-4 md:p-6">
                        {activeTab === 'info' && (
                            <ProfileInformation
                                currentUser={currentUser}
                                onUpdateSuccess={handleSuccess}
                                onUpdateError={handleError}
                                refreshCurrentUserContext={refreshCurrentUser} 
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
                                refreshCurrentUserContext={refreshCurrentUser}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;