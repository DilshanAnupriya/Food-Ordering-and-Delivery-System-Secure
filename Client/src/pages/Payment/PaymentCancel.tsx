import { useNavigate } from 'react-router-dom';
import NavigationBar from '../../components/layout/Navbar';
import SubNav from '../../components/layout/SubNav';
import Footer from '../../components/layout/Footer';

const PaymentCancel = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50">
            <SubNav />
            <NavigationBar />
            <div className="max-w-lg mx-auto mt-10 p-6">
                <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                    <div className="flex flex-col items-center">
                        <svg 
                            className="h-16 w-16 text-yellow-500 mb-4" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                            />
                        </svg>
                        <h1 className="text-2xl font-bold mb-2">Payment Cancelled</h1>
                        <p className="text-center mb-4">
                            Your payment was cancelled. You can try again or return to the order page.
                        </p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/orders')}
                        className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Return to Orders
                    </button>
                    <button
                        onClick={() => window.history.back()}
                        className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                        Go Back
                    </button>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PaymentCancel;