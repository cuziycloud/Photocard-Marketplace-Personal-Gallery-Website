// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">K-Pop Card Store</Link>
            <ul className="navbar-nav">
                <li className="nav-item">
                    <Link to="/products" className="nav-link">Sản phẩm</Link>
                </li>
                {/* Thêm các link khác sau: Giỏ hàng, Đăng nhập,... */}
            </ul>
        </nav>
    );
};
export default Navbar;