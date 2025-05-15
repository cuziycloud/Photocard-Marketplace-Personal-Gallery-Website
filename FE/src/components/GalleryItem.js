import React from 'react';
import { FaHeart, FaComment } from 'react-icons/fa';

const GalleryItem = ({ post }) => {
  if (!post) return null;

  return (
    <div className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer">
      <img
        src={post.imageUrl}
        alt={post.caption || `Post by ${post.user?.username}`}
        className="w-full h-auto object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
        loading="lazy"
      />
      
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-300 flex items-center justify-center p-3">
        <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
          {typeof post.likes === 'number' && (
            <div className="flex items-center">
              <FaHeart className="w-5 h-5 sm:w-6 sm:h-6 mr-1.5" />
              <span className="font-semibold text-sm sm:text-base">{post.likes.toLocaleString()}</span>
            </div>
          )}
          {typeof post.comments === 'number' && (
            <div className="flex items-center">
              <FaComment className="w-5 h-5 sm:w-6 sm:h-6 mr-1.5" />
              <span className="font-semibold text-sm sm:text-base">{post.comments.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GalleryItem;
