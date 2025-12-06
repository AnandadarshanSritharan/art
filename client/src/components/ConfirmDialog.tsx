import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    type = 'warning',
}) => {
    if (!isOpen) return null;

    const typeConfig = {
        danger: {
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            confirmBg: 'bg-red-600 hover:bg-red-700',
        },
        warning: {
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-600',
            confirmBg: 'bg-amber-600 hover:bg-amber-700',
        },
        info: {
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            confirmBg: 'bg-blue-600 hover:bg-blue-700',
        },
    };

    const config = typeConfig[type];

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onCancel}
            ></div>

            {/* Dialog */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                >
                    <X size={20} />
                </button>

                <div className="flex items-start space-x-4">
                    <div className={`${config.iconBg} p-3 rounded-full flex-shrink-0`}>
                        <AlertTriangle className={config.iconColor} size={24} />
                    </div>
                    <div className="flex-1 pt-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{message}</p>
                    </div>
                </div>

                <div className="flex space-x-3 mt-6">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onCancel();
                        }}
                        className={`flex-1 px-4 py-2.5 ${config.confirmBg} text-white font-medium rounded-xl transition-colors shadow-lg`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
