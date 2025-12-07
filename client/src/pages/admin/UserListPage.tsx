import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import api from '../../api/axios';
import useStore from '../../store/useStore';

import { useToast } from '../../components/ToastProvider';
import { useConfirm } from '../../hooks/useConfirm';

interface User {
    _id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    isArtist: boolean;
}

const UserListPage: React.FC = () => {
    const { userInfo } = useStore();
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();
    const { confirm, ConfirmDialogComponent } = useConfirm();

    useEffect(() => {
        if (!userInfo || !userInfo.isAdmin) {
            navigate('/login');
        } else {
            const fetchUsers = async () => {
                try {
                    const { data } = await api.get('/auth/users');
                    setUsers(data);
                } catch (error) {
                    console.error(error);
                    showToast('Failed to load users', 'error');
                } finally {
                    setLoading(false);
                }
            };
            fetchUsers();
        }
    }, [navigate, userInfo]);

    const getUserType = (user: User) => {
        if (user.isAdmin) return <span className="bg-red-100 text-red-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">Admin</span>;
        if (user.isArtist) return <span className="bg-purple-100 text-purple-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">Artist</span>;
        return <span className="bg-gray-100 text-gray-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">User</span>;
    };

    const deleteHandler = async (id: string, name: string) => {
        const confirmed = await confirm({
            title: 'Delete User',
            message: `Are you sure you want to delete user "${name}"? This action cannot be undone.`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'danger'
        });

        if (confirmed) {
            try {
                await api.delete(`/auth/users/${id}`);
                setUsers(users.filter((user) => user._id !== id));
                showToast('User deleted successfully', 'success');
            } catch (error: any) {
                console.error(error);
                showToast(error.response?.data?.message || 'Failed to delete user', 'error');
            }
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <ConfirmDialogComponent />
            <h1 className="text-3xl font-bold mb-6 font-serif">Users</h1>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user._id.substring(0, 10)}...</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm bg-white">
                                        {getUserType(user)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                                        {!user.isAdmin && (
                                            <button
                                                onClick={() => deleteHandler(user._id, user.name)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 size={20} />
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

export default UserListPage;
