import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import useStore from '../../store/useStore';
import { useToast } from '../../components/ToastProvider';
import { useConfirm } from '../../hooks/useConfirm';

interface Terms {
    _id: string;
    content: string;
    version: number;
    isActive: boolean;
    createdBy: {
        name: string;
        email: string;
    };
    createdAt: string;
}

const TermsListPage: React.FC = () => {
    const { userInfo } = useStore();
    const navigate = useNavigate();
    const [terms, setTerms] = useState<Terms[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();
    const { confirm, ConfirmDialogComponent } = useConfirm();

    useEffect(() => {
        if (!userInfo?.isAdmin) {
            navigate('/');
        } else {
            fetchTerms();
        }
    }, [userInfo, navigate]);

    const fetchTerms = async () => {
        try {
            const { data } = await api.get('/terms/all');
            setTerms(data);
        } catch (error) {
            console.error('Failed to fetch terms', error);
            showToast('Failed to fetch terms', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSetActive = async (id: string) => {
        const confirmed = await confirm({
            title: 'Activate Terms',
            message: 'Are you sure you want to set this version as active?',
            confirmText: 'Activate',
            type: 'info'
        });

        if (confirmed) {
            try {
                await api.put(`/terms/${id}/activate`);
                fetchTerms();
                showToast('Terms activated successfully', 'success');
            } catch (error) {
                console.error('Failed to activate terms', error);
                showToast('Failed to activate terms', 'error');
            }
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <ConfirmDialogComponent />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold font-serif">Terms & Conditions Management</h1>
                <Link
                    to="/admin/terms/new"
                    className="bg-primary text-white px-4 py-2 rounded-md font-bold hover:bg-gray-800 transition"
                >
                    Create New Version
                </Link>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : terms.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <p>No terms and conditions found. Create the first version.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Version
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created By
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {terms.map((term) => (
                                <tr key={term._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        v{term.version}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {term.createdBy?.name || 'Unknown'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(term.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {term.isActive ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <Link
                                            to={`/admin/terms/edit/${term._id}`}
                                            className="text-primary hover:text-indigo-900"
                                        >
                                            Edit
                                        </Link>
                                        {!term.isActive && (
                                            <button
                                                onClick={() => handleSetActive(term._id)}
                                                className="text-green-600 hover:text-green-900"
                                            >
                                                Set Active
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TermsListPage;
