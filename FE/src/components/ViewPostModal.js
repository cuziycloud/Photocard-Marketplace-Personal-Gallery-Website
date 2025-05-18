import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaHeart, FaComment, FaUserCircle, FaCalendarAlt, FaSpinner } from 'react-icons/fa';

const formatDateForView = (dateString) => {
    if (!dateString) return 'Không rõ thời gian';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        }).format(date);
    } catch {
        return 'Không rõ thời gian';
    }
};

const ViewPostModal = ({ isOpen, onClose, post }) => {
    const [isImageActuallyLoaded, setIsImageActuallyLoaded] = useState(false);
    const modalRef = useRef(null);

    useEffect(() => {
        if (!isOpen || !post) {
            setIsImageActuallyLoaded(false);
        } else {
            const timer = setTimeout(() => setIsImageActuallyLoaded(true), 50);
            return () => clearTimeout(timer);
        }
    }, [isOpen, post]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !post) return null;

    const { imageUrl, caption, likes, comments, user, postedAt, timestamp } = post;
    const username = user?.username || 'Người dùng ẩn danh';
    const userAvatar = user?.avatarUrl;
    const displayDate = postedAt ? formatDateForView(postedAt) : (timestamp || 'Vừa xong');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-modalBgShow">
            <div
                ref={modalRef}
                className="inline-flex bg-white rounded-xl shadow-2xl overflow-hidden transform transition-all duration-300 ease-out animate-modalContentShow max-h-[90vh]"
            >
                {/* Ảnh */}
                <div className="relative flex-none bg-black flex items-center justify-center">
                    {!isImageActuallyLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black">
                            <FaSpinner className="animate-spin text-white text-3xl" />
                        </div>
                    )}
                    <img
                        src={imageUrl || 'https://via.placeholder.com/800x600?text=No+Image'}
                        alt={caption || 'Gallery Post'}
                        className={`transition-opacity duration-300
                                    ${isImageActuallyLoaded ? 'opacity-100' : 'opacity-0'}
                                    w-auto h-auto max-w-[60vw] max-h-[60vh] object-contain`}
                        onLoad={() => setIsImageActuallyLoaded(true)}
                        onError={() => setIsImageActuallyLoaded(true)}
                    />
                </div>

                {/* Thông tin */}
                <div className="flex-none bg-white p-5 sm:p-6 max-h-[90vh] overflow-y-auto w-80">
                    <div className="flex items-center mb-4 pb-4 border-b border-gray-200">
                        {userAvatar ? (
                            <img src={userAvatar} alt={username} className="w-10 h-10 rounded-full object-cover mr-3 shadow" />
                        ) : (
                            <FaUserCircle className="w-10 h-10 text-gray-400 mr-3" />
                        )}
                        <div>
                            <p className="text-sm font-semibold text-gray-800">{username}</p>
                            <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                <FaCalendarAlt className="mr-1.5" />
                                <span>{displayDate}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 text-white bg-black/50 hover:bg-black/70 p-2 rounded-full transition-colors z-20"
                        aria-label="Đóng"
                    >
                        <FaTimes size={18} />
                    </button>

                    {caption && (
                        <div className="mb-5 text-sm text-gray-700 leading-relaxed">
                            {caption.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                        </div>
                    )}

                    <div className="mt-auto pt-4 border-t border-gray-200 flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center">
                            <FaHeart className={`mr-1 ${likes > 0 ? 'text-red-500' : 'text-gray-400'}`} />
                            <span>{likes || 0} lượt thích</span>
                        </div>
                        <div className="flex items-center">
                            <FaComment className={`mr-1 ${comments > 0 ? 'text-blue-500' : 'text-gray-400'}`} />
                            <span>{comments || 0} bình luận</span>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes modalBgShow { from { opacity: 0; } to { opacity: 1; } }
                @keyframes modalContentShow {
                    from { transform: scale(0.95) translateY(10px); opacity: 0; }
                    to { transform: scale(1) translateY(0); opacity: 1; }
                }
                .animate-modalBgShow {
                    animation: modalBgShow 0.1s ease-out forwards;
                }
                .animate-modalContentShow {
                    animation: modalContentShow 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                    animation-delay: 0.05s;
                }
            `}</style>
        </div>
    );
};

export default ViewPostModal;
