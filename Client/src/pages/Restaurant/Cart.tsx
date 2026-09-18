// src/pages/CartPage.jsx
import { useState, useEffect } from 'react';
import { getCartByUserId, removeCartItem, updateCartItemQuantity, clearCart } from '../../services/Restaurants/Cart';
import { useAuth } from '../../services/auth/authContext';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from "../../components/layout/Navbar.tsx";
import Footer from "../../components/layout/Footer.tsx";
import { motion, AnimatePresence } from 'framer-motion';

// Import icons
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import NavV2 from "../../components/layout/NavV2.tsx";

const CartPage = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [restaurantGroups, setRestaurantGroups] = useState({});
    const [activeSection, setActiveSection] = useState(null);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const userId = user?.userId;

            if (!userId) {
                console.error('User ID not found in token:', user);
                // @ts-ignore
                setError('User ID not found. Please log in again.');
                setLoading(false);
                return;
            }

            const response = await getCartByUserId(userId);
            if (response.code === 200) {
                // Group items by restaurant ID
                const groupedItems = {};

                response.data.cartItems.forEach(item => {
                    const restaurantId = item.restaurantId;
                    if (!groupedItems[restaurantId]) {
                        groupedItems[restaurantId] = {
                            items: [],
                            totalPrice: 0,
                            restaurantName: item.restaurantName || `Restaurant ${restaurantId}`
                        };
                    }
                    groupedItems[restaurantId].items.push(item);
                    groupedItems[restaurantId].totalPrice += item.price * item.quantity;
                });

                // Calculate the correct total from all restaurant groups
                const calculatedTotal = Object.values(groupedItems).reduce(
                    (sum, restaurant) => sum + restaurant.totalPrice,
                    0
                );

                // Update the cart with the recalculated total
                setCart({
                    ...response.data,
                    totalPrice: calculatedTotal
                });

                setRestaurantGroups(groupedItems);

                // Set the first restaurant as active by default
                if (Object.keys(groupedItems).length > 0 && !activeSection) {
                    setActiveSection(Object.keys(groupedItems)[0]);
                }
            } else {
                setError('Failed to fetch cart');
            }
        } catch (err) {
            setError(`Error loading cart: ${err.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && user) {
            sessionStorage.setItem('isAuthenticated', 'true');
            sessionStorage.setItem('user', JSON.stringify(user));
            fetchCart();
        } else {
            const storedAuth = sessionStorage.getItem('isAuthenticated');
            const storedUser = sessionStorage.getItem('user');

            if (storedAuth === 'true' && storedUser) {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser?.userId) {
                    setLoading(true);
                    getCartByUserId(parsedUser.userId)
                        .then(response => {
                            if (response.code === 200) {
                                const groupedItems = {};
                                response.data.cartItems.forEach(item => {
                                    const restaurantId = item.restaurantId;
                                    if (!groupedItems[restaurantId]) {
                                        groupedItems[restaurantId] = {
                                            items: [],
                                            totalPrice: 0,
                                            restaurantName: item.restaurantName || `Restaurant ${restaurantId}`
                                        };
                                    }
                                    groupedItems[restaurantId].items.push(item);
                                    groupedItems[restaurantId].totalPrice += item.price * item.quantity;
                                });

                                // Calculate the correct total from all restaurant groups
                                const calculatedTotal = Object.values(groupedItems).reduce(
                                    (sum, restaurant) => sum + restaurant.totalPrice,
                                    0
                                );

                                // Update the cart with the recalculated total
                                setCart({
                                    ...response.data,
                                    totalPrice: calculatedTotal
                                });

                                setRestaurantGroups(groupedItems);

                                if (Object.keys(groupedItems).length > 0 && !activeSection) {
                                    setActiveSection(Object.keys(groupedItems)[0]);
                                }
                            } else {
                                setError('Failed to fetch cart');
                            }
                        })
                        .catch(err => {
                            setError(`Error loading cart: ${err.message || 'Unknown error'}`);
                            if (err.response?.status === 401) {
                                navigate('/login', { state: { from: '/cart' } });
                            }
                        })
                        .finally(() => setLoading(false));
                    return;
                }
            }
            navigate('/login', { state: { from: '/cart' } });
        }
    }, [user, isAuthenticated, navigate]);

    const handleQuantityUpdate = async (foodId, currentQuantity, increase) => {
        const userId = user?.userId;
        if (!userId) return;

        try {
            const newQuantity = increase ? currentQuantity + 1 : Math.max(1, currentQuantity - 1);

            const updatedItems = cart.cartItems.map(item =>
                item.foodItemId === foodId ? {...item, quantity: newQuantity} : item
            );

            const groupedItems = {};
            updatedItems.forEach(item => {
                const restaurantId = item.restaurantId;
                if (!groupedItems[restaurantId]) {
                    groupedItems[restaurantId] = {
                        items: [],
                        totalPrice: 0,
                        restaurantName: item.restaurantName || `Restaurant ${restaurantId}`
                    };
                }
                groupedItems[restaurantId].items.push(item);
                groupedItems[restaurantId].totalPrice += item.price * item.quantity;
            });

            // Calculate the new total from all restaurant groups
            const newTotal = Object.values(groupedItems).reduce(
                (sum, restaurant) => sum + restaurant.totalPrice,
                0
            );

            setCart({
                ...cart,
                cartItems: updatedItems,
                totalPrice: newTotal // Use the calculated total
            });

            setRestaurantGroups(groupedItems);

            await updateCartItemQuantity(userId, foodId, 1, increase);
            toast.success(`Quantity ${increase ? 'increased' : 'decreased'}`);
        } catch (err) {
            setError(`Failed to update quantity: ${err.message || 'Unknown error'}`);
            toast.error("Failed to update quantity");
            fetchCart();
        }
    };

    const handleRemoveItem = async (foodId) => {
        const userId = user?.userId;
        if (!userId) return;

        try {
            const removedItem = cart.cartItems.find(item => item.foodItemId === foodId);
            const updatedItems = cart.cartItems.filter(item => item.foodItemId !== foodId);

            const groupedItems = {};
            updatedItems.forEach(item => {
                const restaurantId = item.restaurantId;
                if (!groupedItems[restaurantId]) {
                    groupedItems[restaurantId] = {
                        items: [],
                        totalPrice: 0,
                        restaurantName: item.restaurantName || `Restaurant ${restaurantId}`
                    };
                }
                groupedItems[restaurantId].items.push(item);
                groupedItems[restaurantId].totalPrice += item.price * item.quantity;
            });

            // Calculate the new total from all restaurant groups
            const newTotal = Object.values(groupedItems).reduce(
                (sum, restaurant) => sum + restaurant.totalPrice,
                0
            );

            setCart({
                ...cart,
                cartItems: updatedItems,
                totalPrice: newTotal // Use the calculated total
            });

            setRestaurantGroups(groupedItems);

            await removeCartItem(userId, foodId);
            toast.success(`${removedItem?.foodName || 'Item'} removed from cart`);
        } catch (err) {
            setError(`Failed to remove item: ${err.message || 'Unknown error'}`);
            toast.error("Failed to remove item");
            fetchCart();
        }
    };
    const handleClearCart = async () => {
        const userId = user?.userId;
        if (!userId) return;

        try {
            await clearCart(userId);
            setCart({
                ...cart,
                cartItems: [],
                totalPrice: 0
            });
            setRestaurantGroups({});
            toast.success("Cart cleared successfully");
        } catch (err) {
            setError(`Failed to clear cart: ${err.message || 'Unknown error'}`);
            toast.error("Failed to clear cart");
            fetchCart();
        }
    };

    const confirmClearCart = () => {
        toast.info(
            <div>
                <p>Are you sure you want to clear your cart?</p>
                <div className="flex justify-end mt-2">
                    <button
                        onClick={() => handleClearCart()}
                        className="bg-red-500 text-white px-3 py-1 rounded mr-2 hover:bg-red-600 transition-colors"
                    >
                        Yes
                    </button>
                    <button
                        onClick={() => toast.dismiss()}
                        className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 transition-colors"
                    >
                        No
                    </button>
                </div>
            </div>,
            { autoClose: false, closeButton: false }
        );
    };

    const proceedToCheckout = () => {
        sessionStorage.setItem('cartRestaurantGroups', JSON.stringify(restaurantGroups));
        const restaurantIds = Object.keys(restaurantGroups);

        if (restaurantIds.length === 1) {
            navigate(`/orders/new?restaurantId=${restaurantIds[0]}`);
        } else {
            navigate(`/orders/new?restaurantId=${restaurantIds[0]}`);
        }
    };

    if (loading) {
        return (
            <>
                <div className="fixed top-0 w-full ">
                    <NavV2/>
                </div>
                <div className="min-h-screen bg-white flex justify-center items-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-2xl"
                    >
                        <div className="flex flex-col items-center justify-center h-64">
                            <motion.div
                                animate={{
                                    rotate: 360,
                                    transition: { duration: 1.5, repeat: Infinity, ease: "linear" }
                                }}
                                className="rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"
                            ></motion.div>
                            <p className="mt-4 text-gray-600 font-medium">Loading your cart...</p>
                        </div>
                    </motion.div>
                </div>
                <Footer />
            </>
        );
    }

    // Empty cart view
    if (!cart || cart.cartItems?.length === 0 || error) {
        return (
            <>
                <div className="fixed top-0 w-full ">
                    <NavV2/>
                </div>
                <div className="min-h-screen bg-white pt-28 mt-20 pb-16 ">
                    <ToastContainer position="top-right" autoClose={3000} />
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="container mx-auto px-4"
                    >
                        <div className="bg-white rounded-2xl shadow-2xl p-10 text-center max-w-2xl mx-auto">
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex justify-center mb-6"
                            >
                                <ShoppingCart size={80} className="text-gray-300" />
                            </motion.div>
                            <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
                            <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/restaurants')}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-8 rounded-full text-lg font-medium hover:shadow-lg transition-all duration-300"
                            >
                                Browse Menu
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
                <Footer />
            </>
        );
    }

    // @ts-ignore
    // @ts-ignore
    return (
        <>
            <div className="top-0 z-0 w-full ">
                <NavV2/>
            </div>
            <div className="min-h-screen z-0 bg-white pt-2 mt-5 pb-16 ">

                <ToastContainer position="top-right" autoClose={3000} />

                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white rounded-2xl  overflow-hidden"
                    >
                        {/* Header */}
                        <div className="relative bg-gradient-to-r from-orange-700 to-orange-400 text-white px-8 z-10 py-6">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-4">
                                    <ShoppingCart size={28} />
                                    <h1 className="text-3xl font-bold">My Cart</h1>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={confirmClearCart}
                                    className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/30 transition-all duration-300"
                                >
                                    <Trash2 size={16} />
                                    <span>Clear Cart</span>
                                </motion.button>
                            </div>
                        </div>

                        {/* Restaurant Tabs */}
                        {Object.keys(restaurantGroups).length > 1 && (
                            <div className="bg-gray-50 border-b px-6 py-4">
                                <div className="flex space-x-2 overflow-x-auto pb-2">
                                    {Object.keys(restaurantGroups).map(restaurantId => (
                                        <motion.button
                                            key={restaurantId}
                                            whileHover={{ y: -2 }}
                                            onClick={() => setActiveSection(restaurantId)}
                                            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-300 ${
                                                activeSection === restaurantId
                                                    ? 'bg-blue-600 text-white font-medium shadow-md'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                        >
                                            {restaurantGroups[restaurantId].restaurantName}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[400px]">
                            {/* Cart Items */}
                            <div className="lg:col-span-2 border-r">
                                <AnimatePresence mode="wait">
                                    {Object.keys(restaurantGroups).map(restaurantId => (
                                        (!activeSection || activeSection === restaurantId) && (
                                            <motion.div
                                                key={restaurantId}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="px-6 py-4 bg-blue-50 border-b">
                                                    <h2 className="text-xl font-bold text-blue-800">
                                                        {restaurantGroups[restaurantId].restaurantName}
                                                    </h2>
                                                </div>

                                                {/* Headers for desktop */}
                                                <div className="hidden md:grid md:grid-cols-12 gap-4 text-sm font-medium text-gray-600 p-6 border-b">
                                                    <div className="col-span-6">Item</div>
                                                    <div className="col-span-2 text-center">Price</div>
                                                    <div className="col-span-2 text-center">Quantity</div>
                                                    <div className="col-span-2 text-right">Subtotal</div>
                                                </div>

                                                {/* Cart items */}
                                                {restaurantGroups[restaurantId].items.map((item) => (
                                                    <motion.div
                                                        key={item.foodItemId}
                                                        layout
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="p-4 md:p-6 border-b hover:bg-blue-50 transition-colors"
                                                    >
                                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                                            <div className="col-span-1 md:col-span-6 flex items-center">
                                                                <motion.div
                                                                    whileHover={{ scale: 1.05 }}
                                                                    className="h-20 w-20 bg-gray-200 rounded-xl flex items-center justify-center mr-4 overflow-hidden shadow-md"
                                                                >
                                                                    {item.foodImage ? (
                                                                        <img
                                                                            src={item.foodImage}
                                                                            alt={item.foodName}
                                                                            className="h-full w-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                        </svg>
                                                                    )}
                                                                </motion.div>
                                                                <div>
                                                                    <h3 className="font-medium text-lg">{item.foodName}</h3>
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.05 }}
                                                                        whileTap={{ scale: 0.95 }}
                                                                        onClick={() => handleRemoveItem(item.foodItemId)}
                                                                        className="text-red-500 text-sm mt-1 hover:text-red-700 flex items-center space-x-1 transition-colors"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                        <span>Remove</span>
                                                                    </motion.button>
                                                                </div>
                                                            </div>

                                                            <div className="col-span-1 md:col-span-2 flex justify-between md:justify-center items-center mt-2 md:mt-0">
                                                                <span className="md:hidden font-medium">Price:</span>
                                                                <span className="text-blue-800 font-medium">${item.price.toFixed(2)}</span>
                                                            </div>

                                                            <div className="col-span-1 md:col-span-2 flex justify-between md:justify-center items-center mt-2 md:mt-0">
                                                                <span className="md:hidden font-medium">Quantity:</span>
                                                                <div className="flex items-center">
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.1 }}
                                                                        whileTap={{ scale: 0.9 }}
                                                                        onClick={() => handleQuantityUpdate(item.foodItemId, item.quantity, false)}
                                                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                                                            item.quantity <= 1
                                                                                ? 'bg-gray-200 text-gray-400'
                                                                                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                                                        }`}
                                                                        disabled={item.quantity <= 1}
                                                                    >
                                                                        <Minus size={16} />
                                                                    </motion.button>
                                                                    <span className="mx-3 font-medium">{item.quantity}</span>
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.1 }}
                                                                        whileTap={{ scale: 0.9 }}
                                                                        onClick={() => handleQuantityUpdate(item.foodItemId, item.quantity, true)}
                                                                        className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors"
                                                                    >
                                                                        <Plus size={16} />
                                                                    </motion.button>
                                                                </div>
                                                            </div>

                                                            <div className="col-span-1 md:col-span-2 flex justify-between md:justify-end items-center mt-2 md:mt-0">
                                                                <span className="md:hidden font-medium">Subtotal:</span>
                                                                <span className="text-blue-800 font-bold">
                                                                    ${(item.price * item.quantity).toFixed(2)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}

                                                {/* Restaurant Subtotal */}
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 0.2 }}
                                                    className="px-6 py-4 bg-blue-50"
                                                >
                                                    <div className="flex justify-end">
                                                        <div className="w-full md:w-64">
                                                            <div className="flex justify-between py-2">
                                                                <span className="font-medium">Restaurant Subtotal</span>
                                                                <span className="font-bold">${restaurantGroups[restaurantId].totalPrice.toFixed(2)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </motion.div>
                                        )
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Order Summary */}
                            <div className="lg:col-span-1 bg-gray-50">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="p-6 sticky top-0"
                                >
                                    <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

                                    <div className="space-y-4">
                                        <div className="flex justify-between py-2 border-b">
                                            <span className="font-medium text-gray-600">Subtotal</span>
                                            <span className="font-medium">${cart.totalPrice.toFixed(2)}</span>
                                        </div>

                                        <div className="flex justify-between py-2 border-b">
                                            <span className="font-medium text-gray-600">Tax</span>
                                            <span className="text-gray-600">Calculated at checkout</span>
                                        </div>

                                        <div className="flex justify-between py-4 mt-2">
                                            <span className="font-bold text-xl">Total</span>
                                            <span className="font-bold text-xl text-blue-800">${cart.totalPrice.toFixed(2)}</span>
                                        </div>

                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={proceedToCheckout}
                                            className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl hover:shadow-lg font-medium flex items-center justify-center space-x-2 transition-all duration-300"
                                        >
                                            <span>Proceed to Checkout</span>
                                            <ArrowRight size={18} />
                                        </motion.button>

                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            onClick={() => navigate('/restaurants')}
                                            className="w-full mt-4 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 font-medium transition-colors"
                                        >
                                            Continue Shopping
                                        </motion.button>
                                    </div>

                                    {/* Order Protection */}
                                    <div className="mt-10 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                        <h3 className="font-medium text-blue-800 mb-2">Secure Checkout</h3>
                                        <p className="text-sm text-gray-600">Your order is protected by our secure payment system.</p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
            <Footer/>
        </>
    );
};

export default CartPage;