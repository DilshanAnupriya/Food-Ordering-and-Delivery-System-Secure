import React, { useRef, useState } from "react";
import { motion, useInView, useAnimation } from 'framer-motion';
import SectionWrapper from "../../hoc/SectionWrapper.tsx";
import { AiFillStar } from 'react-icons/ai';
import { BiTimer } from 'react-icons/bi';
import { MdDeliveryDining } from 'react-icons/md';
import {Link} from "react-router-dom";

// Animation variants
const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.3
        }
    }
};

const cardVariants = {
    hidden: {
        y: 50,
        opacity: 0
    },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 12
        }
    }
};

const titleVariants = {
    hidden: {
        x: -50,
        opacity: 0
    },
    visible: {
        x: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            duration: 0.8
        }
    }
};

const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.5 }
    }
};

interface DiscountProps {
    image: string;
    name: string;
    restaurant: string;
    discount: string;
    rating: number;
    deliveryTime: string;
    deliveryFee?: string;
}

const Nav = () => {
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={titleVariants}
            className="flex justify-between items-center py-10 pl-3 mb-6"
        >
            <div>
                <h2 className="text-3xl font-bold text-gray-800">
                    Exclusive <span className="text-orange-500">Deals</span>
                </h2>
                <p className="text-gray-500 mt-2">Limited time offers you can't resist</p>
            </div>
            <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "#ea580c" }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2 bg-orange-500 text-white rounded-full font-medium text-sm transition-colors duration-300"
            >
                View All
            </motion.button>
        </motion.div>
    );
};

