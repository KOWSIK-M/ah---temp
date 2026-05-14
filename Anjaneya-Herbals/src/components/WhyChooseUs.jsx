import React from 'react'

const WhyChooseUs = () => {
  const AyurvedicSymbol = () => (
    <svg className="w-64 h-64 text-green-100 opacity-50" viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M100,30 C140,40 160,80 150,120 C140,160 100,170 60,160 C20,150 10,110 30,70 C50,30 90,20 100,30 Z" 
        fill="none" stroke="currentColor" strokeWidth="1"/>
      <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M100,70 L100,130 M70,100 L130,100" stroke="currentColor" strokeWidth="2"/>
    </svg>
  )

  const points = [
    {
      title: 'Traditional Wisdom',
      description: 'Formulations based on centuries of Ayurvedic knowledge'
    },
    {
      title: 'Ethical Sourcing',
      description: 'Direct partnerships with farmers across India'
    },
    {
      title: 'Purity Guarantee',
      description: 'No artificial additives, chemicals, or preservatives'
    },
    {
      title: 'Scientific Validation',
      description: 'Traditional methods validated by modern science'
    }
  ]

  return (
    <section id="why-us" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Why Choose Anjaneya Herbals
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            The perfect blend of tradition, purity, and modern wellness
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left Content */}
          <div className="lg:w-1/2">
            <div className="space-y-8">
              {points.map((point, index) => (
                <div 
                  key={index}
                  className="flex items-start group cursor-pointer transition-all duration-300 hover:bg-green-50 p-4 rounded-xl"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-6 flex-shrink-0 group-hover:bg-green-200 transition-colors">
                    <span className="text-green-700 font-bold text-lg">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-green-700 transition-colors">
                      {point.title}
                    </h3>
                    <p className="text-gray-600">
                      {point.description}
                    </p>
                  </div>
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-yellow-50 rounded-2xl border border-yellow-100">
              <h4 className="font-bold text-gray-800 mb-2">Our Promise</h4>
              <p className="text-gray-700">
                "We promise to deliver only authentic, pure, and effective Ayurvedic products, 
                just as nature intended and our ancestors practiced."
              </p>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="lg:w-1/2 relative">
            <div className="relative">
              <div className="bg-gradient-to-br from-green-50 to-yellow-50 rounded-3xl p-12 flex items-center justify-center">
                <AyurvedicSymbol />
                
                {/* Floating Elements */}
                <div className="absolute top-8 left-8 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
                      stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                
                <div className="absolute bottom-8 right-8 w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <svg className="w-10 h-10 text-yellow-600" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                      stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.2"/>
                  </svg>
                </div>
                
                <div className="absolute top-1/2 left-1/4 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" viewBox="0 0 24 24" fill="none">
                    <ellipse cx="12" cy="12" rx="8" ry="4" transform="rotate(45 12 12)" 
                      fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhyChooseUs