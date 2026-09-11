import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import herbalTeaImage from '../assets/hero-herbal-tea.webp';
import turmericImage from '../assets/hero-turmeric.webp';
import dryFruitsImage from '../assets/hero-dry-fruits.webp';

const slides = [
  {
    id: 1,
    image: herbalTeaImage,
    title: "Botanical Wellness",
    subtitle: "Thoughtfully selected herbs inspired by time-honoured Indian wellness traditions.",
    cta: "Explore Wellness",
    link: "/category/health-wellness",
    position: "52% center"
  },
  {
    id: 2,
    image: turmericImage,
    title: "Traditional Herbal Care",
    subtitle: "Pure turmeric and botanical blends prepared for simple everyday rituals.",
    cta: "Explore Herbs",
    link: "/products",
    position: "62% center"
  },
  {
    id: 3,
    image: dryFruitsImage,
    title: "Premium Dry Fruits",
    subtitle: "A colourful selection of nuts and dried fruits chosen for freshness and quality.",
    cta: "Shop Dry Fruits",
    link: "/category/dry-fruits",
    position: "center"
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

  return (
    <div className="relative w-full min-h-[560px] h-[78svh] sm:h-[82vh] overflow-hidden bg-brand-black pt-16">
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
            width="1600"
            height="1000"
            loading={current === 0 ? "eager" : "lazy"}
            fetchPriority={current === 0 ? "high" : "auto"}
            decoding="async"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 6, ease: "easeOut" }}
            className="w-full h-full object-cover opacity-80"
            style={{ objectPosition: slides[current].position }}
          />
          
          {/* Cinematic Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-brand-black/40 to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-5 pt-16 pb-20 z-10">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
            >
                <h2 className="text-brand-yellow tracking-[0.2em] font-sans text-xs md:text-sm uppercase mb-4">
                    Royal Ayurveda
                </h2>
                <h1 className="text-[clamp(2.6rem,12vw,5.5rem)] font-serif font-medium mb-5 text-brand-cream drop-shadow-2xl leading-[0.96] max-w-5xl">
                {slides[current].title}
                </h1>
            </motion.div>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 0.9 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="text-sm sm:text-lg md:text-xl mb-8 max-w-xl text-gray-100 font-light font-sans leading-relaxed px-2"
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
