import React, { useState, useRef, useEffect } from 'react';
import {
    Search,
    Bell,
    User,
    Settings,
    HelpCircle,
    LogOut,
    ChevronDown,
    Moon,
    Sun,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../services/auth/authContext.tsx'; // Update with the correct path
import { useNavigate } from 'react-router-dom'; // Import router navigation

interface AdminNavbarProps {
    // Add optional props for sidebar toggle functionality
    onToggleSidebar?: () => void;
    sidebarOpen?: boolean;
}

const AdminNavbar: React.FC<AdminNavbarProps> = () => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);

    // Auth context and navigation
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const notificationRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    // Handle clicks outside of dropdown menus
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setShowProfile(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Handle logout
    const handleLogout = () => {
        logout(() => {
            // Redirect to login page after logout
            navigate('/login');
        });
    };

    const notifications = [
        { id: 1, text: 'New restaurant application submitted', time: '5 min ago', unread: true },
        { id: 2, text: 'Order #2458 reported an issue', time: '23 min ago', unread: true },
        { id: 3, text: 'Monthly sales report is ready', time: '2 hours ago', unread: false },
        { id: 4, text: 'Driver #126 is unavailable today', time: '5 hours ago', unread: false },
    ];

    const unreadCount = notifications.filter(n => n.unread).length;

    const dropdownVariants = {
        hidden: { opacity: 0, y: -5, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1 }
    };

    // Get user display name or email
    const userDisplayName = user?.name || user?.sub || 'Admin User';
    const userEmail = user?.email || user?.sub || 'admin@foodapp.com';

    return (
        <nav className="bg-white border-b rounded-3xl border-gray-200 fixed w-[calc(100%-300px)] z-30 mt-2 shadow-sm ml-5">
            <div className="max-w-full mx-auto px-5 ">
                <div className="flex items-center justify-between h-16">

                    {/* Search Bar */}
                    <div className="flex-1 max-w-xl ml-8">
                        <div className={`relative ${searchFocused ? 'ring-2 ring-orange-200' : ''}`}>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={18} className="text-gray-400" />
                            </div>
                            <motion.input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
                                placeholder="Search restaurants, orders, customers..."
                                whileFocus={{ scale: 1.01 }}
                                transition={{ duration: 0.2 }}
                                onFocus={() => setSearchFocused(true)}
                                onBlur={() => setSearchFocused(false)}
                            />
                        </div>
                    </div>

                    {/* Right side icons */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Theme Toggle */}
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {/* Notifications */}
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors relative"
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div
                                        className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 border border-gray-200 z-50"
                                        variants={dropdownVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="hidden"
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                                            <h3 className="font-medium">Notifications</h3>
                                            <button className="text-xs text-blue-500 hover:text-blue-700">
                                                Mark all as read
                                            </button>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.map(notification => (
                                                <div
                                                    key={notification.id}
                                                    className={`px-4 py-3 border-b border-gray-100 last:border-0 ${notification.unread ? 'bg-orange-50' : ''}`}
                                                >
                                                    <div className="flex items-start">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm text-gray-800">{notification.text}</p>
                                                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                                                        </div>
                                                        {notification.unread && (
                                                            <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="px-4 py-2 border-t border-gray-100">
                                            <button className="text-sm text-center w-full text-gray-600 hover:text-gray-800">
                                                View all notifications
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Profile Dropdown */}
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setShowProfile(!showProfile)}
                                className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
                            >
                                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                                    <User size={18} className="text-orange-500" />
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-medium text-gray-700">{userDisplayName}</p>
                                    <p className="text-xs text-gray-500">{userEmail}</p>
                                </div>
                                <ChevronDown size={16} className={`text-gray-500 transition-transform ${showProfile ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {showProfile && (
                                    <motion.div
                                        className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 border border-gray-200 z-50"
                                        variants={dropdownVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="hidden"
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-sm font-medium text-gray-800">{userDisplayName}</p>
                                            <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                                        </div>
                                        <div className="py-1">
                                            <button className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                                                <User size={16} />
                                                <span>My Profile</span>
                                            </button>
                                            <button className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                                                <Settings size={16} />
                                                <span>Account Settings</span>
                                            </button>
                                            <button className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                                                <HelpCircle size={16} />
                                                <span>Help Center</span>
                                            </button>
                                        </div>
                                        <div className="py-1 border-t border-gray-100">
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                            >
                                                <LogOut size={16} />
                                                <span>Sign out</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default AdminNavbar;