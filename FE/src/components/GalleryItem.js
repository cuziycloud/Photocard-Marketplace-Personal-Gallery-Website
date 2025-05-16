import React from 'react';
import { FaHeart, FaComment, FaUserCircle } from 'react-icons/fa';

const GalleryItem = ({ post, onViewPost }) => {
  if (!post || !post.id) {
    return null;
  }

  const { imageUrl, caption, likes, comments, user, timestamp } = post;
  const username = user?.username || 'Anonymous';
  const userAvatar = user?.avatarUrl;

  const handleViewPostClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onViewPost) {
      onViewPost();
    }
  };

  return (
    <div
      className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer break-inside-avoid-column" // Giữ shadow transition, bỏ scale/translate ở đây
      onClick={handleViewPostClick}
    >
      <img
        src={imageUrl || 'https://via.placeholder.com/400x300?text=No+Image'} 
        alt={caption || `Post by ${username}`}
        className="w-full h-auto object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
        loading="lazy"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 sm:p-4">
        <div className="flex items-center opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transform translate-y-2 transition-all duration-300 delay-100">
          {userAvatar ? (
            <img src={userAvatar} alt={username} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover mr-2 border-2 border-white/50" />
          ) : (
            <FaUserCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white/80 mr-2" />
          )}
          <div>
            <p className="text-white text-xs sm:text-sm font-semibold line-clamp-1">{username}</p>
            {timestamp && <p className="text-white/80 text-[10px] sm:text-xs line-clamp-1">{timestamp}</p>}
          </div>
        </div>

        <div className="flex items-center justify-start space-x-4 sm:space-x-5 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transform translate-y-2 transition-all duration-300 delay-200">
          {typeof likes === 'number' && (
            <div className="flex items-center text-white">
              <FaHeart className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-1.5 text-red-400 group-hover:text-red-500 transition-colors" />
              <span className="font-semibold text-xs sm:text-sm">{likes.toLocaleString()}</span>
            </div>
          )}
          {typeof comments === 'number' && (
            <div className="flex items-center text-white">
              <FaComment className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-1.5 text-sky-300 group-hover:text-sky-400 transition-colors" />
              <span className="font-semibold text-xs sm:text-sm">{comments.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GalleryItem;