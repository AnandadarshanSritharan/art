import { useState, useCallback } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';

interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

export const useConfirm = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<ConfirmOptions>({
        title: '',
        message: '',
    });
    const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

    const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
        setOptions(opts);
        setIsOpen(true);

        return new Promise((resolve) => {
            setResolvePromise(() => resolve);
        });
    }, []);

    const handleConfirm = useCallback(() => {
        if (resolvePromise) {
            resolvePromise(true);
        }
        setIsOpen(false);
    }, [resolvePromise]);

    const handleCancel = useCallback(() => {
        if (resolvePromise) {
            resolvePromise(false);
        }
        setIsOpen(false);
    }, [resolvePromise]);

    const ConfirmDialogComponent = () => (
        <ConfirmDialog
            isOpen={isOpen}
            title={options.title}
            message={options.message}
            confirmText={options.confirmText}
            cancelText={options.cancelText}
            type={options.type}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
        />
    );

    return { confirm, ConfirmDialogComponent };
};
