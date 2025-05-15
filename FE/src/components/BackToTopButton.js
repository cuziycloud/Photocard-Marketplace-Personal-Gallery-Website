import React, { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa'; 

const BackToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        if (window.pageYOffset > 200) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);

        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    return (
        <div className="fixed bottom-6 right-6 z-50"> 
            {isVisible && (
                <button
                    type="button"
                    onClick={scrollToTop}
                    className="bg-pink-600 hover:bg-pink-700 text-white font-bold p-3 rounded-full shadow-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50"
                    aria-label="Go to top"
                >
                    <FaArrowUp size={20} />
                </button>
            )}
        </div>
    );
};

export default BackToTopButton;