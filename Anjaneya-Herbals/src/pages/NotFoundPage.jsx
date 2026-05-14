import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFoundPage = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-brand-cream px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="relative mb-8">
          <h1 className="text-[150px] font-black text-brand-sand/50 leading-none select-none font-serif">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-brand-cream border-2 border-brand-terracotta backdrop-blur-sm p-6 rounded-full shadow-lg">
              <Search size={48} className="text-brand-terracotta" />
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-brand-black mb-4 font-serif">Page Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-sm mx-auto">
          Oops! The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="flex items-center justify-center px-6 py-3 bg-brand-black text-white rounded-lg hover:bg-brand-earth transition-colors font-medium shadow-lg shadow-brand-sand/50"
          >
            <Home size={18} className="mr-2" />
            Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center px-6 py-3 border border-brand-sand text-brand-black bg-white rounded-lg hover:bg-brand-cream transition-colors font-medium"
          >
            <ArrowLeft size={18} className="mr-2" />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;