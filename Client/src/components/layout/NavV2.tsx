import { useState, useEffect, useRef } from "react";
import { Home, Store, ShoppingCart, Truck, LogIn, UserPlus, Phone, User, ChevronDown, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../services/auth/authContext.tsx"; // Update this path as needed

// Define the type for navigation links
interface NavLink {
    link: string;
    name: string;
    icon: React.ReactNode;
}

// Define the navLinks with icons
const navLinks: NavLink[] = [
    { link: "/", name: "Home", icon: <Home size={18} /> },
    { link: "/restaurants", name: "Restaurants", icon: <Store size={18} /> },
    { link: "/cart/:id", name: "Cart", icon: <ShoppingCart size={18} /> },
    { link: "/track", name: "Order Tracking", icon: <Truck size={18} /> },
    { link: "/contact", name: "Contact us", icon: <Phone size={18} /> }
];

const ManiNavbar = () => {
    // Track if the user has scrolled down the page
    const [scrolled, setScrolled] = useState<boolean>(false);
    // Track window width for responsive design
    const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
    // Track if the profile dropdown is open
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

    // Use the auth context - adding getUserRole from old navbar
    const { isAuthenticated, user, logout, getUserRole } = useAuth();
    const navigate = useNavigate();
    const userRole = getUserRole();

    // Ref for the dropdown menu to handle clicks outside
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Create an event listener for when the user scrolls
        const handleScroll = (): void => {
            // Check if the user has scrolled down at least 10px
            const isScrolled = window.scrollY > 10;
            setScrolled(isScrolled);
        };

        // Create an event listener for window resize
        const handleResize = (): void => {
            setWindowWidth(window.innerWidth);
        };

        // Handle clicks outside dropdown
        const handleClickOutside = (event: MouseEvent): void => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        // Add the event listeners to the window
        window.addEventListener("scroll", handleScroll);
        window.addEventListener("resize", handleResize);
        document.addEventListener("mousedown", handleClickOutside);

        // Initialize scroll state
        handleScroll();

        // Cleanup the event listeners when the component is unmounted
        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleResize);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Handle login click
    const handleLoginClick = () => {
        navigate("/login");
    };

    // Handle signup click
    const handleSignupClick = () => {
        navigate("/register");
    };

    // Handle logout - Updated to match old navbar's logout with callback
    const handleLogout = () => {
        logout(() => {
            navigate('/login');
        });
        setIsDropdownOpen(false);
    };

    // Toggle dropdown visibility
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // Determine if nav should be displayed based on window width
    const isDesktop = windowWidth >= 1024;

    // Orange color for hover effects
    const orangeColor = "#FF7A00";

    // Custom padding values - adjusted for 2xl screens
    const getLeftPadding = () => {
        if (windowWidth >= 1536) { // 2xl breakpoint
            return "22rem";
        } else if (windowWidth >= 1500) {
            return "7.5rem";
        } else if (windowWidth >= 768) {
            return "7.5rem";
        }
        return "1rem";
    };

    const getRightPadding = () => {
        if (windowWidth >= 1536) { // 2xl breakpoint
            return "10rem";
        } else if (windowWidth >= 768) {
            return "3rem";
        }
        return "1rem";
    };

    return (
        <>
            <header
                className="fixed top-0 w-full left-0 z-50 transition-all duration-300 ease-in-out"
                style={{
                    paddingTop: "1.25rem",
                    paddingBottom: "1.25rem",
                    paddingLeft: getLeftPadding(),
                    paddingRight: getRightPadding(),
                    backgroundColor: "black",
                    fontFamily: '"Mona Sans", sans-serif',
                    boxShadow: scrolled ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)" : "none"
                }}
            >
                <div className="flex items-center justify-between mx-auto">
                    <Link
                        to="/"
                        className="font-semibold cursor-pointer transition-transform duration-300"
                        style={{
                            color: "#d9ecff",
                            fontSize: windowWidth >= 768 ? "1.5rem" : "1.25rem"
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = "scale(1.05)";
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                        }}
                    >
                        Quick Bite
                    </Link>

                    {isDesktop && (
                        <nav className="flex items-center">
                            <ul className="flex gap-8 list-none m-0 p-0">
                                {navLinks.map(({ link, name, icon }) => (
                                    <li
                                        key={name}
                                        className="relative"
                                        style={{ color: "#d9ecff" }}
                                    >
                                        <Link
                                            to={link}
                                            className="no-underline flex items-center gap-2"
                                            style={{ color: "inherit" }}
                                        >
                                            <span
                                                className="flex items-center gap-2 cursor-pointer transition-colors duration-300"
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.color = orangeColor;
                                                    // Safely access the next sibling
                                                    const nextSibling = e.currentTarget.nextElementSibling;
                                                    if (nextSibling) {
                                                        nextSibling.setAttribute('style', `width: 100%; background-color: ${orangeColor}; bottom: -0.25rem; height: 0.125rem;`);
                                                    }
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.color = "#d9ecff";
                                                    // Safely access the next sibling
                                                    const nextSibling = e.currentTarget.nextElementSibling;
                                                    if (nextSibling) {
                                                        nextSibling.setAttribute('style', 'width: 0; bottom: -0.25rem; height: 0.125rem; transition: all 0.3s;');
                                                    }
                                                }}
                                            >
                                                {icon} {name}
                                            </span>
                                            <span
                                                className="absolute h-0.5 left-0 w-0 transition-all duration-300"
                                                style={{
                                                    bottom: "-0.25rem",
                                                    backgroundColor: "transparent"
                                                }}
                                            />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    )}

                    <div className="flex items-center gap-4">
                        {!isAuthenticated ? (
                            <>
                                <button
                                    onClick={handleSignupClick}
                                    className="rounded-lg flex items-center gap-2 transition-colors duration-300"
                                    style={{
                                        padding: windowWidth >= 768 ? "0.5rem 1.25rem" : "0.4rem 1rem",
                                        backgroundColor: "white",
                                        fontSize: windowWidth >= 768 ? "1rem" : "0.9rem",
                                        border: "none",
                                        cursor: "pointer"
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.backgroundColor = orangeColor;
                                        const span = e.currentTarget.querySelector("span");
                                        if (span) span.style.color = "white";
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.backgroundColor = "white";
                                        const span = e.currentTarget.querySelector("span");
                                        if (span) span.style.color = "black";
                                    }}
                                >
                                    <UserPlus size={18} />
                                    <span className="transition-colors duration-300" style={{ color: "black" }}>
                                        Sign up
                                    </span>
                                </button>

                                <button
                                    onClick={handleLoginClick}
                                    className="rounded-lg flex items-center gap-2 transition-colors duration-300"
                                    style={{
                                        padding: windowWidth >= 768 ? "0.5rem 1.25rem" : "0.4rem 1rem",
                                        backgroundColor: "white",
                                        fontSize: windowWidth >= 768 ? "1rem" : "0.9rem",
                                        border: "none",
                                        cursor: "pointer"
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.backgroundColor = orangeColor;
                                        const span = e.currentTarget.querySelector("span");
                                        if (span) span.style.color = "white";
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.backgroundColor = "white";
                                        const span = e.currentTarget.querySelector("span");
                                        if (span) span.style.color = "black";
                                    }}
                                >
                                    <LogIn size={18} />
                                    <span className="transition-colors duration-300" style={{ color: "black" }}>
                                        Sign in
                                    </span>
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={toggleDropdown}
                                        className="rounded-lg flex items-center gap-2 transition-colors duration-300"
                                        style={{
                                            padding: windowWidth >= 768 ? "0.5rem 1.25rem" : "0.4rem 1rem",
                                            backgroundColor: isDropdownOpen ? orangeColor : "white",
                                            fontSize: windowWidth >= 768 ? "1rem" : "0.9rem",
                                            border: "none",
                                            cursor: "pointer"
                                        }}
                                        onMouseOver={(e) => {
                                            if (!isDropdownOpen) {
                                                e.currentTarget.style.backgroundColor = orangeColor;
                                                const span = e.currentTarget.querySelector("span");
                                                if (span) span.style.color = "white";
                                            }
                                        }}
                                        onMouseOut={(e) => {
                                            if (!isDropdownOpen) {
                                                e.currentTarget.style.backgroundColor = "white";
                                                const span = e.currentTarget.querySelector("span");
                                                if (span) span.style.color = "black";
                                            }
                                        }}
                                    >
                                        <User size={18} color={isDropdownOpen ? "white" : "black"} />
                                        <span
                                            className="transition-colors duration-300"
                                            style={{
                                                color: isDropdownOpen ? "white" : "black"
                                            }}
                                        >
                                            {user?.sub?.split('@')[0] || 'Profile'}
                                        </span>
                                        <ChevronDown
                                            size={16}
                                            className={`transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                                            color={isDropdownOpen ? "white" : "black"}
                                        />
                                    </button>

                                    {isDropdownOpen && (
                                        <div
                                            className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white"
                                            style={{
                                                transform: 'translateY(0)',
                                                opacity: 1,
                                                animation: 'fadeIn 0.3s ease-in-out'
                                            }}
                                        >
                                            {/* Admin Dashboard Link (only for admin users) - Added from old navbar */}
                                            {userRole === 'Admin' && (
                                                <Link
                                                    to="/admin/dashboard"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                >
                                                    <Settings className="h-4 w-4 mr-2" />
                                                    <span>Admin Dashboard</span>
                                                </Link>
                                            )}

                                            <Link
                                                to="/profile"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                Your Profile
                                            </Link>
                                            <Link
                                                to="/settings"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                Settings
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Sign out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Add padding to prevent content from hiding behind fixed navbar */}
            <div style={{ paddingTop: "5rem" }}></div>

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </>
    );
};

export default ManiNavbar;