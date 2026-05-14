import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const OAuth2RedirectHandler = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const error = params.get('error');

        if (error) {
            console.error('OAuth2 Error:', error);
            toast.error(error);
            navigate('/login');
            return;
        }

        // Successful login: Backend has already set HttpOnly cookies.
        // We trigger an auth change event so AuthContext can fetch the user profile.
        window.dispatchEvent(new Event('authChange'));
        
        // Navigate to home
        navigate('/');
        
    }, [location, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-cream">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-brand-terracotta border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-brand-black font-serif text-lg">Authenticating...</p>
            </div>
        </div>
    );
};

export default OAuth2RedirectHandler;
