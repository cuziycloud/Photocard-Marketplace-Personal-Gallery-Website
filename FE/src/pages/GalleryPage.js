import React, { useState, useEffect, useCallback, useRef } from 'react';
import GalleryItem from '../components/GalleryItem';
import AddPostModal from '../components/AddPostModal'; 
import ViewPostModal from '../components/ViewPostModal'; 
import galleryService from '../services/galleryService'; 
import { FaPhotoVideo, FaPlusCircle, FaSpinner, FaTimesCircle } from 'react-icons/fa';

const shuffleArray = (array) => {
  if (!array?.length) return [];
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
  const [isContentLoaded, setIsContentLoaded] = useState(false); 
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const contentTimerRef = useRef(null); 

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setIsContentLoaded(false);
    setError(null);

    if (contentTimerRef.current) {
      clearTimeout(contentTimerRef.current);
    }

    try {
      const res = await galleryService.getAllGalleryPosts();
      setPosts(shuffleArray(res.data || []));
    } catch (e) {
      console.error("Lỗi khi tải gallery posts:", e.response?.data || e.message);
      setError('Không thể tải dữ liệu gallery. Vui lòng thử lại sau.');
      setPosts([]);
    } finally {
      setLoading(false);
      contentTimerRef.current = setTimeout(() => {
        setIsContentLoaded(true);
      }, 10); 
    }
  }, []);

  useEffect(() => {
    loadPosts();
    return () => {
      if (contentTimerRef.current) {
        clearTimeout(contentTimerRef.current);
      }
    };
  }, [loadPosts]); 

  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);

  const handleCreatePost = async (postDataFromModal) => {
    try {
      let payload;
      if (postDataFromModal.uploadMethod === 'file' && postDataFromModal.imageFile) {
        payload = new FormData();
        payload.append('caption', postDataFromModal.caption);
        payload.append('imageFile', postDataFromModal.imageFile);
      } else if (postDataFromModal.uploadMethod === 'link' && postDataFromModal.imageUrl) {
        payload = {
          imageUrl: postDataFromModal.imageUrl,
          caption: postDataFromModal.caption,
        };
      } else {
        throw new Error("Dữ liệu không hợp lệ để tạo bài đăng.");
      }
      const response = await galleryService.createGalleryPost(payload);
      const createdPost = response.data;

      setPosts(prevPosts => [createdPost, ...prevPosts])
      handleCloseAddModal();
    } catch (apiError) {
      console.error("Lỗi khi tạo bài đăng trong GalleryPage:", apiError.response?.data || apiError.message);
      throw apiError;
    }
  };

  const handleOpenViewModal = (post) => {
    setSelectedPost(post);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedPost(null);
  };

  const ContentWrapper = ({ children }) => (
    <div className="min-h-[calc(100vh-22rem)] sm:min-h-[400px] flex flex-col justify-center">
        {children}
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-4 h-full">
          <FaSpinner className="animate-spin text-indigo-600 text-5xl" />
          <p className="mt-5 text-lg text-gray-700">Đang tải khoảnh khắc...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className={`
            flex flex-col items-center justify-center text-center p-8 
            bg-red-50 border-l-4 border-red-500 rounded-lg shadow 
            max-w-2xl mx-auto h-full
            transition-opacity duration-500 ease-in-out
            ${isContentLoaded ? 'opacity-100' : 'opacity-0'}
        `}>
          <FaTimesCircle className="text-red-500 text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-700 mb-2">Error</h3>
          <p className="text-red-600 mb-5">{error}</p>
          <button
            onClick={loadPosts}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-lg shadow transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }

    if (posts.length > 0) {
      return (
        <div 
          className={`
            columns-1 xs:columns-2 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 
            gap-5 sm:gap-6
            transition-opacity duration-300 ease-in-out 
            ${isContentLoaded ? 'opacity-100' : 'opacity-0'}
          `}
        >
          {posts.map((post, index) => (
            <div 
              key={post.id} 
              className={`
                break-inside-avoid-column mb-5 sm:mb-6
                transition-all duration-500 ease-out
                ${isContentLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 sm:translate-y-5'}
              `}
              style={{ transitionDelay: isContentLoaded ? `${index * 60}ms` : '0ms' }}
            >
              <GalleryItem post={post} onViewPost={() => handleOpenViewModal(post)} />
            </div>
          ))}
        </div>
      );
    }

    if (isContentLoaded && !loading && !error && posts.length === 0) {
        return (
            <div className={`
                flex flex-col items-center justify-center text-center py-16 
                bg-white rounded-xl shadow-xl p-8 sm:p-12 max-w-xl mx-auto h-full
                transition-opacity duration-500 ease-in-out
                ${isContentLoaded ? 'opacity-100' : 'opacity-0'}
            `}>
                <FaPhotoVideo className="mx-auto mb-6 text-indigo-300 text-6xl sm:text-7xl" />
                <h3 className="text-2xl sm:text-3xl font-semibold text-slate-800 mb-3">Blank Gallery</h3>
                <p className="text-md sm:text-lg text-gray-600 mb-8">
                  Be the first.
                </p>
                <button
                  onClick={handleOpenAddModal}
                  className="inline-flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-md sm:text-lg"
                >
                  <FaPlusCircle className="mr-2.5" size={20} />
                  Post
                </button>
            </div>
        );
    }
    return null; 
  };

  return (
    <div className="bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 min-h-screen py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col sm:flex-row items-center justify-between mb-10 sm:mb-12 pb-6 border-b border-slate-200">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 mb-4 sm:mb-0">
            Juzt Clz 
          </h1>
          <button
            onClick={handleOpenAddModal}
            disabled={loading || !isContentLoaded} 
            className="flex items-center bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FaPlusCircle className="mr-2 text-lg" />
            Post Something
          </button>
        </header>
        
        <ContentWrapper>
          {renderContent()}
        </ContentWrapper>
      </div>

      <AddPostModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSubmit={handleCreatePost}
      />

      {selectedPost && (
        <ViewPostModal
            isOpen={isViewModalOpen}
            onClose={handleCloseViewModal}
            post={selectedPost}
        />
      )}
    </div>
  );
};

export default GalleryPage;