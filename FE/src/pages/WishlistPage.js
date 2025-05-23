import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FaHeartBroken,
  FaSortAmountDown,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaTimesCircle,
  FaShoppingCart,
  FaSpinner, 
} from 'react-icons/fa';
import ProductDetailModal from '../components/ProductDetailModal';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext'; 

const ITEMS_PER_PAGE = 10;

const SimpleProductCard = ({ product, onRemove, onClickCard }) => (
  <div
    className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col group transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 relative"
    onClick={() => onClickCard(product)}
    style={{ cursor: 'pointer' }}
  >
    <div className="relative">
      <div style={{ paddingTop: '135%' }} />
      <div className="absolute inset-0 bg-[#e5e7eb] p-[20px] sm:p-[30px] md:p-[40px] box-border flex justify-center items-center overflow-hidden border-b border-[#ddd]">
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
          title="Remove from Wishlist"
          className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 z-10"
          aria-label="Remove from Wishlist"
        >
          <FaTimesCircle className="w-3.5 h-3.5" />
        </button>
      )}

      <button
          className={`absolute bottom-2.5 left-2.5 bg-slate-400 text-white p-1.5 rounded-full shadow-md cursor-not-allowed z-10 opacity-50`}
          onClick={(e) => {e.stopPropagation(); alert("Thêm vào giỏ từ chi tiết sản phẩm.");}}
          aria-label="Add to Cart (disabled)"
          disabled={true}
          title="Thêm vào giỏ từ chi tiết sản phẩm"
      >
          <FaShoppingCart className="w-4 h-4" />
      </button>

    </div>
    <div className="p-3.5 flex-grow flex flex-col justify-between">
      <div>
        {product.group?.name && (
          <p className="text-xs font-medium text-indigo-500 mb-1 truncate tracking-wide">
            {product.group.name.toUpperCase()}
          </p>
        )}
        <h3
          className="text-[0.9rem] sm:text-[0.95rem] font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors duration-300 leading-snug line-clamp-2 min-h-[2.4em]"
          title={product.name}
        >
          {product.name}
        </h3>
        {product.version && (
          <p className="text-xs text-slate-500 mt-0.5">Ver: {product.version}</p>
        )}
      </div>
      <div className="mt-2.5">
        <div className="flex justify-between items-center">
          <p className="text-md font-bold text-pink-600">
            ${typeof product.price === 'number' ? product.price.toFixed(2) : 'N/A'}
          </p>
           <p className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${product.stockQuantity > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {product.stockQuantity > 0 ? `Còn ${product.stockQuantity}` : 'Hết hàng'}
            </p>
        </div>
      </div>
    </div>
  </div>
);

