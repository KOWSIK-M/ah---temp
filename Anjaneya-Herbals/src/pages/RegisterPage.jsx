import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, Eye, EyeOff, ArrowLeft, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        setLoading(true);

        try {
            const response = await register({
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone || null
            });

            if (!response) {
                return;
            }

            navigate('/');
        } catch (error) {
            toast.error(error.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-cream flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-brand-sand">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center text-brand-moss hover:text-brand-earth mb-4 transition-colors">
                            <ArrowLeft size={20} className="mr-2" />
                            Back to store
                        </Link>
                        <h2 className="text-3xl font-serif font-bold text-brand-black mb-2">Create Account</h2>
                        <p className="text-gray-600">Join thousands of happy customers</p>
                    </div>

                    {/* Registration Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-brand-black mb-2">
                                First Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    required
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none transition-all"
                                    placeholder="John"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-brand-black mb-2">
                                Last Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    required
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none transition-all"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-brand-black mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-brand-black mb-2">
                                Phone Number
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none transition-all"
                                    placeholder="+91 9876543210"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-brand-black mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <ul className="mt-2 text-xs text-gray-500 space-y-1">
                                <li className="flex items-center">
                                    <Check size={12} className="mr-1 text-brand-moss" />
                                    At least 8 characters
                                </li>
                            </ul>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-brand-black mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                required
                                className="w-4 h-4 text-brand-terracotta rounded focus:ring-brand-terracotta border-gray-300"
                                id="terms"
                            />
                            <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                                I agree to the{' '}
                                <Link to="/terms" className="text-brand-terracotta hover:text-brand-earth">
                                    Terms of Service
                                </Link>{' '}
                                and{' '}
                                <Link to="/privacy" className="text-brand-terracotta hover:text-brand-earth">
                                    Privacy Policy
                                </Link>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-brand-terracotta text-white rounded-lg font-medium hover:bg-brand-earth disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-md hover:shadow-lg"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>
                    

                    {/* Login Link */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="text-brand-terracotta hover:text-brand-earth font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
                
            </motion.div>
        </div>
    );
};

export default RegisterPage;