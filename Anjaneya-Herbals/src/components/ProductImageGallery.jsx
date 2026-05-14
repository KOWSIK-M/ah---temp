import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react';

const ProductImageGallery = ({ images, productName }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        if (!isZoomed || isFullscreen) return;

        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;

        setZoomPosition({ x, y });
    };

    const nextImage = () => {
        setSelectedIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <>
            <div className="space-y-4">
                {/* Main Image */}
                <div className="relative bg-white rounded-lg border overflow-hidden">
                    <div
                        className="relative aspect-square cursor-zoom-in"
                        onMouseEnter={() => setIsZoomed(true)}
                        onMouseLeave={() => setIsZoomed(false)}
                        onMouseMove={handleMouseMove}
                        onClick={() => setIsFullscreen(true)}
                    >
                        <img
                            src={images[selectedIndex]}
                            alt={`${productName} - Image ${selectedIndex + 1}`}
                            className="w-full h-full object-contain"
                        />

                        {/* Zoom Icon */}
                        <div className="absolute bottom-4 right-4 bg-white rounded-full p-2 shadow-lg">
                            <ZoomIn size={20} />
                        </div>

                        {/* Zoom Preview */}
                        {isZoomed && !isFullscreen && (
                            <div className="absolute left-full top-0 ml-4 w-96 h-96 bg-white border rounded-lg shadow-xl overflow-hidden z-10 hidden lg:block">
                                <div
                                    className="w-[400%] h-[400%] absolute"
                                    style={{
                                        backgroundImage: `url(${images[selectedIndex]})`,
                                        backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                                        backgroundSize: '400%',
                                        backgroundRepeat: 'no-repeat',
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    prevImage();
                                }}
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    nextImage();
                                }}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </>
                    )}

                    {/* Image Counter */}
                    <div className="absolute bottom-4 left-4 bg-black/60 text-white px-2 py-1 rounded text-sm">
                        {selectedIndex + 1} / {images.length}
                    </div>
                </div>

                {/* Thumbnail Strip */}
                {images.length > 1 && (
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                        {images.map((img, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedIndex(index)}
                                className={`flex-shrink-0 w-20 h-20 border rounded-lg overflow-hidden ${selectedIndex === index
                                    ? 'border-blue-500 ring-2 ring-blue-300'
                                    : 'border-gray-300'
                                    }`}
                            >
                                <img
                                    src={img}
                                    alt={`Thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Fullscreen Modal */}
            <AnimatePresence>
                {isFullscreen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black z-50 flex items-center justify-center"
                    >
                        <button
                            onClick={() => setIsFullscreen(false)}
                            className="absolute top-4 right-4 text-white p-2"
                        >
                            <X size={32} />
                        </button>

                        <div className="relative max-w-4xl max-h-[90vh]">
                            <img
                                src={images[selectedIndex]}
                                alt={`${productName} - Fullscreen`}
                                className="max-w-full max-h-[90vh] object-contain"
                            />

                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white p-2"
                                    >
                                        <ChevronLeft size={32} />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white p-2"
                                    >
                                        <ChevronRight size={32} />
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ProductImageGallery;