import { useEffect, useState } from 'react';

export const useScrollAnimation = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll('[data-animate]');
      
      elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const isInView = (
          rect.top <= window.innerHeight * (1 - threshold) &&
          rect.bottom >= window.innerHeight * threshold
        );
        
        if (isInView) {
          element.classList.add('animate-slide-up');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return { isVisible, hasAnimated };
};