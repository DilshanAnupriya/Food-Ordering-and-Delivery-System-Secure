import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ContactUs from './pages/ContactUs/ContactUs';
import Home from './pages/Home';

import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import { AuthProvider } from './services/auth/authContext';
import Restaurants from './pages/Restaurant/Restaurants';
import Restaurant from './pages/Restaurant/Restaurant';
import RestaurantCreate from './pages/Restaurant/RestaurantCreate';
import DriverDashboard from './pages/Delivery/DriverDashboard';
import DriverDeliveryPageWrapper from './pages/Delivery/DriverDeliveryPageWrapper';
import CustomerTrackingPage from './pages/Delivery/CustomerTraking';
import AdminDashboard from './pages/AdminDashboard.tsx';
import CartPage from "./pages/Restaurant/Cart.tsx";
import OrderList from "./pages/orders/OrderList.tsx";
import OrderForm from "./pages/orders/OrderForm.tsx";
import OrderDetail from "./pages/orders/OrderDetail.tsx";
import OrderTracking from "./pages/orders/OrderTracking.tsx";
import Checkout from './pages/Payment/Checkout.tsx';
import OrderConfirmation from './pages/orders/OrderConfirmation';
import RestaurantAdminDashboard from "./pages/Restaurant/Admin/RestaurantAdminDashboard.tsx";
import UpdateRestaurantPage from "./pages/Restaurant/Admin/RestaurantUpdate.tsx";
import RestuarantAdminFoodItem from "./pages/Restaurant/Admin/RestuarantAdminFoodItem.tsx";

import AdminContactView from './pages/ContactUs/AdminContactView';



import PaymentDetails from './pages/Payment/PaymentDetails';

import RestaurantOwnerDashboard from "./pages/Restaurant/Admin/RestaurantOwnerDashboard.tsx";
import ManageFoodItems from "./pages/Restaurant/Admin/ManageFoodItems.tsx";
import AdminDriverDashboard from "./pages/Delivery/AdminDriverDashboard.tsx";
import ProtectedRoute from "./services/auth/ProtectedRoute.tsx";
import AdminRoute from "./services/auth/AdminRoute.tsx";
import RoleRouter from "./services/auth/RoleRouter.tsx";
import {Suspense} from "react";
import AdminUser from './pages/Restaurant/Admin/AdminUser.tsx';
import DriverForm from "./pages/Delivery/DriverForm.tsx";
import RestaurantOrders from "./pages/Restaurant/Admin/RestaurantOrders.tsx";
import ResUpdate from "./pages/Restaurant/Admin/ResUpdate.tsx";
import ResCreate from "./pages/Restaurant/resCreate.tsx";


function App() {
    return (
        <AuthProvider>
            <Suspense fallback={
                <div className="flex items-center justify-center h-screen bg-orange-50">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
                        <p className="mt-4 text-gray-700 text-xl">Loading...</p>
                    </div>
                </div>
            }>
            <Router>
                <Routes>
                    <Route path="/route" element={<RoleRouter />} />

                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route element={<ProtectedRoute />}>
                        <Route path="/contact" element={<ContactUs />} />
                        <Route path="/restaurants" element={<Restaurants />} />
                        <Route path="/restaurant/:id" element={<Restaurant />} />
                        <Route path="/restaurant/create" element={<RestaurantCreate />} />
                        <Route path="/cart/:id" element={<CartPage />} />
                        <Route path="/res/create" element={<ResCreate />} />
                    </Route>



                    <Route path="/driver-delivery" element={<DriverDeliveryPageWrapper />} />
                    <Route path="/driver-dashboard" element={<DriverDashboard />} />
                    <Route path="/customer-tracking" element={<CustomerTrackingPage />} />
                    <Route path="/driver-form" element={<DriverForm/>} />
                    <Route element={<AdminRoute />}>
                        <Route path="/admin-dashboard" element={<AdminDashboard />} />
                        <Route path="/admin-user" element={<AdminUser />} />
                    </Route>

                    <Route path="/AdminDashboard" element={<Navigate to="/admin-dashboard" replace />} />
                    <Route path='/admin-restaurant' element={<RestaurantAdminDashboard/>}/>
                    <Route path='/update/:id' element={<UpdateRestaurantPage/>} />
                    <Route path='/res/:id' element={<ResUpdate/>} />
                    <Route path='/admin-fooditems' element={<RestuarantAdminFoodItem/>} />
                    <Route path='/admin-contacts' element={<AdminContactView />} />
                    <Route path='/restaurant/orders/:id' element={<RestaurantOrders />} />

                    <Route path='/owner-restaurant' element={<RestaurantOwnerDashboard/>} />
                    <Route path='/:id/fooditems' element={<ManageFoodItems/>} />

                    <Route path='/checkout' element={<Checkout />} />
                    <Route path='/order-confirmation' element={<OrderConfirmation />} />
                    <Route path="/orders" element={<OrderList />} />
                    <Route path="/orders/new" element={<OrderForm />} />
                    <Route path="/orders/:orderId" element={<OrderDetail />} />
                    <Route path="/orders/:orderId/edit" element={<OrderForm />} />
                    <Route path="/track" element={<OrderTracking />} />
                    <Route path="/payments" element={<PaymentDetails />} />
                    <Route path="/driveradmin-dashboard" element={<AdminDriverDashboard />} />
                      <Route path="/driver-form" element={<DriverForm/>} />
                </Routes>
            </Router>
            </Suspense>
        </AuthProvider>
    );
}

export default App;
