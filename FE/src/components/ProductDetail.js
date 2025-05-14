import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; 
import productService from '../services/productService';
import './ProductDetail.css'; 

const ProductDetail = () => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { productId } = useParams(); 

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await productService.getProductById(productId);
                setProduct(response.data);
                setError(null);
            } catch (err) {
                console.error("Error fetching product:", err);
                setError("Không thể tải thông tin sản phẩm.");
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchProduct();
        }
    }, [productId]); 

    if (loading) return <p>Đang tải chi tiết sản phẩm...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!product) return <p>Không tìm thấy sản phẩm.</p>;

    return (
        <div className="product-detail-container">
            <Link to="/" className="back-link">← Quay lại danh sách</Link>
            <h2>{product.name}</h2>
            <div className="product-detail-content">
                <img src={product.imageUrl || 'https://via.placeholder.com/300?text=No+Image'} alt={product.name} className="product-detail-image" />
                <div className="product-detail-info">
                    <p><strong>Mô tả:</strong> {product.description}</p>
                    <p><strong>Giá:</strong> ${product.price.toFixed(2)}</p>
                    <p><strong>Số lượng còn lại:</strong> {product.stockQuantity}</p>
                    <button className="add-to-cart-button">Thêm vào giỏ hàng</button>
                </div>
            </div>
        </div>
    );
};
export default ProductDetail;