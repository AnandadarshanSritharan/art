import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useStore from '../store/useStore';
import { useToast } from '../components/ToastProvider';

// Helper function to get full image URL
const getImageUrl = (imagePath: string | undefined): string => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    return `http://localhost:5000${imagePath}`;
};

const PlaceOrderPage: React.FC = () => {
    const { cartItems, shippingAddress, clearCart, refreshNotifications } = useStore();
    const navigate = useNavigate();
    const { showToast } = useToast();

    // Calculate prices
    const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const shippingPrice = itemsPrice > 100 ? 0 : 10; // Free shipping over $100
    const taxPrice = Number((0.15 * itemsPrice).toFixed(2)); // 15% tax
    const totalPrice = (itemsPrice + shippingPrice + taxPrice).toFixed(2);

    useEffect(() => {
        if (!shippingAddress) {
            navigate('/shipping');
        }
    }, [shippingAddress, navigate]);

    if (!shippingAddress) {
        return null;
    }

    const placeOrderHandler = async () => {
        try {
            const { data } = await api.post('/orders', {
                orderItems: cartItems,
                shippingAddress,
                paymentMethod: 'Cash on Delivery', // Default for now
                itemsPrice: itemsPrice.toFixed(2),
                shippingPrice: shippingPrice.toFixed(2),
                taxPrice: taxPrice.toFixed(2),
                totalPrice,
                orderNotes: shippingAddress?.orderNotes,
            });
            clearCart();
            // Trigger notification refresh for artists
            refreshNotifications();
            showToast('Order placed successfully! Thank you for your purchase.', 'success');
            navigate(`/order/${data._id}`);
        } catch (error) {
            console.error(error);
            showToast('Failed to place order. Please try again.', 'error');
        }
    };

    return (

        <div className="container mx-auto px-4 py-16 min-h-[calc(100vh-80px)]">
            <h1 className="text-4xl font-bold mb-10 font-serif text-gray-900">Review Your Order</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                    {/* Shipping Info */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold mb-6 font-serif text-gray-900 border-b border-gray-100 pb-4 flex items-center">
                            <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3 font-sans">1</span>
                            Shipping Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-gray-600">
                            <div>
                                <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">Contact</p>
                                <p className="font-medium text-gray-900">{shippingAddress?.fullName}</p>
                                <p>{shippingAddress?.email}</p>
                                <p>{shippingAddress?.phone}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">Address</p>
                                <p className="font-medium text-gray-900">
                                    {shippingAddress?.addressLine1}
                                    {shippingAddress?.addressLine2 && <><br />{shippingAddress.addressLine2}</>}
                                </p>
                                <p>
                                    {shippingAddress?.city}, {shippingAddress?.district} {shippingAddress?.postalCode}
                                </p>
                            </div>
                            {shippingAddress?.landmark && (
                                <div className="md:col-span-2">
                                    <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">Landmark</p>
                                    <p>{shippingAddress.landmark}</p>
                                </div>
                            )}
                            {(shippingAddress?.orderNotes || shippingAddress?.specialInstructions) && (
                                <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg mt-2">
                                    {shippingAddress?.orderNotes && (
                                        <div className="mb-2">
                                            <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">Order Notes</p>
                                            <p className="italic">"{shippingAddress.orderNotes}"</p>
                                        </div>
                                    )}
                                    {shippingAddress?.specialInstructions && (
                                        <div>
                                            <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">Special Instructions</p>
                                            <p className="italic">"{shippingAddress.specialInstructions}"</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100">
                            <Link to="/shipping" className="text-accent font-bold hover:underline text-sm flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                Edit Shipping Details
                            </Link>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold mb-6 font-serif text-gray-900 border-b border-gray-100 pb-4 flex items-center">
                            <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3 font-sans">2</span>
                            Order Items
                        </h2>

                        {cartItems.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                Your cart is empty. <Link to="/shop" className="text-primary font-bold hover:underline">Go Shopping</Link>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {cartItems.map((item, index) => (
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
                        )}
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
                        <h2 className="text-2xl font-bold mb-6 font-serif text-gray-900">Order Summary</h2>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-gray-600">
                                <span>Items Subtotal</span>
                                <span className="font-medium">${itemsPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                {Number(shippingPrice) === 0 ? (
                                    <span className="text-green-600 font-medium">Free</span>
                                ) : (
                                    <span className="font-medium">${shippingPrice.toFixed(2)}</span>
                                )}
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Tax (15%)</span>
                                <span className="font-medium">${taxPrice.toFixed(2)}</span>
                            </div>

                            <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-900">Total</span>
                                <span className="text-3xl font-bold text-primary font-serif">${totalPrice}</span>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100">
                            <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">Payment Method</p>
                            <div className="flex items-center text-gray-700 font-medium">
                                <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                Cash on Delivery
                            </div>
                        </div>

                        <button
                            onClick={placeOrderHandler}
                            className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={cartItems.length === 0}
                        >
                            Place Order
                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </button>

                        <p className="text-center text-xs text-gray-400 mt-4">
                            By placing your order, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaceOrderPage;
