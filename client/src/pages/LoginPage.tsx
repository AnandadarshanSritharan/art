import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import useStore from '../store/useStore';
import { useToast } from '../components/ToastProvider';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const location = useLocation();
    const { userInfo, setUserInfo } = useStore();
    const { showToast } = useToast();

    const redirect = location.search ? location.search.split('=')[1] : '/';

    useEffect(() => {
        if (userInfo) {
            navigate(redirect);
        }
    }, [navigate, userInfo, redirect]);

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/auth/login', { email, password });
            setUserInfo(data);
            showToast('Login successful! Welcome back.', 'success');
            navigate(redirect);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid email or password');
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 flex">
            {/* Left Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold mb-2 font-serif text-gray-900">Welcome Back</h1>
                        <p className="text-gray-500">Sign in to access your account</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm flex items-center border border-red-100">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={submitHandler} className="space-y-6">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Email Address</label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Password</label>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            Sign In
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                        <p className="text-gray-600 mb-2">New to our platform?</p>
                        <Link
                            to={redirect ? `/register?redirect=${redirect}` : '/register'}
                            className="text-accent font-bold hover:text-orange-600 transition-colors inline-flex items-center"
                        >
                            Create an Account
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Side - Artwork Image */}
            <div className="hidden lg:block lg:w-1/2 relative">
                {/* Background Artwork Image */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
                    <img
                        src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&q=80"
                        alt="Artwork"
                        className="w-full h-full object-cover opacity-50"
                    />
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

                {/* Floating Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                    <div className="max-w-lg">
                        <div className="mb-8">
                            <svg className="w-20 h-20 mx-auto text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                        </div>
                        <h2 className="text-4xl font-bold font-serif text-white mb-4 drop-shadow-lg">Discover Extraordinary Art</h2>
                        <p className="text-xl text-gray-100 leading-relaxed drop-shadow">
                            Explore unique masterpieces from talented artists around the world. Your next favorite piece awaits.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

