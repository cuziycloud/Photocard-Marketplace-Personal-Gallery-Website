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

const API_BASE_URL = 'http://localhost:8080/api';
const MOCK_USER_ID = 2;
const ITEMS_PER_PAGE = 10;

const SimpleProductCard = ({ product, onRemove }) => (
  <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow transform hover:-translate-y-0.5 hover:scale-105 overflow-hidden">
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
          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-shadow shadow-lg"
        >
          <FaTrashAlt className="w-4 h-4" />
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
      console.error(err);
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
    } catch (err) {
      console.error(err);
      alert(`Lỗi khi xóa: ${err.response?.data?.message || err.message}`);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500"></div>
    </div>
  );

  if (error) return (
    <div className="max-w-md mx-auto p-6 bg-red-50 rounded-lg shadow text-center">
      <FaTimesCircle className="mx-auto text-4xl text-red-400 mb-3" />
      <p className="text-gray-700 mb-2">Đã xảy ra lỗi:</p>
      <p className="text-sm text-red-600 mb-4">{error}</p>
      <button onClick={fetchCollectedProducts} className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700">
        Thử lại
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">

        <header className="mb-6 text-center">
          <p className="text-2xl font-bold text-gray-800 mb-2">Collected <span className="font-semibold text-pink-600">{totalItems}</span> card</p>
        </header>

        <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center text-gray-600">
            <FaFilter className="mr-2 text-pink-600" />
            <select
              disabled
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option>Tất cả nhóm</option>
            </select>
          </div>
          <div className="flex items-center text-gray-600">
            <FaSortAmountDown className="mr-2 text-pink-600" />
            <select
              value={sortOption}
              onChange={e => { setSortOption(e.target.value); setCurrentPage(1); }}
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="date_added_desc">Mới nhất</option>
              <option value="name_asc">Tên A-Z</option>
            </select>
          </div>
        </div>

        {totalItems === 0 ? (
          <div className="flex flex-col items-center p-10 bg-white rounded-lg shadow">
            <FaPlusCircle className="text-5xl text-gray-300 mb-4" />
            <p className="text-gray-600 mb-2">Bộ sưu tập của bạn hiện trống</p>
            <Link to="/products" className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700">
              Khám phá ngay
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {currentDisplay.map(product => (
                <SimpleProductCard
                  key={product.id}
                  product={product}
                  onRemove={handleRemoveFromCollection}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded border border-gray-300 hover:bg-pink-50 disabled:opacity-50"
                >
                  <FaChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-2 py-1 text-sm rounded transition ${
                      currentPage === page ? 'bg-pink-600 text-white' : 'text-gray-700 hover:bg-pink-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded border border-gray-300 hover:bg-pink-50 disabled:opacity-50"
                >
                  <FaChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyCollectionPage;