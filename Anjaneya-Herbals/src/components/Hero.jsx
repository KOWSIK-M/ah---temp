import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80", // Spices/Turmeric
    title: "Pure & Authentic Spices",
    subtitle: "Experience the true essence of nature with our premium hand-ground spices.",
    cta: "Shop Spices",
    link: "/category/spices"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80", // Herbal Powders
    title: "Traditional Herbal Powders",
    subtitle: "Ancient Ayurvedic wisdom for your daily wellness journey.",
    cta: "Explore Herbs",
    link: "/category/herbal-powders"
  }
];

const Hero = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000); // Slower, more relaxed interval
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  return (
    <div className="relative w-full h-[85vh] overflow-hidden bg-brand-black">
      <AnimatePresence mode='wait'>
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Subtle Zoom/Ken Burns Effect */}
          <motion.img
            src={slides[current].image}
            alt={slides[current].title}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 6, ease: "easeOut" }}
            className="w-full h-full object-cover opacity-80"
          />
          
          {/* Cinematic Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-brand-black/40 to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4 z-10">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
            >
                <h2 className="text-brand-yellow tracking-[0.2em] font-sans text-xs md:text-sm uppercase mb-4">
                    Royal Ayurveda
                </h2>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium mb-6 text-brand-cream drop-shadow-2xl px-4 leading-tight">
                {slides[current].title}
                </h1>
            </motion.div>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 0.9 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="text-lg md:text-2xl mb-10 max-w-xl text-gray-200 font-light font-sans tracking-wide px-6"
            >
              {slides[current].subtitle}
            </motion.p>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
            >
               <a 
                 href={slides[current].link}
                 className="group relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-medium tracking-tighter text-white bg-transparent border border-brand-yellow rounded-none transition-all duration-300 hover:bg-brand-yellow hover:text-brand-black"
               >
                 <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-brand-yellow rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
                 <span className="relative uppercase tracking-widest text-sm">{slides[current].cta}</span>
               </a>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Minimal Controls */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-4 z-20">
        {slides.map((_, index) => (
            <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`w-12 h-1 transition-all duration-500 ${current === index ? 'bg-brand-yellow' : 'bg-white/20 hover:bg-white/40'}`}
            />
        ))}
      </div>
    </div>
  );
};

export default Hero;