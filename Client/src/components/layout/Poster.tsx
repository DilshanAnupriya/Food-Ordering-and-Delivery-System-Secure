import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import logo from "../../../public/assets/logo.jpeg"
const FoodDeliveryPoster = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [isInView, setIsInView] = useState(false);

    // Mock images for food categories
    const foodCategories = [
        { name: "Pizza", icon: "🍕" },
        { name: "Burgers", icon: "🍔" },
        { name: "Sushi", icon: "🍣" },
        { name: "Salad", icon: "🥗" }
    ];

    useEffect(() => {
        // Set in view after component mounts for entrance animation
        const timer = setTimeout(() => {
            setIsInView(true);
        }, 300);

        return () => clearTimeout(timer);
    }, []);

    // Poster container animations
    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: "easeOut",
                staggerChildren: 0.1
            }
        }
    };

    // Poster image animations
    const posterVariants = {
        normal: {
            scale: 1,
            boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.15)",
            transition: {
                duration: 0.5,
                ease: "easeInOut"
            }
        },
        hover: {
            scale: 1.03,
            boxShadow: "0px 20px 40px rgba(0, 0, 0, 0.3)",
            transition: {
                duration: 0.3,
                ease: "easeInOut"
            }
        }
    };

    // Category item animations
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    // Feature item animations
    const featureVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    // Button animation
    const buttonVariants = {
        normal: { scale: 1 },
        hover: {
            scale: 1.05,
            boxShadow: "0px 5px 15px rgba(255, 90, 31, 0.4)",
            transition: {
                duration: 0.2,
                ease: "easeInOut",
                yoyo: Infinity
            }
        }
    };

    return (
        <div className="flex justify-center items-center w-full py-20 ">
            <motion.div
                className="w-full max-w-6xl relative rounded-2xl overflow-hidden"
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={containerVariants}
            >
                {/* Decorative background elements */}
                <motion.div
                    className="absolute -top-20 -left-20 w-40 h-40 bg-orange-500 rounded-full opacity-10 blur-2xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.15, 0.1],
                    }}
                    transition={{ duration: 6, repeat: Infinity, repeatType: "reverse" }}
                />
                <motion.div
                    className="absolute bottom-40 -right-20 w-40 h-40 bg-red-500 rounded-full opacity-10 blur-2xl"
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.1, 0.18, 0.1],
                    }}
                    transition={{ duration: 7, repeat: Infinity, repeatType: "reverse", delay: 1 }}
                />

                {/* Main poster content */}
                <motion.div
                    className="flex flex-col md:flex-row bg-white shadow-xl rounded-2xl overflow-hidden"
                    variants={posterVariants}
                    initial="normal"
                    animate={isHovered ? "hover" : "normal"}
                    onHoverStart={() => setIsHovered(true)}
                    onHoverEnd={() => setIsHovered(false)}
                >
                    {/* Left side - imagery */}
                    <motion.div
                        className="relative md:w-1/2 bg-gradient-to-br from-orange-50 to-white overflow-hidden"
                    >
                        {/* Food hero image */}
                        <motion.div
                            className="relative h-full flex items-center justify-center p-6"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Image placeholder - would be a real image in production */}
                            <div className="relative z-10 w-full h-96 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center overflow-hidden shadow-lg">
                                <motion.span
                                    className="text-9xl"
                                    animate={{
                                        y: [0, -10, 0],
                                        rotate: [0, 5, 0]
                                    }}
                                    transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                                >
                                      <div className="w-58 h-60 bg-[url('public/assets/logo.jpeg')] bg-cover bg-center  rounded-4xl flex items-center justify-center">
                                </div>
                                </motion.span>
                            </div>

                            {/* Floating decorative elements */}
                            <motion.div
                                className="absolute top-4 left-4 w-20 h-20 bg-yellow-400 rounded-full opacity-30 blur-md"
                                animate={{
                                    x: [0, 5, 0],
                                    y: [0, -5, 0]
                                }}
                                transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                            />
                            <motion.div
                                className="absolute bottom-8 right-8 w-16 h-16 bg-red-400 rounded-full opacity-30 blur-md"
                                animate={{
                                    x: [0, -5, 0],
                                    y: [0, 5, 0]
                                }}
                                transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", delay: 1 }}
                            />
                        </motion.div>
                    </motion.div>

                    {/* Right side - text content */}
                    <motion.div className="md:w-1/2 p-8 lg:p-10 flex flex-col justify-between">
                        <div>
                            <motion.div
                                className="mb-6"
                                variants={featureVariants}
                            >
                                <motion.h2
                                    className="text-3xl md:text-4xl font-bold text-gray-800 mb-2"
                                    animate={{
                                        color: isHovered ? "#f97316" : "#1f2937"
                                    }}
                                    transition={{ duration: 0.3 }}
                                >
                                    QuickBite
                                </motion.h2>
                                <motion.p className="text-lg md:text-xl font-medium text-orange-500">
                                    Fast Food Delivery App
                                </motion.p>
                            </motion.div>

                            <motion.p
                                className="text-gray-600 mb-6"
                                variants={featureVariants}
                            >
                                Order delicious food from your favorite restaurants and get it delivered to your doorstep in minutes!
                            </motion.p>

                            {/* Features */}
                            <div className="space-y-4 mb-8">
                                <motion.div
                                    className="flex items-center gap-3"
                                    variants={featureVariants}
                                >
                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                                        <motion.span
                                            whileHover={{ rotate: 20, scale: 1.2 }}
                                        >
                                            ⚡
                                        </motion.span>
                                    </div>
                                    <p className="text-gray-700 font-medium">Lightning fast delivery</p>
                                </motion.div>

                                <motion.div
                                    className="flex items-center gap-3"
                                    variants={featureVariants}
                                >
                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                                        <motion.span
                                            whileHover={{ rotate: -20, scale: 1.2 }}
                                        >
                                            🔍
                                        </motion.span>
                                    </div>
                                    <p className="text-gray-700 font-medium">Real-time order tracking</p>
                                </motion.div>

                                <motion.div
                                    className="flex items-center gap-3"
                                    variants={featureVariants}
                                >
                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                                        <motion.span
                                            whileHover={{ rotate: 20, scale: 1.2 }}
                                        >
                                            💸
                                        </motion.span>
                                    </div>
                                    <p className="text-gray-700 font-medium">Exclusive deals & discounts</p>
                                </motion.div>
                            </div>

                            {/* Category chips */}
                            <motion.div
                                className="flex flex-wrap gap-2 mb-8"
                                variants={featureVariants}
                            >
                                {foodCategories.map((category, index) => (
                                    <motion.div
                                        key={index}
                                        className="px-4 py-2 bg-orange-50 rounded-full flex items-center gap-2 border border-orange-100"
                                        variants={itemVariants}
                                        whileHover={{
                                            scale: 1.05,
                                            backgroundColor: "#fff7ed",
                                            boxShadow: "0px 4px 8px rgba(249, 115, 22, 0.15)"
                                        }}
                                    >
                                        <span>{category.icon}</span>
                                        <span className="text-gray-700 font-medium">{category.name}</span>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>

                        {/* CTA Section */}
                        <motion.div className="mt-auto" variants={featureVariants}>
                            <motion.button
                                className="w-full py-3 px-6 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl"
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap={{ scale: 0.95 }}
                            >
                                Download Now
                            </motion.button>
                            <motion.p
                                className="text-center text-gray-500 text-sm mt-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: isHovered ? 1 : 0.7 }}
                                transition={{ duration: 0.3 }}
                            >
                                Available on iOS and Android
                            </motion.p>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default FoodDeliveryPoster;