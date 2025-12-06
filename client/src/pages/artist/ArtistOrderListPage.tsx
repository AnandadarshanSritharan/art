import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, DollarSign } from 'lucide-react';
import api from '../../api/axios';
import useStore from '../../store/useStore';
import { useToast } from '../../components/ToastProvider';
import { useConfirm } from '../../hooks/useConfirm';

interface Order {
    _id: string;
    user: {
        name: string;
        email: string;
    };
    createdAt: string;
    totalPrice: number;
    isPaid: boolean;
    isDelivered: boolean;
    shippingAddress: {
        fullName: string;
        city: string;
        district: string;
    };
    orderItems: {
        title: string;
        qty: number;
        price: number;
    }[];
}

const ArtistOrderListPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { refreshNotifications } = useStore();
    const { showToast } = useToast();
    const { confirm, ConfirmDialogComponent } = useConfirm();

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/orders/artist');
            setOrders(data);
            setLoading(false);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load orders');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const markAsDelivered = async (id: string) => {
        const confirmed = await confirm({
            title: 'Mark as Delivered',
            message: 'Are you sure you want to mark this order as delivered?',
            confirmText: 'Mark Delivered',
            type: 'info'
        });

        if (confirmed) {
            try {
                await api.put(`/orders/${id}/deliver`);
                fetchOrders(); // Refresh list
                // Trigger notification refresh
                refreshNotifications();
                showToast('Order marked as delivered', 'success');
            } catch (err: any) {
                showToast(err.response?.data?.message || 'Failed to update order', 'error');
            }
        }
    };

    const markAsPaid = async (id: string) => {
        const confirmed = await confirm({
            title: 'Mark as Paid',
            message: 'Are you sure you want to mark this order as paid?',
            confirmText: 'Mark Paid',
            type: 'info'
        });

        if (confirmed) {
            try {
                await api.put(`/orders/${id}/mark-paid`);
                fetchOrders(); // Refresh list
                refreshNotifications();
                showToast('Order marked as paid', 'success');
            } catch (err: any) {
                showToast(err.response?.data?.message || 'Failed to update order', 'error');
            }
        }
    };

    return (
        <>
            <ConfirmDialogComponent />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 font-serif">Artist Orders</h1>

                {loading ? (
                    <div className="text-center py-8">Loading orders...</div>
                ) : error ? (
                    <div className="text-red-500 text-center py-8">{error}</div>
                ) : orders.length === 0 ? (
                    <div className="bg-white p-8 rounded-lg shadow-md text-center">
                        <p className="text-gray-600 text-lg">No orders found for your artworks yet.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders.map((order) => (
                                    <tr key={order._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {order._id.substring(0, 10)}...
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {order.shippingAddress.fullName}<br />
                                            <span className="text-xs text-gray-400">{order.shippingAddress.city}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <ul className="list-disc list-inside">
                                                {order.orderItems.map((item, idx) => (
                                                    <li key={idx} className="truncate max-w-xs" title={item.title}>
                                                        {item.qty}x {item.title}
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {order.isPaid ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    Paid
                                                </span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                    Not Paid
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {order.isDelivered ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    Delivered
                                                </span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex flex-col space-y-2">
                                                <Link
                                                    to={`/order/${order._id}`}
                                                    className="text-primary hover:text-indigo-900"
                                                >
                                                    View Details
                                                </Link>
                                                {!order.isPaid && (
                                                    <button
                                                        onClick={() => markAsPaid(order._id)}
                                                        className="text-green-600 hover:text-green-900 flex items-center"
                                                        title="Mark as Paid"
                                                    >
                                                        <DollarSign size={16} className="mr-1" /> Mark Paid
                                                    </button>
                                                )}
                                                {!order.isDelivered && (
                                                    <button
                                                        onClick={() => markAsDelivered(order._id)}
                                                        className="text-blue-600 hover:text-blue-900 flex items-center"
                                                        title="Mark as Delivered"
                                                    >
                                                        <CheckCircle size={16} className="mr-1" /> Mark Delivered
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
};

export default ArtistOrderListPage;
