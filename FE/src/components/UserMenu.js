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
    const dropdownItemBaseClass = isDark
        ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
        : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600';
    const dropdownBorderClass = isDark ? 'border-gray-700' : 'border-gray-200';
    const textColorPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textColorSecondary = isDark ? 'text-gray-400' : 'text-gray-500';

    if (!currentUser) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className={`flex items-center p-1.5 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 ${ 
                    isDark ? 'focus:ring-white focus:ring-offset-gray-900' : 'focus:ring-indigo-500 focus:ring-offset-white'
                } ${iconColorClass} transition duration-200 ease-in-out hover:scale-105`}
                aria-label="User menu"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <FaUserCircle className="h-7 w-7" />
                {mobileContext && (
                    <span className={`ml-2 text-sm font-medium truncate max-w-[120px] ${textColorPrimary}`}> 
                        {currentUser.username || 'Account'}
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    className={`absolute ${mobileContext ? 'left-0' : 'right-0'} mt-2 w-60 rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 ${dropdownBgClass} z-50 transform transition-all duration-300 ease-in-out overflow-hidden`} // mt-2, rounded-lg, shadow-xl
                    role="menu"
                    aria-orientation="vertical"
                >
                    <div>
                        <div className={`px-4 py-3 border-b ${dropdownBorderClass}`}> 
                            <div className="flex items-center gap-x-2">
                                <p className={`text-xs font-medium ${textColorSecondary}`}>
                                    Signed in as:
                                </p>
                                <p className={`text-xs font-semibold truncate ${textColorPrimary}`}>
                                    {currentUser.username || currentUser.email}
                                </p>
                            </div>
                        </div>

                        <div className="p-1.5 space-y-1">
                            <Link
                                to="/profile"
                                onClick={handleMenuClick}
                                className={`flex items-center px-2.5 py-2 text-sm font-medium w-full ${dropdownItemBaseClass} transition duration-150 ease-in-out rounded-md`}
                                role="menuitem"
                            >
                                <FaUserCircle className="mr-2.5 h-4 w-4" /> 
                                Profile
                            </Link>

                            <Link
                                to="/myorder"
                                onClick={handleMenuClick}
                                className={`flex items-center px-2.5 py-2 text-sm font-medium w-full ${dropdownItemBaseClass} transition duration-150 ease-in-out rounded-md`}
                                role="menuitem"
                            >
                                <FaBoxOpen className="mr-2.5 h-4 w-4" />
                                My Orders
                            </Link>

                            <button
                                onClick={handleLogout}
                                className={`flex items-center px-2.5 py-2 text-sm font-medium w-full ${dropdownItemBaseClass} transition duration-150 ease-in-out rounded-md`}
                                role="menuitem"
                            >
                                <FaSignOutAlt className="mr-2.5 h-4 w-4" />
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMenu;