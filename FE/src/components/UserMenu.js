// components/UserMenu.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';

const UserMenu = ({ isDark }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => setIsOpen(!isOpen);
    const closeDropdown = () => setIsOpen(false);

    return (
        <div className="relative inline-block text-left">
            <button
                onClick={toggleDropdown}
                className={`p-3 rounded-full transition-colors focus:outline-none ${
                    isDark ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-200 hover:text-indigo-600'
                }`}
                aria-haspopup="true"
            >
                <FaUserCircle className="h-6 w-6" />
            </button>

            {isOpen && (
                <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                    onMouseLeave={closeDropdown}
                >
                    <div className="py-1" role="menu">
                        <Link
                            to="/profile"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                            onClick={closeDropdown}
                        >
                            View Profile
                        </Link>
                        <Link
                            to="/account"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                            onClick={closeDropdown}
                        >
                            Account Settings
                        </Link>
                        <Link
                            to="/logout"
                            className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            role="menuitem"
                            onClick={closeDropdown}
                        >
                            Logout
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
