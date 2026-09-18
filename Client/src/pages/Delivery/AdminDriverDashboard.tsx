import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AdminSidebar from "../../components/layout/AdminSideBar";
import AdminNavbar from "../../components/admin/AdminNavbar";

interface DriverLocation {
  driverId: string;
  driverName: string;
  latitude: number;
  longitude: number;
  available: boolean;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
}

export default function DriversDashboard() {
  const [drivers, setDrivers] = useState<DriverLocation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [isStatusUpdating, setIsStatusUpdating] = useState<boolean>(false);
  const [updatingDriverId, setUpdatingDriverId] = useState<string | null>(null);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = useCallback(async (status?: string) => {
    setLoading(true);
    try {
      let url = 'http://localhost:8082/api/v1/delivery/drivers';
      if (status && status !== 'ALL') {
        url = `http://localhost:8082/api/v1/delivery/drivers/status/${status}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      setDrivers(data);
      setError(null);
    } catch (err) {
      setError(`Failed to fetch drivers: ${err instanceof Error ? err.message : String(err)}`);
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStatusChange = async (driverId: string, newStatus: string) => {
    if (isStatusUpdating) return;
    
    setIsStatusUpdating(true);
    setUpdatingDriverId(driverId);
    setError(null);
    
    try {
      // Optimistically update UI first
      setDrivers(prevDrivers => 
        prevDrivers.map(d => 
          d.driverId === driverId 
            ? { ...d, status: newStatus as 'APPROVED' | 'PENDING' | 'REJECTED' } 
            : d
        )
      );
      
      const response = await fetch(
        `http://localhost:8082/api/v1/delivery/drivers/${driverId}/status?status=${newStatus}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.status}`);
      }

      // Get the driver details for the email notification
      const driver = drivers.find(d => d.driverId === driverId);
      if (driver) {
        try {
          // Send email notification
          await axios.post('http://localhost:8080/api/notifications/driver-status', {
            email: driver.driverName, // Using driverName as email
            driverName: driver.driverName,
            driverId: driver.driverId,
            status: newStatus
          });
        } catch (emailErr) {
          console.error("Failed to send email notification:", emailErr);
          // Continue even if email fails - don't revert UI
        }
      }
    } catch (err) {
      setError(`Error updating driver status: ${err instanceof Error ? err.message : String(err)}`);
      
      // Revert the optimistic update if API call failed
      await fetchDrivers(statusFilter !== 'ALL' ? statusFilter : undefined);
    } finally {
      setIsStatusUpdating(false);
      setUpdatingDriverId(null);
    }
  };

  const handleDeleteDriver = async (driverId: string) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) return;
    try {
      const response = await fetch(
        `http://localhost:8082/api/v1/delivery/drivers/${driverId}`,
        { method: 'DELETE' }
      );
      if (!response.ok) {
        throw new Error(`Failed to delete driver: ${response.status}`);
      }
      setDrivers(drivers.filter((d) => d.driverId !== driverId));
      setError(null);
    } catch (err) {
      setError(`Error deleting driver: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    setError(null);
    fetchDrivers(status !== 'ALL' ? status : undefined);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'REJECTED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getAvailabilityBadgeColor = (available: boolean) => {
    return available 
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
      : 'bg-rose-100 text-rose-800 border-rose-200';
  };

  const filteredDrivers = drivers.filter(driver =>
  (driver.driverName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
  (driver.driverId?.toLowerCase() || '').includes(searchTerm.toLowerCase())
   );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminNavbar />
          
          {/* Main content */}
          <main className="flex-1 pt-20 pb-8 px-6 md:px-8 lg:px-10 bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto">
              {/* Header Section */}
              <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">Driver Management</h1>
                    <p className="text-gray-600 mt-1">Manage all driver accounts and statuses</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Search drivers..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <select
                      value={statusFilter}
                      onChange={(e) => handleFilterChange(e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="ALL">All Status</option>
                      <option value="APPROVED">Approved</option>
                      <option value="PENDING">Pending</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                {/* <button
                  onClick={() => fetchDrivers(statusFilter !== 'ALL' ? statusFilter : undefined)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <svg 
                    className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button> */}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Drivers</p>
                      <p className="text-2xl font-semibold text-gray-800 mt-1">{drivers.length}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Available Drivers</p>
                      <p className="text-2xl font-semibold text-gray-800 mt-1">
                        {drivers.filter(d => d.available).length}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-50 text-green-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Pending Approval</p>
                      <p className="text-2xl font-semibold text-gray-800 mt-1">
                        {drivers.filter(d => d.status === 'PENDING').length}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3 flex justify-between w-full">
                      <p className="text-sm text-red-700">{error}</p>
                      <button 
                        onClick={() => setError(null)} 
                        className="ml-auto text-red-700 hover:text-red-900 transition-colors"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Driver Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Driver ID
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Location
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Availability
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredDrivers.length > 0 ? (
                          filteredDrivers.map((driver) => (
                            <tr key={driver.driverId} className="hover:bg-gray-50 transition-colors duration-150">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-blue-600 font-medium">
                                      {driver.driverName?.charAt(0)?.toUpperCase() || ''}
                                    </span>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{driver.driverName || 'Unknown'}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {driver.driverId.substring(0, 8)}...
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {driver.latitude.toFixed(4)}, {driver.longitude.toFixed(4)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${getAvailabilityBadgeColor(driver.available)}`}>
                                  {driver.available ? 'Available' : 'Busy'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadgeColor(driver.status)}`}>
                                  {driver.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                                <div className="flex justify-end items-center gap-2">
                                  {updatingDriverId === driver.driverId && isStatusUpdating ? (
                                    <div className="px-3 py-1 text-sm text-gray-500">
                                      <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                                        Updating...
                                      </div>
                                    </div>
                                  ) : (
                                    <select
                                      value=""
                                      onChange={(e) => {
                                        if (e.target.value) {
                                          handleStatusChange(driver.driverId, e.target.value);
                                        }
                                      }}
                                      disabled={isStatusUpdating}
                                      className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                                    >
                                      <option value="">Change Status</option>
                                      <option value="APPROVED">Approve</option>
                                      <option value="REJECTED">Reject</option>
                                      <option value="PENDING">Pending</option>
                                    </select>
                                  )}
                                  <button
                                    onClick={() => handleDeleteDriver(driver.driverId)}
                                    disabled={isStatusUpdating}
                                    className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white ${isStatusUpdating ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150`}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-6 py-4 text-center">
                              <div className="text-gray-500 py-8">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No drivers found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                  {searchTerm ? 'Try a different search term' : 'No drivers match your current filters'}
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}