import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api/axios';
import useStore from '../store/useStore';
import { getImageUrl, compressImage } from '../utils/image';
import Toast, { type ToastType } from '../components/Toast';

interface Order {
    _id: string;
    createdAt: string;
    totalPrice: number;
    isPaid: boolean;
    isDelivered: boolean;
}

const ProfilePage: React.FC = () => {
    const { userInfo, logout, setUserInfo } = useStore();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'orders' | 'settings'>('orders');

    // Settings State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profileImage, setProfileImage] = useState('');
    const [uploading, setUploading] = useState(false);

    // Section Toggles
    const [personalOpen, setPersonalOpen] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);

    // Section Loading & Messages
    const [personalLoading, setPersonalLoading] = useState(false);
    const [personalMessage, setPersonalMessage] = useState({ type: '', text: '' });

    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

    // Toast State
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => {
                setToast(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    useEffect(() => {
        if (!userInfo) {
            navigate('/login');
        } else {
            setName(userInfo.name);
            setEmail(userInfo.email);
            setProfileImage(userInfo.profileImage || '');

            const fetchOrders = async () => {
                try {
                    const { data } = await api.get('/orders/myorders');
                    setOrders(data);
                } catch (error) {
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            };
            fetchOrders();
        }
    }, [navigate, userInfo]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const uploadFileHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        let file = files[0];

        // Compress image
        try {
            file = await compressImage(file);
        } catch (error) {
            console.error("Compression failed, using original file", error);
        }

        if (file.size > 5 * 1024 * 1024) {
            setPersonalMessage({ type: 'error', text: 'File is too large (max 5MB)' });
            return;
        }

        const formData = new FormData();
        formData.append('image', file);
        setUploading(true);

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo?.token}`,
                },
            };

            const { data } = await api.post('/upload', formData, config);
            setProfileImage(data.imagePath);
            setUploading(false);
        } catch (error) {
            console.error(error);
            setPersonalMessage({ type: 'error', text: 'Image upload failed' });
            setUploading(false);
        }
    };

    const handleUpdatePersonalInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        setPersonalMessage({ type: '', text: '' });

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setPersonalMessage({ type: 'error', text: 'Please enter a valid email address' });
            return;
        }

        setPersonalLoading(true);

        try {
            const { data } = await api.put('/auth/profile', {
                name,
                email,
                profileImage,
            });

            setUserInfo(data);
            setToast({ type: 'success', message: 'Personal info updated successfully' });
            setPersonalOpen(false);
        } catch (err: any) {
            setPersonalMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
        } finally {
            setPersonalLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage({ type: '', text: '' });

        if (!password) {
            setPasswordMessage({ type: 'error', text: 'Please enter a new password' });
            return;
        }

        if (password.length < 6) {
            setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
            return;
        }

        if (password !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        setPasswordLoading(true);

        try {
            const { data } = await api.put('/auth/profile', {
                password,
            });

            setUserInfo(data);
            setToast({ type: 'success', message: 'Password updated successfully' });
            setPassword('');
            setConfirmPassword('');
            setPasswordOpen(false);
        } catch (err: any) {
            setPasswordMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-16 min-h-[calc(100vh-80px)]">
            {toast && (
                <div className="fixed bottom-4 right-4 z-50">
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                </div>
            )}

            <h1 className="text-4xl font-bold mb-10 font-serif text-gray-900">My Account</h1>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Profile Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-24 h-24 rounded-full overflow-hidden mb-4 shadow-lg border-4 border-white">
                                {userInfo?.profileImage ? (
                                    <img
                                        src={getImageUrl(userInfo.profileImage)}
                                        alt={userInfo.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${userInfo.name}&background=0D8ABC&color=fff`;
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-primary text-white flex items-center justify-center text-4xl font-bold">
                                        {userInfo?.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 text-center">{userInfo?.name}</h2>
                            <p className="text-gray-500 text-sm">{userInfo?.email}</p>
                            {userInfo?.isArtist && (
                                <span className="mt-2 bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    Artist Account
                                </span>
                            )}
                        </div>

                        <div className="space-y-2">
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center transition ${activeTab === 'settings'
                                    ? 'bg-gray-50 text-primary'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                Profile & Settings
                            </button>
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center transition ${activeTab === 'orders'
                                    ? 'bg-gray-50 text-primary'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                                My Orders
                            </button>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition font-medium"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    {activeTab === 'orders' ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-8 border-b border-gray-100">
                                <h2 className="text-2xl font-bold font-serif text-gray-900">Order History</h2>
                                <p className="text-gray-500 mt-1">View and track your recent purchases</p>
                            </div>

                            {loading ? (
                                <div className="p-12 text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                                    <p className="text-gray-500">Loading your orders...</p>
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">No orders yet</h3>
                                    <p className="text-gray-500 mb-6">Start your collection today with unique artworks.</p>
                                    <Link to="/shop" className="inline-block bg-primary text-white px-6 py-2 rounded-full font-bold hover:bg-gray-800 transition">
                                        Browse Artworks
                                    </Link>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {orders.map((order) => (
                                                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                                                        #{order._id.substring(order._id.length - 6).toUpperCase()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                        Rs {order.totalPrice.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {order.isDelivered ? (
                                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                                                                Delivered
                                                            </span>
                                                        ) : (
                                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                                                                Processing
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <Link to={`/order/${order._id}`} className="text-primary hover:text-gray-900 font-bold hover:underline">
                                                            View Details
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Personal Info Section */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <button
                                    onClick={() => setPersonalOpen(!personalOpen)}
                                    className="w-full flex items-center justify-between p-8 hover:bg-gray-50 transition"
                                >
                                    <div>
                                        <h2 className="text-xl font-bold font-serif text-gray-900 text-left">Personal Information</h2>
                                        <p className="text-sm text-gray-500 mt-1 text-left">Update your photo, name and email</p>
                                    </div>
                                    {personalOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                </button>

                                {personalOpen && (
                                    <div className="p-8 border-t border-gray-100 animate-fade-in">
                                        {personalMessage.text && (
                                            <div className={`mb-6 p-4 rounded-lg ${personalMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                {personalMessage.text}
                                            </div>
                                        )}

                                        <form onSubmit={handleUpdatePersonalInfo}>
                                            <div className="mb-8">
                                                <label className="block text-gray-700 text-sm font-bold mb-4">Profile Picture</label>
                                                <div className="flex items-center gap-6">
                                                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-50">
                                                        {profileImage ? (
                                                            <img
                                                                src={getImageUrl(profileImage)}
                                                                alt="Profile Preview"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                <Upload size={24} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition inline-flex items-center">
                                                            <Upload size={18} className="mr-2" />
                                                            {uploading ? 'Uploading...' : 'Change Photo'}
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                accept="image/*"
                                                                onChange={uploadFileHandler}
                                                                disabled={uploading}
                                                            />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                <div>
                                                    <label className="block text-gray-700 text-sm font-bold mb-2">Full Name</label>
                                                    <input
                                                        type="text"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                        placeholder="Enter your name"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
                                                    <input
                                                        type="email"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50"
                                                        placeholder="Enter your email"
                                                        readOnly
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                                                </div>
                                            </div>

                                            <div className="flex justify-end">
                                                <button
                                                    type="submit"
                                                    disabled={personalLoading || uploading}
                                                    className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {personalLoading ? 'Saving...' : 'Save Changes'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>

                            {/* Change Password Section */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <button
                                    onClick={() => setPasswordOpen(!passwordOpen)}
                                    className="w-full flex items-center justify-between p-8 hover:bg-gray-50 transition"
                                >
                                    <div>
                                        <h2 className="text-xl font-bold font-serif text-gray-900 text-left">Change Password</h2>
                                        <p className="text-sm text-gray-500 mt-1 text-left">Ensure your account is secure</p>
                                    </div>
                                    {passwordOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                </button>

                                {passwordOpen && (
                                    <div className="p-8 border-t border-gray-100 animate-fade-in">
                                        {passwordMessage.text && (
                                            <div className={`mb-6 p-4 rounded-lg ${passwordMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                {passwordMessage.text}
                                            </div>
                                        )}

                                        <form onSubmit={handleUpdatePassword}>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                <div>
                                                    <label className="block text-gray-700 text-sm font-bold mb-2">New Password</label>
                                                    <input
                                                        type="password"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                        placeholder="Enter new password"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-gray-700 text-sm font-bold mb-2">Confirm New Password</label>
                                                    <input
                                                        type="password"
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                        placeholder="Confirm new password"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-end">
                                                <button
                                                    type="submit"
                                                    disabled={passwordLoading}
                                                    className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {passwordLoading ? 'Updating...' : 'Update Password'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default ProfilePage;
