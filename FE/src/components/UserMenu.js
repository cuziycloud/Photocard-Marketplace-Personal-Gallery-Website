import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaBoxOpen } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const UserMenu = ({ isDark, mobileContext = false, closeMobileMenu = () => {} }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const toggleDropdown = (e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const handleLogout = async () => {
        setIsOpen(false);
        if (mobileContext && typeof closeMobileMenu === 'function') {
            closeMobileMenu();
        }
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error("Failed to logout:", error);
        }
    };

    const handleMenuClick = () => {
        setIsOpen(false);
        if (mobileContext && typeof closeMobileMenu === 'function') {
            closeMobileMenu();
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const iconColorClass = isDark ? 'text-gray-200 hover:text-white' : 'text-gray-600 hover:text-indigo-600';
    const dropdownBgClass = isDark ? 'bg-gray-900' : 'bg-white';
    const dropdownTextClass = isDark
        ? 'text-gray-200 hover:bg-gray-800 hover:text-white'
        : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600';
    const dropdownBorderClass = isDark ? 'border-gray-700' : 'border-gray-200';
    const textColorPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textColorSecondary = isDark ? 'text-gray-400' : 'text-gray-500';

    if (!currentUser) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className={`flex items-center p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    isDark ? 'focus:ring-white focus:ring-offset-gray-900' : 'focus:ring-indigo-500 focus:ring-offset-white'
                } ${iconColorClass} transition duration-200 ease-in-out hover:scale-105`}
                aria-label="User menu"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <FaUserCircle className="h-8 w-8" />
                {mobileContext && (
                    <span className={`ml-3 text-base font-medium truncate max-w-[120px] ${textColorPrimary}`}>
                        {currentUser.username || 'Account'}
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    className={`absolute ${mobileContext ? 'left-0' : 'right-0'} mt-3 w-60 rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 ${dropdownBgClass} z-50 transform transition-all duration-300 ease-in-out`}
                    role="menu"
                    aria-orientation="vertical"
                >
                    <div className="py-3">
                        <div className={`px-5 py-4 border-b ${dropdownBorderClass}`}>
                            <div className="flex items-center gap-x-2">
                                <p className={`text-sm font-medium ${textColorSecondary}`}>
                                    Signed in as:
                                </p>
                                <p className={`text-sm font-semibold truncate ${textColorPrimary}`}>
                                    {currentUser.username || currentUser.email}
                                </p>
                            </div>
                        </div>

                        <Link
                            to="/profile"
                            onClick={handleMenuClick}
                            className={`flex items-center px-5 py-3 text-sm font-medium w-full ${dropdownTextClass} transition duration-150 ease-in-out rounded-md mx-2 mt-2`}
                            role="menuitem"
                        >
                            <FaUserCircle className="mr-3 h-5 w-5" />
                            Profile
                        </Link>

                        <Link
                            to="/myorder"
                            onClick={handleMenuClick}
                            className={`flex items-center px-5 py-3 text-sm font-medium w-full ${dropdownTextClass} transition duration-150 ease-in-out rounded-md mx-2`}
                            role="menuitem"
                        >
                            <FaBoxOpen className="mr-3 h-5 w-5" />
                            My Orders
                        </Link>

                        <button
                            onClick={handleLogout}
                            className={`flex items-center px-5 py-3 text-sm font-medium w-full ${dropdownTextClass} transition duration-150 ease-in-out rounded-md mx-2 mb-2`}
                            role="menuitem"
                        >
                            <FaSignOutAlt className="mr-3 h-5 w-5" />
                            Sign out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
