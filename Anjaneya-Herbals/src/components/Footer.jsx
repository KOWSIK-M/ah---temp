import React from 'react';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black text-white pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">

          {/* Column 1: Brand Info */}
          <div>
            <h3 className="text-2xl font-serif font-bold text-brand-yellow mb-6">
              Anjaneya Herbals
            </h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Premium wellness and beauty products crafted with the finest natural ingredients. Embrace the power of nature for a healthier, more radiant you.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-brand-yellow transition-colors"><Facebook size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-brand-yellow transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-brand-yellow transition-colors"><Twitter size={20} /></a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white border-b border-gray-800 pb-2 inline-block">Quick Links</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="/#about" className="hover:text-brand-yellow transition-colors">About Us</a></li>
              <li><a href="/#products" className="hover:text-brand-yellow transition-colors">Our Ingredients</a></li>
              <li><a href="#" className="hover:text-brand-yellow transition-colors">Blog</a></li>
              <li><a href="/contact" className="hover:text-brand-yellow transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-brand-yellow transition-colors">Track Order</a></li>
            </ul>
          </div>

          {/* Column 3: Policies */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white border-b border-gray-800 pb-2 inline-block">Policies</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#" className="hover:text-brand-yellow transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-brand-yellow transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-brand-yellow transition-colors">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-brand-yellow transition-colors">Refund Policy</a></li>
              <li><a href="#" className="hover:text-brand-yellow transition-colors">FAQs</a></li>
            </ul>
          </div>

          {/* Column 4: Contact & Newsletter */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white border-b border-gray-800 pb-2 inline-block">Stay Connected</h4>
            <ul className="space-y-4 text-sm text-gray-400 mb-6">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="text-brand-yellow mt-1 flex-shrink-0" />
                <span>Vijayawada, Andhra Pradesh</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-brand-yellow flex-shrink-0" />
                <span>+91 79817 93537</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-brand-yellow flex-shrink-0" />
                <span>medamkowsik2004@gmail.com</span>
              </li>
            </ul>

            <div>
              <p className="text-xs text-brand-gray mb-2">Subscribe to our newsletter</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="bg-gray-800 text-white px-4 py-2 rounded-l-md focus:outline-none focus:ring-1 focus:ring-brand-yellow w-full text-sm"
                />
                <button className="bg-brand-orange text-white px-4 py-2 rounded-r-md hover:bg-orange-600 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 mt-8 text-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Anjaneya Herbals. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;