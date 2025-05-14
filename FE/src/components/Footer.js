// src/components/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaRegCopyright } from 'react-icons/fa';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer-container">
            <div className="footer-content">
                <div className="footer-section about">
                    <h2 className="footer-logo">
                        <Link to="/">K-CARDS</Link>
                    </h2>
                    <p>
                        Chuyên cung cấp card K-Pop chính hãng, đa dạng từ nhiều nhóm nhạc.
                        Tìm kiếm những tấm card yêu thích của bạn tại đây!
                    </p>
                    <div className="contact-details">
                        <span><MdPhone />   (+84) 123 456 789</span>
                        <span><MdEmail />   support@kcards.com</span>
                        <span><MdLocationOn />   123 Đường ABC, Quận XYZ, TP.HCM</span>
                    </div>
                </div>

                <div className="footer-section links">
                    <h3>Liên Kết Nhanh</h3>
                    <ul>
                        <li><Link to="/products">Sản Phẩm</Link></li>
                        <li><Link to="/new-arrivals">Hàng Mới Về</Link></li>
                        <li><Link to="/faqs">Câu Hỏi Thường Gặp</Link></li>
                        <li><Link to="/terms-of-service">Điều Khoản Dịch Vụ</Link></li>
                        <li><Link to="/privacy-policy">Chính Sách Bảo Mật</Link></li>
                    </ul>
                </div>

                <div className="footer-section social">
                    <h3>Kết Nối Với Chúng Tôi</h3>
                    <div className="social-icons">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                            <FaFacebookF />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <FaInstagram />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                            <FaTwitter />
                        </a>
                        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                            <FaYoutube />
                        </a>
                    </div>
                    <div className="newsletter-signup">
                        <h4>Đăng Ký Nhận Tin</h4>
                        <form>
                            <input type="email" name="email" placeholder="Nhập email của bạn..." />
                            <button type="submit">Đăng Ký</button>
                        </form>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>
                    <FaRegCopyright /> {currentYear} K-CARDS Store. All Rights Reserved.
                </p>
                <p>
                    Thiết kế bởi <a href="https://your-portfolio-link.com" target="_blank" rel="noopener noreferrer">Tên Của Bạn</a>
                </p>
            </div>
        </footer>
    );
};

export default Footer;