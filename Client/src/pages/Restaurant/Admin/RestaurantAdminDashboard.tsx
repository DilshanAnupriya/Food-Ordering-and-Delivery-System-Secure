import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../components/layout/AdminSideBar';
import AdminNavbar from '../../../components/admin/AdminNavbar.tsx';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Eye, Clock, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { fetchRestaurants } from "../../../services/Restaurants/LoadAllRestaurants.ts";
import { API_BASE_URL } from '../../../services/Common/Common'; // Import API_BASE_URL

// Updated interface to match backend data structure
interface Restaurant {
    restaurantId: string;
    restaurantName: string;
    restaurantAddress: string;
    restaurantPhone: string;
    restaurantEmail: string;
    active: boolean;             // restaurant open/closed
    orderAvailability: boolean;// accepting orders
    availability: boolean;
    rating: number;
    imageUrl: string;
    description: string;
    city: string;
    openingTime: string;
    closingTime: string;
    restaurantType: string;
    createdAt: string;
    updatedAt: string;
}

const RestaurantDashboard: React.FC = () => {
    // State management
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>('');
    const [searchText, setSearchText] = useState('');
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [debouncedSearchText, setDebouncedSearchText] = useState<string>('');
    const [totalItems, setTotalItems] = useState<number>(0);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchText(searchText);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchText]);

    // Fetch restaurants data
    useEffect(() => {
        const getRestaurants = async () => {
            try {
                setLoading(true);
                const data = await fetchRestaurants(debouncedSearchText, page, size);
                setRestaurants(data.restaurants);
                setTotalItems(data.totalItems);
                setTotalPages(Math.ceil(data.totalItems / size));
                setError(null);

                // Added logging to debug
                console.log('Restaurant data:', {
                    data: data.restaurants,
                    restaurants: data.restaurants.length,
                    totalItems: data.totalItems,
                    currentPage: page,
                    pageSize: size
                });

            } catch (err) {
                setError('An error occurred while fetching restaurants');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        getRestaurants();
    }, [page, size, debouncedSearchText]);

    // Format time (e.g., "08:00:00" to "8:00 AM")
    const formatTime = (timeString: string) => {
        if (!timeString) return "";

        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;

        return `${formattedHour}:${minutes} ${ampm}`;
    };

    // Handle restaurant deletion - FIXED
    const handleDeleteRestaurant = async (id: string) => {
        console.log("Deleting restaurant with ID:", id);

        if (window.confirm('Are you sure you want to delete this restaurant?')) {
            try {
                // Use the API_BASE_URL instead of relative path
                const response = await axios.delete(`${API_BASE_URL}/restaurants/${id}`);

                console.log("Delete response:", response);

                if (response.status === 204 || (response.data && response.data.code === 204)) {
                    // Remove restaurant from state
                    setRestaurants(restaurants.filter(restaurant => restaurant.restaurantId !== id));
                    // Show success message
                    alert('Restaurant deleted successfully!');
                } else {
                    setError('Failed to delete restaurant');
                }
            } catch (err) {
                console.error("Error deleting restaurant:", err);
                setError('An error occurred while deleting the restaurant');
                alert('Failed to delete restaurant. Please try again later.');
            }
        }
    };

    // Animations
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 10
            }
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <AdminSidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Navbar */}
                <AdminNavbar
                    onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                    sidebarOpen={sidebarOpen}
                />
                {/* Main content area */}
                <div className="flex-1 overflow-auto pt-16 px-6 pb-6">
                    {/* Header */}
                    <div className="flex justify-between items-center my-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Restaurant Management</h1>
                            <p className="text-gray-600 mt-1">Manage all restaurants in your platform</p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md"
                            onClick={() => navigate('/restaurant/create')}
                        >
                            <Plus size={18} />
                            Add New Restaurant
                        </motion.button>
                    </div>

                    {/* Search and filters */}
                    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-500 focus:outline-none"
                                    placeholder="Search restaurants by name, location..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <select
                                    className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 focus:outline-none"
                                    onChange={(e) => setSize(Number(e.target.value))}
                                    value={size}
                                >
                                    <option value="5">5 per page</option>
                                    <option value="10">10 per page</option>
                                    <option value="20">20 per page</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Restaurant grid */}
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 p-4 rounded-lg flex items-start gap-3">
                            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                            <div>
                                <h3 className="font-medium text-red-800">Error</h3>
                                <p className="text-red-700">{error}</p>
                            </div>
                        </div>
                    ) : restaurants.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg p-8 text-center">
                            <div className="bg-gray-100 p-4 rounded-full mb-4">
                                <AlertCircle className="text-gray-500" size={32} />
                            </div>
                            <h3 className="text-lg font-medium text-gray-800 mb-2">No Restaurants Found</h3>
                            <p className="text-gray-600 mb-6">There are no restaurants that match your criteria.</p>
                            <button
                                className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                onClick={() => {
                                    setSearchText('');
                                    setPage(0);
                                }}
                            >
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {restaurants.map((restaurant) => (
                                <motion.div
                                    key={restaurant.restaurantId}
                                    className={`bg-white rounded-xl shadow-sm overflow-hidden relative ${
                                        hoveredCard === restaurant.restaurantId ? 'ring-2 ring-orange-300' : ''
                                    }`}
                                    variants={cardVariants}
                                    onMouseEnter={() => setHoveredCard(restaurant.restaurantId)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                    whileHover={{ y: -5 }}
                                >
                                    <div className="relative h-48 bg-gray-200">
                                        <img
                                            src={restaurant.imageUrl || "/api/placeholder/400/160"}
                                            alt={restaurant.restaurantName}
                                            className="w-full h-full object-cover text-black"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = "/api/placeholder/400/160";
                                                target.onerror = null;
                                            }}
                                        />
                                        <div className="absolute top-3 right-3 bg-white bg-opacity-90 text-xs px-2 py-1 rounded-full">
                                            {restaurant.restaurantType}
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-lg text-black">{restaurant.restaurantName}</h3>
                                                <p className="text-gray-600 text-sm mt-1">{restaurant.restaurantAddress}</p>
                                            </div>
                                            <div className="bg-gray-100 px-2 py-1 rounded-md text-sm font-medium flex items-center">
                                                ⭐ {restaurant.rating}
                                            </div>
                                        </div>

                                        <div className="mt-4 text-sm text-gray-600">
                                            {restaurant.description && restaurant.description.length > 100
                                                ? `${restaurant.description.substring(0, 100)}...`
                                                : restaurant.description}
                                        </div>

                                        <div className="mt-3 flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <Clock size={16} className="text-gray-500" />
                                                <span className="text-sm">{formatTime(restaurant.openingTime)} - {formatTime(restaurant.closingTime)}</span>
                                            </div>

                                            <div className="flex items-center justify-between mt-2">
                                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    restaurant.availability
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {restaurant.availability ? 'Restaurant available' : 'Restaurant unavailable'}
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    restaurant.active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {restaurant.active ? 'Open' : 'Closed'}
                                                </div>


                                                <div className={`px-1 py-1 rounded-full text-xs font-medium ${
                                                    restaurant.orderAvailability
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {restaurant.orderAvailability ? 'Accepting Orders' : 'Not Accepting Orders'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center mt-4 pt-3 border-t border-gray-100">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="flex-1 text-gray-600 hover:text-blue-600 flex items-center justify-center gap-1 py-2"
                                                onClick={() => navigate(`/restaurant/${restaurant.restaurantId}`)}
                                            >
                                                <Eye size={16} />
                                                <span>View</span>
                                            </motion.button>
                                            <div className="h-6 w-px bg-gray-200"></div>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="flex-1 text-gray-600 hover:text-orange-600 flex items-center justify-center gap-1 py-2"
                                                onClick={() => navigate(`/update/${restaurant.restaurantId}`)}
                                            >
                                                <Edit size={16} />
                                                <span>Edit</span>
                                            </motion.button>
                                            <div className="h-6 w-px bg-gray-200"></div>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="flex-1 text-gray-600 hover:text-red-600 flex items-center justify-center gap-1 py-2"
                                                onClick={() => handleDeleteRestaurant(restaurant.restaurantId)}
                                            >
                                                <Trash2 size={16} />
                                                <span>Delete</span>
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* Pagination */}
                    {!loading && totalItems > 0 && (
                        <div className="flex justify-between items-center mt-8">
                            <div className="text-sm text-gray-600">
                                Showing {page * size + 1} to {Math.min((page + 1) * size, totalItems)} of {totalItems} restaurants
                            </div>
                            <div className="flex gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`px-4 py-2 rounded-md ${
                                        page === 0
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                    }`}
                                    onClick={() => setPage(Math.max(0, page - 1))}
                                    disabled={page === 0}
                                >
                                    Previous
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`px-4 py-2 rounded-md ${
                                        page >= totalPages - 1
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                    }`}
                                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                                    disabled={page >= totalPages - 1}
                                >
                                    Next
                                </motion.button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RestaurantDashboard;