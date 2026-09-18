import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import NavV2 from "../../components/layout/NavV2.tsx";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationMarkerProps {
  position: [number, number] | null;
  setPosition: (position: [number, number] | null) => void;
  onLocationSelect: (lat: number, lng: number) => void;
}

const LocationMarker: React.FC<LocationMarkerProps> = ({ position, setPosition, onLocationSelect }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationSelect(lat, lng);
    },
  });

  return position ? (
    <Marker position={position}>
      <Popup>Selected driver location</Popup>
    </Marker>
  ) : null;
};

enum DriverStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  OFFLINE = 'OFFLINE',
}

interface Driver {
  driverId: string;
  driverName: string;
  contactNumber: string;
  email: string;
  userId: string;
  latitude: number | null;
  longitude: number | null;
  currentAddress: string;
  isAvailable: boolean;
  status: DriverStatus;
}

// Function to generate a unique driver ID
const generateDriverId = (): string => {
  // Generate a prefix "DRV" followed by current timestamp and 3 random digits
  const timestamp = new Date().getTime().toString().slice(-6); // Last 6 digits of timestamp
  const randomDigits = Math.floor(Math.random() * 900 + 100); // 3 random digits (100-999)
  return `DRV${timestamp}${randomDigits}`;
};

const DriverForm = () => {
  const { driverId } = useParams<{ driverId: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(driverId);

  const [position, setPosition] = useState<[number, number] | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [existingDrivers, setExistingDrivers] = useState<Driver[]>([]);
  const [username, setUsername] = useState<string>('');

  const mapRef = useRef<any>(null);

  const [driver, setDriver] = useState<Driver>({
    driverId: '',
    driverName: '',
    contactNumber: '',
    email: '',
    userId: '',
    latitude: null,
    longitude: null,
    currentAddress: '',
    isAvailable: true,
    status: DriverStatus.PENDING,
  });

  // Check if the user is authenticated
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const storedUsername = localStorage.getItem('username') || '';
    
    if (!userId) {
      setError('You must be logged in to access this page');
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
      setUsername(storedUsername);
      
      // Get userId from local storage
      setDriver(prev => ({
        ...prev,
        userId: userId,
        driverName: storedUsername // Set the driver name from the stored username
      }));
      
      // Fetch existing drivers for this user
      axios.get(`/api/v1/delivery/drivers/user/${userId}`)
        .then(response => {
          setExistingDrivers(response.data);
        })
        .catch(err => {
          console.error('Error fetching user drivers:', err);
        });
    }
  }, []);

  // Generate driver ID and get user ID from local storage when component mounts (only in create mode)
  useEffect(() => {
    if (!isEditMode && isAuthenticated) {
      setDriver(prev => ({
        ...prev,
        driverId: generateDriverId()
      }));
    }
  }, [isEditMode, isAuthenticated]);

  useEffect(() => {
    if (isEditMode && driverId && isAuthenticated) {
      setLoading(true);
      axios.get(`/api/v1/delivery/drivers/${driverId}`)
        .then(response => {
          const driverData = response.data;
          setDriver(driverData);
          if (driverData.latitude && driverData.longitude) {
            setPosition([driverData.latitude, driverData.longitude]);
          }
        })
        .catch(err => {
          console.error('Error fetching driver:', err);
          setError('Failed to load driver data');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [driverId, isEditMode, isAuthenticated]);

  // Try to get username from JWT token if not in localStorage
  useEffect(() => {
    if (isAuthenticated && !username) {
      // Try to fetch user details from token
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Simple JWT parsing to get the payload
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          
          const payload = JSON.parse(jsonPayload);
          if (payload.sub) {
            setUsername(payload.sub);
            localStorage.setItem('username', payload.sub);
            
            // Update driver name
            setDriver(prev => ({
              ...prev,
              driverName: payload.sub
            }));
          }
        }
      } catch (err) {
        console.error('Error parsing JWT token:', err);
      }
    }
  }, [isAuthenticated, username]);

  const validateForm = () => {
    // Check if driver name is provided
    if (!driver.driverName.trim()) {
      setError('Please enter the driver name');
      return false;
    }
    
    // Check if location is selected
    if (!driver.latitude || !driver.longitude) {
      setError('Please select a location on the map');
      return false;
    }
    
    // Check if userId exists (user is logged in)
    if (!driver.userId) {
      setError('You must be logged in to save a driver');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setSuccess(null);
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      setError('You must be logged in to perform this action');
      return;
    }
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const locationData = {
        driverId: driver.driverId,
        driverName: driver.driverName,
        userId: driver.userId,
        latitude: driver.latitude,
        longitude: driver.longitude,
      };

      // Using the correct URL from the first file (instead of relative path)
      await axios.post('http://localhost:8082/api/v1/delivery/update-location', locationData);
      setSuccess('Driver location updated successfully!');
      
      // Set a short timeout to display the success message before navigating
      setTimeout(() => {
        navigate('/'); // Navigate to home page after successful submission
      }, 1000); // Navigate after 1 second so the user can see the success message
      
    } catch (err) {
      console.error('Error saving driver location:', err);
      setError('Failed to update driver location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDriver({ ...driver, [name]: value });
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await response.json();
      if (data.display_name) {
        setDriver(prev => ({
          ...prev,
          currentAddress: data.display_name,
        }));
      }
    } catch (error) {
      console.error('Error during reverse geocoding:', error);
    }
  };

  const handleLocationSelect = async (lat: number, lng: number) => {
    setDriver(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
    await reverseGeocode(lat, lng);
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition([latitude, longitude]);
          setDriver(prev => ({ ...prev, latitude, longitude }));
          reverseGeocode(latitude, longitude);
          if (mapRef.current) {
            mapRef.current.flyTo([latitude, longitude], 15);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get your current location');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };

  useEffect(() => {
    setMapLoaded(true);
    if (navigator.geolocation && !isEditMode) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition([latitude, longitude]);
          setDriver(prev => ({ ...prev, latitude, longitude }));
          reverseGeocode(latitude, longitude);
        },
        () => setPosition([6.9271, 79.8612])
      );
    } else {
      setPosition([6.9271, 79.8612]);
    }
  }, [isEditMode]);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="text-red-500 text-xl mb-4">
            <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            You must be logged in to access this page
          </div>
          <button 
            onClick={() => navigate('/login')} 
            className="bg-orange-400 text-white px-6 py-2 rounded-lg shadow hover:bg-orange-500 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Fixed header section */}
      <div className="fixed w-full z-50">
         <div className="w-full">
          <NavV2 />
        </div>
      </div>
      <div className="bg-white min-h-screen py-2">
        <div className="flex-grow container mx-auto px-4 pt-32 pb-14 bg-gradient-to-r from-black via-black/80 to-black/60">
          {error && <div className="bg-red-100 text-orange-400 p-4 mb-4 rounded">{error}</div>}
          {success && <div className="bg-green-100 text-orange-400 p-4 mb-4 rounded">{success}</div>}

          <form
            onSubmit={handleSubmit}
            className="relative rounded-2xl shadow-2xl p-8 max-w-5xl mx-auto border border-blue-200 bg-white bg-opacity-80"
            style={{
              background: 'linear-gradient(135deg, #FFF3E0 0%, #FFCC80 50%, #FFA726 100%)',
              boxShadow: '0 10px 25px rgba(255, 152, 0, 0.3)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {/* Profile Avatar */}
            <div className="flex justify-center -mt-16 mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-400 to-orange-400 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2V19.2c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-400 text-center mb-8 flex items-center justify-center gap-2">
              <svg className="w-7 h-7 text-orange-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 13h2l.4 2M7 13h10l1.6-8H6.4L7 13zm5 0v6m-4 0h8"/>
              </svg>
              {isEditMode ? 'Edit Driver Details' : 'Add New Driver'}
            </h2>

            {/* Section: Driver Info */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-semibold text-black">Driver ID <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="driverId"
                      value={driver.driverId}
                      onChange={handleChange}
                      className="w-full p-3 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                      placeholder="Auto-generated driver ID"
                      readOnly={!isEditMode}
                      required
                    />
                  </div>
                  {!isEditMode && (
                    <p className="text-xs mt-1 text-gray-600">Auto-generated ID </p>
                  )}
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-black">Driver Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="driverName"
                    value={driver.driverName}
                    onChange={handleChange}
                    className="w-full p-3 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    placeholder="Enter driver name"
                    required
                  />
                  {!driver.driverName && <p className="text-xs mt-1 text-red-500">Driver name is required</p>}
                </div>
              </div>
              
              {/* Added User ID field */}
              <div className="mt-6">
                <label className="block mb-2 font-semibold text-black">User ID <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="userId"
                  value={driver.userId}
                  onChange={handleChange}
                  className="w-full p-3 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  placeholder="User ID"
                  readOnly={true}
                />
                <p className="text-xs mt-1 text-gray-600">Auto-filled from logged in user</p>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center my-6"></div>

            {/* Section: Driver Location */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2">
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  className="mb-4 px-5 py-2 bg-gradient-to-r from-black to-orange-400 text-white font-semibold rounded-lg shadow hover:scale-105 transition"
                >
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.07-7.07l-1.41 1.41M6.34 17.66l-1.41 1.41m12.02 0l-1.41-1.41M6.34 6.34L4.93 4.93"/>
                    </svg>
                    Use My Location
                  </span>
                </button>
                <div
                  className="relative border border-blue-200 rounded-xl shadow-md overflow-hidden leaflet-map-fix"
                  style={{ height: '300px', zIndex: 0, position: 'relative' }}
                >
                  {mapLoaded && (
                    <MapContainer
                      center={position || [6.9271, 79.8612]}
                      zoom={13}
                      className="w-full h-full"
                      ref={mapRef}
                      style={{ zIndex: 0, height: '100%', width: '100%', position: 'relative' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                      />
                      <LocationMarker
                        position={position}
                        setPosition={setPosition}
                        onLocationSelect={handleLocationSelect}
                      />
                    </MapContainer>
                  )}
                </div>
                <p className="mt-2 text-sm text-black">Click on the map to set driver location <span className="text-red-500">*</span></p>
                {!driver.latitude && !driver.longitude && <p className="text-xs text-red-500">Location selection is required</p>}
              </div>
              <div className="md:w-1/2">
                <label className="block mb-2 font-semibold text-black">Current Address</label>
                <textarea
                  name="currentAddress"
                  value={driver.currentAddress}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-3 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  placeholder="Address will appear here after selecting location"
                />
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div>
                    <label className="block mb-2 font-semibold text-black">Latitude <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={driver.latitude || ''}
                      readOnly
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold text-black">Longitude <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={driver.longitude || ''}
                      readOnly
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-10 text-center">
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-orange-400 to-black text-white font-bold rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition inline-flex items-center gap-2"
                disabled={loading}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7"/>
                </svg>
                {loading ? 'Saving...' : isEditMode ? 'Update Driver' : 'Save Driver'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
    </div>
  );
};

export default DriverForm;