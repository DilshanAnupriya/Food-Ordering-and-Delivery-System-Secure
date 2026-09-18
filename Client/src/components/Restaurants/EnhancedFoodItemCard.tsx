import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

interface FoodItemCardProps {
    item: FoodItem;
    calculateFinalPrice: (price: number, discount: number) => string;
    addToCart: (item: FoodItem) => void;
    addedItemId: string | null;
}

const EnhancedFoodItemCard = ({
                                  item,
                                  calculateFinalPrice,
                                  addToCart,
                                  addedItemId
                              }: FoodItemCardProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

    // Calculate if item is on sale
    const isOnSale = item.discount > 0;

    // Decide badge background based on availability and type
    const getBadgeColor = () => {
        if (!item.available) return "bg-gray-500";
        return item.type === "Veg" ? "bg-emerald-500" : "bg-red-600";
    };

    return (
        <motion.div
            className="relative w-70 h-100 bg-white  rounded-xl overflow-hidden shadow-md"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{
                opacity: 1,
                y: 0,
                transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.1
                }
            }}
            viewport={{ once: true, margin: "-100px" }}
            whileHover={{
                y: -10,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                transition: { type: "spring", stiffness: 500 }
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                setIsDetailsExpanded(false);
            }}
            layout
        >
            {/* Ribbon for popular or featured items */}
            {item.discount >= 15 && (
                <motion.div
                    className="absolute -right-12 top-6 bg-orange-500 text-white py-1 px-12 text-sm font-medium z-20 shadow-md"
                    initial={{ opacity: 0, rotate: 45 }}
                    animate={{ opacity: 1 }}
                    style={{ transform: "rotate(45deg)" }}
                >
                    POPULAR
                </motion.div>
            )}

            {/* Image section */}
            <div className="relative h-52 overflow-hidden">
                <motion.img
                    src={item.imageUrl || "/api/placeholder/400/300"}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    initial={{ scale: 1 }}
                    animate={{
                        scale: isHovered ? 1.08 : 1,
                        filter: isHovered ? "brightness(0.85) contrast(1.1)" : "brightness(1) contrast(1)"
                    }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                />

                {/* Availability badge */}
                <motion.div
                    className={`absolute top-4 left-4 ${getBadgeColor()} text-white px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm shadow-lg z-10`}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                >
                    {!item.available ? "OUT OF STOCK" : item.type}
                </motion.div>

                {/* Discount tag */}
                {isOnSale && (
                    <motion.div
                        className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg z-10"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, delay: 0.3 }}
                    >
                        {item.discount}% OFF
                    </motion.div>
                )}

                {/* Hover overlay with quick-add */}
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent flex flex-col justify-end p-4 z-20"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <motion.button
                                className={`w-full py-2.5 rounded-lg font-medium shadow-xl text-white ${
                                    !item.available
                                        ? "bg-gray-500 cursor-not-allowed"
                                        : addedItemId === item.foodItemId
                                            ? "bg-green-500"
                                            : "bg-orange-500 hover:bg-orange-600"
                                }`}
                                disabled={!item.available}
                                onClick={() => item.available && addToCart(item)}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 10, opacity: 0 }}
                                transition={{ delay: 0.1, type: "spring" }}
                                whileHover={{ scale: item.available ? 1.03 : 1 }}
                                whileTap={{ scale: item.available ? 0.97 : 1 }}
                            >
                                {!item.available ? (
                                    "Out of Stock"
                                ) : addedItemId === item.foodItemId ? (
                                    <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Added to Cart
                  </span>
                                ) : (
                                    <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add to Cart
                  </span>
                                )}
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Content section */}
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <motion.h3
                        className="text-lg font-bold text-gray-800 truncate"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        {item.name}
                    </motion.h3>

                    <motion.div
                        className="flex items-center bg-gray-100 rounded-full px-2 py-0.5 text-xs font-medium text-gray-600"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        4.8
                    </motion.div>
                </div>

                <motion.div
                    className="flex items-center text-sm text-gray-500 mb-2"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {item.restaurantName}
                </motion.div>

                <AnimatePresence>
                    {isDetailsExpanded ? (
                        <motion.p
                            className="text-sm text-gray-600 mb-3"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {item.description}
                        </motion.p>
                    ) : (
                        <motion.p
                            className="text-sm text-gray-600 mb-3 line-clamp-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            {item.description}
                        </motion.p>
                    )}
                </AnimatePresence>

                <motion.div
                    className="flex justify-between items-center mt-auto pt-2 border-t border-gray-100"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <div className="flex items-baseline">
                        {isOnSale ? (
                            <>
                <span className="text-lg font-bold text-orange-600">
                  ${calculateFinalPrice(item.price, item.discount)}
                </span>
                                <span className="ml-2 text-sm text-gray-500 line-through">
                  ${item.price.toFixed(2)}
                </span>
                            </>
                        ) : (
                            <span className="text-lg font-bold text-gray-900">
                ${item.price.toFixed(2)}
              </span>
                        )}
                    </div>

                    <motion.div
                        className="flex items-center text-xs text-gray-500"
                        whileHover={{ scale: 1.05 }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        15-25 min
                    </motion.div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default EnhancedFoodItemCard;