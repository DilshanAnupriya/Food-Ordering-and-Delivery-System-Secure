import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Package,
    Search,
    PlusCircle,
    Edit,
    Trash2,
    Tag,
    X,
    Check,
    Filter,

    AlertCircle,
    RefreshCw
} from 'lucide-react';
import {
    fetchFoodCategories,
    fetchFoodItemsByCategory,
    FoodItem,
    createFoodItem,
    updateFoodItem,
    deleteFoodItem,
    getFoodItemById,
    toggleFoodItemAvailability,
    FoodItemRequest
} from '../../../services/Restaurants/Fooditems.ts';
import Sidebar from "../../../components/Restaurants/Owner/Sidebar";
import FoodItemForm from '../../../pages/Restaurant/Admin/FoodItemForm.tsx';
import { toast } from 'react-hot-toast'; // Assuming you have a toast library installed

const ManageFoodItems = () => {
    // State variables
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
    const [searchText, setSearchText] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [restaurantId, setRestaurantId] = useState<string>('');
    const [totalItems, setTotalItems] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [pageSize] = useState<number>(10);
    const [showAddModal, setShowAddModal] = useState<boolean>(false);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedFoodItem, setSelectedFoodItem] = useState<FoodItem | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
    const [activeFilter, setActiveFilter] = useState<'all' | 'available' | 'unavailable'>('all');
    const [filterDropdownOpen, setFilterDropdownOpen] = useState<boolean>(false);


    // Get restaurant ID from localStorage (simulate auth context)
    useEffect(() => {
        // Extract restaurantId from URL path
        // URL format: http://localhost:5173/{restaurantId}/fooditems
        const pathSegments = window.location.pathname.split('/');

        // Find the UUID segment in the URL path

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        for (const segment of pathSegments) {
            if (uuidRegex.test(segment)) {
                setRestaurantId(segment);
                break;
            }
        }
    }, []);

    // Fetch all food categories
    useEffect(() => {
        const getCategories = async () => {
            try {
                setError(null);
                const fetchedCategories = await fetchFoodCategories();
                setCategories(fetchedCategories);
                if (fetchedCategories.length > 0) {
                    setSelectedCategory(fetchedCategories[0]);
                    setExpandedCategory(fetchedCategories[0]);
                }
            } catch (err) {
                setError('Failed to load food categories');
                console.error('Error fetching categories:', err);
            }
        };

        getCategories();
    }, []);

    // Fetch food items when category changes or refresh is triggered
    useEffect(() => {
        const fetchFoodItems = async () => {
            if (!selectedCategory || !restaurantId) return;

            try {
                setLoading(true);
                setError(null);
                const response = await fetchFoodItemsByCategory(
                    restaurantId,
                    selectedCategory,
                    searchText,
                    currentPage,
                    pageSize
                );

                // Fixed section: properly access the data structure
                if (response && response.code === 200 && response.data) {
                    setFoodItems(response.data.dataList || []);
                    setTotalItems(response.data.dataCount || 0);
                }
            } catch (err) {
                setError('Failed to load food items');
                console.error('Error fetching food items:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchFoodItems();
    }, [selectedCategory, restaurantId, searchText, currentPage, pageSize, refreshTrigger]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterDropdownOpen && !(event.target as Element).closest('.filter-dropdown')) {
                setFilterDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [filterDropdownOpen]);

    // Apply filters to the displayed items
    const filteredFoodItems = foodItems.filter(item => {
        if (activeFilter === 'available') return item.available;
        if (activeFilter === 'unavailable') return !item.available;
        return true; // 'all' filter
    });

    // Handle category selection
    const handleCategorySelect = (category: string) => {
        setSelectedCategory(category);
        setCurrentPage(0);

        // Toggle expanded category
        if (expandedCategory === category) {
            setExpandedCategory(null);
        } else {
            setExpandedCategory(category);
        }
    };

    // Handle search
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
        setCurrentPage(0);
    };

    // Format price with discount
    const formatPrice = (price: number, discount: number) => {
        if (discount > 0) {
            const discountedPrice = price - (price * discount / 100);
            return (
                <span>
                    <span className="text-gray-400 line-through text-sm mr-2">{price.toFixed(2)}</span>
                    <span className="text-green-600 font-semibold">{discountedPrice.toFixed(2)}</span>
                </span>
            );
        }
        return <span className="font-semibold">Rs.{price.toFixed(2)}</span>;
    };

    // Calculate total pages
    const totalPages = Math.ceil(totalItems / pageSize);

    // Page transition variants
    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        in: { opacity: 1, y: 0, transition: { duration: 0.3 } },
        out: { opacity: 0, y: -20, transition: { duration: 0.3 } }
    };

    // Item variants for staggered animation
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 10
            }
        }
    };

    // Handle add new food item
    const handleAddItem = () => {
        setShowAddModal(true);
    };

    // Handle submit new food item
    const handleSubmitNewItem = async (foodItem: FoodItemRequest) => {
        try {
            await createFoodItem(foodItem);
            setShowAddModal(false);
            // Refresh the food items list
            setRefreshTrigger(prev => prev + 1);
            toast.success('Food item added successfully!');
        } catch (err) {
            console.error('Error adding food item:', err);
            toast.error('Failed to add food item. Please try again.');
        }
    };

    // Handle edit item
    const handleEditItem = async (foodItemId: string) => {
        try {
            setLoading(true);
            const foodItem = await getFoodItemById(foodItemId);
            setSelectedFoodItem(foodItem);
            setShowEditModal(true);
        } catch (err) {
            console.error(`Error fetching food item with ID ${foodItemId}:`, err);
            toast.error('Failed to load food item details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle submit edit food item
    const handleSubmitEditItem = async (foodItem: FoodItemRequest) => {
        if (!selectedFoodItem) return;

        try {
            await updateFoodItem(selectedFoodItem.foodItemId, foodItem);
            setShowEditModal(false);
            setSelectedFoodItem(null);
            // Refresh the food items list
            setRefreshTrigger(prev => prev + 1);
            toast.success('Food item updated successfully!');
        } catch (err) {
            console.error('Error updating food item:', err);
            toast.error('Failed to update food item. Please try again.');
        }
    };

    // Handle delete confirmation
    const handleDeleteConfirmation = (foodItemId: string) => {
        setShowDeleteConfirm(foodItemId);
    };

    // Handle actual delete
    const handleDeleteItem = async (foodItemId: string) => {
        try {
            await deleteFoodItem(foodItemId);
            setShowDeleteConfirm(null);
            // Refresh the food items list
            setRefreshTrigger(prev => prev + 1);
            toast.success('Food item deleted successfully!');
        } catch (err) {
            console.error(`Error deleting food item with ID ${foodItemId}:`, err);
            toast.error('Failed to delete food item. Please try again.');
        }
    };

    // Handle toggle availability
    const handleToggleAvailability = async (foodItemId: string, currentAvailability: boolean) => {
        try {
            await toggleFoodItemAvailability(foodItemId, !currentAvailability);
            // Update the local state to reflect the change immediately
            setFoodItems(prevItems =>
                prevItems.map(item =>
                    item.foodItemId === foodItemId
                        ? { ...item, available: !currentAvailability }
                        : item
                )
            );
            toast.success(`Food item ${!currentAvailability ? 'available' : 'unavailable'} for ordering`);
        } catch (err) {
            console.error(`Error toggling availability for food item with ID ${foodItemId}:`, err);
            toast.error('Failed to update availability. Please try again.');
        }
    };

    // Handle refresh data
    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar/>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                >
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Food Items Management</h1>
                            <p className="text-gray-600">Manage your restaurant's food items by category</p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="mt-4 md:mt-0 flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
                            onClick={handleAddItem}
                        >
                            <PlusCircle size={20} />
                            <span>Add New Food Item</span>
                        </motion.button>
                    </div>

                    {/* Search and Filter Section */}
                    <div className="bg-white rounded-xl shadow-sm mb-8 p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search food items..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    value={searchText}
                                    onChange={handleSearch}
                                />
                            </div>
                            <div className="flex gap-4">
                                <button
                                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                                    onClick={handleRefresh}
                                >
                                    <RefreshCw size={18} className="text-gray-500" />
                                    <span className="hidden sm:inline text-gray-700">Refresh</span>
                                </button>
                                <div className="relative filter-dropdown">
                                    <button
                                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                                        onClick={() => setFilterDropdownOpen(prev => !prev)}
                                    >
                                        <Filter size={18} className="text-gray-500" />
                                        <span className="hidden sm:inline text-gray-700">Filter</span>
                                    </button>
                                    {filterDropdownOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-100">
                                            <div className="p-2">
                                                <button
                                                    className={`w-full text-left px-3 py-2 rounded-md ${activeFilter === 'all' ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-50'}`}
                                                    onClick={() => {
                                                        setActiveFilter('all');
                                                        setFilterDropdownOpen(false);
                                                    }}
                                                >
                                                    All Items
                                                </button>
                                                <button
                                                    className={`w-full text-left px-3 py-2 rounded-md ${activeFilter === 'available' ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-50'}`}
                                                    onClick={() => {
                                                        setActiveFilter('available');
                                                        setFilterDropdownOpen(false);
                                                    }}
                                                >
                                                    Available Only
                                                </button>
                                                <button
                                                    className={`w-full text-left px-3 py-2 rounded-md ${activeFilter === 'unavailable' ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-50'}`}
                                                    onClick={() => {
                                                        setActiveFilter('unavailable');
                                                        setFilterDropdownOpen(false);
                                                    }}
                                                >
                                                    Unavailable Only
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Categories Section */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {categories.map((category) => (
                            <motion.button
                                key={category}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                                    selectedCategory === category
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-white text-gray-700 border border-gray-200'
                                }`}
                                onClick={() => handleCategorySelect(category)}
                            >
                                <Tag size={16} />
                                <span>{category}</span>
                            </motion.button>
                        ))}
                    </div>

                    {/* Food Items List */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        {error && (
                            <div className="p-6 flex items-center gap-3 bg-red-50 text-red-700 border-b border-red-100">
                                <AlertCircle size={20} />
                                <span>{error}</span>
                                <button
                                    onClick={handleRefresh}
                                    className="ml-auto text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                        {loading ? (
                            <div className="p-12 flex justify-center items-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                            </div>
                        ) : filteredFoodItems.length === 0 ? (
                            <div className="p-12 text-center">
                                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-700 mb-2">No food items found</h3>
                                <p className="text-gray-500 mb-6">
                                    {searchText
                                        ? `No results found for "${searchText}". Try a different search term.`
                                        : `No food items in the ${selectedCategory} category. Add your first item!`}
                                </p>
                                <button
                                    onClick={handleAddItem}
                                    className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    <PlusCircle size={18} />
                                    <span>Add New Food Item</span>
                                </button>
                            </div>
                        ) : (
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="divide-y divide-gray-100"
                            >
                                {filteredFoodItems.map((item) => (
                                    <motion.div
                                        key={item.foodItemId}
                                        variants={itemVariants}
                                        className="p-6 flex flex-col md:flex-row md:items-center gap-4 hover:bg-gray-50 transition-colors"
                                    >
                                        {/* Food Item Image */}
                                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                            {item.imageUrl ? (
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = "/api/placeholder/64/64";
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                                    <Package size={24} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Food Item Details */}
                                        <div className="flex-1">
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                                <h3 className="text-lg font-medium text-gray-800">{item.name}</h3>
                                                <div className="flex items-center gap-2 mt-2 md:mt-0">
                                                    <span className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-600">{item.type}</span>
                                                    <span className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-600">{item.category}</span>
                                                    {item.available ? (
                                                        <span className="px-2 py-1 bg-green-100 rounded-md text-xs text-green-600">Available</span>
                                                    ) : (
                                                        <span className="px-2 py-1 bg-red-100 rounded-md text-xs text-red-600">Unavailable</span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-3">
                                                <div className="flex items-center gap-4">
                                                    <div className="text-gray-800">
                                                        {formatPrice(item.price, item.discount)}
                                                    </div>
                                                    {item.discount > 0 && (
                                                        <span className="px-2 py-1 bg-orange-100 rounded-md text-xs text-orange-600">{item.discount}% Off</span>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2 mt-3 md:mt-0">
                                                    <button
                                                        onClick={() => handleToggleAvailability(item.foodItemId, item.available)}
                                                        className={`p-2 rounded-md transition-colors ${
                                                            item.available
                                                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                        }`}
                                                        title={item.available ? 'Mark as unavailable' : 'Mark as available'}
                                                    >
                                                        {item.available ? <X size={18} /> : <Check size={18} />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditItem(item.foodItemId)}
                                                        className="p-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                                                        title="Edit food item"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteConfirmation(item.foodItemId)}
                                                        className="p-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                                                        title="Delete food item"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {!loading && filteredFoodItems.length > 0 && (
                        <div className="mt-6 flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                Showing <span className="font-medium">{filteredFoodItems.length}</span> of <span className="font-medium">{totalItems}</span> items
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                    disabled={currentPage === 0}
                                    className={`p-2 rounded-md ${
                                        currentPage === 0
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    // Logic to show pages around current page
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i;
                                    } else if (currentPage < 3) {
                                        pageNum = i;
                                    } else if (currentPage > totalPages - 3) {
                                        pageNum = totalPages - 5 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-10 h-10 flex items-center justify-center rounded-md ${
                                                currentPage === pageNum
                                                    ? 'bg-orange-500 text-white'
                                                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            {pageNum + 1}
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                                    disabled={currentPage === totalPages - 1 || totalPages === 0}
                                    className={`p-2 rounded-md ${
                                        currentPage === totalPages - 1 || totalPages === 0
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Add Food Item Modal */}
            {showAddModal && (
                <FoodItemForm
                    onClose={() => setShowAddModal(false)}
                    onSubmit={handleSubmitNewItem}
                    categories={categories}
                    restaurantId={restaurantId}
                />
            )}

            {/* Edit Food Item Modal */}
            {showEditModal && selectedFoodItem && (
                <FoodItemForm
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedFoodItem(null);
                    }}
                    onSubmit={handleSubmitEditItem}
                    categories={categories}
                    restaurantId={restaurantId}
                    initialData={selectedFoodItem}
                    isEditing={true}
                />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4"
                    >
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                                <AlertCircle size={32} className="text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Confirm Deletion</h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete this food item? This action cannot be undone.
                            </p>
                            <div className="flex justify-center gap-4">
                                <button
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                                    onClick={() => setShowDeleteConfirm(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                    onClick={() => handleDeleteItem(showDeleteConfirm)}
                                >
                                    Delete Item
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default ManageFoodItems;