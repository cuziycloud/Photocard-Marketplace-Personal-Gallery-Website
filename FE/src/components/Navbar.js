import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FaMusic, FaBars, FaTimes, FaShoppingCart, FaSearch } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { cartItemCount, loadingCart } = useCart();

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => { 
        if (isMobileMenuOpen) {
            setIsMobileMenuOpen(false);
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50); 
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinkClasses = ({ isActive }) =>
        `px-4 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
            isActive
                ? (isScrolled || isMobileMenuOpen ? 'text-white bg-indigo-700' : 'text-indigo-600 underline underline-offset-4 decoration-2 decoration-indigo-600')
                : (isScrolled || isMobileMenuOpen ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:text-indigo-600')
        }`;

    const mobileNavLinkClasses = ({ isActive }) =>
        `block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
            isActive
                ? 'bg-indigo-600 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`;

    const actionButtonClasses = `p-3 rounded-full transition-colors ${
        isScrolled || isMobileMenuOpen
            ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
            : 'text-gray-600 hover:bg-gray-200 hover:text-indigo-600'
    }`;

    return (
        <nav
            className={`fixed w-full z-50 transition-all duration-300 ease-in-out ${
                isScrolled || isMobileMenuOpen ? 'bg-gray-800 shadow-lg' : 'bg-white/90 backdrop-blur-md shadow-sm' 
            }`}
        >
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link
                            to="/"
                            onClick={closeMobileMenu}
                            className={`flex items-center group ${isScrolled || isMobileMenuOpen ? 'text-white' : 'text-gray-900'} hover:text-green-500 transition-colors`}
                        >
                            <img
                            src="/assets/img/bite.png"
                            alt="Logo"
                            className="h-10 w-10 mr-2 object-contain transition-transform duration-300 group-hover:scale-110"
                            />
                            <span className="font-bold text-2xl tracking-wide">K-Clz</span>
                        </Link>
                    </div>

                    {/* Desktop Menu Links */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-6">
                            <NavLink to="/" className={navLinkClasses} onClick={closeMobileMenu}>
                                Home
                            </NavLink>
                            <NavLink to="/gallery" className={navLinkClasses} onClick={closeMobileMenu}>
                                Gallery
                            </NavLink>
                            <NavLink to="/collection" className={navLinkClasses} onClick={closeMobileMenu}>
                                Collection
                            </NavLink>
                            <NavLink to="/wishlist" className={navLinkClasses} onClick={closeMobileMenu}>
                                Wishlist
                            </NavLink>
                            {/* <NavLink to="/bubble" className={navLinkClasses} onClick={closeMobileMenu}>
                                Bubble
                            </NavLink> */}
                        </div>
                    </div>

                    {/* Desktop Action Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link to="/cart" aria-label="Cart" className={`${actionButtonClasses} relative`}>
                            <FaShoppingCart className="h-6 w-6" />
                            { !loadingCart && cartItemCount > 0 && ( // Kiểm tra loadingCart để tránh hiển thị số 0 tạm thời
                                <span className="absolute -top-0.5 -right-0.5 px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                                    {cartItemCount}
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={toggleMobileMenu}
                            type="button"
                            className={`inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white ${actionButtonClasses}`}
                            aria-controls="mobile-menu"
                            aria-expanded={isMobileMenuOpen}
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMobileMenuOpen ? (
                                <FaTimes className="block h-6 w-6" aria-hidden="true" />
                            ) : (
                                <FaBars className="block h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Content */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-20 inset-x-0 bg-gray-800 pb-3 sm:pb-4 shadow-lg transition transform origin-top" id="mobile-menu">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <NavLink to="/" className={mobileNavLinkClasses} onClick={closeMobileMenu}>
                            Home
                        </NavLink>
                        <NavLink to="/products" className={mobileNavLinkClasses} onClick={closeMobileMenu}>
                            Shop
                        </NavLink>
                        <NavLink to="/collection" className={mobileNavLinkClasses} onClick={closeMobileMenu}>
                            Collections
                        </NavLink>
                        <NavLink to="/contact" className={mobileNavLinkClasses} onClick={closeMobileMenu}>
                            Contact
                        </NavLink>
                    </div>
                    {/* Mobile Actions */}
                    <div className="pt-4 pb-3 border-t border-gray-700">
                        <div className="flex items-center justify-center space-x-4 px-5">
                            <button aria-label="Search" className="p-2 rounded-full text-gray-300 hover:bg-gray-700 hover:text-white">
                                <FaSearch className="h-6 w-6" />
                            </button>
                            <Link
                                to="/cart"
                                aria-label="Cart"
                                className="p-2 rounded-full text-gray-300 hover:bg-gray-700 hover:text-white relative"
                                onClick={closeMobileMenu}
                            >
                                <FaShoppingCart className="h-6 w-6" />
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">3</span>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
