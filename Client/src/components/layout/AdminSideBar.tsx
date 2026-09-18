import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
  CreditCard,
  Truck,
  HelpCircle,
  LogOut,
  UserRoundSearch,
  ChevronRight,
  ChevronLeft,
  Store,
  Pizza,
  MessageSquare,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../services/auth/authContext.tsx'; // Update this import path as needed

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [restaurantSubmenuOpen, setRestaurantSubmenuOpen] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    if (collapsed) {
      // When expanding, keep the submenu state as is
    } else {
      // When collapsing, close the submenu
      setRestaurantSubmenuOpen(false);
    }
  };

  const toggleRestaurantSubmenu = (e: React.MouseEvent) => {
    if (collapsed) return;
    e.preventDefault();
    setRestaurantSubmenuOpen(!restaurantSubmenuOpen);
  };

  const handleLogout = () => {
    // Call the logout function from AuthContext
    logout(() => {
      // Callback function to redirect after logout
      navigate('/login'); // Redirect to login page after logout
    });
  };

  const navLinkStyle = (isActive: boolean) =>
      `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
          isActive ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-orange-100'
      }`;

  const sidebarVariants = {
    expanded: { width: '240px' },
    collapsed: { width: '80px' }
  };

  const submenuVariants = {
    open: {
      height: 'auto',
      opacity: 1,
      transition: { duration: 0.3 }
    },
    closed: {
      height: 0,
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
      <motion.div
          className="min-h-screen bg-white shadow-lg flex flex-col relative"
          initial="expanded"
          animate={collapsed ? "collapsed" : "expanded"}
          variants={sidebarVariants}
          transition={{ duration: 0.3 }}
      >
        {/* Toggle button */}
        <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-6 bg-orange-500 text-white p-1 rounded-full shadow-lg z-10"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Logo Area */}
        <div className="py-6 flex justify-center items-center border-b border-gray-100">
          <motion.div
              animate={{ scale: [0.9, 1] }}
              transition={{ duration: 0.5 }}
              className="text-orange-500 font-bold text-xl flex items-center"
          >
            <UtensilsCrossed size={24} className="flex-shrink-0" />
            {!collapsed && <span className="ml-2">FoodApp</span>}
          </motion.div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-2">
            {/* Dashboard Link */}
            <li>
              <NavLink
                  to="/admin-dashboard"
                  className={({ isActive }) => navLinkStyle(isActive)}
              >
                <LayoutDashboard size={20} className="flex-shrink-0" />
                {!collapsed && <span className="ml-3">Dashboard</span>}
              </NavLink>
            </li>

            {/* Restaurant with submenu */}
            <li>
              <div
                  onClick={toggleRestaurantSubmenu}
                  className={`${navLinkStyle(
                      location.pathname === '/restaurant' ||
                      location.pathname === '/food-items' ||
                      location.pathname === '/cart'
                  )} cursor-pointer flex justify-between`}
              >
                <div className="flex items-center">
                  <Store size={20} className="flex-shrink-0" />
                  {!collapsed && <span className="ml-3">Restaurant</span>}
                </div>
                {!collapsed && (
                    <ChevronRight
                        size={16}
                        className={`transition-transform ${restaurantSubmenuOpen ? 'rotate-90' : ''}`}
                    />
                )}
              </div>

              {/* Submenu */}
              {!collapsed && (
                  <AnimatePresence>
                    {restaurantSubmenuOpen && (
                        <motion.ul
                            variants={submenuVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            className="ml-6 mt-2 space-y-1 overflow-hidden"
                        >
                          <li>
                            <NavLink
                                to="/admin-restaurant"
                                className={({ isActive }) => navLinkStyle(isActive)}
                            >
                              <Store size={18} />
                              <span>Restaurants</span>
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                                to="/admin-fooditems"
                                className={({ isActive }) => navLinkStyle(isActive)}
                            >
                              <Pizza size={18} />
                              <span>Food Items</span>
                            </NavLink>
                          </li>
                        </motion.ul>
                    )}
                  </AnimatePresence>
              )}
            </li>

            {/* Other menu items */}
            <li>
              <NavLink
                  to="/orders"
                  className={({ isActive }) => navLinkStyle(isActive)}
              >
                <UtensilsCrossed size={20} className="flex-shrink-0" />
                {!collapsed && <span className="ml-3">Orders</span>}
              </NavLink>
            </li>
            <li>
              <NavLink
                  to="/driveradmin-dashboard"
                  className={({ isActive }) =>
                      navLinkStyle(isActive || location.pathname.startsWith('/driver'))
                  }
              >
                <Truck size={20} className="flex-shrink-0" />
                {!collapsed && <span className="ml-3">Delivery</span>}
              </NavLink>
            </li>
            <li>
              <NavLink
                  to="/payments"
                  className={({ isActive }) => navLinkStyle(isActive)}
              >
                <CreditCard size={20} className="flex-shrink-0" />
                {!collapsed && <span className="ml-3">Payments</span>}
              </NavLink>
            </li>
            <li>
              <NavLink
                  to="/admin-user"
                  className={({ isActive }) => navLinkStyle(isActive)}
              >
                <UserRoundSearch size={20} className="flex-shrink-0" />
                {!collapsed && <span className="ml-3">Users</span>}
              </NavLink>
            </li>
            <li>
              <NavLink
                  to="/admin-contacts"
                  className={({ isActive }) => navLinkStyle(isActive)}
              >
                <MessageSquare size={20} className="flex-shrink-0" />
                {!collapsed && <span className="ml-3">Contact Messages</span>}
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Footer Menu Items */}
        <div className="px-3 py-4 border-t border-gray-100">
          <ul className="space-y-2">
            <li>
              <NavLink
                  to="/help"
                  className={({ isActive }) => navLinkStyle(isActive)}
              >
                <HelpCircle size={20} className="flex-shrink-0" />
                {!collapsed && <span className="ml-3">Help</span>}
              </NavLink>
            </li>
            <li>
              <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors text-gray-700 hover:bg-red-100 hover:text-red-600 w-full"
              >
                <LogOut size={20} className="flex-shrink-0" />
                {!collapsed && <span className="ml-3">Logout</span>}
              </button>
            </li>
          </ul>
        </div>
      </motion.div>
  );
};

export default AdminSidebar;