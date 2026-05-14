import React, { useState } from 'react';
import { MapPin, Phone, Clock, ArrowRight } from 'lucide-react';

const BRANCHES = [
    {
        id: 1,
        name: "Anjaneya Herbals",
        address: "D. No:11-62-91, Canal Rd, near Ganesh temple, Beside Vinayaka Temple, Kaleswara Rao Market, Tarapet, Vijayawada, Andhra Pradesh 520001",
        phone: "+91 99661 11111", // Placeholder
        hours: "10:00 AM - 9:00 PM",
        mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7650.541080119492!2d80.60120967770996!3d16.512433999999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35efdfda42bff3%3A0x8b2a89103caf3b33!2sAnjaneya%20Herbals!5e0!3m2!1sen!2sin!4v1765730021866!5m2!1sen!2sin"
    },
    {
        id: 2,
        name: "Anjaneya Herbal Stores (ఆంజనేయ హెర్బల్ స్టోర్స్)",
        address: "Opp SBI Beside Tagore Type institute, Patamata, Vijayawada, Andhra Pradesh 520010",
        phone: "+91 99661 22222", // Placeholder
        hours: "10:00 AM - 9:00 PM",
        mapUrl: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d7651.1831829201!2d80.6498345!3d16.496205!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35fac1351c19ab%3A0xf5035d8e3bd6851d!2sAnjaneya%20Herbal%20Stores!5e0!3m2!1sen!2sin!4v1765730240963!5m2!1sen!2sin"
    }
];

// Store Locator Component
const StoreLocator = () => {
    const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0]);

    return (
        <section className="py-16 bg-brand-cream">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-serif font-bold text-brand-black mb-3">Visit Our Stores</h2>
                    <div className="w-20 h-1 bg-brand-yellow mx-auto rounded-full"></div>
                    <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
                        Anjaneya Herbals now serving you at multiple locations in Vijayawada.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 rounded-2xl overflow-hidden shadow-xl bg-white">
                    {/* Map Interface - Real Time Embed */}
                    <div className="relative h-[400px] lg:h-auto bg-gray-200 overflow-hidden">
                        <iframe
                            src={selectedBranch.mapUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Store Location Map"
                        ></iframe>
                    </div>

                    {/* Branch List */}
                    <div className="p-8 lg:p-12 flex flex-col justify-center">
                        <h3 className="text-2xl font-bold mb-6 text-brand-black">Our Locations</h3>
                        <div className="space-y-4">
                            {BRANCHES.map((branch) => (
                                <div
                                    key={branch.id}
                                    onClick={() => setSelectedBranch(branch)}
                                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${selectedBranch.id === branch.id ? 'border-brand-orange bg-orange-50' : 'border-gray-100 hover:border-gray-300'}`}
                                >
                                    <h4 className="font-bold text-lg mb-2 flex items-center justify-between">
                                        {branch.name}
                                        {selectedBranch.id === branch.id && <ArrowRight size={18} className="text-brand-orange" />}
                                    </h4>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <p className="flex items-start">
                                            <MapPin size={16} className="mr-2 mt-1 flex-shrink-0 text-brand-green" />
                                            {branch.address}
                                        </p>
                                        <p className="flex items-center">
                                            <Clock size={16} className="mr-2 text-brand-green" />
                                            {branch.hours}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <a
                                href={selectedBranch.id === 1 ? "https://maps.app.goo.gl/WDqdwbYezMJFF9h5A" : "https://maps.app.goo.gl/D31P3aTW3VYb3Thz8"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-brand-black text-white py-3 rounded-lg font-bold hover:bg-brand-green transition-colors flex items-center justify-center"
                            >
                                Get Directions via Google Maps
                                <ArrowRight size={18} className="ml-2" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StoreLocator;
