import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Home,
    Package,
    ShoppingBag,
    Users,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Menu
} from 'lucide-react';
import Restaurant from "../../../pages/Restaurant/Restaurant.tsx";
import { useAuth } from '../../../services/auth/authContext.tsx'; // Import path may need adjustment

interface SidebarProps {
    isMobile?: boolean;
    restaurant?: Restaurant;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobile = false, restaurant }) => {
    // Changed initial state to false (collapsed) regardless of device type
    const [isExpanded, setIsExpanded] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth(); // Get logout function from authentication context

    const toggleSidebar = () => {
        setIsExpanded(!isExpanded);
    };

    const sidebarVariants = {
        expanded: { width: '240px' },
        collapsed: { width: '72px' }
    };

    const menuItems = [
        { title: 'Dashboard', icon: <Home size={20} />, path: '/owner-restaurant' },
        { title: 'Food Items', icon: <Package size={20} />, path: `/${restaurant?.restaurantId}/fooditems` },
        { title: 'Settings', icon: <Settings size={20} />, path: '/settings' },
    ];

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    // Handle logout with redirect to login page
    const handleLogout = () => {
        logout(() => {
            navigate('/login'); // Redirect to login page after logout
        });
    };

    return (
        <>
            {/* Mobile toggle button - visible only on small screens */}
            {isMobile && (
                <button
                    className="fixed z-30 top-4 left-4 p-2 rounded-full bg-white shadow-md lg:hidden"
                    onClick={toggleSidebar}
                >
                    <Menu size={20} />
                </button>
            )}

            {/* Overlay for mobile */}
            {isMobile && isExpanded && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <motion.div
                className={`fixed top-0 left-0 z-20 h-screen bg-white shadow-md flex flex-col ${
                    isMobile ? (isExpanded ? 'translate-x-0' : '-translate-x-full') : ''
                } transition-transform duration-300 ease-in-out`}
                animate={isExpanded ? 'expanded' : 'collapsed'}
                variants={sidebarVariants}
                initial="collapsed" // Changed to always start collapsed
            >
                {/* Logo and toggle button */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    {isExpanded && (
                        <div className="text-lg font-bold text-orange-500">Restaurant</div>
                    )}
                    {!isMobile && (
                        <button
                            className={`p-2 rounded-full hover:bg-gray-100 ${!isExpanded ? 'mx-auto' : ''}`}
                            onClick={toggleSidebar}
                        >
                            {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                        </button>
                    )}
                </div>

                {/* Navigation Menu */}
                <div className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-2 px-2">
                        {menuItems.map((item, index) => (
                            <li key={index}>
                                <motion.button
                                    className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                                        isActive(item.path)
                                            ? 'bg-orange-100 text-orange-700'
                                            : 'hover:bg-gray-100 text-gray-700'
                                    }`}
                                    onClick={() => {
                                        navigate(item.path);
                                        if (isMobile) setIsExpanded(false);
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className={`${!isExpanded ? 'mx-auto' : ''}`}>
                                        {item.icon}
                                    </div>
                                    {isExpanded && <span className="ml-3">{item.title}</span>}
                                </motion.button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Logout Button */}
                <div className="p-4 border-t border-gray-200">
                    <motion.button
                        className="flex items-center w-full p-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogout}
                    >
                        <div className={`${!isExpanded ? 'mx-auto' : ''}`}>
                            <LogOut size={20} />
                        </div>
                        {isExpanded && <span className="ml-3">Logout</span>}
                    </motion.button>
                </div>
            </motion.div>
        </>
    );
};

export default Sidebar;