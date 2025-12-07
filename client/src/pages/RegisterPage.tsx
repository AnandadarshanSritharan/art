import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import useStore from '../store/useStore';
import { useToast } from '../components/ToastProvider';

const RegisterPage: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
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
        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
        } else {
            try {
                const { data } = await api.post('/auth/register', {
                    name,
                    email,
                    password,
                    isArtist: false
                });
                setUserInfo(data);
                showToast('Registration successful! Welcome to our platform.', 'success');
                navigate(redirect);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Registration failed');
            }
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col lg:flex-row">
            {/* Left Side - Registration Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-4 md:px-6 py-8 md:py-12">
                <div className="w-full max-w-md">
                    <div className="text-center mb-6 md:mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold mb-2 font-serif text-gray-900">Create Account</h1>
                        <p className="text-gray-500">Join our community of art lovers</p>
                    </div>

                    {message && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm flex items-center border border-red-100">
                            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            {message}
                        </div>
                    )}
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm flex items-center border border-red-100">
                            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={submitHandler} className="space-y-4 md:space-y-5">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Full Name</label>
                            <input
                                type="text"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 md:px-5 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-gray-50 focus:bg-white text-base"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Email Address</label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 md:px-5 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-gray-50 focus:bg-white text-base"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Password</label>
                            <input
                                type="password"
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 md:px-5 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-gray-50 focus:bg-white text-base"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Confirm Password</label>
                            <input
                                type="password"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 md:px-5 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-gray-50 focus:bg-white text-base"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-base md:text-lg hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            Register
                        </button>
                    </form>

                    <div className="mt-6 md:mt-8 pt-6 border-t border-gray-200 text-center">
                        <p className="text-gray-600 mb-2">Already have an account?</p>
                        <Link
                            to={redirect ? `/login?redirect=${redirect}` : '/login'}
                            className="text-accent font-bold hover:text-orange-600 transition-colors inline-flex items-center"
                        >
                            Sign In
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                        </Link>
                    </div>

                    {/* Artist CTA - Mobile Version */}
                    <div className="lg:hidden mt-8 p-6 bg-gradient-to-br from-accent/10 to-orange-50 rounded-2xl border border-accent/20">
                        <div className="text-center">
                            <div className="mb-4">
                                <svg className="w-12 h-12 mx-auto text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold font-serif text-gray-900 mb-2">Are you an artist?</h2>
                            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                                Join our community of talented artists and showcase your work to art lovers worldwide.
                            </p>
                            <Link
                                to="/register/artist"
                                className="inline-block bg-accent text-white px-6 py-3 rounded-xl font-bold text-base hover:bg-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                Apply to Sell Art
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Artwork Image with Artist CTA (Desktop Only) */}
            <div className="hidden lg:block lg:w-1/2 relative">
                {/* Background Artwork Image */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
                    <img
                        src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200&q=80"
                        alt="Artwork"
                        className="w-full h-full object-cover opacity-40"
                    />
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                {/* Artist CTA Card */}
                <div className="absolute inset-0 flex items-center justify-center p-12">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-10 max-w-md text-center border border-gray-100">
                        <div className="mb-6">
                            <svg className="w-16 h-16 mx-auto text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold font-serif text-gray-900 mb-3">Are you an artist?</h2>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            Join our community of talented artists and showcase your work to art lovers worldwide.
                        </p>
                        <Link
                            to="/register/artist"
                            className="inline-block bg-accent text-white px-8 py-3.5 rounded-xl font-bold text-lg hover:bg-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            Apply to Sell Art
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;

