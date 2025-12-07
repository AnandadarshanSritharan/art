
export const getApiUrl = (): string => {
    if (window.location.hostname === 'localhost') {
        return 'http://localhost:5000';
    }
    return ''; // Relative path for production
};