const WishlistPage = () => {
  const {
      wishlistItems,
      loadingWishlist,
      wishlistError,
      removeProductFromWishlist,
      addProductToWishlist, 
      isProductInWishlist,
      fetchWishlist
  } = useWishlist();

  const { addToCart: contextAddToCart, addingToCart: cartAddingStatus } = useCart();
  const { isLoggedIn, loadingAuth } = useAuth(); 

  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState('date_added_desc'); 
  const [selectedProductForModal, setSelectedProductForModal] = useState(null);
  const [sortedAndPaginatedItems, setSortedAndPaginatedItems] = useState([]);


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

  useEffect(() => {
    if (!loadingAuth && !loadingWishlist) {
        let itemsToProcess = [...wishlistItems];

        switch (sortOption) {
            case 'date_added_desc':
                break;
            case 'date_added_asc':
                itemsToProcess.reverse(); 
                break;
            case 'name_asc':
                itemsToProcess.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
                break;
            case 'name_desc':
                itemsToProcess.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
                break;
            case 'price_asc':
                itemsToProcess.sort((a, b) => (parseFloat(a.price) || Infinity) - (parseFloat(b.price) || Infinity));
                break;
            case 'price_desc':
                itemsToProcess.sort((a, b) => (parseFloat(b.price) || -Infinity) - (parseFloat(a.price) || -Infinity));
                break;
            default:
                break;
        }
        setSortedAndPaginatedItems(itemsToProcess);
        if (currentPage !== 1 && itemsToProcess.length > 0) { 
        } else if (itemsToProcess.length === 0) {
            setCurrentPage(1);
        }
    }
  }, [wishlistItems, sortOption, loadingWishlist, loadingAuth, currentPage]);

  const handleRemoveFromWishlistPage = async (productId, productName) => {
    await removeProductFromWishlist(productId);
    if (selectedProductForModal && selectedProductForModal.id === productId) {
      handleCloseModal();
    }
  };

  const handleOpenProductModal = (product) => {
    setSelectedProductForModal(product);
  };

  const handleCloseModal = () => {
    setSelectedProductForModal(null);
  };

  const handleAddToCartFromWishlistModalAndPrompt = async (product, event, quantity = 1) => {
    if (!isLoggedIn) {
        alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng và quản lý wishlist trên tài khoản.");
        return false;
    }

    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    if (event && typeof event.stopPropagation === 'function') event.stopPropagation();

    if (!product || !product.id) {
        alert('Sản phẩm không hợp lệ.');
        return false;
    }
    if (product.stockQuantity === 0) {
        alert(`Sản phẩm "${product.name}" đã hết hàng.`);
        return false;
    }
    if (product.stockQuantity < quantity) {
        alert(`Chỉ còn ${product.stockQuantity} sản phẩm "${product.name}".`);
        return false;
    }

    const success = await contextAddToCart(product, quantity);
    if (success) {
        setSelectedProductForModal(prev => prev ? {...prev, stockQuantity: Math.max(0, prev.stockQuantity - quantity)} : null);
        if (isLoggedIn) {
            if (window.confirm(`"${product.name}" đã được thêm vào giỏ. Bạn có muốn xóa khỏi Wishlist không?`)) {
              await removeProductFromWishlist(product.id);
            }
        }
    }
    return success;
  };

  const totalItems = sortedAndPaginatedItems.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentDisplay = sortedAndPaginatedItems.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) {
        if (totalPages === 0 && page === 1) { 
             setCurrentPage(1);
             return;
        }
        if (page < 1 && totalPages > 0) {
            setCurrentPage(1);
            return;
        }
        if (page > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
            return;
        }
        return;
    }
    setCurrentPage(page);
  };


  const handleToggleWishlistInModal = async (product) => {
    const currentlyInWishlist = isProductInWishlist(product.id);
    if (currentlyInWishlist) {
        await removeProductFromWishlist(product.id);
    } else {
        await addProductToWishlist(product);
    }
  };


  if (loadingAuth || loadingWishlist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
        <FaSpinner className="animate-spin text-pink-600 text-4xl mb-3" />
        <p className="text-gray-500">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (wishlistError) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-red-50 rounded-lg shadow text-center">
        <FaTimesCircle className="mx-auto text-4xl text-red-400 mb-3" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Rất tiếc, đã xảy ra lỗi!</h3>
        <p className="text-sm text-red-600 mb-4">{wishlistError}</p>
        <button
          onClick={fetchWishlist}
          className="px-4 py-2 bg-pink-600 text-white text-sm rounded hover:bg-pink-700 transition"
        >Thử lại</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 pb-4 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-800 text-center sm:text-left">Danh sách Yêu thích</h1>
           <p className="text-center sm:text-left text-gray-500 mt-1">
            Hiện có <span className="font-semibold text-pink-600">{totalItems}</span> sản phẩm trong danh sách yêu thích.
          </p>
        </header>

        <div className="bg-white p-4 sm:p-5 rounded-lg shadow mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center text-gray-600">
            <FaFilter className="mr-2 text-pink-500 text-lg" />
            <select
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm bg-gray-50 cursor-not-allowed"
                disabled
            >
              <option value="">Tất cả nhóm (chưa hỗ trợ)</option>
            </select>
          </div>
          <div className="flex items-center text-gray-600">
            <FaSortAmountDown className="mr-2 text-pink-500 text-lg" />
            <select
              value={sortOption}
              onChange={(e) => { setSortOption(e.target.value); setCurrentPage(1); }}
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

        {totalItems === 0 && !loadingWishlist ? (
          <div className="flex flex-col items-center justify-center p-10 bg-white rounded-lg shadow min-h-[300px]">
            <FaHeartBroken className="text-6xl text-gray-300 mb-6" />
            <p className="text-xl text-gray-600 mb-3">Danh sách yêu thích của bạn trống!</p>
            <p className="text-gray-500 mb-6 text-center max-w-sm">
                Thêm các sản phẩm bạn quan tâm vào đây để dễ dàng theo dõi nhé.
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
              {currentDisplay.map((product) => (
                <SimpleProductCard
                  key={product.id}
                  product={product}
                  onRemove={handleRemoveFromWishlistPage}
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
              onAddToCart={handleAddToCartFromWishlistModalAndPrompt}
              isAddingToCart={cartAddingStatus && cartAddingStatus[selectedProductForModal.id]}
              wishlistStatus={isProductInWishlist(selectedProductForModal.id)}
              onToggleWishlist={() => handleToggleWishlistInModal(selectedProductForModal)}
              isLoggedIn={isLoggedIn} 
          />
      )}
    </div>
  );
};

export default WishlistPage;