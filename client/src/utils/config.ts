
export const getApiUrl = (): string => {
    return (window as any).appConfig?.API_URL || 'http://localhost:5000';
};
