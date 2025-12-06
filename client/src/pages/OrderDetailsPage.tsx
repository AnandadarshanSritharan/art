import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

// Helper function to get full image URL
const getImageUrl = (imagePath: string | undefined): string => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    return `http://localhost:5000${imagePath}`;
};

interface Order {
    _id: string;
    shippingAddress: {
        fullName: string;
        email: string;
        phone: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        district: string;
        postalCode?: string;
        landmark?: string;
        orderNotes?: string;
        specialInstructions?: string;
    };
    orderItems: {
        product: string;
        title: string;
        image: string;
        price: number;
        qty: number;
    }[];
    itemsPrice: number;
    shippingPrice: number;
    taxPrice: number;
    totalPrice: number;
    isPaid: boolean;
    paidAt?: string;
    isDelivered: boolean;
    deliveredAt?: string;
    paymentMethod: string;
}

const OrderDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await api.get(`/orders/${id}`);
                setOrder(data);
                setLoading(false);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load order');
                setLoading(false);
            }
        };

        if (id) {
            fetchOrder();
        }
    }, [id]);

    if (loading) return <div className="text-center py-8">Loading...</div>;
    if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
    if (!order) return <div className="text-center py-8">Order not found</div>;

    return (

        <div className="container mx-auto px-4 py-16 min-h-[calc(100vh-80px)]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
                <div>
                    <h1 className="text-4xl font-bold font-serif text-gray-900 mb-2">Order Details</h1>
                    <p className="text-gray-500">Order ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">{order._id}</span></p>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-3">
                    <Link to="/shop" className="px-6 py-2 border border-gray-300 rounded-full text-gray-700 font-medium hover:bg-gray-50 transition">
                        Continue Shopping
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                    {/* Shipping Info */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold mb-6 font-serif text-gray-900 border-b border-gray-100 pb-4">
                            Shipping Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 text-gray-600 mb-6">
                            <div>
                                <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">Contact</p>
                                <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
                                <p>{order.shippingAddress.email}</p>
                                <p>{order.shippingAddress.phone}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">Address</p>
                                <p className="font-medium text-gray-900">
                                    {order.shippingAddress.addressLine1}
                                    {order.shippingAddress.addressLine2 && <><br />{order.shippingAddress.addressLine2}</>}
                                </p>
                                <p>
                                    {order.shippingAddress.city}, {order.shippingAddress.district} {order.shippingAddress.postalCode}
                                </p>
                            </div>
                        </div>

                        <div className={`p-4 rounded-xl flex items-center ${order.isDelivered ? 'bg-green-50 text-green-800 border border-green-100' : 'bg-yellow-50 text-yellow-800 border border-yellow-100'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${order.isDelivered ? 'bg-green-100' : 'bg-yellow-100'}`}>
                                {order.isDelivered ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                )}
                            </div>
                            <div>
                                <p className="font-bold">{order.isDelivered ? 'Delivered' : 'Processing'}</p>
                                <p className="text-sm opacity-80">
                                    {order.isDelivered
                                        ? `Delivered on ${new Date(order.deliveredAt!).toLocaleDateString()}`
                                        : 'Your order is being prepared for shipment.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold mb-6 font-serif text-gray-900 border-b border-gray-100 pb-4">
                            Payment Method
                        </h2>

                        <div className="mb-6">
                            <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">Method</p>
                            <p className="font-medium text-gray-900 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                {order.paymentMethod}
                            </p>
                        </div>

                        <div className={`p-4 rounded-xl flex items-center ${order.isPaid ? 'bg-green-50 text-green-800 border border-green-100' : 'bg-red-50 text-red-800 border border-red-100'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${order.isPaid ? 'bg-green-100' : 'bg-red-100'}`}>
                                {order.isPaid ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                )}
                            </div>
                            <div>
                                <p className="font-bold">{order.isPaid ? 'Paid' : 'Not Paid'}</p>
                                <p className="text-sm opacity-80">
                                    {order.isPaid
                                        ? `Payment received on ${new Date(order.paidAt!).toLocaleDateString()}`
                                        : 'Payment is pending.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold mb-6 font-serif text-gray-900 border-b border-gray-100 pb-4">
                            Order Items
                        </h2>
                        <div className="space-y-6">
                            {order.orderItems.map((item, index) => (
                                <div key={index} className="flex flex-col sm:flex-row items-center sm:items-start justify-between border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                                    <div className="flex items-center space-x-6 w-full sm:w-auto">
                                        <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                            <img
                                                src={getImageUrl(item.image)}
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <Link to={`/artwork/${item.product}`} className="text-lg font-bold text-gray-900 hover:text-primary transition-colors font-serif">
                                                {item.title}
                                            </Link>
                                            <p className="text-sm text-gray-500 mt-1">Quantity: {item.qty}</p>
                                        </div>
                                    </div>
                                    <div className="text-right mt-4 sm:mt-0 w-full sm:w-auto">
                                        <p className="text-lg font-bold text-gray-900">${(item.qty * item.price).toFixed(2)}</p>
                                        <p className="text-xs text-gray-400">${item.price} each</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
                        <h2 className="text-2xl font-bold mb-6 font-serif text-gray-900">Order Summary</h2>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-gray-600">
                                <span>Items Subtotal</span>
                                <span className="font-medium">${order.itemsPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span className="font-medium">${order.shippingPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Tax</span>
                                <span className="font-medium">${order.taxPrice.toFixed(2)}</span>
                            </div>

                            <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-900">Total</span>
                                <span className="text-3xl font-bold text-primary font-serif">${order.totalPrice.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                            <p className="text-sm text-gray-500 mb-2">Need help with your order?</p>
                            <a href="mailto:support@artspace.com" className="text-primary font-bold hover:underline">Contact Support</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsPage;
