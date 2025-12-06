import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    const config = {
        success: {
            icon: CheckCircle,
            bgColor: 'bg-gradient-to-r from-green-500 to-emerald-600',
            iconColor: 'text-white',
        },
        error: {
            icon: XCircle,
            bgColor: 'bg-gradient-to-r from-red-500 to-rose-600',
            iconColor: 'text-white',
        },
        warning: {
            icon: AlertCircle,
            bgColor: 'bg-gradient-to-r from-amber-500 to-orange-600',
            iconColor: 'text-white',
        },
        info: {
            icon: Info,
            bgColor: 'bg-gradient-to-r from-blue-500 to-indigo-600',
            iconColor: 'text-white',
        },
    };

    const { icon: Icon, bgColor, iconColor } = config[type];

    return (
        <div className={`${bgColor} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-4 min-w-[320px] max-w-md animate-slide-in-right backdrop-blur-sm border border-white/20`}>
            <Icon className={iconColor} size={24} />
            <p className="flex-1 font-medium text-sm leading-relaxed">{message}</p>
            <button
                onClick={onClose}
                className="hover:bg-white/20 p-1 rounded-full transition-colors"
            >
                <X size={18} />
            </button>
        </div>
    );
};

export default Toast;
