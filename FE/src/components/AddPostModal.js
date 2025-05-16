import React, { useState, useRef, useEffect } from 'react';
import { FaTimes, FaImage, FaLink, FaUpload } from 'react-icons/fa';

const AddPostModal = ({ isOpen, onClose, onSubmit }) => {
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadMethod, setUploadMethod] = useState('link');
  const fileInputRef = useRef(null);

  const resetForm = () => {
    setCaption('');
    setImageUrl('');
    setImageFile(null);
    setPreviewUrl(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    }
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);


  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn 5MB.');
        setImageFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        setError('Định dạng file không hợp lệ. Vui lòng chọn file JPEG, PNG, GIF, hoặc WEBP.');
        setImageFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file)); 
      setError('');
    } else {
      setImageFile(null);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (uploadMethod === 'link' && !imageUrl.trim()) {
      setError('Vui lòng nhập URL hình ảnh.');
      return;
    }
    if (uploadMethod === 'file' && !imageFile) {
      setError('Vui lòng chọn một file ảnh.');
      return;
    }
    if (!caption.trim()) {
      setError('Vui lòng nhập chú thích.');
      return;
    }

    setIsSubmitting(true);
    try {
      const postData = {
        caption: caption,
        imageUrl: uploadMethod === 'link' ? imageUrl : null,
        imageFile: uploadMethod === 'file' ? imageFile : null,
        uploadMethod: uploadMethod, 
      };
      await onSubmit(postData);
    } catch (apiError) {
      setError(apiError.response?.data?.message || apiError.message || 'Đã xảy ra lỗi khi tạo bài đăng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInternalClose = () => {
    if (isSubmitting) return;
    onClose();  
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-lg transform transition-all duration-300 ease-in-out scale-95 animate-modalShow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-indigo-700">Tạo Bài Đăng Mới</h2>
          <button
            onClick={handleInternalClose}
            className="text-gray-400 hover:text-red-600 transition-colors p-1.5 rounded-full hover:bg-gray-100 focus:outline-none"
            aria-label="Đóng modal"
            disabled={isSubmitting}
          >
            <FaTimes size={20} />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md mb-4 text-sm" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phương thức tải ảnh:</label>
            <div className="flex rounded-md shadow-sm">
              <button
                type="button"
                onClick={() => { setUploadMethod('link'); setError(''); setPreviewUrl(null); setImageFile(null); if (fileInputRef.current) fileInputRef.current.value = "";}}
                className={`relative inline-flex items-center justify-center px-4 py-2.5 rounded-l-md border border-gray-300 text-sm font-medium focus:z-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors w-1/2
                  ${uploadMethod === 'link' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                <FaLink className="mr-2 h-4 w-4" /> Liên kết URL
              </button>
              <button
                type="button"
                onClick={() => { setUploadMethod('file'); setError(''); setImageUrl(''); }} 
                className={`relative -ml-px inline-flex items-center justify-center px-4 py-2.5 rounded-r-md border border-gray-300 text-sm font-medium focus:z-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors w-1/2
                  ${uploadMethod === 'file' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                <FaImage className="mr-2 h-4 w-4" /> Tải file lên
              </button>
            </div>
          </div>

          {uploadMethod === 'link' && (
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1.5">
                URL Hình Ảnh <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLink className="text-gray-400 h-4 w-4" />
                </div>
                <input
                  type="url"
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm"
                  required={uploadMethod === 'link'}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}

          {uploadMethod === 'file' && (
            <div>
              <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 mb-1.5">
                Chọn File Ảnh <span className="text-red-500">*</span> (Tối đa 5MB: JPG, PNG, GIF, WEBP)
              </label>
              <label
                htmlFor="imageFile"
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-indigo-500 transition-colors bg-white"
              >
                <div className="space-y-1 text-center">
                  <FaUpload className="mx-auto h-10 w-10 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <span className="relative rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                      Nhấn để tải lên
                    </span>
                    <input
                      id="imageFile"
                      name="imageFile"
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="sr-only"
                      onChange={handleFileChange} 
                      ref={fileInputRef}
                      disabled={isSubmitting}
                    />
                  </div>
                  <p className="text-xs text-gray-500">hoặc kéo thả file vào đây</p>
                </div>
              </label>
              {previewUrl && (
                <div className="mt-3 text-center">
                  <img src={previewUrl} alt="Xem trước ảnh" className="max-h-40 mx-auto rounded-md shadow-sm border" />
                  <p className="text-xs text-gray-500 mt-1">Xem trước: {imageFile?.name}</p>
                </div>
              )}
            </div>
          )}

          <div>
            <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-1.5">
              Chú thích <span className="text-red-500">*</span>
            </label>
            <textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows="3"
              placeholder="Viết gì đó về bức ảnh này..."
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={handleInternalClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-150 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isSubmitting || (uploadMethod === 'file' && !imageFile) || (uploadMethod === 'link' && !imageUrl) }
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang đăng...
                </div>
              ) : 'Đăng Bài'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPostModal;    