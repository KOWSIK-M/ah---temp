import React, { useState } from 'react';
import { Phone, Mail, MapPin, Instagram, Facebook, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ContactSection = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            toast.error('Please fill all fields');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (response.ok) {
                toast.success(data.message || 'Message sent successfully!');
                setSent(true);
                setFormData({ name: '', email: '', subject: '', message: '' });
            } else {
                toast.error(data.message || 'Failed to send message');
            }
        } catch (error) {
            console.error('Contact form error:', error);
            toast.error('Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="py-20 lg:py-28 bg-brand-cream relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-sand/30 skew-x-12 transform translate-x-20 pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-black mb-4">Get in Touch</h2>
                    <div className="w-24 h-1 bg-brand-orange mx-auto rounded-full mb-6"></div>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        Have questions about our products? We'd love to hear from you.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

                    {/* Contact Info Card */}
                    <div className="bg-white/80 backdrop-blur-lg p-8 md:p-10 rounded-3xl shadow-xl border border-white/50 space-y-8">
                        <div>
                            <h3 className="text-2xl font-bold text-brand-black mb-6">Contact Information</h3>
                            <div className="space-y-6">
                                <div className="flex items-start group">
                                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center shrink-0 group-hover:bg-brand-orange group-hover:text-white transition-colors duration-300">
                                        <Phone size={20} className="text-brand-orange group-hover:text-white transition-colors" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm text-gray-500 font-medium tracking-wide uppercase">Phone</p>
                                        <p className="text-lg font-semibold text-brand-black mt-1">+91 79817 93537</p>
                                    </div>
                                </div>

                                <div className="flex items-start group">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                                        <Mail size={20} className="text-blue-500 group-hover:text-white transition-colors" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm text-gray-500 font-medium tracking-wide uppercase">Email</p>
                                        <p className="text-lg font-semibold text-brand-black mt-1">medamkowsik2004@gmail.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start group">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0 group-hover:bg-brand-green group-hover:text-white transition-colors duration-300">
                                        <MapPin size={20} className="text-brand-green group-hover:text-white transition-colors" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm text-gray-500 font-medium tracking-wide uppercase">Head Office</p>
                                        <p className="text-lg font-semibold text-brand-black mt-1">Vijayawada, Andhra Pradesh</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-gray-100">
                            <h4 className="text-lg font-bold text-brand-black mb-4">Follow Us</h4>
                            <div className="flex space-x-4">
                                <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-pink-600 hover:text-white transition-all duration-300">
                                    <Instagram size={20} />
                                </a>
                                <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white transition-all duration-300">
                                    <Facebook size={20} />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
                        {sent ? (
                            <div className="text-center py-12">
                                <CheckCircle size={64} className="text-brand-green mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-brand-black mb-2">Message Sent!</h3>
                                <p className="text-gray-600 mb-6">We'll get back to you soon.</p>
                                <button
                                    onClick={() => setSent(false)}
                                    className="px-6 py-3 bg-brand-black text-white rounded-lg hover:bg-brand-green transition-colors"
                                >
                                    Send Another Message
                                </button>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-2xl font-bold text-brand-black mb-6">Send us a Message</h3>
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label htmlFor="name" className="text-sm font-medium text-gray-700">Your Name</label>
                                            <input
                                                type="text"
                                                id="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="email" className="text-sm font-medium text-gray-700">Your Email</label>
                                            <input
                                                type="email"
                                                id="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="subject" className="text-sm font-medium text-gray-700">Subject</label>
                                        <input
                                            type="text"
                                            id="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                                            placeholder="How can we help?"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="message" className="text-sm font-medium text-gray-700">Message</label>
                                        <textarea
                                            id="message"
                                            rows="4"
                                            value={formData.message}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-brand-orange focus:ring-2 focus:ring-orange-100 outline-none transition-all resize-none"
                                            placeholder="Write your message here..."
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 bg-brand-black text-white font-bold rounded-lg hover:bg-brand-green transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                <span>Sending...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Send Message</span>
                                                <Send size={18} />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
