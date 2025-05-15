import React from 'react';
import GalleryItem from '../components/GalleryItem';
import { mockGalleryPosts } from '../data/galleryData';

const GalleryPage = () => {
  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-10 text-gray-800">
        Our Gallery
      </h1>

      {mockGalleryPosts && mockGalleryPosts.length > 0 ? (
        <div className="columns-2 sm:columns-3 md:columns-4 gap-4 space-y-4">
          {mockGalleryPosts.map(post => (
            <div key={post.id} className="break-inside-avoid">
              <GalleryItem post={post} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600">No items to display in the gallery yet.</p>
      )}
    </div>
  );
};

export default GalleryPage;
