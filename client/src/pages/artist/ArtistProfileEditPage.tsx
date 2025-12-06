import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import useStore from '../../store/useStore';
import { useToast } from '../../components/ToastProvider';

// Helper function to get full image URL
const getImageUrl = (imagePath: string | undefined): string => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    return `http://localhost:5000${imagePath}`;
};

const ArtistProfileEditPage: React.FC = () => {
    const navigate = useNavigate();
    const { userInfo, setUserInfo } = useStore();
    const { showToast } = useToast();

    const [bio, setBio] = useState('');
    const [profileImage, setProfileImage] = useState('');
    const [website, setWebsite] = useState('');
    const [instagram, setInstagram] = useState('');
    const [twitter, setTwitter] = useState('');
    const [facebook, setFacebook] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [country, setCountry] = useState('');

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!userInfo || !userInfo.isArtist) {
            navigate('/login');
        } else {
            setBio(userInfo.bio || '');
            setProfileImage(userInfo.profileImage || '');
            if (userInfo.socialLinks) { // Assuming socialLinks might be added to userInfo in store
                // We need to fetch the latest profile data to be sure
                fetchProfile();
            } else {
                fetchProfile();
            }
        }
    }, [userInfo, navigate]);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get(`/artists/${userInfo?._id}`);
            setBio(data.bio || '');
            setProfileImage(data.profileImage || '');
            if (data.socialLinks) {
                setWebsite(data.socialLinks.website || '');
                setInstagram(data.socialLinks.instagram || '');
                setTwitter(data.socialLinks.twitter || '');
                setFacebook(data.socialLinks.facebook || '');
                setWhatsapp(data.socialLinks.whatsapp || '');
            }
            setPhone(data.phone || '');
            setAddress(data.address || '');
            setCountry(data.country || '');
        } catch (error) {
            console.error('Failed to fetch profile', error);
            showToast('Failed to fetch profile data', 'error');
        }
    };

    const uploadFileHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showToast('File size must be less than 5MB', 'error');
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
            showToast('Profile image uploaded successfully', 'success');
        } catch (error) {
            console.error(error);
            showToast('Error uploading image', 'error');
        } finally {
            setUploading(false);
        }
    };

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const { data } = await api.put(
                '/artists/profile',
                {
                    bio,
                    profileImage,
                    socialLinks: {
                        website,
                        instagram,
                        twitter,
                        facebook,
                        whatsapp
                    },
                    phone,
                    address,
                    country
                },
                {
                    headers: {
                        Authorization: `Bearer ${userInfo?.token}`,
                    },
                }
            );

            // Update local store with new user info
            // We need to merge the new data with existing token
            setUserInfo({ ...data, token: userInfo?.token || '' });

            setMessage('Profile updated successfully');
            showToast('Profile updated successfully', 'success');
            setLoading(false);
        } catch (err: any) {
            console.error(err);
            const errorMsg = err.response?.data?.message || 'Failed to update profile';
            setMessage(errorMsg);
            showToast(errorMsg, 'error');
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 flex justify-center">
            <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold mb-6 font-serif">Edit Artist Profile</h1>

                {message && (
                    <div className={`p-4 rounded mb-6 ${message.includes('failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={submitHandler}>
                    {/* Profile Image Section */}
                    <div className="mb-8 text-center">
                        <div className="relative inline-block">
                            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg mx-auto mb-4">
                                {profileImage ? (
                                    <img
                                        src={getImageUrl(profileImage)}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400">
                                        {userInfo?.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <label
                                htmlFor="profile-upload"
                                className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-gray-800 transition shadow-md"
                                title="Change Profile Picture"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                            </label>
                            <input
                                id="profile-upload"
                                type="file"
                                accept="image/*"
                                onChange={uploadFileHandler}
                                className="hidden"
                                disabled={uploading}
                            />
                        </div>
                        <p className="text-sm text-gray-500">{uploading ? 'Uploading...' : 'Click pencil to upload new photo'}</p>
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2 font-medium">Bio</label>
                        <textarea
                            placeholder="Tell us about yourself, your style, and your inspiration..."
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={6}
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        ></textarea>
                    </div>

                    <h3 className="text-xl font-bold mb-4 text-gray-700 border-b pb-2">Contact Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div>
                            <label className="block text-gray-700 mb-2 text-sm">Phone Number</label>
                            <input
                                type="tel"
                                placeholder="+1 234 567 8900"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/[^0-9+\s-]/g, ''))}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2 text-sm">Country</label>
                            <select
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-gray-700 mb-2 text-sm">Address</label>
                            <textarea
                                placeholder="Enter your full address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                rows={2}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    <h3 className="text-xl font-bold mb-4 text-gray-700 border-b pb-2">Social Links</h3>

                    <div className="grid grid-cols-1 gap-4 mb-8">
                        <div>
                            <label className="block text-gray-700 mb-2 text-sm">Website / Portfolio</label>
                            <input
                                type="url"
                                placeholder="https://yourwebsite.com"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2 text-sm">Instagram Profile</label>
                            <input
                                type="url"
                                placeholder="https://instagram.com/yourusername"
                                value={instagram}
                                onChange={(e) => setInstagram(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2 text-sm">Twitter / X Profile</label>
                            <input
                                type="url"
                                placeholder="https://twitter.com/yourusername"
                                value={twitter}
                                onChange={(e) => setTwitter(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2 text-sm">Facebook Profile</label>
                            <input
                                type="url"
                                placeholder="https://facebook.com/yourusername"
                                value={facebook}
                                onChange={(e) => setFacebook(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2 text-sm">WhatsApp Number</label>
                            <input
                                type="text"
                                placeholder="+1234567890"
                                value={whatsapp}
                                onChange={(e) => setWhatsapp(e.target.value.replace(/[^0-9+\s-]/g, ''))}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <p className="text-xs text-gray-500 mt-1">Include country code without spaces (e.g. +1234567890)</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={loading || uploading}
                            className="flex-1 bg-primary text-white py-3 rounded-md font-bold hover:bg-gray-800 transition disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/artist/dashboard')}
                            className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-md font-bold hover:bg-gray-300 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ArtistProfileEditPage;
