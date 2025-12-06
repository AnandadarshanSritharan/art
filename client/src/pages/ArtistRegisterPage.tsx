import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useStore from '../store/useStore';

const ArtistRegisterPage: React.FC = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [country, setCountry] = useState('');
    const [bio, setBio] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [terms, setTerms] = useState<any>(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { userInfo, setUserInfo } = useStore();

    useEffect(() => {
        if (userInfo) {
            navigate('/');
        }
        fetchTerms();
    }, [navigate, userInfo]);

    const fetchTerms = async () => {
        try {
            const { data } = await api.get('/terms');
            setTerms(data);
        } catch (err) {
            console.error('Failed to fetch terms', err);
        }
    };

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');

        // Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setMessage('Please enter a valid email address');
            return;
        }

        if (password.length < 6) {
            setMessage('Password must be at least 6 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }

        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (phone && !phoneRegex.test(phone)) {
            setMessage('Please enter a valid phone number (at least 10 digits)');
            return;
        }

        if (!termsAccepted) {
            setMessage('You must accept the terms and conditions to register as an artist');
            return;
        }

        setLoading(true);

        try {
            const { data } = await api.post('/auth/register', {
                name: `${firstName} ${lastName}`,
                email,
                password,
                isArtist: true,
                bio,
                phone,
                address,
                country,
                termsAccepted: true,
                termsVersion: terms?.version
            });
            setUserInfo(data);
            navigate('/artist/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 flex">
            {/* Left Side - Registration Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 overflow-y-auto">
                <div className="w-full max-w-xl">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2 font-serif text-gray-900">Join as an Artist</h1>
                        <p className="text-gray-500">Share your creativity with the world and start selling your masterpieces.</p>
                    </div>

                    {message && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm flex items-center border border-red-100">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            {message}
                        </div>
                    )}
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm flex items-center border border-red-100">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={submitHandler} className="space-y-5">
                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">First Name *</label>
                                <input
                                    type="text"
                                    placeholder="First name"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Last Name *</label>
                                <input
                                    type="text"
                                    placeholder="Last name"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Email Address *</label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Password *</label>
                                <input
                                    type="password"
                                    placeholder="Create password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Confirm Password *</label>
                                <input
                                    type="password"
                                    placeholder="Confirm password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Phone Number</label>
                                <input
                                    type="tel"
                                    placeholder="+1 234 567 8900"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9+\s-]/g, ''))}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Country</label>
                                <div className="relative">
                                    <select
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white appearance-none"
                                    >
                                        <option value="">Select Country</option>
                                        <option value="United States">United States</option>
                                        <option value="United Kingdom">United Kingdom</option>
                                        <option value="Canada">Canada</option>
                                        <option value="Australia">Australia</option>
                                        <option value="India">India</option>
                                        <option value="Sri Lanka">Sri Lanka</option>
                                        <option value="Germany">Germany</option>
                                        <option value="France">France</option>
                                        <option value="Spain">Spain</option>
                                        <option value="Italy">Italy</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Address</label>
                            <textarea
                                placeholder="Enter your full address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                rows={2}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Artist Bio</label>
                            <textarea
                                placeholder="Tell us about yourself, your artistic style, and your inspiration..."
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white resize-none"
                            />
                        </div>

                        {/* Terms and Conditions */}
                        <div className="flex items-start space-x-3 pt-2">
                            <input
                                type="checkbox"
                                checked={termsAccepted}
                                onChange={(e) => setTermsAccepted(e.target.checked)}
                                className="w-5 h-5 mt-1 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                                required
                            />
                            <label className="text-gray-700 text-sm leading-relaxed">
                                I agree to the{' '}
                                <button
                                    type="button"
                                    onClick={() => setShowTermsModal(true)}
                                    className="text-accent hover:underline font-bold"
                                >
                                    Terms and Conditions
                                </button>{' '}
                                and acknowledge that I have read the Privacy Policy. *
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating Profile...' : 'Complete Registration'}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                        <p className="text-gray-600 mb-2">
                            Already have an account?{' '}
                            <Link to="/login" className="text-accent font-bold hover:text-orange-600 transition-colors">
                                Login
                            </Link>
                        </p>
                        <p className="text-gray-500 text-sm mt-2">
                            Looking to buy art?{' '}
                            <Link to="/register" className="text-gray-700 font-bold hover:text-primary transition-colors">
                                Register as a Customer
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Artwork Image */}
            <div className="hidden lg:block lg:w-1/2 relative">
                {/* Background Artwork Image */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
                    <img
                        src="https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=1200&q=80"
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                            </svg>
                        </div>
                        <h2 className="text-4xl font-bold font-serif text-white mb-4 drop-shadow-lg">Showcase Your Art</h2>
                        <p className="text-xl text-gray-100 leading-relaxed drop-shadow">
                            Join thousands of artists worldwide who are sharing their passion and earning from their creativity.
                        </p>
                    </div>
                </div>
            </div>

            {/* Terms Modal */}
            {showTermsModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-2xl font-bold font-serif text-gray-900">Terms and Conditions</h2>
                            <button onClick={() => setShowTermsModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto flex-1">
                            {terms ? (
                                <div className="prose max-w-none text-gray-600">
                                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-4 font-bold">Version {terms.version}</p>
                                    <div className="whitespace-pre-wrap leading-relaxed">{terms.content}</div>
                                </div>
                            ) : (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setShowTermsModal(false)}
                                className="bg-primary text-white px-8 py-2.5 rounded-lg font-bold hover:bg-gray-800 transition shadow-md"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArtistRegisterPage;