const DiscountCard: React.FC<DiscountProps> = ({
                                                   image,
                                                   name,
                                                   restaurant,
                                                   discount,
                                                   rating,
                                                   deliveryTime,
                                                   deliveryFee = "Free"
                                               }) => {
    const cardRef = useRef(null);
    const isInView = useInView(cardRef, { once: true, amount: 0.2 });
    const [isHovered, setIsHovered] = useState(false);

    // Placeholder image for demo purposes
    const placeholderImage = "/api/placeholder/400/320";

    return (
        <motion.div
            ref={cardRef}
            variants={cardVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="relative bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 w-full max-w-xs mx-auto"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            whileHover={{
                y: -10,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                transition: { duration: 0.3 }
            }}
        >
            <div className="relative">
                <img
                    src={image ? image : placeholderImage}
                    alt={`${name} from ${restaurant}`}
                    className="w-full h-48 object-cover"
                />

                {/* Discount badge with animation */}
                <motion.div
                    className="absolute top-3 right-3 bg-orange-500 text-white font-bold py-1 px-3 rounded-full text-sm"
                    animate={{ scale: isHovered ? 1.1 : 1 }}
                    transition={{ duration: 0.2 }}
                >
                    {discount}
                </motion.div>
            </div>

            <div className="p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">{name}</h3>
                        <p className="text-gray-500 text-sm">{restaurant}</p>
                    </div>
                    <div className="flex items-center bg-gray-100 px-2 py-1 rounded-full">
                        <AiFillStar className="text-yellow-500 mr-1" />
                        <span className="text-sm font-medium">{rating}</span>
                    </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <div className="flex items-center text-gray-600">
                        <BiTimer className="mr-1" />
                        <span className="text-xs">{deliveryTime}</span>
                    </div>

                    <div className="flex items-center">
                        <MdDeliveryDining className="mr-1 text-orange-500" />
                        <span className="text-xs font-medium text-gray-700">{deliveryFee}</span>
                    </div>
                </div>
            </div>

            {/* Improved hover effect - slide up card overlay instead of black background */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-t from-orange-500 to-orange-400 flex items-center justify-center"
                initial={{ opacity: 0, y: "100%" }}
                animate={{
                    opacity: isHovered ? 0.95 : 0,
                    y: isHovered ? "0%" : "100%"
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            >
                <motion.div
                    className="text-center px-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <p className="text-white font-bold text-lg mb-2">{discount} OFF</p>
                    <p className="text-white mb-4">Limited time offer!</p>
                    <motion.button
                        whileHover={{ scale: 1.05, backgroundColor: "#fff", color: "#f97316" }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white text-orange-500 font-bold py-2 px-6 rounded-full shadow-lg transition-all duration-300"
                    >
                        Order Now
                    </motion.button>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

const Discount = () => {
    const controls = useAnimation();
    const promoRef = useRef(null);
    const isPromoInView = useInView(promoRef, { once: false, amount: 0.3 });

    React.useEffect(() => {
        if (isPromoInView) {
            controls.start("visible");
        }
    }, [controls, isPromoInView]);

    return (
        <section className="py-12 px-4 md:px-8 bg-white">
            <div className="w-full mx-auto px-10">
                <Nav />

                <motion.div
                    variants={sectionVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10"
                >
                    <DiscountCard
                        image="https://www.kitchensanctuary.com/wp-content/uploads/2021/05/Double-Cheeseburger-square-FS-42.jpg"
                        name="Cheese Burger"
                        restaurant="Burger King"
                        discount="-25%"
                        rating={4.5}
                        deliveryTime="15-25 min"
                    />

                    <DiscountCard
                        image="https://www.jennycancook.com/wp-content/uploads/2013/02/PeppPizza_600.jpg"
                        name="Margherita Pizza"
                        restaurant="Pizza Hut"
                        discount="-30%"
                        rating={4.7}
                        deliveryTime="20-30 min"
                    />
                    <DiscountCard
                        image="https://cdn.sanity.io/images/g1s4qnmz/production/9edf7c23ab535752b4e4c597636756078930551a-2500x2500.jpg"
                        name="Fried Rice"
                        restaurant="Keells"
                        discount="-5%"
                        rating={4.5}
                        deliveryTime="15-25 min"
                    />

                    <DiscountCard
                        image="https://images.arla.com/recordid/15F33607-F6D9-4952-B6AA210D3033BF14/club-sandwich1.jpg?format=jpg&width=1200&height=630&mode=crop"
                        name="Sandwich"
                        restaurant="BARISTA"
                        discount="-30%"
                        rating={4.7}
                        deliveryTime="20-30 min"
                    />

                    <DiscountCard
                        image="https://www.heinens.com/content/uploads/2022/05/Mocha-Iced-Coffee-with-Vanilla-Cold-Foam-800x550-1.jpg"
                        name="Iced Coffee"
                        restaurant="BARISTA"
                        discount="-15%"
                        rating={4.2}
                        deliveryTime="10-15 min"
                    />
                    <DiscountCard
                        image="https://www.wholesomeyum.com/wp-content/uploads/2022/12/wholesomeyum-Baked-Whole-Chicken-Wings-15.jpg"
                        name="Chicken Wings"
                        restaurant="KFC"
                        discount="-25%"
                        rating={4.5}
                        deliveryTime="15-25 min"
                    />

                    <DiscountCard
                        image="https://www.cuisinart.com/dw/image/v2/ABAF_PRD/on/demandware.static/-/Sites-us-cuisinart-sfra-Library/default/dw3a257599/images/recipe-Images/french-fries-airfryer-recipe.jpg?sw=1200&sh=1200&sm=fit"
                        name="French Fries"
                        restaurant="SUBWAY"
                        discount="-30%"
                        rating={4.7}
                        deliveryTime="20-30 min"
                    />

                    <DiscountCard
                        image="https://www.taco-bell.ro/wp-content/uploads/soft-taco-supreme-540x274.png"
                        name="Taco"
                        restaurant="Taco Bell"
                        discount="-15%"
                        rating={4.2}
                        deliveryTime="10-15 min"
                    />

                    {/* Modernized promotional banner */}
                    <motion.div
                        ref={promoRef}
                        variants={fadeIn}
                        initial="hidden"
                        animate={controls}
                        className="hidden lg:block md:col-span-2 lg:col-span-4 mt-12"
                    >
                        <motion.div
                            className="relative w-full bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500 rounded-2xl shadow-xl overflow-hidden"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="absolute -right-16 -top-16 w-64 h-64 bg-orange-300 rounded-full opacity-20"></div>
                            <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-orange-300 rounded-full opacity-20"></div>

                            <div className="flex flex-col md:flex-row items-center relative z-10">
                                <div className="p-8 md:w-2/3">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.2 }}
                                    >
                                        <h3 className="text-3xl font-bold text-white mb-2">
                                            Get 50% off your first order!
                                        </h3>
                                        <div className="w-20 h-1 bg-white opacity-70 mb-4"></div>
                                        <p className="text-orange-50 mb-4 text-lg">
                                            Use code <span className="font-bold text-white bg-orange-600 px-2 py-1 rounded-md mx-1">WELCOME50</span> at checkout
                                        </p>
                                        <p className="text-orange-50 mb-6 text-sm">Limited time offer. Terms & conditions apply.</p>

                                        <Link to="/cart/:id">
                                        <motion.button
                                            whileHover={{
                                                scale: 1.05,
                                                backgroundColor: "rgba(255, 255, 255, 0.9)",
                                                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2)"
                                            }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-8 py-3 bg-white text-orange-500 font-bold rounded-full shadow-md transition-all duration-300 flex items-center space-x-2"
                                        >
                                            <span>Order Now</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </motion.button>
                                        </Link>
                                    </motion.div>
                                </div>

                                <motion.div
                                    className="md:w-1/3 p-6 flex justify-center"
                                    animate={{
                                        y: [0, -10, 0],
                                        rotate: [0, 5, 0]
                                    }}
                                    transition={{
                                        duration: 5,
                                        repeat: Infinity,
                                        repeatType: "reverse"
                                    }}
                                >
                                    <div className="w-48 h-48 bg-[url('https://i.fbcd.co/products/resized/resized-750-500/73c4b33c29e94322066dbc5bfec443981bf035f6fe3da2a7646f3d3b5c5acbd1.jpg')] bg-cover bg-center rounded-full flex items-center justify-center">
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};


export default Discount;