import React from 'react';

const SkeletonLoader = ({ type = 'product-details' }) => {
  if (type === 'product-details') {
    return (
      <div className="container mx-auto px-4 py-6 animate-pulse">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Image Gallery Skeleton */}
          <div className="lg:w-1/2">
            <div className="aspect-square bg-gray-200 rounded-lg"></div>
            <div className="flex space-x-2 mt-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-20 h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
          
          {/* Product Info Skeleton */}
          <div className="lg:w-1/2 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-6 bg-gray-200 rounded w-24"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 h-64 rounded"></div>
    </div>
  );
};

export default SkeletonLoader;