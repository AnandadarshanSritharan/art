import React, { useEffect, useState, useRef } from 'react';
import { MessageSquare, Search } from 'lucide-react';
import useStore from '../store/useStore';
import api from '../api/axios';
import { getImageUrl, getAvatarPlaceholder } from '../utils/image';

interface Conversation {
    _id: string;
    participants: {
        _id: string;
        name: string;
        profileImage?: string;
    }[];
    lastMessage?: {
        content: string;
        sender: string;
        timestamp: string;
    };
    unreadCount: number;
}

const MessageIcon: React.FC = () => {
    const { userInfo, openChat, setUnreadMessageCount, socket, messageRefreshTrigger } = useStore();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchConversations = async () => {
        try {
            const { data } = await api.get('/messages/conversations');
            setConversations(data);

            // Calculate total unread count
            const totalUnread = data.reduce((acc: number, conv: Conversation) => acc + conv.unreadCount, 0);
            setUnreadCount(totalUnread);
            setUnreadMessageCount(totalUnread);
        } catch (error) {
            console.error('Failed to fetch conversations', error);
        }
    };


    useEffect(() => {
        if (userInfo && socket) {
            fetchConversations();

            // Test listener to verify socket is working
            const handleTest = () => {
                // Test event received
            };

            // Listen for new messages to update list
            const handleNewMessage = () => {
                fetchConversations();
            };

            const handleMessagesRead = () => {
                fetchConversations();
            };

            socket.on('test', handleTest);
            socket.on('newMessage', handleNewMessage);
            socket.on('messagesRead', handleMessagesRead);

            return () => {
                socket.off('test', handleTest);
                socket.off('newMessage', handleNewMessage);
                socket.off('messagesRead', handleMessagesRead);
            };
        }
    }, [userInfo, socket]);

    // Polling fallback - refetch conversations periodically when dropdown is open
    useEffect(() => {
        if (showDropdown && userInfo) {
            const interval = setInterval(() => {
                fetchConversations();
            }, 3000); // Poll every 3 seconds

            return () => {
                clearInterval(interval);
            };
        }
    }, [showDropdown, userInfo]);

    // Refetch when messageRefreshTrigger changes (triggered by ChatBox)
    useEffect(() => {
        if (userInfo && messageRefreshTrigger > 0) {
            fetchConversations();
        }
    }, [messageRefreshTrigger, userInfo]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length > 0) {
            try {
                const { data } = await api.get(`/messages/search?query=${query}`);
                setConversations(data);
            } catch (error) {
                console.error('Search failed', error);
            }
        } else {
            fetchConversations();
        }
    };

    const handleConversationClick = (conversation: Conversation) => {
        const otherParticipant = conversation.participants.find(p => p._id !== userInfo?._id);
        if (otherParticipant) {
            openChat(otherParticipant._id);
            setShowDropdown(false);
        }
    };

    const getOtherParticipant = (conversation: Conversation) => {
        return conversation.participants.find(p => p._id !== userInfo?._id);
    };

    const filteredConversations = showUnreadOnly
        ? conversations.filter(c => c.unreadCount > 0)
        : conversations;

    if (!userInfo) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className={`relative p-2 rounded-full transition-all duration-300 ${showDropdown ? 'bg-primary text-white' : 'text-gray-600 hover:text-primary hover:bg-gray-100'}`}
            >
                <MessageSquare size={22} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-sm border border-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="absolute right-0 mt-4 w-96 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in origin-top-right">
                    <div className="p-4 border-b border-gray-50 bg-white/80 backdrop-blur-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-900 text-lg font-serif">Messages</h3>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                                    className={`text-xs font-medium px-3 py-1 rounded-full transition-all ${showUnreadOnly
                                        ? 'bg-primary text-white shadow-md'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    Unread Only
                                </button>
                            </div>
                        </div>
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Search messages..."
                                value={searchQuery}
                                onChange={handleSearch}
                                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                            />
                            <Search size={16} className="absolute left-3.5 top-3 text-gray-400 group-focus-within:text-primary transition-colors" />
                        </div>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {filteredConversations.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 flex flex-col items-center">
                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                    <MessageSquare size={24} className="text-gray-300" />
                                </div>
                                <p className="text-sm font-medium">No conversations found</p>
                                {showUnreadOnly && <p className="text-xs mt-1">Try turning off the unread filter</p>}
                            </div>
                        ) : (
                            filteredConversations.map((conv) => {
                                const otherUser = getOtherParticipant(conv);
                                if (!otherUser) return null;

                                return (
                                    <div
                                        key={conv._id}
                                        onClick={() => handleConversationClick(conv)}
                                        className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-all duration-200 flex items-start space-x-4 group ${conv.unreadCount > 0 ? 'bg-blue-50/30' : ''
                                            }`}
                                    >
                                        <div className="relative flex-shrink-0">
                                            <img
                                                src={getImageUrl(otherUser.profileImage) || getAvatarPlaceholder(otherUser.name, 40)}
                                                alt={otherUser.name}
                                                className="w-12 h-12 rounded-full object-cover border border-gray-100 shadow-sm group-hover:border-gray-200 transition-colors"
                                            />
                                            {conv.unreadCount > 0 && (
                                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h4 className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-900'}`}>
                                                    {otherUser.name}
                                                </h4>
                                                {conv.lastMessage && (
                                                    <span className={`text-[10px] ${conv.unreadCount > 0 ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                                                        {new Date(conv.lastMessage.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className={`text-xs truncate max-w-[180px] ${conv.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                                    {conv.lastMessage?.content || 'Start a conversation'}
                                                </p>
                                                {conv.unreadCount > 0 && (
                                                    <span className="bg-primary text-white text-[10px] font-bold rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center shadow-sm ml-2">
                                                        {conv.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                        <button className="text-xs font-bold text-primary hover:text-gray-800 transition uppercase tracking-wider">
                            View All Messages
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessageIcon;
