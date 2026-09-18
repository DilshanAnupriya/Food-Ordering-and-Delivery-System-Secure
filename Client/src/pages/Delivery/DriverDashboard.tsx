import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import CompletedDeliveryCard from './CompletedDeliveryCard';
import NavV2 from "../../components/layout/NavV2.tsx";

interface Order {
  id: string;
  orderId?: string;
  status: string;
  destination: string;
  deliveryDate?: string;
}

interface DriverData {
  driverId: string;
  driverName: string;
}

const DriverDashboard: React.FC = () => {
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [driverData, setDriverData] = useState<DriverData>({ driverId: '', driverName: '' });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const userId = localStorage.getItem('userId');
    if (!userId) {
      // If no userId is found, redirect to login page
      navigate('/login');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        console.error(err);
      }
    );
    
    // Check if driver data exists in sessionStorage
    const storedDriverData = sessionStorage.getItem('driverData');
    
    if (storedDriverData) {
      // Use driver data from sessionStorage if available
      const parsedDriverData = JSON.parse(storedDriverData);
      setDriverData(parsedDriverData);
      fetchCompletedDeliveries(parsedDriverData.driverId);
    } else {
      // Fetch driver data by userId
      fetchDriverDataByUserId(userId);
    }
  }, [navigate]);

  const fetchDriverDataByUserId = async (userId: string) => {
    try {
      const res = await fetch(`http://localhost:8082/api/v1/delivery/drivers/user/${userId}`);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch driver data: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data && data.length > 0) {
        // Use the first driver associated with this user
        const driver = data[0];
        const driverInfo: DriverData = {
          driverId: driver.driverId,
          driverName: driver.driverName || 'Driver'
        };
        
        // Save driver data to sessionStorage
        sessionStorage.setItem('driverData', JSON.stringify(driverInfo));
        setDriverData(driverInfo);
        
        // Fetch completed deliveries for this driver
        fetchCompletedDeliveries(driverInfo.driverId);
      } else {
        console.error('No driver data found for this user ID');
      }
    } catch (error) {
      console.error('Error fetching driver data:', error);
    }
  };

  const fetchCompletedDeliveries = async (driverId: string) => {
    try {
      const res = await fetch(`http://localhost:8082/api/v1/delivery/completed-deliveries/${driverId}`);
      const data = await res.json();
      
      const processedOrders = data.map((order: any) => ({
        ...order,
        deliveryDate: order.deliveryDate || order.completedAt || new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      }));
      
      setOrders(processedOrders);
      setFilteredOrders(processedOrders);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
    }
  };

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(order => {
        const displayId = order.orderId || order.id;
        return displayId.toLowerCase().includes(searchTerm.toLowerCase());
      });
      setFilteredOrders(filtered);
    }
  }, [searchTerm, orders]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    // Clear all user-related data from storage
    localStorage.removeItem('userId');
    localStorage.removeItem('token'); // In case you're using token authentication
    sessionStorage.removeItem('driverData');
    
    // Optional: You could also clear other related data
    localStorage.removeItem('userRole');
    sessionStorage.clear(); // Clear all session storage
    
    // Show a logout message (optional)
    alert('You have been successfully logged out.');
    
    // Navigate to login page
    navigate('/login');
  };

  // Get profile initial from driver name
  const profileInitial = driverData.driverName ? driverData.driverName.charAt(0) : 'D';

  return (
    <div className="min-h-screen ">

      <div className="w-full ">

      </div>
      
      <div className="mt-1 ">
        <div className="max-w-7xl mx-auto px-4 py-8 ">
          {/* Header */}
          <div className="flex justify-between h-20 w-full bg-orange-500 items-center mb-7 rounded-lg">
            <div className="flex items-center">
              <div className="relative ml-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg border-2 border-white">
                  <span className="text-2xl font-bold text-white">{profileInitial}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
              <div className="ml-4 flex flex-col items-start space-y-1">
                <h1 className="text-2xl font-bold text-white">
                  {driverData.driverName || 'Loading...'}
                </h1>
                <p className="text-sm text-white">
                  Driver ID: <strong>{driverData.driverId || 'Loading...'}</strong>
                </p>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                className="bg-yellow-500 text-white px-4 py-2 rounded-md mr-4 hover:bg-yellow-400 hover:text-black transition-colors"
                onClick={() => handleNavigate('/driver-delivery')}
              >
                Deliveries
              </button>
              <button
                  className="bg-red-500 text-white px-4 py-2 rounded-md mr-4 hover:bg-yellow-400 hover:text-black transition-colors"
                  onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>

          {/* Map Section - Fixed to prevent overlapping when scrolling */}
          <div className="bg-orange-50 p-5 rounded-lg mb-6 shadow-md relative">
            <h2 className="text-lg font-semibold mb-4 text-orange-500">
              Current Location
            </h2>
            {location ? (
              <div className="h-64 rounded-lg overflow-hidden" style={{ position: 'relative', zIndex: 1 }}>
                <div className="h-full w-full rounded-lg" style={{ position: 'relative' }}>
                  <MapContainer center={location} zoom={13} style={{ height: '100%', width: '100%', borderRadius: '10px', position: 'relative', zIndex: 1 }}>
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="&copy; OpenStreetMap contributors"
                    />
                    <Marker position={location}>
                      <Popup>Current Location</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
              </div>
            )}
          </div>
          
          {/* Deliveries Summary */}
          <div className="bg-orange-50 p-5 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-orange-500">
                Completed Deliveries
              </h2>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    placeholder="Search by Order ID"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
                
                <span className="bg-orange-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                  {filteredOrders.length} of {orders.length} total
                </span>
              </div>
            </div>
            
            {filteredOrders.length === 0 ? (
              <div className="bg-gray-100 p-8 rounded-lg text-center">
                <div className="inline-flex rounded-full bg-gray-200 p-4 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-gray-500">
                  {searchTerm ? "No deliveries match your search." : "No completed deliveries yet."}
                </p>
              </div>
            ) : (
              <div className="relative">
                <div className="flex overflow-x-auto pb-2 space-x-4 scrollbar-thin scrollbar-thumb-orange-500 scrollbar-track-gray-100">
                  {filteredOrders.map((order) => (
                    <CompletedDeliveryCard 
                      key={order.id} 
                      order={order} 
                    />
                  ))}
                </div>
                
                <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
                <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default DriverDashboard;