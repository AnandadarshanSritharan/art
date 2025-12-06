import { getApiUrl } from './config';

export const getImageUrl = (imagePath: string | undefined): string => {
    if (!imagePath || typeof imagePath !== 'string') return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    return `${getApiUrl()}${imagePath}`;
};

// Generate a data URI SVG avatar with the user's first letter
export const getAvatarPlaceholder = (name: string | undefined, size: number = 40): string => {
    const letter = name?.charAt(0).toUpperCase() || '?';
    const fontSize = Math.floor(size * 0.45);
    const textY = size * 0.65;

    return `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"%3E%3Ccircle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="%23e5e7eb"/%3E%3Ctext x="${size / 2}" y="${textY}" font-size="${fontSize}" text-anchor="middle" fill="%239ca3af" font-family="Arial, sans-serif" font-weight="600"%3E${letter}%3C/text%3E%3C/svg%3E`;
};
