import React, { useState, useEffect } from 'react';
import productService from '../services/productService';
import { Link } from 'react-router-dom';
import { FaRegHeart, FaHeart } from 'react-icons/fa';
import { useCategory } from '../contexts/CategoryContext';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [favorites, setFavorites] = useState({});
    const { selectedCategory } = useCategory();

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const groupId = selectedCategory ? selectedCategory.id : null;
                const response = await productService.getAllProducts(groupId);
                setProducts(Array.isArray(response.data) ? response.data : (response.data.content || []));
            } catch (err) {
                setError("Không thể tải danh sách sản phẩm.");
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        if (selectedCategory) {
            fetchProducts();
        }
    }, [selectedCategory]);

    const toggleFavorite = (productId) => {
        setFavorites(prev => ({ ...prev, [productId]: !prev[productId] }));
    };

    if (loading) return (
        <div className="text-center text-lg text-gray-600 p-5 font-['Arial',_sans-serif]">
            Đang tải sản phẩm...
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mt-3"></div>
        </div>
    );

    if (error) return (
        <div className="text-center text-lg text-red-600 p-5 font-['Arial',_sans-serif] font-semibold">
            {error}
        </div>
    );

    if (products.length === 0 && !loading) return (
        <div className="text-center text-lg text-gray-600 p-5 font-['Arial',_sans-serif]">
            Không tìm thấy sản phẩm nào
            {selectedCategory && selectedCategory.name !== 'Tất cả' ? ` cho nhóm "${selectedCategory.name}"` : ''}.
        </div>
    );

    return (
        <div className="p-5 bg-gradient-to-br from-slate-100 to-slate-200 font-['Arial',_sans-serif] min-h-screen">
            {selectedCategory && selectedCategory.name && (
                <h2
                    className="text-center mb-7 text-3xl font-bold text-gray-800"
                >
                    {selectedCategory.name === 'Tất cả' || !selectedCategory.name
                        ? 'Tất cả Sản Phẩm'
                        : `Sản phẩm nhóm: ${selectedCategory.name}`}
                </h2>
            )}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-6">
                {products.map(product => (
                    <div
                        key={product.id}
                        className="bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 ease-in-out hover:translate-y-[-6px] hover:scale-[1.02] hover:shadow-xl"
                    >
                        <Link to={`/product/${product.id}`} className="flex flex-col h-full text-inherit no-underline">
                            <div className="group relative w-full"> 
                                <div style={{ paddingTop: '135%' }} />
                                    <div className="absolute inset-0 bg-[#f1f3f6] p-[50px] box-border flex justify-center items-center overflow-hidden border-b border-[#ddd]">
                                        <img
                                            src={product.imageUrl || 'https://via.placeholder.com/300x400?text=No+Image'}
                                            alt={product.name}
                                            className="block max-w-full max-h-full object-cover rounded-lg transition-transform duration-300 ease-in-out group-hover:scale-105"
                                        />
                                    </div>

                                <button
                                    className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm border-none rounded-full w-[34px] h-[34px] flex items-center justify-center cursor-pointer text-2xl text-slate-400 shadow-md transition-all duration-200 ease-in-out hover:text-pink-500 hover:bg-white"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        toggleFavorite(product.id);
                                    }}
                                    aria-label="Yêu thích"
                                >
                                    {favorites[product.id] ? <FaHeart className="block w-[1em] h-[1em]" style={{ color: '#ff4d6d' }} /> : <FaRegHeart className="block w-[1em] h-[1em]" />}
                                </button>
                            </div>

                            <div className="p-[15px_18px_18px_18px] text-left flex-grow flex flex-col justify-between">
                                <div>
                                    {product.group && (
                                        <p className="text-[0.9em] font-medium text-gray-500 mb-[2px]">{product.group.name}</p>
                                    )}
                                    <h3 className="text-[1.05em] font-semibold text-slate-800 mb-2 leading-tight min-h-[calc(1.05em*1.3*2)] overflow-hidden"> 
                                        <span className="line-clamp-2">{product.name}</span>
                                    </h3>
                                    {product.version && <p className="text-xs text-slate-500">{product.version}</p>}
                                </div>

                                <div className="mt-auto"> 
                                    <div className="flex items-baseline flex-wrap gap-2">
                                        <p className="text-[1.2em] font-bold text-[#e91e63] m-0"> 
                                            ${typeof product.price === 'number' ? product.price.toFixed(2) : 'N/A'}
                                        </p>
                                    </div>
                                    <p className="text-xs text-slate-600 mt-1">
                                        Còn lại: {product.stockQuantity}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductList;