// utils/mockApi.js
export const getProductById = async (id) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const products = {
        '1': {
            id: '1',
            name: 'Organic Ashwagandha Powder (200g)',
            brand: 'Anjaneya Herbals',
            category: 'Herbal Supplements',
            description: '100% pure and organic Ashwagandha powder sourced from certified organic farms. Known for reducing stress, improving sleep, and boosting immunity.',
            rating: 4.5,
            ratingCount: 12340,
            reviewCount: 2345,
            discountedPrice: 499,
            originalPrice: 649,
            stock: 42,
            images: [
                'https://images.unsplash.com/photo-1596040033221-a9881e4f6f5d?w=800',
                'https://images.unsplash.com/photo-1596040033221-a9881e4f6f5d?w=800',
                'https://images.unsplash.com/photo-1596040033221-a9881e4f6f5d?w=800',
                'https://images.unsplash.com/photo-1596040033221-a9881e4f6f5d?w=800'
            ],
            features: [
                '100% Organic and Pure',
                'No additives or preservatives',
                'Laboratory tested for purity',
                'GMP certified manufacturing',
                'Traditional Ayurvedic preparation'
            ],
            specifications: {
                'Weight': '200g',
                'Form': 'Powder',
                'Shelf Life': '24 Months',
                'Storage': 'Cool & Dry Place',
                'Certification': 'Organic India, GMP',
                'Country of Origin': 'India'
            },
            offers: [
                'Bank Offer: 10% instant discount on ICICI Bank Credit Cards',
                'Special Price: Get extra 5% off',
                'Partner Offer: Buy 2 items save 15%'
            ],
            variants: [
                { id: '1-1', name: '200g', price: 499 },
                { id: '1-2', name: '500g', price: 1199 },
                { id: '1-3', name: '1kg', price: 2199 }
            ],
            variantType: 'Pack Size',
            seller: {
                name: 'Anjaneya Herbals',
                rating: 4.8
            }
        },
        '2': {
            id: '2',
            name: 'Premium Almonds (California, 500g)',
            brand: 'Anjaneya Herbals',
            category: 'Dry Fruits',
            description: 'Premium quality California almonds, rich in nutrients and antioxidants. Perfect for daily consumption and healthy snacking.',
            rating: 4.7,
            ratingCount: 8567,
            reviewCount: 1890,
            discountedPrice: 589,
            originalPrice: 699,
            stock: 15,
            images: [
                'https://images.unsplash.com/photo-1623334044303-241021148842?w=800',
                'https://images.unsplash.com/photo-1623334044303-241021148842?w=800',
                'https://images.unsplash.com/photo-1623334044303-241021148842?w=800'
            ],
            features: [
                'Premium California Almonds',
                'Rich in Vitamin E and antioxidants',
                'No artificial colors or preservatives',
                'Direct from farm to you',
                'Handpicked for quality'
            ],
            specifications: {
                'Weight': '500g',
                'Type': 'Whole Almonds',
                'Origin': 'California, USA',
                'Shelf Life': '12 Months',
                'Storage': 'Airtight container in cool place',
                'Certification': 'FSSAI Certified'
            },
            offers: [
                'Special Price: Get extra 10% off',
                'Free Delivery on orders above ₹999',
                'Buy 2 Get 1 Free on select items'
            ],
            variants: [
                { id: '2-1', name: '250g', price: 299 },
                { id: '2-2', name: '500g', price: 589 },
                { id: '2-3', name: '1kg', price: 1149 }
            ],
            variantType: 'Pack Size',
            seller: {
                name: 'Anjaneya Herbals',
                rating: 4.9
            }
        },
        '3': {
            id: '3',
            name: "Organic Aloe Vera Gel for Skin & Hair",
            brand: 'Anjaneya Herbals',
            category: 'Skin Care',
            description: 'Pure Aloe Vera gel extracted from fresh organic aloe leaves. Soothes skin, hydrates, and promotes hair growth.',
            rating: 5,
            ratingCount: 2150,
            reviewCount: 450,
            discountedPrice: 299,
            originalPrice: 399,
            stock: 50,
            images: [
                "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            ],
            features: [
                '99% Pure Aloe Vera',
                'No artificial fragrance',
                'Multi-purpose gel',
                'Paraben free'
            ],
            specifications: {
                'Net Qty': '200ml',
                'Type': 'Gel',
                'Skin Type': 'All'
            },
            offers: [],
            variants: [],
            seller: {
                name: 'Anjaneya Herbals',
                rating: 4.8
            }
        },
        '4': {
            id: '4',
            name: "Rose Water Facial Mist Spray",
            brand: 'Anjaneya Herbals',
            category: 'Skin Care',
            description: 'Refreshing facial mist made from steam-distilled Kannauj roses. Tones, hydrates, and revitalizes skin instantly.',
            rating: 4,
            ratingCount: 890,
            reviewCount: 67,
            discountedPrice: 349,
            originalPrice: 499,
            stock: 25,
            images: [
                "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            ],
            features: [
                'Steam Distilled',
                'Alcohol Free',
                'Natural Toner'
            ],
            specifications: {
                'Net Qty': '100ml',
                'Fragrance': 'Rose'
            },
            offers: [],
            variants: [],
            seller: {
                name: 'Anjaneya Herbals',
                rating: 4.8
            }
        }
    };

    return products[id] || null;
};

export const getSimilarProducts = async (productId, category) => {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Return mock similar products based on category
    return [
        {
            id: '101',
            name: 'Organic Turmeric Powder',
            price: 299,
            originalPrice: 399,
            rating: 4.3,
            image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
            discount: 25
        },
        // Add more similar products...
    ];
};