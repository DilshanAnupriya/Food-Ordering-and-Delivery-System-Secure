import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/auth/authContext';
import { createCheckoutSession } from '../../services/Payment/payment';
import Footer from '../../components/layout/Footer';
import NavV2 from "../../components/layout/NavV2.tsx";

const Checkout = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const processCheckout = async () => {
            if (!user?.userId) {
                navigate('/login');
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const orderDetail = JSON.parse(sessionStorage.getItem('orderDetail') || '[]');
                const latestOrder = orderDetail[orderDetail.length - 1];

                if (!latestOrder) {
                    throw new Error('No order found');
                }

                const productRequest = {
                    amount: Math.round(latestOrder.totalAmount * 100),
                    quantity: 1,
                    name: `Order #${latestOrder.orderId}`,
                    currency: 'USD',
                    userId: parseInt(user.userId),
                    orderId: latestOrder.orderId
                };

                const response = await createCheckoutSession(productRequest);

                if (response.status === 'SUCCESS' && response.sessionUrl) {
                    // Redirect to Stripe checkout
                    window.location.href = response.sessionUrl;
                    // After successful payment, navigate to order confirmation
                    setTimeout(() => {
                        navigate('/order-confirmation');
                    }, 1000);
                } else {
                    throw new Error('Failed to create checkout session');
                }
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
                setError(errorMessage);
                console.error('Checkout error:', error);
            } finally {
                setLoading(false);
            }
        };

        processCheckout();
    }, [user, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <NavV2 />
                <div className="flex justify-center items-center h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">

                <NavV2 />
                <div className="max-w-lg mx-auto mt-10 p-6">
                    <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                    <button
                        onClick={() => navigate('/track')}
                        className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Return to Orders
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">

            <NavV2 />
            <div className="max-w-lg mx-auto mt-10 p-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Processing Your Payment</h1>
                    <p className="text-gray-600">
                        Please wait while we redirect you to our secure payment gateway...
                    </p>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Checkout;