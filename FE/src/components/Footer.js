import { FaRegCopyright } from 'react-icons/fa'; 

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-800 text-slate-300 py-6 sm:py-8">
            <div className="container mx-auto px-4 text-center">
                <div className="flex items-center justify-center text-sm">
                    <FaRegCopyright className="mr-1.5 h-4 w-4" />
                    <span>{currentYear} K-Clz. All about Yujin.</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;