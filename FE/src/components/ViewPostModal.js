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

const INFO_PANEL_WIDTH_CLASS = "md:w-[300px] lg:w-[320px]"; 
const MAX_MODAL_HEIGHT_VH = 85; 
const MAX_MODAL_WIDTH_VW = 90;  

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
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-md flex items-center justify-center z-[60] p-2 sm:p-4 animate-modalBgShow">
      <div
        ref={modalRef}
        className={`bg-white rounded-xl shadow-2xl flex flex-col md:flex-row overflow-hidden transform transition-all duration-300 ease-out animate-modalContentShow
                   max-h-[${MAX_MODAL_HEIGHT_VH}vh] w-auto max-w-[${MAX_MODAL_WIDTH_VW}vw]`}
      >
        {/* ảnh */}
        <div className="flex-shrink-0 md:flex-shrink bg-black flex items-center justify-center relative 
                       md:max-w-[calc(100%-280px)] lg:md:max-w-[calc(100%-320px)]"> 
          {!isImageActuallyLoaded && ( 
            <div className="absolute inset-0 flex items-center justify-center bg-black">
                <FaSpinner className="animate-spin text-white text-3xl" />
            </div>
          )}
          <img
            src={imageUrl || 'https://via.placeholder.com/800x600?text=No+Image'}
            alt={caption || 'Gallery Post'}
            className={`object-contain transition-opacity duration-300
                       ${isImageActuallyLoaded ? 'opacity-100' : 'opacity-0'}
                       max-w-full max-h-[${MAX_MODAL_HEIGHT_VH}vh]`} 
            onLoad={() => setIsImageActuallyLoaded(true)}
            onError={() => setIsImageActuallyLoaded(true)} 
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white bg-black/50 hover:bg-black/70 p-2 rounded-full transition-colors z-20"
            aria-label="Đóng"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* thông tin */}
        <div className={`flex-shrink-0 bg-white p-5 sm:p-6 overflow-y-auto flex flex-col 
                       ${INFO_PANEL_WIDTH_CLASS} 
                       max-h-[${MAX_MODAL_HEIGHT_VH}vh]`} 
        >
          <div className="flex items-center mb-4 pb-4 border-b border-gray-200">
            {userAvatar ? <img src={userAvatar} alt={username} className="w-10 h-10 rounded-full object-cover mr-3 shadow" /> : <FaUserCircle className="w-10 h-10 text-gray-400 mr-3" />}
            <div>
              <p className="text-sm font-semibold text-gray-800">{username}</p>
              <div className="flex items-center text-xs text-gray-500 mt-0.5"><FaCalendarAlt className="mr-1.5"/><span>{displayDate}</span></div>
            </div>
          </div>
          {caption && <div className="mb-5 text-sm text-gray-700 leading-relaxed flex-grow min-h-[50px]"><p style={{ whiteSpace: 'pre-wrap' }}>{caption}</p></div>}
          <div className="mt-auto pt-4 border-t border-gray-200 flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center"><FaHeart className={`mr-1 ${likes > 0 ? 'text-red-500' : 'text-gray-400'}`} /><span>{likes || 0}</span></div>
            <div className="flex items-center"><FaComment className={`mr-1 ${comments > 0 ? 'text-blue-500' : 'text-gray-400'}`} /><span>{comments || 0}</span></div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes modalBgShow { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalContentShow { 
            from { transform: scale(0.95) translateY(10px); opacity: 0; } 
            to { transform: scale(1) translateY(0); opacity: 1; } 
        }
        .animate-modalBgShow { animation: modalBgShow 0.2s ease-out forwards; }
        .animate-modalContentShow { animation: modalContentShow 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; animation-delay: 0.05s; }
      `}</style>
    </div>
  );
};

export default ViewPostModal;