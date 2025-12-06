import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import useStore from '../../store/useStore';

const TermsFormPage: React.FC = () => {
    const { id } = useParams();
    const { userInfo } = useStore();
    const navigate = useNavigate();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const isEditMode = Boolean(id);

    useEffect(() => {
        if (!userInfo?.isAdmin) {
            navigate('/');
        } else if (isEditMode) {
            fetchTerms();
        }
    }, [userInfo, navigate, id]);

    const fetchTerms = async () => {
        try {
            const { data } = await api.get('/terms/all');
            const term = data.find((t: any) => t._id === id);
            if (term) {
                setContent(term.content);
            }
        } catch (error) {
            console.error('Failed to fetch terms', error);
        }
    };

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            if (isEditMode) {
                await api.put(`/terms/${id}`, { content });
                setMessage('Terms updated successfully');
            } else {
                await api.post('/terms', { content });
                setMessage('Terms created successfully');
            }
            setTimeout(() => navigate('/admin/terms'), 1500);
        } catch (error: any) {
            setMessage(error.response?.data?.message || 'Failed to save terms');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 flex justify-center">
            <div className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold mb-6 font-serif">
                    {isEditMode ? 'Edit Terms & Conditions' : 'Create New Terms & Conditions'}
                </h1>

                {message && (
                    <div className={`p-4 rounded mb-6 ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={submitHandler}>
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2 font-medium">
                            Terms & Conditions Content
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={20}
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                            placeholder="Enter the terms and conditions content here..."
                            required
                        />
                        <p className="text-sm text-gray-500 mt-2">
                            You can use plain text or HTML formatting.
                        </p>
                    </div>

                    <div className="mb-6 p-4 bg-gray-50 border rounded-md">
                        <h3 className="font-bold mb-2">Preview:</h3>
                        <div className="prose max-w-none whitespace-pre-wrap text-sm">
                            {content || 'Preview will appear here...'}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-primary text-white py-3 rounded-md font-bold hover:bg-gray-800 transition disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : isEditMode ? 'Update Terms' : 'Create Terms'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/admin/terms')}
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

export default TermsFormPage;
