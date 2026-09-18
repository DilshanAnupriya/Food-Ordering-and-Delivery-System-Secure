import { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import SectionWrapper from "../../hoc/SectionWrapper.tsx";
import {Link} from "react-router-dom";

interface PartnerCardProps {
    img: string;
    headTxt: string;
    subheadTxt: string;
    description: string;
    index: number;
    link: string;
}

const PartnerCard = ({ img, headTxt, subheadTxt, description, index,link }: PartnerCardProps) => {
    const controls = useAnimation();
    const [ref, inView] = useInView({
        threshold: 0.25,
        triggerOnce: true
    });

    useEffect(() => {
        if (inView) {
            controls.start("visible");
        }
    }, [controls, inView]);

    // Card animation variants
    const cardVariants = {
        hidden: {
            opacity: 0,
            y: 50
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 80,
                damping: 15,
                delay: index * 0.2
            }
        }
    };

    // Content animation variants
    const contentVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3 + index * 0.1
            }
        }
    };

    // Text animation variants
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };



    return (
        <motion.div
            ref={ref}
            className="w-full lg:w-1/2 p-4"
            variants={cardVariants}
            initial="hidden"
            animate={controls}
        >
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-64 overflow-hidden">
                    <img
                        src={img || "/api/placeholder/600/400"}
                        alt={headTxt}
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70"></div>
                    <div className="absolute bottom-0 left-0 w-full p-6">
                        <motion.div variants={contentVariants} initial="hidden" animate={controls}>
                            <motion.span variants={itemVariants} className="inline-block bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium mb-2">
                                {subheadTxt}
                            </motion.span>
                            <motion.h3 variants={itemVariants} className="text-white text-2xl font-bold">
                                {headTxt}
                            </motion.h3>
                        </motion.div>
                    </div>
                </div>

                <motion.div
                    className="p-6"
                    variants={contentVariants}
                    initial="hidden"
                    animate={controls}
                >
                    <motion.p variants={itemVariants} className="text-gray-600 mb-6">
                        {description}
                    </motion.p>
                    <Link to={link}>
                    <motion.button
                        variants={itemVariants}
                        className="w-full bg-orange-500 text-white font-medium py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors duration-300 flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}

                    >

                        Get Started
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </motion.button>
                    </Link>
                </motion.div>
            </div>
        </motion.div>
    );
};

const PartnerSection = () => {
    const controls = useAnimation();
    const [ref, inView] = useInView({
        threshold: 0.1,
        triggerOnce: true
    });

    useEffect(() => {
        if (inView) {
            controls.start("visible");
        }
    }, [controls, inView]);

    // Header animation variants
    const headerVariants = {
        hidden: { opacity: 0, y: -30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                when: "beforeChildren",
                staggerChildren: 0.2
            }
        }
    };

    // Text element variants
    const textVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    ref={ref}
                    className="text-center mb-16"
                    variants={headerVariants}
                    initial="hidden"
                    animate={controls}
                >
                    <motion.span variants={textVariants} className="text-orange-500 font-medium text-lg">
                        Join Our Network
                    </motion.span>

                    <motion.h2 variants={textVariants} className="mt-2 text-4xl md:text-5xl font-bold text-gray-900">
                        Grow With Our Food Delivery Platform
                    </motion.h2>

                    <motion.div variants={textVariants} className="h-1 w-24 bg-orange-500 mx-auto mt-4"></motion.div>

                    <motion.p variants={textVariants} className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
                        Partner with us to expand your business reach or start earning as a delivery professional
                    </motion.p>
                </motion.div>

                <div className="flex flex-col lg:flex-row flex-wrap -mx-4">
                    <PartnerCard
                        img="https://www.touchbistro.com/wp-content/uploads/2024/03/how-to-create-a-successful-restaurant-partnership-thumbnail.jpg"
                        subheadTxt="For Restaurants"
                        headTxt="Become a Restaurant Partner"
                        description="Join thousands of restaurants that deliver with our platform. Increase your sales, reach new customers, and grow your business with our advanced ordering technology."
                        index={0}
                        link="/res/create"
                    />

                    <PartnerCard
                        img="https://www.rca.asn.au/hubfs/Website/Media/online%20food%20delivery.png"
                        subheadTxt="For Drivers"
                        headTxt="Deliver With Us"
                        description="Enjoy flexible hours, competitive earnings, and weekly payments. Be your own boss and earn money by delivering food from local restaurants to hungry customers."
                        index={1}
                        link="/driver-form"
                    />
                </div>

                <motion.div
                    className="mt-16 text-center"
                    variants={textVariants}
                    initial="hidden"
                    animate={controls}
                >
                    <motion.a
                        href="#learn-more"
                        className="inline-flex items-center text-orange-500 font-medium hover:text-orange-600 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Learn more about partnership opportunities
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-3.293-3.293a1 1 0 111.414-1.414l4 4z" clipRule="evenodd" />
                        </svg>
                    </motion.a>
                </motion.div>
            </div>
        </section>
    );
};

// Wrap with the SectionWrapper HOC
const PartnerSectionWrapper = SectionWrapper(PartnerSection);

export default PartnerSectionWrapper;