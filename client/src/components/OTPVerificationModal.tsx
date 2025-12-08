import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

interface OTPVerificationModalProps {
    email: string;
    onSuccess: () => void;
    onClose: () => void;
}

const OTPVerificationModal: React.FC<OTPVerificationModalProps> = ({ email, onSuccess, onClose }) => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(15 * 60); // 15 minutes in seconds
    const [canResend, setCanResend] = useState(false);

    // Countdown timer
    useEffect(() => {
        if (timeRemaining <= 0) {
            setCanResend(true);
            return;
        }

        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining]);

    // Format time as MM:SS
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Handle OTP input (only allow digits)
    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.trim().replace(/\D/g, ''); // Trim and remove non-digits
        if (value.length <= 6) {
            setOtp(value);
            setError('');
        }
    };

    // Handle OTP verification
    const handleVerify = async () => {
        const trimmedOtp = otp.trim();

        if (trimmedOtp.length !== 6) {
            setError('Please enter a 6-digit OTP');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post('/auth/verify-artist-otp', {
                email,
                otp: trimmedOtp,
            });

            console.log('OTP verified successfully:', response.data);
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid or expired OTP');
            setOtp('');
        } finally {
            setLoading(false);
        }
    };

    // Handle resend OTP
    const handleResend = async () => {
        setResendLoading(true);
        setError('');

        try {
            await axios.post('/api/auth/resend-artist-otp', { email });
            setTimeRemaining(15 * 60); // Reset timer
            setCanResend(false);
            setOtp('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setResendLoading(false);
        }
    };

    // Auto-submit when 6 digits entered
    useEffect(() => {
        if (otp.length === 6) {
            handleVerify();
        }
    }, [otp]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fadeIn">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={loading}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h2>
                    <p className="text-gray-600 text-sm">
                        We've sent a 6-digit code to<br />
                        <span className="font-semibold text-gray-800">{email}</span>
                    </p>
                </div>

                {/* OTP Input */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                        Enter Verification Code
                    </label>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={otp}
                        onChange={handleOtpChange}
                        placeholder="000000"
                        className="w-full text-center text-3xl font-bold tracking-[0.5em] px-4 py-4 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                        maxLength={6}
                        autoFocus
                        disabled={loading}
                    />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                        <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* Timer */}
                <div className="mb-6 text-center">
                    <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full">
                        <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className={`font-mono font-semibold ${timeRemaining <= 60 ? 'text-red-600' : 'text-gray-700'}`}>
                            {formatTime(timeRemaining)}
                        </span>
                    </div>
                    {timeRemaining <= 60 && timeRemaining > 0 && (
                        <p className="text-xs text-red-600 mt-2">Code expires soon!</p>
                    )}
                </div>

                {/* Verify Button */}
                <button
                    onClick={handleVerify}
                    disabled={loading || otp.length !== 6}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4 flex items-center justify-center"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Verifying...
                        </>
                    ) : (
                        'Verify Email'
                    )}
                </button>

                {/* Resend OTP */}
                <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
                    <button
                        onClick={handleResend}
                        disabled={!canResend || resendLoading}
                        className="text-purple-600 font-semibold hover:text-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        {resendLoading ? 'Sending...' : 'Resend Code'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OTPVerificationModal;
