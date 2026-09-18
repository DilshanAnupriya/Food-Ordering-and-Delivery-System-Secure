import React, { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const titleVariants = {
    hidden: {
        y: -30,
        opacity: 0
    },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 120,
            duration: 0.7
        }
    }
};

const dividerVariants = {
    hidden: { width: 0 },
    visible: {
        width: "6rem",
        transition: {
            duration: 0.8,
            ease: "easeOut"
        }
    }
};

// Skeleton loader for category cards
const CategoryCardSkeleton = () => {
    return (
        <div className="flex flex-col w-full rounded-2xl overflow-hidden shadow-md bg-white">
            <div className="h-48 bg-gray-200 animate-pulse"></div>
            <div className="p-4 bg-gray-100 animate-pulse">
                <div className="h-6 w-3/4 mx-auto bg-gray-300 rounded"></div>
                <div className="h-4 w-1/2 mx-auto bg-gray-300 rounded mt-2"></div>
            </div>
        </div>
    );
};

// @ts-ignore
const FoodCard = ({ categoryName, index }) => {
    const cardRef = useRef(null);
    const isInView = useInView(cardRef, { once: true, amount: 0.2 });

    // Food category images and colors
    const categoryImages = {
        "Italian": "https://media.cnn.com/api/v1/images/stellar/prod/210211142532-18-classic-italian-dishes.jpg?q=w_1110,c_fill",
        "fast food": "https://www.2foodtrippers.com/wp-content/uploads/2022/11/Big-Mac-Meal-at-McDonalds-1024x726.jpg",
        "Vegan": "https://frommybowl.com/wp-content/uploads/2019/01/Easy_Vegan_Chili_OilFree_FromMyBowl-4.jpg",
        "Desserts":"https://cdn.shopify.com/s/files/1/2690/0106/files/Elegant_Vanilla_Cream_Tartelettes_with_Nuts_and_Berries_From_Pin_To_Plate_480x480.jpg?v=1709554277",
        "Beverages": "https://www.pranfoods.net/sites/default/files/2023-08/BEVERAGE.jpeg",
        "default": "/api/placeholder/350/200"
    };

    // Colors for categories
    const categoryColors = {
        "Italian": "from-red-400 to-red-600",
        "fast food": "from-yellow-400 to-amber-500",
        "Desserts": "from-pink-400 to-rose-500",
        "Vegan": "from-green-400 to-emerald-600",
        "Beverages": "from-blue-400 to-sky-600",
        "default": "from-orange-400 to-orange-600"
    };

    const imageUrl = categoryImages[categoryName] || categoryImages.default;
    const gradientColor = categoryColors[categoryName] || categoryColors.default;

    // Animation variants for each card
    const cardVariants = {
        hidden: {
            opacity: 0,
            y: 50,
            rotateY: index % 2 === 0 ? -10 : 10,
        },
        visible: {
            opacity: 1,
            y: 0,
            rotateY: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 12,
                delay: index * 0.08
            }
        },
        hover: {
            y: -12,
            scale: 1.03,
            boxShadow: "0px 15px 25px rgba(0,0,0,0.1)",
            transition: { duration: 0.3 }
        }
    };

    // Animation for image zoom on hover
    const imageVariants = {
        hover: {
            scale: 1.1,
            transition: { duration: 0.5 }
        }
    };

    return (
        <motion.div
            ref={cardRef}
            className="flex flex-col w-full rounded-2xl overflow-hidden shadow-lg bg-white relative cursor-pointer"
            variants={cardVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            whileHover="hover"
        >
            <div className="h-48 overflow-hidden">
                <motion.img
                    src={imageUrl}
                    alt={`${categoryName} category`}
                    className="h-full w-full object-cover"
                    variants={imageVariants}
                />
            </div>
            <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100">
                <h2 className="font-semibold text-lg text-center text-gray-800">
                    {categoryName}
                </h2>
                <p className="text-sm text-gray-600 text-center mt-1">
                    Explore {categoryName.toLowerCase()} dishes
                </p>
            </div>

            {/* Improved hover effect - gradient overlay with button */}
            <motion.div
                className={`absolute inset-0 bg-gradient-to-b ${gradientColor} flex items-center justify-center opacity-0`}
                whileHover={{ opacity: 0.85 }}
                transition={{ duration: 0.3 }}
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileHover={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="text-center"
                >
                    <motion.p className="text-white font-bold text-xl mb-2">
                        {categoryName}
                    </motion.p>
                    <motion.button
                        className="bg-white text-orange-500 font-bold py-2 px-6 rounded-full shadow-lg hover:bg-orange-500 hover:text-white transition-colors duration-300"
                    >
                        Explore Now
                    </motion.button>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

const Category = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // References for scroll animations
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, amount: 0.1 });

    // For demo purposes, use hardcoded categories if API fails
    const fallbackCategories = ["Italian", "fast food", "Desserts", "Vegan", "Beverages"];

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://localhost:8082/api/v1/foods/categories');

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();

                if (data.code === 200 && Array.isArray(data.data)) {
                    setCategories(data.data);
                } else {
                    throw new Error('Invalid data format received from API');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
                console.error('Failed to fetch categories:', err);
                // Use fallback categories
                setCategories(fallbackCategories);
            } finally {
                // Add a slight delay to show the skeleton loader
                setTimeout(() => setLoading(false), 600);
            }
        };

        fetchCategories();
    }, []);

    return (
        <section ref={sectionRef} className="py-16 ml-5 px-4 md:px-8 bg-white rounded-xl">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    className="mb-10"
                >
                    <motion.h2
                        variants={titleVariants}
                        className="text-3xl font-bold text-gray-800"
                    >
                        Explore <span className="text-orange-500">Categories</span>
                    </motion.h2>

                    <motion.div
                        variants={dividerVariants}
                        className="h-1 bg-orange-500 mt-2"
                    ></motion.div>

                    <motion.p
                        variants={titleVariants}
                        className="mt-4 text-gray-600"
                    >
                        Find your favorite food by category
                    </motion.p>
                </motion.div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {Array(5).fill(0).map((_, index) => (
                            <CategoryCardSkeleton key={index} />
                        ))}
                    </div>
                ) : error && categories.length === 0 ? (
                    <motion.div
                        className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <p className="font-medium">Error loading categories:</p>
                        <p>{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-2 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                        variants={containerVariants}
                        initial="hidden"
                        animate={isInView ? "visible" : "hidden"}
                    >
                        {categories.map((category, index) => (
                            <FoodCard key={index} categoryName={category} index={index} />
                        ))}
                    </motion.div>
                )}
            </div>
        </section>
    );
};

export default Category;