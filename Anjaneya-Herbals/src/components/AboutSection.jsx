import React from 'react'

const AboutSection = () => {
  const LeafPattern = () => (
    <svg className="absolute -left-4 -top-4 w-24 h-24 text-green-100" viewBox="0 0 100 100">
      <path d="M50,20 C70,10 90,30 85,50 C80,70 60,85 40,80 C20,75 10,55 15,35 C20,15 40,5 60,15" 
        fill="none" stroke="currentColor" strokeWidth="1"/>
    </svg>
  )

  return (
    <section id="about" className="py-16 bg-gradient-to-b from-white to-yellow-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Image/Illustration Container */}
          <div className="lg:w-1/2 relative">
            <div className="relative">
              <div className="w-full h-64 md:h-96 bg-gradient-to-br from-green-50 to-yellow-50 rounded-3xl shadow-lg overflow-hidden">
                {/* Placeholder for product images */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-4 p-8">
                    <div className="bg-white rounded-xl p-4 shadow-md transform rotate-3">
                      <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-3"></div>
                      <div className="h-2 bg-green-200 rounded w-20 mx-auto"></div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md transform -rotate-3">
                      <div className="w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-3"></div>
                      <div className="h-2 bg-yellow-200 rounded w-20 mx-auto"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <LeafPattern />
              <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-orange-100 rounded-full opacity-50"></div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:w-1/2">
            <div className="relative">
              <span className="text-green-600 font-semibold mb-2 block">
                Our Heritage
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                About Anjaneya Herbals
              </h2>
              
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                Founded with a deep respect for Ayurveda and traditional Indian wisdom, 
                Anjaneya Herbals brings centuries-old herbal knowledge to modern households.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  </div>
                  <p className="text-gray-700">
                    <span className="font-semibold">Rooted in Tradition:</span> Our formulations are based on authentic Ayurvedic texts from ancient India.
                  </p>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                  </div>
                  <p className="text-gray-700">
                    <span className="font-semibold">Modern Quality Standards:</span> Traditional knowledge meets contemporary quality control and packaging.
                  </p>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                  </div>
                  <p className="text-gray-700">
                    <span className="font-semibold">Family Values:</span> A family-owned enterprise committed to ethical sourcing and community welfare.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="bg-green-50 rounded-xl p-4 flex-1 min-w-[150px]">
                  <div className="text-2xl font-bold text-green-700">25+</div>
                  <div className="text-sm text-gray-600">Years Experience</div>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4 flex-1 min-w-[150px]">
                  <div className="text-2xl font-bold text-yellow-700">50+</div>
                  <div className="text-sm text-gray-600">Products</div>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 flex-1 min-w-[150px]">
                  <div className="text-2xl font-bold text-orange-700">Andhra</div>
                  <div className="text-sm text-gray-600">Heritage</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection