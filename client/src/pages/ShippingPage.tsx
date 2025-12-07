import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, User, Truck, FileText, CreditCard, Package } from 'lucide-react';
import useStore from '../store/useStore';
import { getImageUrl } from '../utils/image';

const ShippingPage: React.FC = () => {
    const { shippingAddress, saveShippingAddress, cartItems } = useStore();
    const navigate = useNavigate();

    const [fullName, setFullName] = useState(shippingAddress?.fullName || '');
    const [email, setEmail] = useState(shippingAddress?.email || '');
    const [phone, setPhone] = useState(shippingAddress?.phone || '');
    const [addressLine1, setAddressLine1] = useState(shippingAddress?.addressLine1 || '');
    const [addressLine2, setAddressLine2] = useState(shippingAddress?.addressLine2 || '');
    const [city, setCity] = useState(shippingAddress?.city || '');
    const [district, setDistrict] = useState(shippingAddress?.district || '');
    const [postalCode, setPostalCode] = useState(shippingAddress?.postalCode || '');
    const [landmark, setLandmark] = useState(shippingAddress?.landmark || '');
    const [orderNotes, setOrderNotes] = useState(shippingAddress?.orderNotes || '');
    const [specialInstructions, setSpecialInstructions] = useState(shippingAddress?.specialInstructions || '');

    const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

    const submitHandler = (e: React.FormEvent) => {
        e.preventDefault();
        saveShippingAddress({
            fullName,
            email,
            phone,
            addressLine1,
            addressLine2,
            city,
            district,
            postalCode,
            landmark,
            orderNotes,
            specialInstructions,
        });
        navigate('/placeorder');
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12">
            <div className="container mx-auto px-4">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-bold mb-3 font-serif text-gray-900">
                        Shipping Details
                    </h1>
                    <p className="text-gray-500 text-lg">Where should we send your masterpiece?</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {/* Left Column - Shipping Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={submitHandler} className="space-y-6">
                            {/* Section 1: Contact Info */}
                            <div className="bg-white p-8 rounded-xl shadow-sm border-l-4 border-primary transition-all hover:shadow-md">
                                <h2 className="text-xl font-bold mb-8 text-gray-900 flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-primary mr-4">
                                        <User size={20} />
                                    </div>
                                    Contact Information
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Full Name</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                                <User size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                className="w-full pl-11 pr-5 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all focus:bg-white"
                                                placeholder="John Doe"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Email Address</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                                <Mail size={18} />
                                            </div>
                                            <input
                                                type="email"
                                                required
                                                className="w-full pl-11 pr-5 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all focus:bg-white"
                                                placeholder="john@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Phone Number</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                                <Phone size={18} />
                                            </div>
                                            <input
                                                type="tel"
                                                required
                                                className="w-full pl-11 pr-5 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all focus:bg-white"
                                                placeholder="+1 (555) 000-0000"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Delivery Address */}
                            <div className="bg-white p-8 rounded-xl shadow-sm border-l-4 border-primary transition-all hover:shadow-md">
                                <h2 className="text-xl font-bold mb-8 text-gray-900 flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-primary mr-4">
                                        <MapPin size={20} />
                                    </div>
                                    Delivery Address
                                </h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Address Line 1</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="House No, Street Name"
                                            className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all focus:bg-white"
                                            value={addressLine1}
                                            onChange={(e) => setAddressLine1(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Address Line 2 (Optional)</label>
                                        <input
                                            type="text"
                                            placeholder="Apartment, Suite, Unit, etc."
                                            className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all focus:bg-white"
                                            value={addressLine2}
                                            onChange={(e) => setAddressLine2(e.target.value)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">City / Town</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all focus:bg-white"
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">District / State</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all focus:bg-white"
                                                value={district}
                                                onChange={(e) => setDistrict(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Postal Code (Optional)</label>
                                            <input
                                                type="text"
                                                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all focus:bg-white"
                                                value={postalCode}
                                                onChange={(e) => setPostalCode(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Landmark (Optional)</label>
                                            <input
                                                type="text"
                                                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all focus:bg-white"
                                                placeholder="Near famous place"
                                                value={landmark}
                                                onChange={(e) => setLandmark(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Additional Info */}
                            <div className="bg-white p-8 rounded-xl shadow-sm border-l-4 border-primary transition-all hover:shadow-md">
                                <h2 className="text-xl font-bold mb-8 text-gray-900 flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-primary mr-4">
                                        <FileText size={20} />
                                    </div>
                                    Additional Information
                                </h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Order Notes (Optional)</label>
                                        <textarea
                                            className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all focus:bg-white h-24 resize-none"
                                            placeholder="Notes about your order, e.g. special notes for delivery."
                                            value={orderNotes}
                                            onChange={(e) => setOrderNotes(e.target.value)}
                                        ></textarea>
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Special Instructions (Optional)</label>
                                        <textarea
                                            className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all focus:bg-white h-24 resize-none"
                                            placeholder="Any specific instructions for the artist or packaging."
                                            value={specialInstructions}
                                            onChange={(e) => setSpecialInstructions(e.target.value)}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex justify-center items-center group"
                            >
                                <span>Continue to Payment</span>
                                <CreditCard className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                            </button>
                        </form>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-accent sticky top-24">
                            <h2 className="text-xl font-bold mb-6 font-serif text-gray-900 flex items-center">
                                <Package className="mr-3 text-accent" size={24} />
                                Order Summary
                            </h2>

                            <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {cartItems.map((item) => (
                                    <div key={item.product} className="flex gap-4 items-start group p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
                                            <img
                                                src={getImageUrl(item.image)}
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-1">{item.title}</h3>
                                            <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                                        </div>
                                        <div className="text-sm font-bold text-primary whitespace-nowrap">
                                            Rs {(item.price * item.qty).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-100 pt-4 space-y-3">
                                <div className="flex justify-between text-gray-600 text-sm">
                                    <span>Subtotal</span>
                                    <span>Rs {itemsPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 text-sm">
                                    <span>Shipping</span>
                                    <span className="text-green-600 font-medium flex items-center">
                                        Free
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                    <span className="text-lg font-bold text-gray-900">Total</span>
                                    <span className="text-2xl font-bold text-primary font-serif">Rs {itemsPrice.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 text-xs bg-gray-50 py-2 rounded-lg">
                                <Truck size={14} />
                                Free Shipping on all orders
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShippingPage;
