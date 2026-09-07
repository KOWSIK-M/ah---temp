import React from 'react'

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

const CTABanner = () => {
  return (
    <section className="botanical-section py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-brand-moss via-[#315b45] to-brand-olive rounded-[2rem] p-6 sm:p-9 md:p-12 relative overflow-hidden shadow-[0_24px_70px_rgba(30,58,47,.22)]">
          {/* Background Decorations */}
          <LeafDecoration />
          <NutDecoration />
          
          <div className="relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-brand-yellow">From Andhra Pradesh, with care</p>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight">
                Bringing Ayurveda to Every Indian Home
              </h2>
              <p className="text-white/85 text-sm sm:text-lg mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
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
              
              <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                {[
                  { label: 'Free Shipping', value: 'Above ₹999' },
                  { label: 'Easy Returns', value: '7 Days' },
                  { label: 'Secure Payment', value: '100% Safe' },
                  { label: 'Support', value: '24/7' }
                ].map((item, index) => (
                  <div key={index} className="rounded-2xl border border-white/15 bg-white/10 p-3 text-white backdrop-blur-sm">
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
