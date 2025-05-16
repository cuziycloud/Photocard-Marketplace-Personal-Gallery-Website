// src/pages/GalleryPage.js
import React, { useState, useEffect, useCallback } from 'react';
import GalleryItem from '../components/GalleryItem';
import AddPostModal from '../components/AddPostModal';
import galleryService from '../services/galleryService';
import { FaPhotoVideo, FaPlusCircle } from 'react-icons/fa';

const shuffleArray = (array) => {
  if (!array || array.length === 0) return [];
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const GalleryPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await galleryService.getAllGalleryPosts();
      setPosts(shuffleArray(res.data || []));
    } catch (e) {
      console.error(e);
      setError('Không thể tải dữ liệu gallery. Vui lòng thử lại sau.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const handleOpen = () => setIsModalOpen(true);
  const handleClose = () => setIsModalOpen(false);
  const handleCreate = async (data) => {
    const res = await galleryService.createGalleryPost(data);
    setPosts([res.data, ...posts]);
    handleClose();
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] bg-slate-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="bg-slate-100 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4">
        <header className="flex flex-col sm:flex-row items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 mb-4 sm:mb-0">
            Juzt Clz 
          </h1>
          <button
            onClick={handleOpen}
            className="flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:shadow-lg transition transform hover:scale-105"
          >
            <FaPlusCircle className="mr-2" />
            Post Something
          </button>
        </header>

        {error ? (
          <div className="text-center p-8 bg-red-50 rounded-lg shadow">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadPosts}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            >Thử lại</button>
          </div>
        ) : posts.length ? (
          <div className="columns-1 xs:columns-2 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-6 space-y-6">
            {posts.map(post => (
              <div key={post.id} className="break-inside-avoid">
                <GalleryItem post={post} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-16 bg-white rounded-xl shadow-lg">
            <FaPhotoVideo className="mx-auto mb-4 text-indigo-300" size={64} />
            <p className="text-xl text-gray-600 mb-4">No moments yet.</p>
            <button
              onClick={handleOpen}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-lg shadow hover:shadow-lg"
            >
              <FaPlusCircle className="mr-2" />
              Be the first to post
            </button>
          </div>
        )}
      </div>
      <AddPostModal isOpen={isModalOpen} onClose={handleClose} onSubmit={handleCreate} />
    </div>
  );
};

export default GalleryPage;