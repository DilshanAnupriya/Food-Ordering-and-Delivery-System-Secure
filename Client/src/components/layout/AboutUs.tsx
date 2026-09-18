import { useState } from 'react';
import { Link } from 'react-router';

const FAQContent = () => {
    const [activeTabIndex, setActiveTabIndex] = useState(0);

    const tabsData = [
        {
            question: "How does Order.LK work?",
            cards: [
                {
                    title: "Browse & Select",
                    description: "Browse restaurants and select your favorite dishes",
                    icon: (
                        <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center text-orange-500 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
                                <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
                                <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
                                <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
                                <rect x="7" y="7" width="10" height="10" rx="2"></rect>
                            </svg>
                        </div>
                    ),
                },
                {
                    title: "Track in Real-Time",
                    description: "Monitor your order's progress from kitchen to your door",
                    icon: (
                        <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center text-orange-500 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 8c0-3.3-2.7-6-6-6S6 4.7 6 8c0 7 6 13 6 13s6-6 6-13"></path>
                                <circle cx="12" cy="8" r="2"></circle>
                            </svg>
                        </div>
                    ),
                },
                {
                    title: "Enjoy Your Meal",
                    description: "Receive hot, fresh food delivered right to your doorstep",
                    icon: (
                        <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center text-orange-500 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 4v4"></path>
                                <path d="M4 8l2.5 2.5"></path>
                                <path d="M19.5 10.5L22 8"></path>
                                <path d="M12 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
                                <path d="M18 12c-1.1 0-2 .9-2 2"></path>
                                <path d="M6 12c1.1 0 2 .9 2 2"></path>
                                <path d="M10.5 20l1.5-6 1.5 6"></path>
                                <path d="M7 20h10"></path>
                            </svg>
                        </div>
                    ),
                }
            ],
        },
        {
            question: "What payment methods are accepted?",
            cards: [
                {
                    title: "Credit/Debit Cards",
                    description: "We accept all major cards including Visa, Mastercard, and Amex",
                    icon: (
                        <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center text-orange-500 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                                <line x1="2" y1="10" x2="22" y2="10"></line>
                            </svg>
                        </div>
                    ),
                },
                {
                    title: "Digital Wallets",
                    description: "Pay easily with Apple Pay, Google Pay, and PayPal",
                    icon: (
                        <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center text-orange-500 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 7h-7.5"></path>
                                <path d="M14 17H6"></path>
                                <path d="M18 17h2"></path>
                                <rect x="2" y="3" width="20" height="14" rx="2"></rect>
                                <path d="M22 7v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2"></path>
                            </svg>
                        </div>
                    ),
                },
                {
                    title: "Cash on Delivery",
                    description: "Pay with cash when your order arrives at your doorstep",
                    icon: (
                        <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center text-orange-500 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                                <circle cx="12" cy="12" r="4"></circle>
                                <path d="M12 8v8"></path>
                                <path d="M8 12h8"></path>
                            </svg>
                        </div>
                    ),
                }
            ],
        },
        {
            question: "How do I track my order?",
            cards: [
                {
                    title: "Live GPS Tracking",
                    description: "Watch your delivery in real-time on an interactive map",
                    icon: (
                        <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center text-orange-500 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                            </svg>
                        </div>
                    ),
                },
                {
                    title: "Push Notifications",
                    description: "Receive updates at each stage of your order's journey",
                    icon: (
                        <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center text-orange-500 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            </svg>
                        </div>
                    ),
                },
                {
                    title: "Delivery Timeline",
                    description: "View estimated arrival time with precise countdown",
                    icon: (
                        <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center text-orange-500 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                        </div>
                    ),
                }
            ],
        },
        {
            question: "Are there any special promotions?",
            cards: [
                {
                    title: "Daily Special Offers",
                    description: "New restaurant deals and discounts every day",
                    icon: (
                        <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center text-orange-500 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                                <line x1="7" y1="7" x2="7.01" y2="7"></line>
                            </svg>
                        </div>
                    ),
                },
                {
                    title: "Order.LK Rewards",
                    description: "Earn points with every order to redeem for free meals",
                    icon: (
                        <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center text-orange-500 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                        </div>
                    ),
                },
                {
                    title: "Refer & Earn",
                    description: "Get LKR 300 off when friends use your referral code",
                    icon: (
                        <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center text-orange-500 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                    ),
                }
            ],
        },
        {
            question: "Is Order.LK available in my area?",
            cards: [
                {
                    title: "Extensive Coverage",
                    description: "We deliver across all major cities in Sri Lanka",
                    icon: (
                        <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center text-orange-500 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                        </div>
                    ),
                },
                {
                    title: "Rapid Expansion",
                    description: "New locations added every month across the country",
                    icon: (
                        <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center text-orange-500 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polygon points="10 8 16 12 10 16 10 8"></polygon>
                            </svg>
                        </div>
                    ),
                },
                {
                    title: "Instant Verification",
                    description: "Check delivery availability by entering your postal code",
                    icon: (
                        <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center text-orange-500 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                <polyline points="9 22 9 12 15 12 15 22"></polyline>
                            </svg>
                        </div>
                    ),
                }
            ],
        }
    ];

    return (
        <div className="bg-orange-50 rounded-2xl p-8 pb-20 ">
            <div className="max-w-6xl mx-auto">
                <div className="mb-10 text-center">
                    <h2 className="text-4xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Everything you need to know about ordering delicious food with Order.LK
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="flex flex-col lg:flex-row">
                        {/* Left side - Questions */}
                        <div className="w-full lg:w-1/3 bg-gray-50 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Common Questions</h3>
                            {tabsData.map((tab, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveTabIndex(idx)}
                                    className={`w-full text-left px-4 py-3 mb-3 rounded-lg transition-all duration-200 ease-in-out flex items-center ${
                                        activeTabIndex === idx
                                            ? 'bg-orange-500 text-white shadow-md'
                                            : 'bg-white text-gray-700 hover:bg-orange-100'
                                    }`}
                                >
                  <span className={`mr-3 flex items-center justify-center w-8 h-8 rounded-full ${
                      activeTabIndex === idx ? 'bg-white text-orange-500' : 'bg-orange-100 text-orange-500'
                  }`}>
                    {idx + 1}
                  </span>
                                    <span className="font-medium">{tab.question}</span>
                                </button>
                            ))}
                        </div>

                        {/* Right side - Card Content */}
                        <div className="w-full lg:w-2/3 p-6 lg:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {tabsData[activeTabIndex].cards.map((card, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-white rounded-xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg border border-gray-100 hover:border-orange-200"
                                    >
                                        {card.icon}
                                        <h3 className="text-xl font-bold text-gray-800 mb-3">{card.title}</h3>
                                        <p className="text-gray-600">{card.description}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 p-6 bg-orange-50 rounded-xl border border-orange-100">
                                <div className="flex items-start">
                                    <div className="mr-4 text-orange-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <path d="M12 16v-4"></path>
                                            <path d="M12 8h.01"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-800 mb-2">Still have questions?</h4>
                                        <p className="text-gray-600 mb-4">
                                            Our customer support team is available 24/7 to assist you with any queries or concerns.
                                        </p>
                                        <Link to="/contact">
                                        <button   className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200">
                                            Contact Support
                                        </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center text-gray-500 text-sm">
                    Order.LK — Making food delivery simple, fast, and delightful since 2020.
                </div>
            </div>
        </div>
    );
};

export default FAQContent;