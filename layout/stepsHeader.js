import ApplicationLogo from '@/config/ApplicationLogo';
import React, { useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

const StepsHeader = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="relative">
            {/* Header */}
            <div className="flex justify-between items-start bg-white text-white px-4 py-3">
              

                <ApplicationLogo width={120} height={60} />

                <div className="relative">
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="flex items-center gap-2 text-white focus:outline-none"
                    >
                        <div className="w-8 h-8 bg-purple-300 text-xs rounded-full flex items-center justify-center text-white">S</div>
                        <span className="hidden sm:block">Jack</span>
                    </button>

                    {/* Sidebar Dropdown */}
                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-ivory border border-gray-200 rounded-md shadow-lg z-50">
                            <div className="p-4 bg-violet-700 text-white flex items-center gap-2">
                                <div className="w-8 h-8 bg-purple-300 text-xs rounded-full flex items-center justify-center">S</div>
                                <span>Shelly</span>
                            </div>
                            <ul className="bg-[#fdfcf5] text-viobg-violet-700 px-4 py-2 space-y-2 font-serif">
                                <li className="border-b border-gray-300 pb-2"><a href="#">• Treatment plans</a></li>
                                <li className="border-b border-gray-300 pb-2"><a href="#">• Account settings</a></li>
                                <li><a href="#">• Logout</a></li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StepsHeader;
