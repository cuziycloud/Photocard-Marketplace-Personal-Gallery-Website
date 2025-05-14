// src/components/ProductList.js
import React, { useState, useEffect } from 'react';
import productService from '../services/productService';
import { Link } from 'react-router-dom';
import './ProductList.css'; // Import CSS
// Import icon trái tim (ví dụ từ react-icons)
// Chạy: npm install react-icons
import { FaRegHeart, FaHeart } from 'react-icons/fa'; // FaRegHeart: rỗng, FaHeart: đầy

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // State để quản lý trạng thái yêu thích (ví dụ đơn giản, thực tế cần lưu trữ)
    const [favorites, setFavorites] = useState({});

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await productService.getAllProducts();
                setProducts(response.data);
                setError(null);
            } catch (err) {
                console.error("Error fetching products:", err);
                setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const toggleFavorite = (productId) => {
        setFavorites(prevFavorites => ({
            ...prevFavorites,
            [productId]: !prevFavorites[productId]
        }));
        // Trong ứng dụng thực tế, bạn sẽ gọi API để lưu trạng thái yêu thích
        console.log(`Toggled favorite for product ${productId}`);
    };

    if (loading) return <p className="status-message">Đang tải sản phẩm...</p>;
    if (error) return <p className="status-message error-message">{error}</p>;
    if (products.length === 0) return <p className="status-message">Không có sản phẩm nào để hiển thị.</p>;

    return (
        <div className="product-list-page">
            <h2 className="page-title">Danh sách Card K-Pop</h2>
            <div className="product-grid">
                {products.map(product => (
                    <div key={product.id} className="product-card">
                        <Link to={`/product/${product.id}`} className="product-card-link">
                            <div className="product-image-container">
                                <img
                                    src={product.imageUrl || 'https://via.placeholder.com/300x400?text=No+Image'}
                                    alt={product.name}
                                    className="product-image"
                                />
                                <button
                                    className="favorite-button"
                                    onClick={(e) => {
                                        e.preventDefault(); // Ngăn Link chuyển hướng khi click icon
                                        e.stopPropagation(); // Ngăn sự kiện nổi bọt lên Link
                                        toggleFavorite(product.id);
                                    }}
                                    aria-label="Yêu thích"
                                >
                                    {favorites[product.id] ? <FaHeart color="red" /> : <FaRegHeart />}
                                </button>
                            </div>
                            <div className="product-info">
                                <h3 className="product-name">{product.name}</h3>
                                {/* Nếu có thông tin phiên bản hoặc mô tả ngắn gọn */}
                                {product.version && <p className="product-version">{product.version}</p>}
                                <p className="product-price">Giá: ${product.price.toFixed(2)}</p>
                                <p className="product-stock">Còn lại: {product.stockQuantity}</p>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductList;