import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import axios from "axios";
import SectionWrapper from "../../hoc/SectionWrapper.tsx";
import EnhancedFoodItemCard from "./EnhancedFoodItemCard.tsx";

// Define FoodItem interface
interface FoodItem {
    foodItemId: string;
    name: string;
    type: string;
    category: string;
    price: number;
    discount: number;
    imageUrl: string;
    description: string;
    available: boolean;
    restaurantId: string;
    restaurantName: string;
    createdAt: string;
}

// Cart item interface for sending to API
interface CartItem {
    foodItemId: string;
    foodName: string;
    foodImage?: string;
    restaurantId: string;
    restaurantName: string;
    price: number;
    quantity: number;
}

interface FoodItemsListProps {
    selectedCategory: string | null;
    foodItemsByCategory: Record<string, FoodItem[]>;
    foodItemsTotalCount: Record<string, number>;
    loadingFoodItems: boolean;
    calculateFinalPrice: (price: number, discount: number) => string;
    searchText: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const EnhancedFoodItemsList: React.FC<FoodItemsListProps> = ({
                                                                 selectedCategory,
                                                                 foodItemsByCategory,
                                                                 foodItemsTotalCount,
                                                                 loadingFoodItems,
                                                                 calculateFinalPrice,
                                                                 searchText,
                                                                 onSearchChange,
                                                             }) => {
    const [userId, setUserId] = useState<string | null>(null);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [addedItemId, setAddedItemId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isCartUpdating, setIsCartUpdating] = useState<boolean>(false);
    const [sortOption, setSortOption] = useState<string>("recommended");
    const [showNotification, setShowNotification] = useState<boolean>(false);
    const [notificationMessage, setNotificationMessage] = useState<string>("");

    const headerRef = useRef(null);
    const isHeaderInView = useInView(headerRef, { once: false, margin: "-100px 0px 0px 0px" });

    // Animation variants for staggered list animations
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.1
            }
        }
    };

    // Enhanced skeleton loading animation variants
    const skeletonVariants = {
        initial: {
            opacity: 0.6,
        },
        animate: {
            opacity: [0.6, 0.9, 0.6],
            transition: {
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut"
            }
        }
    };

    useEffect(() => {
        // Get user ID from local storage or other auth source
        const storedUserId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        if (storedUserId && token) {
            setUserId(storedUserId);
            // Fetch existing cart on component mount
            fetchUserCart(storedUserId);
        } else {
            setIsLoading(false);
        }
    }, []);

    const fetchUserCart = async (uid: string) => {
        setIsLoading(true);
        try {
            const response = await getCartByUserId(uid);
            if (response.data && response.data.cartItems) {
                setCartItems(response.data.cartItems);
            }
        } catch (error) {
            console.error("Error fetching cart:", error);
            // If 404 or cart not found, that's ok - we'll create one when adding items
        } finally {
            setIsLoading(false);
        }
    };

    // Create axios instance with auth headers
    const getCartAxios = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication token not found");
        }
        return axios.create({
            baseURL: "http://localhost:8082",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });
    };

    const getCartByUserId = async (userId: string) => {
        try {
            const axiosInstance = getCartAxios();
            const response = await axiosInstance.get(`/api/v1/cart/${userId}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching cart:", error);
            throw error;
        }
    };

    const addToCart = async (item: FoodItem) => {
        const currentUserId = localStorage.getItem("userId");
        const restaurantId = item.restaurantId;
        const token = localStorage.getItem("token");

        if (!currentUserId || !token) {
            // Show login modal or alert
            showNotification("Please log in to add items to cart", "error");
            return;
        }

        try {
            setIsCartUpdating(true);
            const axiosInstance = getCartAxios();
            const cartItem: CartItem = {
                foodItemId: item.foodItemId,
                foodName: item.name,
                foodImage: item.imageUrl,
                restaurantId: restaurantId,
                restaurantName: item.restaurantName,
                price:
                    item.discount > 0
                        ? parseFloat(calculateFinalPrice(item.price, item.discount))
                        : item.price,
                quantity: 1
            };

            // Show button animation
            setAddedItemId(item.foodItemId);
            setTimeout(() => {
                setAddedItemId(null);
            }, 1500);

            // Check if cart exists
            let hasExistingCart = false;
            try {
                const cartResponse = await axiosInstance.get(`/api/v1/cart/${currentUserId}`);
                hasExistingCart = !!(cartResponse.data && cartResponse.data.cartItems);
            } catch (err) {
                hasExistingCart = false;
            }

            if (hasExistingCart) {
                await axiosInstance.post(`/api/v1/cart/${currentUserId}/items`, [cartItem]);
            } else {
                await axiosInstance.post("/api/v1/cart", {
                    userId: currentUserId,
                    cartItems: [cartItem]
                });
            }

            // Show success notification
            showNotification(`${item.name} added to cart`, "success");

            setCartItems(prev => [...prev, cartItem]);
            setUserId(currentUserId);
        } catch (error) {
            console.error("Error adding item to cart:", error);
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                showNotification("Your session has expired. Please log in again.", "error");
            } else {
                showNotification("Failed to add item to cart", "error");
            }
        } finally {
            setIsCartUpdating(false);
        }
    };

    // // Function to show notification
    // const showNotification = (message: string, type: "success" | "error" = "success") => {
    //     setNotificationMessage(message);
    //     setShowNotification(true);
    //
    //     // Auto-hide notification after 3 seconds
    //     setTimeout(() => {
    //         setShowNotification(false);
    //     }, 3000);
    // };

    // Function to sort food items
    const getSortedFoodItems = () => {
        if (!selectedCategory || !foodItemsByCategory[selectedCategory]) return [];

        const items = [...foodItemsByCategory[selectedCategory]];

        switch (sortOption) {
            case "price-low":
                return items.sort((a, b) => {
                    const priceA = a.discount > 0
                        ? parseFloat(calculateFinalPrice(a.price, a.discount))
                        : a.price;
                    const priceB = b.discount > 0
                        ? parseFloat(calculateFinalPrice(b.price, b.discount))
                        : b.price;
                    return priceA - priceB;
                });
            case "price-high":
                return items.sort((a, b) => {
                    const priceA = a.discount > 0
                        ? parseFloat(calculateFinalPrice(a.price, a.discount))
                        : a.price;
                    const priceB = b.discount > 0
                        ? parseFloat(calculateFinalPrice(b.price, b.discount))
                        : b.price;
                    return priceB - priceA;
                });
            case "discount":
                return items.sort((a, b) => b.discount - a.discount);
            case "veg":
                return items.sort((a, b) => {
                    if (a.type === "Veg" && b.type !== "Veg") return -1;
                    if (a.type !== "Veg" && b.type === "Veg") return 1;
                    return 0;
                });
            default: // recommended
                return items;
        }
    };

    // Empty state when no items are found
    const renderEmptyState = () => (
        <motion.div
            className="bg-gradient-to-br from-gray-50 to-gray-100 p-12 rounded-2xl text-center shadow-sm border border-gray-100"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
        >
            <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, delay: 0.2 }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto text-gray-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                </svg>
            </motion.div>
            <p className="text-gray-700 text-lg font-medium">
                No food items found in this category
            </p>
            <p className="text-gray-500 mt-2">
                Try selecting another category or adjusting your search
            </p>
        </motion.div>
    );

    // Skeleton loader for food items
    const renderSkeletons = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((index) => (
                <motion.div
                    key={`skeleton-${index}`}
                    className="bg-white rounded-xl shadow-md overflow-hidden"
                    variants={skeletonVariants}
                    initial="initial"
                    animate="animate"
                    custom={index}
                >
                    <div className="relative h-52 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 overflow-hidden">
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                            initial={{ x: "-100%" }}
                            animate={{ x: "100%" }}
                            transition={{
                                repeat: Infinity,
                                duration: 1.5,
                                ease: "linear",
                                delay: index * 0.2
                            }}
                        />
                    </div>

                    <div className="p-4">
                        <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-md w-3/4 mb-4" />
                        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-md w-full mb-2" />
                        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-md w-2/3 mb-6" />
                        <div className="flex justify-between items-center mt-4">
                            <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-md w-20" />
                            <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full w-28" />
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );

    if (!selectedCategory) return null;

    const sortedItems = getSortedFoodItems();

    return (
        <div className="mb-20">
            {/* Header with animations */}
            <motion.div
                ref={headerRef}
                className="sticky top-0 z-20 bg-white/90 shadow-3xl border-1 border-gray-300 backdrop-blur-lg px-4 py-6 mb-8 rounded-lg shadow-sm"
                initial={{ opacity: 0, y: -20 }}
                animate={{
                    opacity: 1,
                    y: 0,
                    boxShadow: isHeaderInView
                        ? "0 1px 3px rgba(0,0,0,0.05)"
                        : "0 10px 25px -5px rgba(0,0,0,0.1)"
                }}
                transition={{ duration: 0.4 }}
            >
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 relative">
                            {selectedCategory}
                            <motion.div
                                className="absolute -bottom-2 left-0 h-1.5 bg-gradient-to-r from-orange-500 to-red-400 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: "60%" }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                            />
                        </h2>
                        <p className="text-sm text-gray-500 mt-3">
                            {foodItemsTotalCount[selectedCategory]} items available
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <motion.input
                                type="text"
                                placeholder="Search food items..."
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm bg-white pr-10"
                                value={searchText}
                                onChange={onSearchChange}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                            />
                            <svg
                                className="absolute right-3.5 top-3 h-5 w-5 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative">
                            <select
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                className="appearance-none w-full px-4 py-2.5 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm bg-white text-gray-700 pr-10"
                            >
                                <option value="recommended">Recommended</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="discount">Highest Discount</option>
                                <option value="veg">Vegetarian First</option>
                            </select>
                            <svg
                                className="absolute right-3.5 top-3 h-5 w-5 text-gray-400 pointer-events-none"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Loading Skeletons */}
            {(loadingFoodItems || isLoading) && renderSkeletons()}

            {/* Empty State */}
            {!loadingFoodItems &&
                !isLoading &&
                sortedItems.length === 0 &&
                renderEmptyState()}

            {/* Food Items Grid */}
            {!loadingFoodItems &&
                !isLoading &&
                sortedItems.length > 0 && (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 "
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <AnimatePresence mode="popLayout">
                            {sortedItems.map((item) => (
                                <motion.div
                                    key={item.foodItemId}
                                    layout
                                    exit={{ opacity: 0, scale: 0.8 }}
                                >
                                    <EnhancedFoodItemCard
                                        item={item}
                                        calculateFinalPrice={calculateFinalPrice}
                                        addToCart={addToCart}
                                        addedItemId={addedItemId}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

            {/* Floating Notification */}
            <AnimatePresence>
                {showNotification && (
                    <motion.div
                        className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 ${
                            notificationMessage.includes("error") || notificationMessage.includes("failed") || notificationMessage.includes("expired")
                                ? "bg-red-600 text-white"
                                : "bg-green-500 text-white"
                        }`}
                        initial={{ opacity: 0, y: 50, scale: 0.3 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.5 }}
                        transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    >
                        {notificationMessage.includes("error") || notificationMessage.includes("failed") || notificationMessage.includes("expired") ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        )}
                        <span>{notificationMessage}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Back to top button - appears when scrolling down */}
            <AnimatePresence>
                {!isHeaderInView && (
                    <motion.button
                        className="fixed bottom-6 left-6 p-3 rounded-full bg-orange-500 text-white shadow-lg z-40"
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

const EnhancedFoodItemsListWrapper = SectionWrapper(EnhancedFoodItemsList);

export default EnhancedFoodItemsListWrapper;