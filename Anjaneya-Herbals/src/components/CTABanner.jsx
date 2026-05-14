import React from 'react'

const CTABanner = () => {
  const LeafDecoration = () => (
    <svg className="absolute -left-8 -top-8 w-32 h-32 text-white opacity-20" viewBox="0 0 100 100">
      <path d="M50,20 C70,10 90,30 85,50 C80,70 60,85 40,80 C20,75 10,55 15,35 C20,15 40,5 60,15" 
        fill="currentColor"/>
    </svg>
  )

  const NutDecoration = () => (
    <svg className="absolute -right-8 -bottom-8 w-24 h-24 text-white opacity-20" viewBox="0 0 100 100">
      <ellipse cx="50" cy="50" rx="30" ry="15" transform="rotate(45 50 50)" fill="currentColor"/>
    </svg>
  )

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-green-600 to-yellow-500 rounded-3xl p-8 md:p-12 relative overflow-hidden">
          {/* Background Decorations */}
          <LeafDecoration />
          <NutDecoration />
          
          <div className="relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Bringing Ayurveda to Every Indian Home
              </h2>
              <p className="text-white text-opacity-90 text-lg mb-10 max-w-2xl mx-auto">
                Join thousands of families who trust Anjaneya Herbals for their wellness journey. 
                Experience the purity of authentic Ayurveda.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a 
                  href="/products"
                  className="bg-white text-green-700 hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl w-full sm:w-auto text-center"
                >
                  Shop All Products
                </a>
                <a 
                  href="/contact"
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-green-700 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 w-full sm:w-auto text-center"
                >
                  Contact Us
                </a>
              </div>
              
              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'Free Shipping', value: 'Above ₹999' },
                  { label: 'Easy Returns', value: '7 Days' },
                  { label: 'Secure Payment', value: '100% Safe' },
                  { label: 'Support', value: '24/7' }
                ].map((item, index) => (
                  <div key={index} className="text-white">
                    <div className="text-2xl font-bold">{item.value}</div>
                    <div className="text-sm opacity-90">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTABanner