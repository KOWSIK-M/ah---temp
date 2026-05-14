import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User, Mail, Phone, MapPin, Calendar, Shield,
    CreditCard, Package, Heart, Settings, LogOut,
    Edit2, Save, X, Camera
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const ProfilePage = () => {
    const { user, logout, updateProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        gender: '',
        dob: ''
    });
    const [stats, setStats] = useState({
        orders: 0,
        wishlist: 0,
        addresses: 0,
        coupons: 0
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                gender: user.gender || '',
                dob: user.dob || ''
            });

            // Load user stats
            loadUserStats();
        }
    }, [user]);

    const loadUserStats = () => {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const addresses = JSON.parse(localStorage.getItem('addresses') || '[]');
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');

        setStats({
            orders: orders.length,
            wishlist: wishlist.length,
            addresses: addresses.length,
            coupons: 3 // Mock data
        });
    };

    const handleSave = () => {
        if (updateProfile(formData)) {
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            gender: user.gender || '',
            dob: user.dob || ''
        });
        setIsEditing(false);
    };

    const menuItems = [
        {
            id: 'orders',
            icon: <Package size={24} />,
            label: 'My Orders',
            description: 'View & track orders',
            count: stats.orders,
            color: 'from-brand-moss to-brand-olive',
            href: '/orders'
        },
        {
            id: 'wishlist',
            icon: <Heart size={24} />,
            label: 'Wishlist',
            description: 'Saved items',
            count: stats.wishlist,
            color: 'from-brand-terracotta to-brand-earth',
            href: '/wishlist'
        },
        {
            id: 'addresses',
            icon: <MapPin size={24} />,
            label: 'Addresses',
            description: 'Saved addresses',
            count: stats.addresses,
            color: 'from-brand-sage to-brand-moss',
            href: '/addresses'
        },
        {
            id: 'payments',
            icon: <CreditCard size={24} />,
            label: 'Payments',
            description: 'Cards & wallets',
            count: 2,
            color: 'from-brand-clay to-brand-earth',
            href: '/payments'
        },
        {
            id: 'coupons',
            icon: <div className="text-2xl">🎫</div>,
            label: 'Coupons',
            description: 'Available offers',
            count: stats.coupons,
            color: 'from-brand-yellow to-brand-orange',
            href: '/coupons'
        },
        {
            id: 'settings',
            icon: <Settings size={24} />,
            label: 'Settings',
            description: 'Account settings',
            color: 'from-gray-500 to-gray-600',
            href: '/settings'
        }
    ];

    return (
        <div className="min-h-screen bg-brand-cream py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-serif font-bold text-brand-black mb-2">My Profile</h1>
                    <p className="text-gray-600">Manage your account information and preferences</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Profile Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Profile Card */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-brand-sand">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-brand-black">Personal Information</h2>
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center text-brand-terracotta hover:text-brand-earth transition-colors"
                                    >
                                        <Edit2 size={18} className="mr-2" />
                                        Edit Profile
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleCancel}
                                            className="flex items-center px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50"
                                        >
                                            <X size={16} className="mr-1" />
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            className="flex items-center px-3 py-1 bg-brand-terracotta text-white rounded-lg hover:bg-brand-earth transition-colors"
                                        >
                                            <Save size={16} className="mr-1" />
                                            Save
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                {/* Profile Picture */}
                                <div className="flex items-center">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-sand to-brand-clay flex items-center justify-center text-3xl font-bold text-brand-earth">
                                            {user?.name?.charAt(0) || 'U'}
                                        </div>
                                        <button className="absolute bottom-0 right-0 w-8 h-8 bg-brand-terracotta text-white rounded-full flex items-center justify-center hover:bg-brand-earth transition-colors">
                                            <Camera size={16} />
                                        </button>
                                    </div>
                                    <div className="ml-6">
                                        <h3 className="text-xl font-bold text-brand-black">{user?.name}</h3>
                                        <p className="text-gray-600">Member since {new Date().getFullYear() - 1}</p>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-brand-black mb-2">
                                            Full Name
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none"
                                            />
                                        ) : (
                                            <div className="flex items-center">
                                                <User size={20} className="text-gray-400 mr-3" />
                                                <span className="text-gray-900">{user?.name}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-brand-black mb-2">
                                            Email Address
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none"
                                            />
                                        ) : (
                                            <div className="flex items-center">
                                                <Mail size={20} className="text-gray-400 mr-3" />
                                                <span className="text-gray-900">{user?.email}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-brand-black mb-2">
                                            Phone Number
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none"
                                            />
                                        ) : (
                                            <div className="flex items-center">
                                                <Phone size={20} className="text-gray-400 mr-3" />
                                                <span className="text-gray-900">{user?.phone || 'Not provided'}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-brand-black mb-2">
                                            Gender
                                        </label>
                                        {isEditing ? (
                                            <select
                                                value={formData.gender}
                                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none"
                                            >
                                                <option value="">Select</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        ) : (
                                            <div className="flex items-center">
                                                <User size={20} className="text-gray-400 mr-3" />
                                                <span className="text-gray-900">{user?.gender || 'Not specified'}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-brand-black mb-2">
                                            Date of Birth
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="date"
                                                value={formData.dob}
                                                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none"
                                            />
                                        ) : (
                                            <div className="flex items-center">
                                                <Calendar size={20} className="text-gray-400 mr-3" />
                                                <span className="text-gray-900">{user?.dob || 'Not specified'}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-brand-black mb-2">
                                            Account Status
                                        </label>
                                        <div className="flex items-center">
                                            <Shield size={20} className="text-brand-moss mr-3" />
                                            <span className="text-brand-moss font-medium">Verified</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Section */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-brand-sand">
                            <h2 className="text-xl font-bold text-brand-black mb-6">Security</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                                    <div>
                                        <h3 className="font-medium text-brand-black">Password</h3>
                                        <p className="text-sm text-gray-600">Last changed 3 months ago</p>
                                    </div>
                                    <button className="px-4 py-2 border border-brand-terracotta text-brand-terracotta rounded-lg hover:bg-brand-cream transition-colors">
                                        Change Password
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                                    <div>
                                        <h3 className="font-medium text-brand-black">Two-Factor Authentication</h3>
                                        <p className="text-sm text-gray-600">Add extra security to your account</p>
                                    </div>
                                    <button className="px-4 py-2 bg-brand-terracotta text-white rounded-lg hover:bg-brand-earth transition-colors">
                                        Enable 2FA
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                                    <div>
                                        <h3 className="font-medium text-brand-black">Login Sessions</h3>
                                        <p className="text-sm text-gray-600">Manage active sessions</p>
                                    </div>
                                    <button className="px-4 py-2 border border-gray-400 text-gray-600 rounded-lg hover:bg-gray-50">
                                        View Sessions
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Quick Actions */}
                    <div className="space-y-8">
                        {/* Quick Stats */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-brand-sand">
                            <h2 className="text-xl font-bold text-brand-black mb-6">Quick Stats</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {menuItems.slice(0, 4).map(item => (
                                    <div
                                        key={item.id}
                                        className="p-4 border border-gray-100 rounded-lg hover:border-brand-sage hover:shadow-sm cursor-pointer transition-all"
                                    >
                                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-3 shadow-sm`}>
                                            {item.icon}
                                        </div>
                                        <h3 className="font-medium text-brand-black">{item.label}</h3>
                                        <p className="text-sm text-gray-600">{item.count} items</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions Menu */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-brand-sand">
                            <h2 className="text-xl font-bold text-brand-black mb-6">Quick Actions</h2>
                            <div className="space-y-2">
                                {menuItems.map(item => (
                                    <a
                                        key={item.id}
                                        href={item.href}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-brand-cream group transition-colors"
                                    >
                                        <div className="flex items-center">
                                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-white mr-3 shadow-sm`}>
                                                {item.icon}
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-brand-black">{item.label}</h3>
                                                <p className="text-sm text-gray-600">{item.description}</p>
                                            </div>
                                        </div>
                                        {item.count && (
                                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                                {item.count}
                                            </span>
                                        )}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={logout}
                            className="w-full p-4 border border-red-200 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 flex items-center justify-center transition-colors"
                        >
                            <LogOut size={20} className="mr-2" />
                            Logout
                        </button>

                        {/* Delete Account */}
                        <div className="text-center">
                            <button className="text-sm text-gray-500 hover:text-red-600">
                                Delete my account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;