// src/components/ProductShowcase.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, Zap } from 'lucide-react';

const ProductShowcase = () => {
  // Example product data - REPLACE with your actual products
  const featuredProducts = [
    {
      id: 1,
      name: 'Organic Ashwagandha Powder',
      benefit: 'Reduces Stress & Improves Sleep',
      category: 'Herbal Supplements',
      imageColor: 'from-yellow-100 to-amber-100', // Tailwind gradient for placeholder
      price: 499,
      originalPrice: 649,
      rating: 4.8,
      isBestSeller: true,
      tag: 'BEST SELLER'
    },
    {
      id: 2,
      name: 'Premium Chyawanprash (500g)',
      benefit: 'Boosts Immunity & Energy',
      category: 'Ayurvedic Formulations',
      imageColor: 'from-orange-100 to-red-100',
      price: 399,
      originalPrice: 499,
      rating: 4.9,
      isNew: true,
      tag: 'NEW'
    },
    {
      id: 3,
      name: 'Almonds (California, 500g)',
      benefit: 'Rich in Protein & Vitamin E',
      category: 'Dry Fruits & Nuts',
      imageColor: 'from-amber-50 to-yellow-50',
      price: 589,
      originalPrice: null, // No original price = not on sale
      rating: 4.7,
      tag: 'POPULAR'
    },
    {
      id: 4,
      name: 'Moringa Leaf Capsules',
      benefit: 'High Antioxidants & Nutrition',
      category: 'Wellness Essentials',
      imageColor: 'from-green-100 to-emerald-100',
      price: 299,
      originalPrice: 349,
      rating: 4.5,
      tag: 'TRENDING'
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <section id="products" className="py-16 bg-gradient-to-b from-white to-gray-50/50">
      <div className="container mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Zap className="w-4 h-4" />
            Customer Favorites
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Shop <span className="gradient-text">Best Sellers</span>
          </h2>
          <p className="text-gray-600 text-lg">Most loved Ayurvedic products & dry fruits, chosen by thousands.</p>
        </div>

        {/* Product Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {featuredProducts.map((product) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300"
            >
              {/* Product Tag */}
              {product.tag && (
                <div className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs font-bold text-white ${product.tag === 'BEST SELLER' ? 'bg-orange-500' :
                  product.tag === 'NEW' ? 'bg-green-500' : 'bg-purple-500'
                  }`}>
                  {product.tag}
                </div>
              )}

              {/* Product Image Placeholder */}
              <div className={`h-56 w-full bg-gradient-to-br ${product.imageColor} flex items-center justify-center relative overflow-hidden`}>
                {/* Replace this div with an actual <img> tag for your product photos */}
                <div className="text-5xl opacity-20 group-hover:scale-110 transition-transform duration-500">
                  🌿
                </div>
              </div>

              {/* Product Details */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                    {product.category}
                  </span>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium ml-1">{product.rating}</span>
                  </div>
                </div>

                <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-green-700 transition-colors">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{product.benefit}</p>

                {/* Price & CTA */}
                <div className="flex items-center justify-between mt-6">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
                    {product.originalPrice && (
                      <>
                        <span className="text-sm text-gray-400 line-through ml-2">₹{product.originalPrice}</span>
                        <span className="text-xs font-bold text-green-600 ml-2">
                          Save ₹{product.originalPrice - product.price}
                        </span>
                      </>
                    )}
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-yellow-500 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group/btn"
                  >
                    <ShoppingBag className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Category Navigation */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <h3 className="text-center text-2xl font-bold text-gray-800 mb-8">Shop by Wellness Goals</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {['Immunity Boosters', 'Digestion & Gut Health', 'Stress & Sleep', 'Hair & Skin Care', 'Energy & Vitality', 'Daily Nutrition'].map((goal) => (
              <a
                key={goal}
                href="#"
                className="px-6 py-3 bg-white border-2 border-gray-200 rounded-full text-gray-700 font-medium hover:border-green-400 hover:bg-green-50 hover:text-green-700 transition-all duration-300"
              >
                {goal}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;