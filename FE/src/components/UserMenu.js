import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaCog } from 'react-icons/fa'; 
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

    const handleMenuClick = (action) => {
        setIsOpen(false);
        if (mobileContext && typeof closeMobileMenu === 'function') {
            closeMobileMenu();
        }
        if (action) {
            action();
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


    const iconColorClass = isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-indigo-600';
    const dropdownBgClass = isDark ? 'bg-gray-700' : 'bg-white';
    const dropdownTextClass = isDark ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100';
    const dropdownBorderClass = isDark ? 'border-gray-600' : 'border-gray-200';

    if (!currentUser) {
        return null;
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className={`p-2 rounded-full focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-white' : 'focus:ring-indigo-500'} ${iconColorClass} flex items-center`}
                aria-label="User menu"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <FaUserCircle className="h-6 w-6" />
                {mobileContext && <span className="ml-2 text-sm">{currentUser.username || 'Account'}</span>}
            </button>

            {isOpen && (
                <div 
                    className={`absolute ${mobileContext ? 'left-0' : 'right-0'} mt-2 w-48 rounded-md shadow-xl ${dropdownBgClass} ring-1 ring-black ring-opacity-5 focus:outline-none z-50`}
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                >
                    <div className="py-1" role="none">
                        <div className={`px-4 py-3 ${mobileContext ? '' : `border-b ${dropdownBorderClass}`}`}>
                            <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`} role="none">
                                Signed in as
                            </p>
                            <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} truncate`} role="none">
                                {currentUser.username || currentUser.email}
                            </p>
                        </div>
                        <Link
                            to="/profile"
                            className={`block px-4 py-2 text-sm ${dropdownTextClass}`}
                            role="menuitem"
                            onClick={() => handleMenuClick(() => navigate('/profile'))}
                        >
                            <FaCog className="inline mr-2 h-4 w-4" />
                            Profile
                        </Link>
                        <button
                            onClick={handleLogout}
                            className={`block w-full text-left px-4 py-2 text-sm ${dropdownTextClass}`}
                            role="menuitem"
                        >
                             <FaSignOutAlt className="inline mr-2 h-4 w-4" />
                            Sign out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMenu;