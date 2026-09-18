import { useState } from "react";
import Footer from "../components/layout/Footer";
import AdminSidebar from "../components/layout/AdminSideBar";
import { UtensilsCrossed, ShoppingCart, Truck, CreditCard, TrendingUp, Users, Clock, AlertCircle, Menu } from 'lucide-react';
import AdminNavbar from "../components/admin/AdminNavbar";

function AdminDashboard() {
  // State to track sidebar visibility
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Toggle sidebar function
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
      <div className="flex flex-col min-h-screen">
        {/* Top navigation component - fixed at the top in its own implementation */}
        <div className="absolute ml-70">
          <AdminNavbar />
        </div>

        {/* Main layout with sidebar and content */}
        <div className="flex flex-1 pt-16"> {/* Add padding to account for fixed navbar */}
          {/* Dynamic sidebar that can be toggled */}
          <div className={`fixed  left-0 bottom-0 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0 -ml-64'}`}>
            <AdminSidebar />
          </div>

          {/* Sidebar toggle button for mobile/tablet - Fixed to the left edge */}
          <button
              onClick={toggleSidebar}
              className="fixed top-20 left-4 z-40 p-2 rounded-full bg-white shadow-md border border-gray-200 lg:hidden"
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <Menu size={20} />
          </button>

          {/* Main content that adjusts based on sidebar state */}
          <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'} pb-0`}>
            <div className="p-6  min-h-screen">
              <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

                {/* Admin Overview Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Restaurant Admin Card */}
                  <div className="bg-gray-200 p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">Restaurant Management</h2>
                      <div className="bg-orange-100 p-3 rounded-full">
                        <UtensilsCrossed className="text-orange-500" size={24} />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Active Restaurants</span>
                        <span className="font-medium">243</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Pending Approval</span>
                        <span className="font-medium">12</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Menu Updates</span>
                        <span className="font-medium">47</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button className="w-full py-2 bg-orange-50 text-orange-500 rounded-md hover:bg-orange-100 transition-colors text-sm font-medium">
                        View Restaurant Dashboard
                      </button>
                    </div>
                  </div>

                  {/* Order Admin Card */}
                  <div className="bg-gray-200 p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">Order Admin</h2>
                      <div className="bg-blue-100 p-3 rounded-full">
                        <ShoppingCart className="text-blue-500" size={24} />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Today's Orders</span>
                        <span className="font-medium">152</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Processing</span>
                        <span className="font-medium">34</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Issues Reported</span>
                        <span className="font-medium text-red-500">5</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button className="w-full py-2 bg-blue-50 text-blue-500 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium">
                        Manage Orders
                      </button>
                    </div>
                  </div>

                  {/* Delivery Admin Card */}
                  <div className="bg-gray-200 p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">Delivery Admin</h2>
                      <div className="bg-green-100 p-3 rounded-full">
                        <Truck className="text-green-500" size={24} />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Active Drivers</span>
                        <span className="font-medium">78</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">On Delivery</span>
                        <span className="font-medium">42</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Avg Delivery Time</span>
                        <span className="font-medium">23 min</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button className="w-full py-2 bg-green-50 text-green-500 rounded-md hover:bg-green-100 transition-colors text-sm font-medium">
                        Manage Drivers
                      </button>
                    </div>
                  </div>

                  {/* Payment Admin Card */}
                  <div className="bg-gray-200 p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">Payment Admin</h2>
                      <div className="bg-purple-100 p-3 rounded-full">
                        <CreditCard className="text-purple-500" size={24} />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Today's Revenue</span>
                        <span className="font-medium">£8,234</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Pending Payouts</span>
                        <span className="font-medium">£12,150</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Failed Transactions</span>
                        <span className="font-medium text-red-500">3</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button className="w-full py-2 bg-purple-50 text-purple-500 rounded-md hover:bg-purple-100 transition-colors text-sm font-medium">
                        View Financial Reports
                      </button>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics Section */}
                <h2 className="text-xl font-bold text-gray-800 mb-4 mt-8">Performance Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Sales</span>
                      <TrendingUp className="text-green-500" size={20} />
                    </div>
                    <p className="text-2xl font-bold mt-2">£48,254</p>
                    <p className="text-sm text-green-500">+12.5% from last week</p>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">New Customers</span>
                      <Users className="text-blue-500" size={20} />
                    </div>
                    <p className="text-2xl font-bold mt-2">521</p>
                    <p className="text-sm text-blue-500">+8.2% from last week</p>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Average Time</span>
                      <Clock className="text-orange-500" size={20} />
                    </div>
                    <p className="text-2xl font-bold mt-2">24 min</p>
                    <p className="text-sm text-orange-500">-2 min from last week</p>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Issues</span>
                      <AlertCircle className="text-red-500" size={20} />
                    </div>
                    <p className="text-2xl font-bold mt-2">12</p>
                    <p className="text-sm text-red-500">+2 from last week</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer goes here - outside of the scrollable content area */}
            <Footer />
          </main>
        </div>
      </div>
  );
}

export default AdminDashboard;