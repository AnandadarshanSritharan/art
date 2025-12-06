import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircleQuestion } from 'lucide-react';
import useStore from '../store/useStore';
import api from '../api/axios';

const SupportBubble: React.FC = () => {
    const { userInfo, openChat, isChatOpen } = useStore();
    const navigate = useNavigate();

    const handleSupportClick = async () => {
        if (!userInfo) {
            alert('You need to login to contact support.');
            navigate('/login');
            return;
        }

        try {
            // Find admin user
            // In a real app, you might have a dedicated support endpoint or ID
            // For now, we'll search for the first admin user
            // This is a bit hacky, ideally we'd have a constant or config for support ID
            // Let's assume we can find an admin via a special endpoint or just hardcode if we knew it
            // For this demo, let's try to find an admin from the users list (if we had access)
            // Or better, let's create a specific route to "get support contact"

            // Since we don't have that, let's just use a placeholder ID or try to find one
            // We'll search for a user with isAdmin=true if we could, but we can't search users publicly

            // Alternative: The backend could handle "message to support" by automatically assigning an admin
            // For now, let's just open the chat and let the user search or we can try to find an admin
            // Let's try to find the admin by email if we know it, or just use a known ID if we had one.

            // Let's assume the first user created (usually admin) has a specific ID or we can find them
            // For now, I'll just open the chat with a placeholder and let the backend handle it or 
            // maybe we can't implement this fully without a known admin ID.

            // Let's try to fetch a "support" user. 
            // I'll add a quick endpoint in messageController to get support user if needed, 
            // or just use the first admin found.

            // Let's just use a hardcoded ID for now if we can't find one, or disable if no admin.
            // Actually, let's try to search for "admin" in the message search if they have a conversation

            // BETTER APPROACH:
            // When clicking support, we create a conversation with the admin immediately.
            // We need an endpoint `POST /api/messages/support` that finds an admin and returns their ID.

            // For now, I'll just make it open the chat window and maybe show a "Contact Support" list if we can.
            // But the requirement says "go directly to admin".

            // Let's assume we have an admin ID. 
            // I'll fetch the first admin ID from the backend.
            // I'll add a route for this: GET /api/users/admin

            // Since I can't easily add that route right now without modifying user controller (which I can do),
            // I'll modify the user controller to add `getSupportUser`.

            const { data } = await api.get('/auth/support');
            if (data && data._id) {
                openChat(data._id);
            } else {
                alert('Support is currently unavailable.');
            }
        } catch (error) {
            console.error('Failed to contact support', error);
            alert('Failed to contact support');
        }
    };

    // Don't show support bubble for admins (they would message themselves)
    if (isChatOpen || userInfo?.isAdmin) return null;

    return (
        <button
            onClick={handleSupportClick}
            className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-gray-800 transition z-40 flex items-center justify-center group"
            title="Contact Support"
        >
            <MessageCircleQuestion size={28} />
            <span className="absolute right-full mr-3 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                Contact Support
            </span>
        </button>
    );
};

export default SupportBubble;
