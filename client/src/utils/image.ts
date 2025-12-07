import imageCompression from 'browser-image-compression';
import { getApiUrl } from './config';

export const compressImage = async (file: File): Promise<File> => {
    // Options for compression
    const options = {
        maxSizeMB: 1,          // Target max size 
        maxWidthOrHeight: 1920, // Max width/height
        useWebWorker: true,     // Use multi-threading
        fileType: "image/webp"  // Force conversion to WebP
    };

    try {
        console.log(`Original file size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
        const compressedFile = await imageCompression(file, options);
        console.log(`Compressed file size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);

        // Ensure the file has the correct extension and type
        const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
        const finalFile = new File([compressedFile], newFileName, {
            type: "image/webp",
            lastModified: Date.now(),
        });

        return finalFile;
    } catch (error) {
        console.error("Image compression error:", error);
        return file; // Return original if compression fails
    }
};

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
