import  { useState, useEffect, useRef } from 'react';
import { Search, Edit, Trash2, Plus, Filter, ChevronDown, ChevronRight, X, Image, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from '../../../components/layout/AdminSideBar';
import AdminNavbar from '../../../components/admin/AdminNavbar';
import {  fetchFoodCategories, } from '../../../services/Restaurants/Fooditems';

const AdminFoodItemDashboard = () => {
    const [searchText, setSearchText] = useState('');
    const [foodItems, setFoodItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [expandedRestaurant, setExpandedRestaurant] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [restaurantMap, setRestaurantMap] = useState({});
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(50);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [submitProgress, setSubmitProgress] = useState(0);
    const [formError, setFormError] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        category: '',
        type: '',
        available: null,
        priceRange: { min: 0, max: 1000 }
    });

    // Form state for add/edit food item
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        type: 'Veg',
        restaurantId: '',
        price: '',
        discount: '0',
        imageUrl: '',
        description: '',
        available: true
    });

    // Image preview state
    const [imagePreview, setImagePreview] = useState('');
    const [imageError, setImageError] = useState(false);

    // Form refs
    const formRef = useRef(null);
    const imageInputRef = useRef(null);

    // Fetch all food items
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // For demo purposes, we'll fetch all items and organize them by restaurant
                // In a real app, you'd likely have a dedicated API endpoint for this
                const response = await fetch(`http://localhost:8082/api/v1/foods/list?searchText=${searchText}&page=${page}&size=${size}`);

                const data = await response.json();

                if (data.code === 200 && data.data?.dataList) {
                    const items = data.data.dataList;
                    setFoodItems(items);
                    applyFilters(items);

                    // Group by restaurant
                    const groupedByRestaurant = {};
                    items.forEach(item => {

                        if (!groupedByRestaurant[item.restaurantId]) {
                            groupedByRestaurant[item.restaurantId] = [];
                        }
                        groupedByRestaurant[item.restaurantId].push(item);
                    });

                    setRestaurantMap(groupedByRestaurant);

                    // If no restaurant is selected yet, select the first one
                    if (!selectedRestaurant && Object.keys(groupedByRestaurant).length > 0) {
                        setSelectedRestaurant(Object.keys(groupedByRestaurant)[0]);
                    }
                }

                // Fetch categories
                const categoriesResponse = await fetchFoodCategories();
                setCategories(categoriesResponse);

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [searchText]);

    // Apply filters to food items
    const applyFilters = (items = foodItems) => {
        let filtered = [...items];

        // Apply category filter
        if (filters.category) {
            filtered = filtered.filter(item => item.category === filters.category);
        }

        // Apply type filter
        if (filters.type) {
            filtered = filtered.filter(item => item.type === filters.type);
        }

        // Apply availability filter
        if (filters.available !== null) {
            filtered = filtered.filter(item => item.available === filters.available);
        }

        // Apply price range filter
        filtered = filtered.filter(item =>
            item.price >= filters.priceRange.min &&
            item.price <= filters.priceRange.max
        );

        setFilteredItems(filtered);
    };

    // Effect to apply filters when filters or food items change
    useEffect(() => {
        applyFilters();
    }, [filters, foodItems]);

    // Toggle restaurant expansion
    const toggleRestaurantExpansion = (restaurantId) => {
        setExpandedRestaurant(expandedRestaurant === restaurantId ? null : restaurantId);
    };

    // Delete food item confirmation
    const confirmDeleteItem = (item) => {
        setItemToDelete(item);
        setShowDeleteConfirm(true);
    };

    // Delete food item
    const handleDeleteItem = async () => {
        if (!itemToDelete) return;

        try {
            setFormSubmitting(true);

            // Simulate progress
            const timer = simulateProgress();

            const response = await fetch(`http://localhost:8082/api/v1/foods/${itemToDelete.foodItemId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            clearInterval(timer);
            setSubmitProgress(100);

            if (response.status === 204) {
                // Update local state
                setFoodItems(prevItems => prevItems.filter(item => item.foodItemId !== itemToDelete.foodItemId));

                // Update restaurant map
                const updatedMap = {...restaurantMap};
                Object.keys(updatedMap).forEach(restId => {
                    updatedMap[restId] = updatedMap[restId].filter(item => item.foodItemId !== itemToDelete.foodItemId);
                });
                setRestaurantMap(updatedMap);

                // Close the delete confirmation
                setShowDeleteConfirm(false);
                setItemToDelete(null);
            } else {
                setFormError('Failed to delete item. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting food item:', error);
            setFormError('Network error occurred. Please try again.');
        } finally {
            setFormSubmitting(false);
            setSubmitProgress(0);
        }
    };

    // Edit food item
    const handleEditItem = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name || '',
            category: item.category || '',
            type: item.type || 'Veg',
            restaurantId: item.restaurantId || '',
            price: item.price?.toString() || '',
            discount: item.discount?.toString() || '0',
            imageUrl: item.imageUrl || '',
            description: item.description || '',
            available: item.available !== false // Default to true if not specified
        });

        // Set image preview
        setImagePreview(item.imageUrl || '');
        setImageError(false);

        setShowAddForm(true);
    };

    // Add new food item
    const handleAddItem = () => {
        setEditingItem(null);
        setFormData({
            name: '',
            category: categories.length > 0 ? categories[0] : '',
            type: 'Veg',
            restaurantId: Object.keys(restaurantMap).length > 0 ? Object.keys(restaurantMap)[0] : '',
            price: '',
            discount: '0',
            imageUrl: '',
            description: '',
            available: true
        });

        // Reset image preview
        setImagePreview('');
        setImageError(false);

        setShowAddForm(true);
    };

    // Close form
    const handleCloseForm = () => {
        setShowAddForm(false);
        setEditingItem(null);
        setFormError('');
        setSubmitProgress(0);
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            setFormData({
                ...formData,
                [name]: checked
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });

            // For image URL, update the preview
            if (name === 'imageUrl') {
                setImagePreview(value);
                setImageError(false);
            }
        }
    };

    // Handle image error
    const handleImageError = () => {
        setImageError(true);
    };

    // Helper function to simulate progress
    const simulateProgress = () => {
        setSubmitProgress(0);
        const timer = setInterval(() => {
            setSubmitProgress(prev => {
                if (prev >= 90) {
                    return 90;
                }
                return prev + Math.random() * 10;
            });
        }, 200);
        return timer;
    };

    // Submit form
    const handleSubmitForm = async (e) => {
        e.preventDefault();

        // Form validation
        if (!formData.name.trim()) {
            setFormError('Name is required');
            return;
        }

        if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
            setFormError('Valid price is required');
            return;
        }

        if (isNaN(parseFloat(formData.discount)) || parseFloat(formData.discount) < 0 || parseFloat(formData.discount) > 100) {
            setFormError('Discount must be between 0 and 100');
            return;
        }

        setFormError('');
        setFormSubmitting(true);

        // Simulate progress
        const timer = simulateProgress();

        try {
            // Prepare data for API
            const apiData = {
                ...formData,
                price: parseFloat(formData.price),
                discount: parseFloat(formData.discount)
            };

            // If editing, include ID
            if (editingItem) {
                apiData.foodItemId = editingItem.foodItemId;
            }

            // API endpoint and method
            const url = editingItem
                ? `http://localhost:8082/api/v1/foods/${editingItem.foodItemId}`
                : 'http://localhost:8082/api/v1/foods';
            const method = editingItem ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(apiData)
            });

            clearInterval(timer);
            setSubmitProgress(100);

            const result = await response.json();

            if (response.ok && (result.code === 200 || result.code === 201)) {
                // Success! Refresh data
                const updatedItem = result.data;

                if (editingItem) {
                    // Update item in foodItems list
                    setFoodItems(prevItems =>
                        prevItems.map(item =>
                            item.foodItemId === updatedItem.foodItemId ? updatedItem : item
                        )
                    );

                    // Update item in restaurant map
                    const updatedMap = {...restaurantMap};
                    Object.keys(updatedMap).forEach(restId => {
                        updatedMap[restId] = updatedMap[restId].map(item =>
                            item.foodItemId === updatedItem.foodItemId ? updatedItem : item
                        );
                    });
                    setRestaurantMap(updatedMap);
                } else {
                    // Add new item to foodItems list
                    setFoodItems(prevItems => [...prevItems, updatedItem]);

                    // Add new item to restaurant map
                    const updatedMap = {...restaurantMap};
                    if (!updatedMap[updatedItem.restaurantId]) {
                        updatedMap[updatedItem.restaurantId] = [];
                    }
                    updatedMap[updatedItem.restaurantId].push(updatedItem);
                    setRestaurantMap(updatedMap);
                }

                // Close form
                handleCloseForm();
            } else {
                setFormError(result.message || 'Error saving food item');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setFormError('Network error occurred. Please try again.');
        } finally {
            setFormSubmitting(false);
        }
    };

    // Handle filter toggle
    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    // Handle filter changes
    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    // Reset filters
    const resetFilters = () => {
        setFilters({
            category: '',
            type: '',
            available: null,
            priceRange: { min: 0, max: 1000 }
        });
    };

    const restaurantList = Object.keys(restaurantMap).map(restaurantId => {
        const restaurant = restaurantMap[restaurantId][0]?.restaurantName || 'Unknown Restaurant';
        const foodCount = restaurantMap[restaurantId]?.length || 0;
        return { id: restaurantId, name: restaurant, foodCount };
    });

    // Determine which items to display based on filters and expansion state
    const displayItems = expandedRestaurant
        ? filteredItems.filter(item => item.restaurantId === expandedRestaurant)
        : filteredItems;

    return (
        <div className="flex h-screen bg-gray-50">
            <AdminSidebar />

            <div className="flex-1 flex flex-col overflow-hidden pl-10 pr-5">
                <AdminNavbar />

                <main className="flex-1 overflow-x-hidden overflow-y-auto pt-24 px-6">
                    <div className="container mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-semibold text-gray-800">Food Items Management</h1>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleAddItem}
                                className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-orange-600 transition-colors"
                            >
                                <Plus size={18} />
                                Add Food Item
                            </motion.button>
                        </div>

                        {/* Search and filter bar */}
                        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex items-center justify-between">
                            <div className="relative w-full max-w-md">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                                    placeholder="Search food items..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <button
                                        onClick={toggleFilters}
                                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                                    >
                                        <Filter size={16} />
                                        <span>Filter</span>
                                        {showFilters ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                    </button>

                                    {/* Filter dropdown */}
                                    <AnimatePresence>
                                        {showFilters && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute right-0 z-10 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 border border-gray-100"
                                            >
                                                <div className="flex justify-between items-center mb-3">
                                                    <h3 className="text-sm font-medium text-gray-700">Filters</h3>
                                                    <button
                                                        onClick={resetFilters}
                                                        className="text-xs text-orange-500 hover:text-orange-600"
                                                    >
                                                        Reset All
                                                    </button>
                                                </div>

                                                <div className="space-y-3">
                                                    {/* Category filter */}
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Category
                                                        </label>
                                                        <select
                                                            value={filters.category}
                                                            onChange={(e) => handleFilterChange('category', e.target.value)}
                                                            className="w-full text-sm px-2 py-1 border border-gray-200 rounded-md"
                                                        >
                                                            <option value="">All Categories</option>
                                                            {categories.map(category => (
                                                                <option key={category} value={category}>
                                                                    {category}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Type filter */}
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Type
                                                        </label>
                                                        <select
                                                            value={filters.type}
                                                            onChange={(e) => handleFilterChange('type', e.target.value)}
                                                            className="w-full text-sm px-2 py-1 border border-gray-200 rounded-md"
                                                        >
                                                            <option value="">All Types</option>
                                                            <option value="Veg">Veg</option>
                                                            <option value="Non-Veg">Non-Veg</option>
                                                            <option value="Vegan">Vegan</option>
                                                        </select>
                                                    </div>

                                                    {/* Availability filter */}
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Availability
                                                        </label>
                                                        <select
                                                            value={filters.available === null ? '' : filters.available.toString()}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                handleFilterChange('available',
                                                                    value === '' ? null : value === 'true')
                                                            }}
                                                            className="w-full text-sm px-2 py-1 border border-gray-200 rounded-md"
                                                        >
                                                            <option value="">All Items</option>
                                                            <option value="true">Available</option>
                                                            <option value="false">Unavailable</option>
                                                        </select>
                                                    </div>

                                                    {/* Price range filter */}
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Price Range
                                                        </label>
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={filters.priceRange.min}
                                                                onChange={(e) => handleFilterChange('priceRange', {
                                                                    ...filters.priceRange,
                                                                    min: parseInt(e.target.value) || 0
                                                                })}
                                                                className="w-full text-sm px-2 py-1 border border-gray-200 rounded-md"
                                                                placeholder="Min"
                                                            />
                                                            <span className="text-gray-500">-</span>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={filters.priceRange.max}
                                                                onChange={(e) => handleFilterChange('priceRange', {
                                                                    ...filters.priceRange,
                                                                    max: parseInt(e.target.value) || 0
                                                                })}
                                                                className="w-full text-sm px-2 py-1 border border-gray-200 rounded-md"
                                                                placeholder="Max"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-6">
                                {/* Restaurant List */}
                                <div className="col-span-1">
                                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <h2 className="font-medium text-gray-800">Restaurants</h2>
                                        </div>
                                        <div className="overflow-y-auto max-h-[calc(100vh-250px)]">
                                            {restaurantList.map((restaurant) => (
                                                <motion.div
                                                    key={restaurant.id}
                                                    onClick={() => toggleRestaurantExpansion(restaurant.id)}
                                                    whileHover={{ backgroundColor: 'rgba(249, 115, 22, 0.05)' }}
                                                    transition={{ duration: 0.2 }}
                                                    className={`px-4 py-3 border-b border-gray-100 cursor-pointer ${
                                                        expandedRestaurant === restaurant.id ? 'bg-orange-50' : ''
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-gray-800 font-medium">{restaurant.name}</span>
                                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                                                {restaurant.foodCount} items
                                                            </span>
                                                        </div>
                                                        {expandedRestaurant === restaurant.id ? (
                                                            <ChevronDown size={16} className="text-gray-500" />
                                                        ) : (
                                                            <ChevronRight size={16} className="text-gray-500" />
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Food Items Grid */}
                                <div className="col-span-2">
                                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                        <div className="px-6 py-4 border-b border-gray-100">
                                            <h2 className="font-medium text-gray-800">
                                                {expandedRestaurant ?
                                                    `Food Items - ${restaurantMap[expandedRestaurant]?.[0]?.restaurantName || 'Unknown Restaurant'}` :
                                                    'All Food Items'}
                                            </h2>
                                        </div>

                                        {displayItems.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                                                <AlertCircle size={32} className="mb-2" />
                                                <p>No food items found with the current filters</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                                                <AnimatePresence>
                                                    {displayItems.map((item) => (
                                                        <motion.div
                                                            key={item.foodItemId}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.9 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                                        >
                                                            <div className="relative h-48 overflow-hidden">
                                                                <img
                                                                    src={item.imageUrl}
                                                                    alt={item.name}
                                                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                                                    onError={(e) => {
                                                                        const target = e.target;
                                                                        target.src = `/api/placeholder/400/320`;
                                                                    }}
                                                                />
                                                                <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-lg text-xs font-medium">
                                                                    {item.discount > 0 ? `${item.discount}% off` : 'Regular price'}
                                                                </div>
                                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                                                    <h3 className="text-white font-medium truncate">{item.name}</h3>
                                                                </div>
                                                            </div>

                                                            <div className="p-4">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <div>
                                                                        <p className="text-sm text-gray-600">{item.category}</p>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                                                                item.type === 'Veg' ? 'bg-green-100 text-green-800' :
                                                                                    item.type === 'Vegan' ? 'bg-teal-100 text-teal-800' :
                                                                                        'bg-red-100 text-red-800'
                                                                            }`}>
                                                                              {item.type}
                                                                            </span>
                                                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                                                                item.available ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                                                            }`}>
                                                                              {item.available ? 'Available' : 'Unavailable'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="text-lg font-bold text-gray-900">
                                                                            {item.price.toFixed(2)}
                                                                        </p>
                                                                        {item.discount > 0 && (
                                                                            <p className="text-xs text-gray-500 line-through">
                                                                                ${(item.price / (1 - item.discount / 100)).toFixed(2)}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>

                                                                <div className="flex justify-between">
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.05 }}
                                                                        whileTap={{ scale: 0.95 }}
                                                                        onClick={() => handleEditItem(item)}
                                                                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                                    >
                                                                        <Edit size={16} />
                                                                        Edit
                                                                    </motion.button>

                                                                    <motion.button
                                                                        whileHover={{ scale: 1.05 }}
                                                                        whileTap={{ scale: 0.95 }}
                                                                        onClick={() => confirmDeleteItem(item)}
                                                                        className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                        Delete
                                                                    </motion.button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </AnimatePresence>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                {/* Add/Edit Food Item Modal */}
                <AnimatePresence>
                    {showAddForm && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white rounded-lg w-full max-w-2xl overflow-hidden shadow-xl"
                            >
                                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                    <h2 className="font-medium text-gray-800">
                                        {editingItem ? 'Edit Food Item' : 'Add New Food Item'}
                                    </h2>
                                    <button
                                        onClick={handleCloseForm}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Form submission progress */}
                                {formSubmitting && (
                                    <div className="px-6 py-2 bg-gray-50">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className="bg-orange-500 h-2.5 rounded-full transition-all duration-300"
                                                style={{ width: `${submitProgress}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 text-center">
                                            {submitProgress < 100 ? 'Saving...' : 'Complete!'}
                                        </p>
                                    </div>
                                )}

                                {/* Form error message */}
                                {formError && (
                                    <div className="px-6 py-2 bg-red-50 text-red-700 text-sm flex items-center gap-2">
                                        <AlertCircle size={16} />
                                        {formError}
                                    </div>
                                )}

                                <form ref={formRef} onSubmit={handleSubmitForm}>
                                    <div className="p-6">
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200"
                                                    placeholder="Food item name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                                <select
                                                    name="category"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200"
                                                    value={formData.category}
                                                    onChange={handleInputChange}
                                                >
                                                    {categories.map(category => (
                                                        <option key={category} value={category}>
                                                            {category}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                                <select
                                                    name="type"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200"
                                                    value={formData.type}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="Veg">Veg</option>
                                                    <option value="Non-Veg">Non-Veg</option>
                                                    <option value="Vegan">Vegan</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant</label>
                                                <select
                                                    name="restaurantId"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200"
                                                    value={formData.restaurantId}
                                                    onChange={handleInputChange}
                                                >
                                                    {restaurantList.map(restaurant => (
                                                        <option key={restaurant.id} value={restaurant.id}>
                                                            {restaurant.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                                                <input
                                                    type="number"
                                                    name="price"
                                                    step="0.01"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200"
                                                    placeholder="0.00"
                                                    value={formData.price}
                                                    onChange={handleInputChange}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                                                <input
                                                    type="number"
                                                    name="discount"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200"
                                                    placeholder="0"
                                                    value={formData.discount}
                                                    onChange={handleInputChange}
                                                />
                                            </div>

                                            <div className="col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                                <div className="flex">
                                                    <input
                                                        type="text"
                                                        name="imageUrl"
                                                        ref={imageInputRef}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-200"
                                                        placeholder="https://example.com/image.jpg"
                                                        value={formData.imageUrl}
                                                        onChange={handleInputChange}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="bg-gray-100 border border-gray-300 border-l-0 rounded-r-lg px-3 text-gray-600 hover:bg-gray-200"
                                                        onClick={() => setImagePreview(formData.imageUrl)}
                                                    >
                                                        Preview
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Image Preview */}
                                            {imagePreview && (
                                                <div className="col-span-2 mt-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Image Preview</label>
                                                    <div className="relative h-40 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                                        {imageError ? (
                                                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                                                <Image size={32} className="mb-2" />
                                                                <p className="text-sm">Invalid image URL</p>
                                                            </div>
                                                        ) : (
                                                            <img
                                                                src={imagePreview}
                                                                alt="Preview"
                                                                className="w-full h-full object-cover"
                                                                onError={handleImageError}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                                <textarea
                                                    name="description"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200"
                                                    rows={3}
                                                    placeholder="Describe the food item..."
                                                    value={formData.description}
                                                    onChange={handleInputChange}
                                                ></textarea>
                                            </div>

                                            <div className="col-span-2">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id="available"
                                                        name="available"
                                                        className="rounded text-orange-500 focus:ring-orange-200"
                                                        checked={formData.available}
                                                        onChange={handleInputChange}
                                                    />
                                                    <label htmlFor="available" className="text-sm font-medium text-gray-700">
                                                        Available for ordering
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-3 mt-6">
                                            <button
                                                type="button"
                                                onClick={handleCloseForm}
                                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                                disabled={formSubmitting}
                                            >
                                                Cancel
                                            </button>
                                            <motion.button
                                                type="submit"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed"
                                                disabled={formSubmitting}
                                            >
                                                {editingItem ? 'Update Item' : 'Add Item'}
                                            </motion.button>
                                        </div>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Delete Confirmation Modal */}
                <AnimatePresence>
                    {showDeleteConfirm && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white rounded-lg w-full max-w-md overflow-hidden shadow-xl"
                            >
                                <div className="px-6 py-4 border-b border-gray-100">
                                    <h2 className="font-medium text-gray-800">Confirm Delete</h2>
                                </div>

                                {/* Form submission progress */}
                                {formSubmitting && (
                                    <div className="px-6 py-2 bg-gray-50">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className="bg-red-500 h-2.5 rounded-full transition-all duration-300"
                                                style={{ width: `${submitProgress}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 text-center">
                                            {submitProgress < 100 ? 'Deleting...' : 'Complete!'}
                                        </p>
                                    </div>
                                )}

                                {/* Form error message */}
                                {formError && (
                                    <div className="px-6 py-2 bg-red-50 text-red-700 text-sm flex items-center gap-2">
                                        <AlertCircle size={16} />
                                        {formError}
                                    </div>
                                )}

                                <div className="p-6">
                                    <p className="text-gray-600 mb-4">
                                        Are you sure you want to delete the item <span className="font-medium">{itemToDelete?.name}</span>? This action cannot be undone.
                                    </p>

                                    <div className="flex justify-end gap-3 mt-6">
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                            disabled={formSubmitting}
                                        >
                                            Cancel
                                        </button>
                                        <motion.button
                                            onClick={handleDeleteItem}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed"
                                            disabled={formSubmitting}
                                        >
                                            Delete
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminFoodItemDashboard;