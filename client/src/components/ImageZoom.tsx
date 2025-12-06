import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ImageZoomProps {
    src: string;
    alt: string;
    className?: string;
}

const ImageZoom: React.FC<ImageZoomProps> = ({ src, alt, className }) => {
    const [showZoom, setShowZoom] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [clientPosition, setClientPosition] = useState({ x: 0, y: 0 });
    const imgRef = useRef<HTMLImageElement>(null);
    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

    // Configuration
    const ZOOM_RATIO = 2.5;
    const ZOOM_SIZE = 250; // Diameter of the zoom circle
    const LENS_SIZE = ZOOM_SIZE / ZOOM_RATIO;

    useEffect(() => {
        // Create a portal container if it doesn't exist
        let el = document.getElementById('zoom-portal');
        if (!el) {
            el = document.createElement('div');
            el.id = 'zoom-portal';
            document.body.appendChild(el);
        }
        setPortalContainer(el);
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!imgRef.current) return;

        const { left, top, width, height } = imgRef.current.getBoundingClientRect();
        const x = e.clientX - left;
        const y = e.clientY - top;

        setClientPosition({ x: e.clientX, y: e.clientY });

        // Calculate lens position (top-left of the area to be zoomed)
        let lensX = x - LENS_SIZE / 2;
        let lensY = y - LENS_SIZE / 2;

        // Boundary checks
        if (lensX < 0) lensX = 0;
        if (lensY < 0) lensY = 0;
        if (lensX > width - LENS_SIZE) lensX = width - LENS_SIZE;
        if (lensY > height - LENS_SIZE) lensY = height - LENS_SIZE;

        // Calculate background position for the zoom window
        const bgX = -lensX * ZOOM_RATIO;
        const bgY = -lensY * ZOOM_RATIO;

        setPosition({ x: bgX, y: bgY });
    };

    return (
        <div
            className={`relative cursor-none inline-block ${className}`}
            onMouseEnter={() => setShowZoom(true)}
            onMouseLeave={() => setShowZoom(false)}
            onMouseMove={handleMouseMove}
        >
            <img
                ref={imgRef}
                src={src}
                alt={alt}
                className="w-full h-auto block"
            />

            {/* Zoom Window Portal */}
            {showZoom && portalContainer && createPortal(
                <div
                    className="fixed z-50 border-4 border-white shadow-2xl bg-white overflow-hidden rounded-full pointer-events-none"
                    style={{
                        top: `${clientPosition.y}px`,
                        left: `${clientPosition.x}px`,
                        transform: 'translate(-50%, -50%)',
                        width: `${ZOOM_SIZE}px`,
                        height: `${ZOOM_SIZE}px`,
                    }}
                >
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            backgroundImage: `url(${src})`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: `${position.x}px ${position.y}px`,
                            backgroundSize: `${(imgRef.current?.width || 0) * ZOOM_RATIO}px ${(imgRef.current?.height || 0) * ZOOM_RATIO}px`,
                        }}
                    />
                </div>,
                portalContainer
            )}
        </div>
    );
};

export default ImageZoom;
