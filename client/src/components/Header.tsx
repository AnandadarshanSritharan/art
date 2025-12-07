import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Bell, Menu, X } from 'lucide-react';
import useStore from '../store/useStore';
import api from '../api/axios';
import MessageIcon from './MessageIcon';

const Header: React.FC = () => {
    const { userInfo, cartItems, logout, notificationTrigger } = useStore();
    const navigate = useNavigate();
    const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const fetchPendingOrders = async () => {
            if (userInfo?.isArtist) {
                try {
                    const { data } = await api.get('/orders/artist');
                    const pending = data.filter((order: any) => !order.isDelivered);
                    setPendingOrdersCount(pending.length);
                } catch (error) {
                    console.error('Failed to fetch pending orders', error);
                }
            }
        };

        fetchPendingOrders();
    }, [userInfo, notificationTrigger]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="glass sticky top-0 z-50 transition-all duration-300">
            <div className="container mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
                <Link to="/" className="text-2xl md:text-3xl font-bold font-serif text-primary tracking-tight">
                    CeyCanvas
                </Link>

                <nav className="hidden md:flex space-x-10">
                    {['Home', 'Shop', 'Artists'].map((item) => (
                        <Link
                            key={item}
                            to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                            className="text-gray-600 hover:text-primary font-medium transition duration-300 relative group"
                        >
                            {item}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center space-x-4 md:space-x-8">
                    {/* Message Icon - Hidden on mobile */}
                    {userInfo && <div className="hidden md:block"><MessageIcon /></div>}

                    {/* Notification Bell for Artists - Hidden on mobile */}
                    {userInfo?.isArtist && (
                        <div className="relative hidden md:block" ref={notificationRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative text-gray-600 hover:text-primary transition duration-300"
                            >
                                <Bell size={22} />
                                {pendingOrdersCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                        {pendingOrdersCount}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-4 w-80 bg-white border border-gray-100 rounded-xl shadow-2xl py-2 z-50 overflow-hidden animate-fade-in">
                                    <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                                        <h3 className="font-semibold text-gray-800 font-serif">Notifications</h3>
                                    </div>
                                    {pendingOrdersCount > 0 ? (
                                        <Link
                                            to="/artist/orders"
                                            onClick={() => setShowNotifications(false)}
                                            className="block px-4 py-4 hover:bg-gray-50 transition"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">
                                                        {pendingOrdersCount} Pending Order{pendingOrdersCount > 1 ? 's' : ''}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Action required
                                                    </p>
                                                </div>
                                                <div className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-sm">
                                                    {pendingOrdersCount}
                                                </div>
                                            </div>
                                        </Link>
                                    ) : (
                                        <div className="px-4 py-6 text-sm text-gray-400 text-center italic">
                                            No new notifications
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Cart Icon - Always visible */}
                    <Link to="/cart" className="relative text-gray-600 hover:text-primary transition duration-300">
                        <ShoppingCart size={22} />
                        {cartItems.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-sm">
                                {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                            </span>
                        )}
                    </Link>

                    {/* Desktop User Menu */}
                    {userInfo ? (
                        <div className="relative group hidden md:block">
                            <button className="flex items-center space-x-2 text-gray-600 hover:text-primary transition duration-300">
                                <User size={22} />
                                <span className="hidden md:block font-medium">{userInfo.name}</span>
                            </button>
                            <div className="absolute right-0 pt-4 w-56 hidden group-hover:block">
                                <div className="bg-white border border-gray-100 rounded-xl shadow-2xl py-2 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Account</p>
                                    </div>
                                    <Link to="/profile" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                                        Profile
                                    </Link>

                                    {userInfo.isAdmin && (
                                        <Link to="/admin/dashboard" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                                            Admin Dashboard
                                        </Link>
                                    )}
                                    {userInfo.isArtist && (
                                        <Link to="/artist/dashboard" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                                            Artist Dashboard
                                        </Link>
                                    )}
                                    <div className="border-t border-gray-50 mt-1 pt-1">
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Link to="/login" className="hidden md:block px-6 py-2 bg-primary text-white text-sm font-medium rounded-full hover:bg-gray-800 transition duration-300 shadow-md hover:shadow-lg">
                            Login
                        </Link>
                    )}

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-gray-600 hover:text-primary transition p-2"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-lg animate-fade-in glass">
                    <div className="container mx-auto px-4 py-4 flex flex-col space-y-1">
                        {/* Navigation Links */}
                        {['Home', 'Shop', 'Artists'].map((item) => (
                            <Link
                                key={item}
                                to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                                className="text-base font-medium text-gray-800 hover:text-primary transition py-3 px-2 rounded-lg hover:bg-gray-50"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {item}
                            </Link>
                        ))}

                        {/* User Section */}
                        {userInfo ? (
                            <>
                                <div className="border-t border-gray-100 my-2"></div>
                                <div className="px-2 py-2">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Account</p>
                                </div>
                                <Link
                                    to="/profile"
                                    className="text-base font-medium text-gray-800 hover:text-primary transition py-3 px-2 rounded-lg hover:bg-gray-50"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Profile
                                </Link>

                                {userInfo.isArtist && (
                                    <>
                                        <Link
                                            to="/artist/dashboard"
                                            className="text-base font-medium text-gray-800 hover:text-primary transition py-3 px-2 rounded-lg hover:bg-gray-50 flex items-center justify-between"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <span>Artist Dashboard</span>
                                            {pendingOrdersCount > 0 && (
                                                <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                                    {pendingOrdersCount}
                                                </span>
                                            )}
                                        </Link>
                                        <Link
                                            to="/artist/orders"
                                            className="text-base font-medium text-gray-800 hover:text-primary transition py-3 px-2 rounded-lg hover:bg-gray-50"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Artist Orders
                                        </Link>
                                    </>
                                )}
                                {userInfo.isAdmin && (
                                    <Link
                                        to="/admin/dashboard"
                                        className="text-base font-medium text-gray-800 hover:text-primary transition py-3 px-2 rounded-lg hover:bg-gray-50"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Admin Dashboard
                                    </Link>
                                )}
                                <div className="border-t border-gray-100 my-2"></div>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="text-base font-medium text-red-600 hover:text-red-700 transition py-3 px-2 rounded-lg hover:bg-red-50 text-left w-full"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="border-t border-gray-100 my-2"></div>
                                <Link
                                    to="/login"
                                    className="text-base font-medium text-white bg-primary hover:bg-gray-800 transition py-3 px-4 rounded-lg text-center"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Login
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
