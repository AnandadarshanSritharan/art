import React, { useEffect, useState, useRef } from 'react';
import { X, Minus, Send, Image as ImageIcon, Search, Check, CheckCheck, ChevronLeft } from 'lucide-react';
import useStore from '../store/useStore';
import api from '../api/axios';
import { getImageUrl, getAvatarPlaceholder } from '../utils/image';

interface Message {
    _id: string;
    content: string;
    sender: {
        _id: string;
        name: string;
        profileImage?: string;
    };
    createdAt: string;
    read: boolean;
    conversation: string;
}

const ChatBox: React.FC = () => {
    const { userInfo, activeChat, closeChat, isChatOpen, socket, refreshMessages } = useStore();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [recipient, setRecipient] = useState<any>(null);
    const [isMinimized, setIsMinimized] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isRecipientTyping, setIsRecipientTyping] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Message[]>([]);
    const [conversationId, setConversationId] = useState<string | null>(null);

    // Fetch recipient details and messages when active chat changes
    useEffect(() => {
        const fetchChatData = async () => {
            if (activeChat && userInfo) {
                try {
                    // Fetch conversation to get messages and recipient info
                    const { data: conversations } = await api.get('/messages/conversations');
                    const conversation = conversations.find((c: any) =>
                        c.participants.some((p: any) => p._id === activeChat)
                    );

                    if (conversation) {
                        setConversationId(conversation._id);
                        const { data: msgs } = await api.get(`/messages/${conversation._id}`);
                        setMessages(msgs);

                        // Set recipient info from conversation
                        const otherUser = conversation.participants.find((p: any) => p._id === activeChat);
                        setRecipient(otherUser);

                        // Mark as read
                        await api.put(`/messages/${conversation._id}/read`);
                        refreshMessages(); // Trigger MessageIcon to refresh
                    } else {
                        setMessages([]);
                        setConversationId(null);
                        // Try fetching as artist first if new chat
                        try {
                            const { data: artist } = await api.get(`/artists/${activeChat}`);
                            setRecipient(artist);
                        } catch (e) {
                            // If not artist, try fetching as regular user (e.g. admin)
                            try {
                                const { data: user } = await api.get(`/auth/users/${activeChat}`);
                                setRecipient(user);
                            } catch (err) {
                                setRecipient({ name: 'User', _id: activeChat });
                            }
                        }
                    }
                } catch (error) {
                    console.error('Failed to load chat', error);
                }
            }
        };

        if (isChatOpen && activeChat) {
            fetchChatData();
            setIsMinimized(false);
            setShowSearch(false);
            setSearchQuery('');
        }
    }, [activeChat, isChatOpen, userInfo]);

    // Socket listeners
    useEffect(() => {
        if (userInfo && activeChat && socket) {
            socket.on('newMessage', async (message: Message) => {
                // Only add if it belongs to current chat
                if (message.sender._id === activeChat || message.sender._id === userInfo._id) {
                    setMessages((prev) => [...prev, message]);
                    scrollToBottom();

                    // If message is from the other person and chat is open, mark as read
                    if (message.sender._id === activeChat) {
                        try {
                            await api.put(`/messages/${message.conversation}/read`);
                        } catch (error) {
                            console.error('Failed to mark message as read', error);
                        }
                    }
                }
            });

            socket.on('userTyping', ({ isTyping: typingStatus, conversationId: typingConvId }: any) => {
                if (typingConvId === conversationId) {
                    setIsRecipientTyping(typingStatus);
                }
            });

            socket.on('messagesRead', ({ conversationId: readConvId }: any) => {
                if (readConvId === conversationId) {
                    setMessages(prev => prev.map(msg => ({ ...msg, read: true })));
                }
            });

            return () => {
                socket.off('newMessage');
                socket.off('userTyping');
                socket.off('messagesRead');
            };
        }
    }, [activeChat, userInfo, isMinimized, socket, conversationId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (!searchQuery) {
            scrollToBottom();
        }
    }, [messages, isMinimized, isChatOpen, searchQuery]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat) return;

        try {
            const { data } = await api.post('/messages', {
                recipientId: activeChat,
                content: newMessage
            });

            setMessages([...messages, data]);
            setNewMessage('');
            if (!conversationId) setConversationId(data.conversation);

            // Emit socket event
            if (socket) {
                socket.emit('sendMessage', {
                    recipientId: activeChat,
                    message: data
                });
            }
        } catch (error) {
            console.error('Failed to send message', error);
        }
    };

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);
        // Socket typing event can be added here
    };

    const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length > 0 && conversationId) {
            try {
                const { data } = await api.get(`/messages/${conversationId}/search?query=${query}`);
                setSearchResults(data);
            } catch (error) {
                console.error('Search failed', error);
            }
        } else {
            setSearchResults([]);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
    };

    const groupMessagesByDate = (msgs: Message[]) => {
        const groups: { [key: string]: Message[] } = {};
        msgs.forEach(msg => {
            const date = formatDate(msg.createdAt);
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(msg);
        });
        return groups;
    };

    if (!isChatOpen || !activeChat) return null;

    const groupedMessages = searchQuery ? { 'Search Results': searchResults } : groupMessagesByDate(messages);

    if (isMinimized) {
        return (
            <div
                className="fixed bottom-4 right-20 w-72 bg-gradient-to-br from-primary to-gray-900 rounded-t-2xl shadow-2xl border border-gray-800 cursor-pointer z-50 transform transition-all hover:-translate-y-1 hover:shadow-primary/20"
                onClick={() => setIsMinimized(false)}
            >
                <div className="p-4 rounded-t-2xl flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <img
                                src={getImageUrl(recipient?.profileImage) || getAvatarPlaceholder(recipient?.name, 30)}
                                alt={recipient?.name || 'User'}
                                className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
                            />
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></span>
                        </div>
                        <div>
                            <span className="font-bold text-white block">{recipient?.name || 'Chat'}</span>
                            <span className="text-xs text-green-400 font-medium">Online</span>
                        </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); closeChat(); }} className="text-gray-300 hover:text-white transition">
                        <X size={18} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 md:right-8 w-80 md:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col z-50 overflow-hidden font-sans animate-fade-in-up">
            {/* Header */}
            <div className="p-4 bg-white/90 backdrop-blur-md border-b border-gray-50 flex justify-between items-center flex-shrink-0 z-10">
                {showSearch ? (
                    <div className="flex items-center w-full animate-fade-in">
                        <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="mr-2 text-gray-500 hover:text-gray-700">
                            <ChevronLeft size={20} />
                        </button>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearch}
                            placeholder="Search in conversation..."
                            className="flex-1 bg-gray-100 border-none rounded-full px-4 py-1.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                            autoFocus
                        />
                    </div>
                ) : (
                    <>
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <img
                                    src={getImageUrl(recipient?.profileImage) || getAvatarPlaceholder(recipient?.name, 40)}
                                    alt={recipient?.name || 'User'}
                                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
                                />
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm">{recipient?.name || 'Loading...'}</h3>
                                {isRecipientTyping ? (
                                    <p className="text-xs text-primary font-medium animate-pulse">typing...</p>
                                ) : (
                                    <p className="text-xs text-gray-500">Active now</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center space-x-1">
                            <button onClick={() => setShowSearch(true)} className="p-2 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-full transition">
                                <Search size={18} />
                            </button>
                            <button onClick={() => setIsMinimized(true)} className="p-2 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-full transition">
                                <Minus size={18} />
                            </button>
                            <button onClick={closeChat} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition">
                                <X size={18} />
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-6 custom-scrollbar">
                {messages.length === 0 && !searchQuery && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                            <Send size={24} className="text-gray-300 ml-1" />
                        </div>
                        <p className="text-sm font-medium">No messages yet</p>
                        <p className="text-xs">Say hello to start the conversation!</p>
                    </div>
                )}

                {Object.entries(groupedMessages).map(([date, msgs]) => (
                    <div key={date} className="space-y-4">
                        <div className="flex justify-center sticky top-0 z-0">
                            <span className="bg-gray-200/80 backdrop-blur-sm text-gray-600 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wide">
                                {date}
                            </span>
                        </div>
                        {msgs.map((msg) => {
                            const isMe = msg.sender._id === userInfo?._id;
                            return (
                                <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                                    <div
                                        className={`max-w-[75%] p-3.5 rounded-2xl text-sm shadow-sm relative transition-all ${isMe
                                            ? 'bg-gradient-to-br from-primary to-gray-800 text-white rounded-br-none'
                                            : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                                            }`}
                                    >
                                        <p className="leading-relaxed">{msg.content}</p>
                                        <div className={`flex items-center justify-end mt-1 space-x-1 ${isMe ? 'text-gray-300' : 'text-gray-400'}`}>
                                            <span className="text-[10px]">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {isMe && (
                                                <span>
                                                    {msg.read ? (
                                                        <CheckCheck size={14} className="text-blue-400" />
                                                    ) : (
                                                        <Check size={14} />
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-50">
                <div className="flex items-center space-x-2 bg-gray-50 rounded-full px-2 py-1 border border-gray-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                    <button type="button" className="p-2 text-gray-400 hover:text-primary transition rounded-full hover:bg-gray-200">
                        <ImageIcon size={20} />
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={handleTyping}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-2 text-gray-800 placeholder-gray-400"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className={`p-2 rounded-full ${newMessage.trim()
                            ? 'bg-primary text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            } transition-all duration-200`}
                    >
                        <Send size={18} className={newMessage.trim() ? 'ml-0.5' : ''} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatBox;
