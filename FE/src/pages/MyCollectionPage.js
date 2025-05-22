import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FaPlusCircle,
  FaFilter,
  FaSortAmountDown,
  FaTimesCircle,
  FaChevronLeft,
  FaChevronRight,
  FaTrashAlt,
} from 'react-icons/fa';
import axios from 'axios';
import ProductDetailModal from '../components/ProductDetailModal'; 

const API_BASE_URL = 'http://localhost:8080/api';
const MOCK_USER_ID = 2;
const ITEMS_PER_PAGE = 10;

const SimpleProductCard = ({ product, onRemove, onClickCard }) => ( 
  <div 
    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow transform hover:-translate-y-0.5 hover:scale-105 overflow-hidden"
    onClick={() => onClickCard(product)} 
    style={{cursor: 'pointer'}}
  >
    <div className="relative w-full pb-[120%] bg-gray-100">
       <div style={{ paddingTop: '10%' }} /> 
            <div className="absolute inset-0 bg-[#f1f3f6] p-[10px] sm:p-[15px] md:p-[20px] box-border flex justify-center items-center overflow-hidden border-b border-[#ddd]">
                <img
                    src={product.imageUrl || 'https://via.placeholder.com/300x400?text=No+Image'}
                    alt={product.name}
                    className="block max-w-full max-h-full object-cover rounded-lg transition-transform duration-300 ease-in-out group-hover:scale-105"
                />
            </div>
      {onRemove && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation(); 
            onRemove(product.id, product.name);
          }}
          title="Remove from Collection"
          className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-shadow shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          <FaTrashAlt className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      )}
    </div>
    <div className="p-3 flex flex-col">
      {product.group?.name && (
        <p className="text-xs font-medium text-gray-400 mb-1 truncate">
          {product.group.name}
        </p>
      )}
      <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1" title={product.name}>
        {product.name}
      </h3>
      {product.version && (
        <p className="text-xs text-gray-500 mb-2">Ver. {product.version}</p>
      )}
      <p className="mt-auto text-sm font-bold text-pink-600">
        ${typeof product.price === 'number' ? product.price.toFixed(2) : 'N/A'}
      </p>
    </div>
  </div>
);


const MyCollectionPage = () => {
  const [myCollectedProducts, setMyCollectedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState('date_added_desc');

  const [selectedProductForModal, setSelectedProductForModal] = useState(null);

  useEffect(() => {
    if (selectedProductForModal) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'unset';
    }
    return () => {
        document.body.style.overflow = 'unset';
    };
  }, [selectedProductForModal]);


  const fetchCollectedProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/users/${MOCK_USER_ID}/collections`,
        { params: { sortBy: sortOption } } 
      );
      setMyCollectedProducts(response.data || []); 
    } catch (err) {
      console.error("Error fetching collection:", err);
      setError(err.response?.data?.message || err.message || 'Không thể tải bộ sưu tập.');
      setMyCollectedProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [sortOption]); 

  useEffect(() => {
    fetchCollectedProducts();
  }, [fetchCollectedProducts]);

  const handleRemoveFromCollection = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa "${name}" khỏi bộ sưu tập không?`)) return;
    try {
      await axios.delete(`${API_BASE_URL}/users/${MOCK_USER_ID}/collections/${id}`);
      setMyCollectedProducts(prev => prev.filter(p => p.id !== id));
      if (selectedProductForModal && selectedProductForModal.id === id) {
        handleCloseModal();
      }
    } catch (err) {
      console.error("Error removing from collection:", err);
      alert(`Lỗi khi xóa: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleOpenProductModal = (product) => {
         setSelectedProductForModal(product);
  };

  const handleCloseModal = () => {
    setSelectedProductForModal(null);
  };
  
  const handleAddToCartFromModal = (product, e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    
    if (product.stockQuantity === 0) {
        alert("Sản phẩm này đã hết hàng (thông tin từ collection)!");
        return;
    }
  };


  // Pagination
  const totalItems = myCollectedProducts.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentDisplay = myCollectedProducts.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const goToPage = page => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    //window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500"></div>
      <p className="ml-3 text-gray-600">Đang tải bộ sưu tập...</p>
    </div>
  );

  if (error) return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-red-50 rounded-lg shadow text-center">
      <FaTimesCircle className="mx-auto text-4xl text-red-400 mb-3" />
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Rất tiếc, đã xảy ra lỗi!</h3>
      <p className="text-sm text-red-600 mb-4">{error}</p>
      <button 
        onClick={fetchCollectedProducts} 
        className="px-4 py-2 bg-pink-600 text-white text-sm rounded hover:bg-pink-700 transition-colors"
      >
        Thử lại
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <header className="mb-6 pb-4 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-800 text-center sm:text-left">Bộ sưu tập của tôi</h1>
          <p className="text-center sm:text-left text-gray-500 mt-1">
            Hiện có <span className="font-semibold text-pink-600">{totalItems}</span> sản phẩm trong bộ sưu tập.
          </p>
        </header>

        <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center text-gray-600">
            <FaFilter className="mr-2 text-pink-500 text-lg" />
            <select
              disabled 
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm bg-gray-50 cursor-not-allowed"
            >
              <option>Tất cả nhóm (chưa hỗ trợ)</option>
            </select>
          </div>
          <div className="flex items-center text-gray-600">
            <FaSortAmountDown className="mr-2 text-pink-500 text-lg" />
            <select
              value={sortOption}
              onChange={e => { setSortOption(e.target.value); setCurrentPage(1); }}
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
            >
              <option value="date_added_desc">Ngày thêm (Mới nhất)</option>
              <option value="date_added_asc">Ngày thêm (Cũ nhất)</option>
              <option value="name_asc">Tên A-Z</option>
              <option value="name_desc">Tên Z-A</option>
              <option value="price_asc">Giá (Thấp đến Cao)</option>
              <option value="price_desc">Giá (Cao đến Thấp)</option>
            </select>
          </div>
        </div>

        {totalItems === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center p-10 bg-white rounded-lg shadow min-h-[300px]">
            <FaPlusCircle className="text-6xl text-gray-300 mb-6" />
            <p className="text-xl text-gray-600 mb-3">Bộ sưu tập của bạn trống trơn!</p>
            <p className="text-gray-500 mb-6 text-center max-w-sm">
              Hãy bắt đầu khám phá và thêm những sản phẩm yêu thích vào bộ sưu tập nhé.
            </p>
            <Link 
                to="/" 
                className="px-6 py-3 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition-colors text-lg shadow-md hover:shadow-lg"
            >
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
              {currentDisplay.map(product => (
                <SimpleProductCard
                  key={product.id}
                  product={product}
                  onRemove={handleRemoveFromCollection}
                  onClickCard={handleOpenProductModal} 
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-1.5 sm:space-x-2 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous Page"
                >
                  <FaChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                      currentPage === page 
                        ? 'bg-pink-600 text-white border-pink-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2.5 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next Page"
                >
                  <FaChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedProductForModal && (
          <ProductDetailModal
              product={selectedProductForModal}
              onClose={handleCloseModal}
              onAddToCart={handleAddToCartFromModal} 
              wishlistStatus={false} 
              onToggleWishlist={() => alert("Chức năng Wishlist không áp dụng cho modal từ Collection.")} 
          />
      )}
    </div>
  );
};

export default MyCollectionPage;