import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import useStore from '../store/useStore';

import { getImageUrl } from '../utils/image';

const CartPage: React.FC = () => {
    const { cartItems, removeFromCart } = useStore();
    const navigate = useNavigate();

    const total = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2);

    const checkoutHandler = () => {
        navigate('/login?redirect=/shipping');
    };

    return (

        <div className="container mx-auto px-4 py-16 min-h-[calc(100vh-80px)]">
            <h1 className="text-4xl font-bold mb-10 font-serif text-gray-900">Your Collection</h1>

            {cartItems.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="mb-6 text-gray-300">
                        <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                    </div>
                    <p className="text-2xl text-gray-900 font-serif mb-2">Your cart is empty</p>
                    <p className="text-gray-500 mb-8">Looks like you haven't found your masterpiece yet.</p>
                    <Link
                        to="/shop"
                        className="inline-block bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                        Start Exploring
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-6">
                        {cartItems.map((item) => (
                            <div key={item.product} className="flex flex-col sm:flex-row items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="w-full sm:w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg mb-4 sm:mb-0">
                                    <img
                                        src={getImageUrl(item.image)}
                                        alt={item.title}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                                        }}
                                    />
                                </div>

                                <div className="flex-grow sm:ml-6 text-center sm:text-left w-full">
                                    <Link to={`/artwork/${item.product}`} className="text-xl font-bold font-serif text-gray-900 hover:text-primary transition-colors block mb-1">
                                        {item.title}
                                    </Link>
                                    <p className="text-gray-500 text-sm mb-4">Original Artwork</p>
                                    <div className="flex justify-between items-center sm:hidden w-full border-t border-gray-100 pt-4 mt-2">
                                        <span className="text-xl font-bold text-primary">${item.price}</span>
                                        <button
                                            onClick={() => removeFromCart(item.product)}
                                            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>

                                <div className="hidden sm:flex flex-col items-end space-y-4 ml-6">
                                    <span className="text-2xl font-bold text-primary font-serif">${item.price}</span>
                                    <button
                                        onClick={() => removeFromCart(item.product)}
                                        className="text-gray-400 hover:text-red-500 transition-colors flex items-center text-sm group"
                                    >
                                        <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">Remove</span>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
                            <h2 className="text-2xl font-bold mb-6 font-serif">Order Summary</h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)} items)</span>
                                    <span className="font-medium text-gray-900">${total}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="text-green-600 font-medium">Free</span>
                                </div>
                                <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-900">Total</span>
                                    <span className="text-3xl font-bold text-primary font-serif">${total}</span>
                                </div>
                            </div>

                            <button
                                onClick={checkoutHandler}
                                className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex justify-center items-center"
                            >
                                Proceed to Checkout
                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                            </button>

                            <div className="mt-6 flex items-center justify-center space-x-4 text-gray-400">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" /></svg>
                                <span className="text-xs">Secure Checkout</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
