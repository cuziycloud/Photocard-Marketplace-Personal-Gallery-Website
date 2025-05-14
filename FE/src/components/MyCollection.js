import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaFilter, FaSortAmountDown, FaPlusCircle, FaTimesCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const SimpleProductCard = ({ product, onRemove }) => {
    return (
        <div
            className="bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 ease-in-out hover:translate-y-[-6px] hover:scale-[1.02] hover:shadow-xl"
        >
            <Link to={`/product/${product.id}`} className="flex flex-col h-full text-inherit no-underline">
                <div className="group relative w-full"> 
                    <div style={{ paddingTop: '135%' }} />
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
                            title="Remove from collection"
                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors z-10 shadow-md" // Thêm shadow-md
                            aria-label="Remove from collection"
                        >
                            <FaTimesCircle className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="p-[15px_18px_18px_18px] text-left flex-grow flex flex-col justify-between"> 
                    <div>
                        {product.group && typeof product.group === 'object' && product.group.name && (
                            <p className="text-[0.9em] font-medium text-gray-500 mb-[2px] truncate">{product.group.name}</p>
                        )}
                        <h3 className="text-[1.05em] font-semibold text-slate-800 mb-2 leading-tight min-h-[calc(1.05em*1.3*2)] overflow-hidden" title={product.name}>
                            <span className="line-clamp-2">{product.name}</span>
                        </h3>
                        {product.version && (
                            <p className="text-xs text-slate-500 mt-0.5">
                                Ver. {product.version}
                            </p>
                        )}
                    </div>

                    <div className="mt-auto pt-2"> 
                        <div className="flex items-baseline flex-wrap gap-2">
                            <p className="text-[1.2em] font-bold text-[#e91e63] m-0">
                                ${typeof product.price === 'number' ? product.price.toFixed(2) : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};


const MyCollectionPage = () => {
    const [myCollectedProducts, setMyCollectedProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOption, setSortOption] = useState('date_added_desc');

    const MOCK_USER_ID = 2;
    const ITEMS_PER_PAGE = 10; 

    const fetchCollectedProducts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/users/${MOCK_USER_ID}/collections`, {
                params: { sortBy: sortOption }
            });
            setMyCollectedProducts(response.data || []);
        } catch (err) {
            console.error("Error fetching collected products:", err);
            setError(err.response?.data?.message || err.message || 'Không thể tải bộ sưu tập.');
            setMyCollectedProducts([]);
        } finally {
            setIsLoading(false);
        }
    }, [MOCK_USER_ID, sortOption]);

    useEffect(() => {
        fetchCollectedProducts();
    }, [fetchCollectedProducts]);

    const handleRemoveFromCollection = async (productId, productName) => {
        if (!window.confirm(`Bạn có chắc muốn xóa "${productName}" khỏi bộ sưu tập không?`)) {
            return;
        }
        try {
            await axios.delete(`${API_BASE_URL}/users/${MOCK_USER_ID}/collections/${productId}`);
            setMyCollectedProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
            alert(`"${productName}" đã được xóa khỏi bộ sưu tập của bạn.`);

            const newTotalItems = myCollectedProducts.length - 1;
            const newTotalPages = Math.ceil(newTotalItems / ITEMS_PER_PAGE);

            if (currentPage > newTotalPages && newTotalPages > 0) {
                setCurrentPage(newTotalPages);
            } else if (newTotalItems === 0) {
                setCurrentPage(1);
            } else {
                const currentItemsOnPageAfterDeletion = myCollectedProducts.filter(p => p.id !== productId).slice(indexOfFirstItem, indexOfLastItem).length;
                if (currentItemsOnPageAfterDeletion === 0 && currentPage > 1) {
                    setCurrentPage(prev => prev - 1);
                }
             }
        } catch (err) {
            console.error("Error removing product from collection:", err);
            alert(`Lỗi khi xóa sản phẩm: ${err.response?.data?.message || err.message}`);
        }
    };

    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentDisplayProducts = myCollectedProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(myCollectedProducts.length / ITEMS_PER_PAGE);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };


    const handleSortChange = (e) => {
        setSortOption(e.target.value);
        setCurrentPage(1);
    };

    if (isLoading) {
        return (
            <div className="text-center text-lg text-gray-600 p-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
                Đang tải bộ sưu tập của bạn...
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-lg text-red-600 p-10 bg-red-50 shadow rounded-lg">
                <FaTimesCircle className="mx-auto text-4xl text-red-400 mb-4" />
                <p>Đã xảy ra lỗi:</p>
                <p className="text-sm">{error}</p>
                <button
                    onClick={fetchCollectedProducts}
                    className="mt-4 px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-slate-100 to-slate-200 font-['Arial',_sans-serif] min-h-screen">
            <div className="max-w-7xl mx-auto">

                <div className="mb-8 p-4 bg-white shadow rounded-lg text-center">
                    <p className="text-lg text-slate-700">
                        Bạn đã sưu tầm được <span className="font-bold text-pink-600">{myCollectedProducts.length}</span> card.
                    </p>
                </div>

                {myCollectedProducts.length === 0 && !isLoading ? (
                     <div className="text-center text-lg text-gray-500 p-10 bg-white shadow rounded-lg">
                        <FaPlusCircle className="mx-auto text-4xl text-slate-400 mb-4" />
                        Bộ sưu tập của bạn hiện đang trống.
                        <br />
                        <Link to="/products" className="text-indigo-600 hover:text-indigo-800 font-semibold">
                            Khám phá sản phẩm và thêm vào bộ sưu tập ngay!
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4 sm:gap-6">
                            {currentDisplayProducts.map(product => (
                                <SimpleProductCard
                                    key={product.id}
                                    product={product}
                                    onRemove={handleRemoveFromCollection}
                                />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex justify-center items-center mt-8 sm:mt-10 gap-1 sm:gap-2 text-xs sm:text-sm font-medium">
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-2 sm:px-3 py-1 rounded border text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FaChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-0" />
                                    <span className="hidden sm:inline">Trước</span>
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                  .filter(page => { 
                                    if (totalPages <= 5) return true;
                                    if (page <= 2 || page >= totalPages -1 || Math.abs(page - currentPage) <=1){
                                        return true;
                                    }
                                    if ( (currentPage <=3 && page ===3) || (currentPage >= totalPages -2 && page === totalPages -2)){
                                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                                        return <span key={`ellipsis-${page > currentPage ? 'after':'before'}`} className="px-2 sm:px-3 py-1">...</span>;
                                    }
                                    return false;
                                  })
                                  .map((pageOrEllipsis, index, arr) => {
                                      if(typeof pageOrEllipsis === 'number'){
                                          return (
                                            <button
                                                key={pageOrEllipsis}
                                                onClick={() => goToPage(pageOrEllipsis)}
                                                className={`px-2.5 sm:px-3 py-1 rounded border ${currentPage === pageOrEllipsis ? 'bg-pink-500 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
                                            >
                                                {pageOrEllipsis}
                                            </button>
                                          )
                                      }
                                      if(arr[index -1] !== pageOrEllipsis){
                                          return pageOrEllipsis;
                                      }
                                      return null;
                                  })
                                }
                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-2 sm:px-3 py-1 rounded border text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                     <span className="hidden sm:inline">Sau</span>
                                    <FaChevronRight className="h-3 w-3 sm:h-4 sm:w-4 inline ml-1 sm:ml-0" />
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