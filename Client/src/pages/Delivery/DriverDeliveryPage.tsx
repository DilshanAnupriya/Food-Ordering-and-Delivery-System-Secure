import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Footer from "../../components/layout/Footer";
import NavigationBar from "../../components/layout/Navbar";
import SubNav from "../../components/layout/SubNav";
import { useNavigate } from 'react-router-dom';

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Delivery {
  orderId: string;
  isDelivered: boolean;
  shopLatitude: number;
  shopLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
  driverLatitude: number;
  driverLongitude: number;
}

// Fix Leaflet icon issues
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Custom icons
const customerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const shopIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const driverIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DriverDeliveryPage: React.FC = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [markingDelivered, setMarkingDelivered] = useState<boolean>(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState<boolean>(false);
  const [driverId, setDriverId] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/login');
      return;
    }

    // Get driver data from session storage
    const storedDriverData = sessionStorage.getItem('driverData');
    
    if (storedDriverData) {
      try {
        const parsedDriverData = JSON.parse(storedDriverData);
        if (parsedDriverData && parsedDriverData.driverId) {
          setDriverId(parsedDriverData.driverId);
        } else {
          setError('Driver ID not found in session storage. Please go back to dashboard.');
        }
      } catch (err) {
        console.error('Error parsing driver data from session storage:', err);
        setError('Error loading driver data. Please go back to dashboard.');
      }
    } else {
      setError('Driver data not found. Please go back to dashboard and try again.');
    }
  }, [navigate]);

  // Get current location every 5 seconds and send to backend
  useEffect(() => {
    if (!driverId) return;

    const intervalId = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });

          fetch('http://localhost:8082/api/v1/delivery/update-location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ driverId, latitude, longitude }),
          })
          .catch(err => console.error('Failed to update location:', err));
        },
        (error) => {
          console.error('Location error:', error);
          setError('Unable to access your location. Please enable location services.');
        },
        { enableHighAccuracy: true }
      );
    }, 5000);

    return () => clearInterval(intervalId);
  }, [driverId]);

  // Fetch assigned delivery on mount
  useEffect(() => {
  if (!driverId) return;
  
  const fetchDeliveryData = (retryCount = 0) => {
    setLoading(true);
    fetch(`http://localhost:8082/api/v1/delivery/by-driver/${driverId}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 500 && retryCount < 3) {
            // Server error - retry after delay
            console.log(`Server error, retrying (${retryCount + 1}/3)...`);
            setTimeout(() => fetchDeliveryData(retryCount + 1), 3000);
            throw new Error('Server error, retrying...');
          }
          throw new Error(`Failed to fetch delivery data (Status: ${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        if (!data) {
          setError('No delivery data found for this driver.');
        } else {
          setDelivery(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load delivery', err);
        // Only set error state if we're not retrying
        if (!err.message.includes('retrying')) {
          setError('Unable to load delivery information. Please try again later.');
          setLoading(false);
        }
      });
  };

  fetchDeliveryData();
}, [driverId]);

  const markAsDelivered = async () => {
  if (markingDelivered || !delivery || !driverId) return;

  try {
    setMarkingDelivered(true);
    console.log(`Marking delivery for driver ${driverId} as delivered...`);

    const response = await fetch(`http://localhost:8082/api/v1/delivery/mark-delivered/${driverId}`, {
      method: 'POST',
    });

    if (!response.ok) {
      console.error(`Failed to update delivery status: ${response.status}`);
      // Log response body for more details
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`Failed to update delivery status: ${response.status}`);
    }
    
    //LOG SUCCESS
     console.log("Delivery successfully marked as delivered");
  
      // Update state and show success popup
      setDelivery(prev => prev ? { ...prev, isDelivered: true } : null);
      setShowSuccessPopup(true);
  
      // Hide the success popup after 5 seconds
      setTimeout(() => setShowSuccessPopup(false), 5000);

  } catch (err) {
    console.error('Error in markAsDelivered:', err);
    setError(`Failed to mark delivery as complete. Please try again.`);
  } finally {
    setMarkingDelivered(false);
  }
};

  const isValidCoords = (coord: Location | null): boolean =>
    Boolean(
      coord &&
      typeof coord.latitude === 'number' &&
      typeof coord.longitude === 'number' &&
      coord.latitude !== 0 &&
      coord.longitude !== 0
    );

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-center text-gray-800 mb-2">Error</h3>
          <p className="text-center text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-black via-black/80 to-black/60">
      <div className="w-full">
        <SubNav />
      </div>
      <div className="w-full">
        <NavigationBar />
      </div>
  
      {/* Added margin-top to create space between NavigationBar and the next section */}
      <div className="mt-16">
        <nav className="max-w-7xl bg-black mx-auto px-4 py-1">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center"></div>
              <div className="hidden md:block">
                <div className="flex items-center space-x-4">
                  <div className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full flex items-center text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Active Driver
                  </div>
                  <span className="text-gray-600">|</span>
                  <div className="text-white">Driver ID: <span className="font-medium">{driverId}</span></div>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-3">
        <div className="bg-orange-50 rounded-xl shadow-md overflow-hidden">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
            <h1 className="text-2xl font-bold text-white">
              Driver Delivery Status
            </h1>
            <p className="text-orange-100 mt-1">
              Track and complete your deliveries efficiently
            </p>
          </div>

          {/* Loading state */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500"></div>
                <p className="mt-4 text-gray-500">Loading delivery information...</p>
              </div>
            </div>
          ) : delivery ? (
            <div className="p-6">
              {/* Order information card */}
              <div className="mb-6 bg-white rounded-lg border border-gray-100 shadow-sm p-5 relative">
                {/* Success Popup - Only shown in order information container */}
                {showSuccessPopup && (
                  <div className="absolute top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg z-10 flex items-center animate-fade-in">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Delivery successfully completed!</span>
                    <button 
                      onClick={() => setShowSuccessPopup(false)}
                      className="ml-4 text-green-700 hover:text-green-900"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">Order Information</h2>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className="bg-gray-100 rounded-full p-1 mr-3">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                          </svg>
                        </div>
                        <span className="font-medium text-gray-700 mr-2">Order ID:</span>
                        <span className="text-gray-900">{delivery.orderId}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="bg-gray-100 rounded-full p-1 mr-3">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="font-medium text-gray-700 mr-2">Status:</span>
                        {delivery.isDelivered ? (
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Delivered
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center">
                            <svg className="w-3 h-3 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            In Progress
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {!delivery.isDelivered && (
                    <button
                      onClick={markAsDelivered}
                      disabled={markingDelivered}
                      className={`mt-6 md:mt-0 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 flex items-center ${markingDelivered ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                      {markingDelivered ? (
                        <>
                          <svg className="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Mark as Delivered
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Map container - UPDATED TO PREVENT OVERLAP */}
              {isValidCoords(location) ? (
                <div className="rounded-xl overflow-hidden shadow-md border border-gray-100 mb-6">
                  <div className="bg-gray-50 border-b px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="font-medium text-gray-700">Delivery Route</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <div className="flex items-center mr-4">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        <span>Customer</span>
                      </div>
                      <div className="flex items-center mr-4">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                        <span>You</span>
                      </div>
                      <div className="flex items-center ">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                        <span>Shop</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-96 w-full relative">
                    <div className="absolute inset-0">
                      <MapContainer
                        center={[location?.latitude || 0, location?.longitude || 0]}
                        zoom={14}
                        scrollWheelZoom={true}
                        style={{ height: '100%', width: '100%', zIndex: 0 }}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        
                        {/* Shop Marker */}
                        <Marker 
                          position={[delivery.shopLatitude, delivery.shopLongitude]} 
                          icon={shopIcon}
                        >
                          <Popup>Resturaent Location</Popup>
                        </Marker>
                        
                        {/* Customer Marker */}
                        <Marker 
                          position={[delivery.destinationLatitude, delivery.destinationLongitude]} 
                          icon={customerIcon}
                        >
                          <Popup>Customer Location</Popup>
                        </Marker>
                        
                        {/* Driver Marker */}
                        {location && (
                          <Marker 
                            position={[location.latitude, location.longitude]} 
                            icon={driverIcon}
                          >
                            <Popup>Your Location</Popup>
                          </Marker>
                        )}
                        
                        {/* Polyline connecting the points */}
                        {location && (
                          <Polyline
                            positions={[
                              [delivery.shopLatitude, delivery.shopLongitude],
                              [location.latitude, location.longitude],
                              [delivery.destinationLatitude, delivery.destinationLongitude]
                            ]}
                            color="blue"
                            weight={3}
                            opacity={0.7}
                          />
                        )}
                      </MapContainer>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-64 w-full mt-4 border border-gray-100 rounded-xl flex justify-center items-center bg-gray-50 shadow-md">
                  <div className="text-center p-6">
                    <div className="animate-pulse mb-4">
                      <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 font-medium">Waiting for location data...</p>
                    <p className="text-sm text-gray-500 mt-2">Please ensure location services are enabled</p>
                  </div>
                </div>
              )}
              
              {/* Delivery instructions card */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
                <div className="flex items-start">
                  <div className="bg-orange-100 rounded-full p-2 mr-4">
                    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-orange-800 mb-2">Delivery Instructions</h3>
                    <p className="text-orange-700">
                      Please confirm delivery completion by clicking the "Mark as Delivered" button once the order has been successfully handed over to the customer.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12">
              <div className="bg-gray-100 rounded-full p-4 mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Active Deliveries</h3>
              <p className="text-gray-600 text-center">You currently don't have any active deliveries assigned.</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-6 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DriverDeliveryPage;