
import { Clock, Star, MapPin, Flame, ChefHat, ShoppingBag, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import {Link} from "react-router-dom";

const Banner = () => {
  // Features of the delivery service
  const features = [
    { Icon: Clock, title: "Fast Delivery", description: "30 minutes or less" },
    { Icon: Star, title: "Top Rated", description: "4.8+ star restaurants" },
    { Icon: MapPin, title: "Live Tracking", description: "Real-time updates" }
  ];

  // Burger decoration elements for modern look
  const burgerElements = [
    { icon: <Flame size={22} />, color: "#FF6B6B", label: "Flame Grilled" },
    { icon: <ChefHat size={22} />, color: "#A5907E", label: "Chef's Special" },
    { icon: <ShoppingBag size={22} />, color: "#4CAF50", label: "Fresh Daily" }
  ];

  return (
      <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        <div
            className="absolute inset-0 bg-cover bg-center z-0"
            style={{
              backgroundImage: "url('/api/placeholder/1950/1080')",
              backgroundPosition: "center"
            }}
        >
          {/* Darker gradient overlay for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/60"></div>
        </div>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-15 pb-25 relative z-10 w-full">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            {/* Left Content - Text and CTA - Clean with no icons */}
            <div className="text-white space-y-8 lg:w-3/5 pt-30 relative">
              <div className="space-y-6 relative z-10">
                {/* Badge */}
                <motion.div
                    className="inline-flex items-center px-4 py-1.5 rounded-full bg-orange-500/20 text-orange-400 text-sm font-medium backdrop-blur-sm border border-orange-500/30"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                  <span className="mr-1.5">★</span>
                  <span>Premium Local Restaurants</span>
                </motion.div>

                {/* Heading - Made larger and more impactful */}
                <motion.h1
                    className="text-5xl md:text-7xl font-bold leading-tight tracking-tight"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                  Delicious Food
                  <span className="block text-orange-500 mt-3">Delivered Fast</span>
                </motion.h1>

                {/* Description - More professional tone */}
                <motion.p
                    className="text-gray-300 text-lg md:text-xl max-w-xl leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                  Experience premium cuisine from top-rated local restaurants delivered to your doorstep. Enjoy free delivery on your first order.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    className="pt-6 flex flex-wrap gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Link to="/cart/:id">
                  <motion.button
                      className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 flex items-center gap-2"
                      whileHover={{
                        scale: 1.03,
                        boxShadow: "0px 10px 25px rgba(255,107,107,0.4)",
                      }}
                      whileTap={{ scale: 0.97 }}
                  >
                    <ShoppingBag size={20} />
                    Order Now
                  </motion.button>
                    </Link>
                    <Link to="/restaurants">
                  <motion.button
                      className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
                      whileHover={{
                        scale: 1.03,
                        backgroundColor: "rgba(255,255,255,0.2)",
                      }}
                      whileTap={{ scale: 0.97 }}
                  >
                    <Star size={20} />
                    View Menu
                  </motion.button>
                    </Link>
                </motion.div>


                {/* Features - Redesigned for cleaner look with hover effects */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                  {features.map((feature, index) => (
                      <motion.div
                          key={index}
                          className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 cursor-pointer"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                          whileHover={{
                            backgroundColor: "rgba(255,255,255,0.15)",
                            y: -5,
                            boxShadow: "0px 10px 25px rgba(0,0,0,0.2)",
                          }}
                      >
                        <motion.div
                            className="p-2 rounded-full bg-orange-500/20 backdrop-blur-sm"
                            whileHover={{
                              backgroundColor: "rgba(249,115,22,0.3)",
                              rotate: 360,
                              transition: { rotate: { duration: 0.5 } }
                            }}
                        >
                          <feature.Icon size={20} className="text-orange-400" />
                        </motion.div>
                        <div>
                          <h3 className="text-sm font-medium text-white">{feature.title}</h3>
                          <p className="text-xs text-gray-300">{feature.description}</p>
                        </div>
                      </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>

            {/* Right Content - Enhanced Burger Animation */}
            <div className="relative h-106 lg:w-2/5 ml-10 mt-20 lg:mt-0 hidden lg:block">
              {/* Main circular backdrop */}
              <motion.div
                  className="absolute inset-0 w-126 h-126 rounded-full bg-gradient-to-br from-orange-500/20 to-red-600/10 backdrop-blur-md flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    delay: 0.5
                  }}
              >
                {/* Animated ring */}
                <motion.div
                    className="absolute w-full h-full rounded-full border-4 border-dashed border-orange-500/20"
                    animate={{
                      rotate: 360,
                      transition: { duration: 20, repeat: Infinity, ease: "linear" }
                    }}
                ></motion.div>

                {/* Inner glow */}
                <motion.div
                    className="w-4/5 h-4/5 rounded-full bg-gradient-to-br from-orange-500/10 to-red-600/5 backdrop-blur-sm border border-orange-500/20"
                    animate={{
                      scale: [1, 1.05, 1],
                      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                    }}
                ></motion.div>
              </motion.div>

              {/* Main Burger PNG with enhanced animations */}
              <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, type: "spring", damping: 12 }}
              >
                <motion.div
                    className="relative"
                    whileHover={{
                      scale: 1.05,
                      rotate: [0, -2, 2, 0],
                      transition: { duration: 0.5 }
                    }}
                    animate={{
                      y: [0, -15, 0],
                      transition: {
                        y: {
                          repeat: Infinity,
                          repeatType: "reverse",
                          duration: 3,
                          ease: "easeInOut"
                        }
                      }
                    }}
                >
                  {/* Burger image with enhanced shadow effect */}
                  <motion.img
                      src="public/assets/burger.png"
                      alt="Delicious Burger"
                      className="w-64 mt-20 ml-10 h-auto"
                      style={{
                        filter: "drop-shadow(0px 20px 30px rgba(0,0,0,0.4))"
                      }}
                      whileHover={{
                        filter: "drop-shadow(0px 30px 40px rgba(255,107,107,0.6))",
                        transition: { duration: 0.3 }
                      }}
                  />

                  {/* Animated particles/sparkles around burger */}
                  {[...Array(8)].map((_, index) => (
                      <motion.div
                          key={index}
                          className="absolute w-2 h-2 rounded-full bg-orange-500"
                          style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                          }}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0],
                            x: [0, (Math.random() - 0.5) * 40],
                            y: [0, (Math.random() - 0.5) * 40],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 2 + Math.random() * 2,
                            delay: Math.random() * 2,
                          }}
                      />
                  ))}
                </motion.div>
              </motion.div>

              {/* Improved Modern burger element labels with better positioning */}
              {burgerElements.map((element, index) => {
                // Better positions around the burger
                const positions = [
                  { top: "20%", left: "10%" },  // Top left position
                  { top: "45%", right: "5%" },  // Middle right position
                  { bottom: "15%", left: "25%" } // Bottom left position
                ];

                return (
                    <motion.div
                        key={index}
                        className="absolute"
                        style={{
                          ...positions[index],
                          zIndex: 20
                        }}
                        initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.2 }}
                    >
                      <motion.div
                          className="flex items-center space-x-2 bg-black/50 px-3 py-2 rounded-full backdrop-blur-md border border-white/10"
                          whileHover={{
                            scale: 1.1,
                            backgroundColor: "rgba(0,0,0,0.7)",
                            boxShadow: `0px 5px 15px rgba(${index === 0 ? '255,107,107' : index === 1 ? '165,144,126' : '76,175,80'},0.3)`,
                            x: index % 2 === 0 ? 5 : -5,
                            transition: { duration: 0.3 }
                          }}
                      >
                        <motion.div
                            className="text-white"
                            whileHover={{ rotate: 360, transition: { duration: 0.5 } }}
                            style={{ color: element.color }}
                        >
                          {element.icon}
                        </motion.div>
                        <span className="text-white text-xs font-medium">{element.label}</span>
                      </motion.div>
                    </motion.div>
                );
              })}

              {/* Animated highlight effects */}
              <motion.div
                  className="absolute top-1/4 left-1/4 w-16 h-16 rounded-full bg-white/20 blur-xl"
                  animate={{
                    opacity: [0.2, 0.5, 0.2],
                    scale: [1, 1.2, 1],
                    transition: { duration: 3, repeat: Infinity }
                  }}
              ></motion.div>
            </div>
          </div>
        </div>

        {/* Scroll Down Animation */}
        <motion.div
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
        >
          <motion.p
              className="text-white/70 text-sm mb-1 font-medium"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
          >
            Scroll Down
          </motion.p>
          <motion.div
              className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full p-2"
              animate={{
                y: [0, 10, 0],
                boxShadow: [
                  "0px 0px 0px rgba(255,255,255,0.3)",
                  "0px 8px 15px rgba(255,255,255,0.2)",
                  "0px 0px 0px rgba(255,255,255,0.3)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown size={20} className="text-white" />
          </motion.div>
        </motion.div>

        {/* Subtle Background Elements for depth */}
        <motion.div
            className="absolute -bottom-20 -left-20 w-96 h-96 bg-orange-500 rounded-full opacity-5 z-0"
            initial={{ scale: 0.8 }}
            animate={{
              scale: [0.8, 1, 0.8],
              transition: { duration: 10, repeat: Infinity, repeatType: "reverse" }
            }}
        ></motion.div>
        <motion.div
            className="absolute -top-60 -right-40 w-96 h-96 bg-red-500 rounded-full opacity-5 z-0"
            initial={{ scale: 0.8 }}
            animate={{
              scale: [0.8, 1.1, 0.8],
              transition: { duration: 12, repeat: Infinity, repeatType: "reverse" }
            }}
        ></motion.div>
      </div>
  );
};

export default Banner;