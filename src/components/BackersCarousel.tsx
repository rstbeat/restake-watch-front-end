'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Backer {
  id: string;
  name: string;
  logo: string;
  description: string;
}

interface BackersCarouselProps {
  backers: Backer[];
}

const BackersCarousel: React.FC<BackersCarouselProps> = ({ backers }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const autoplayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = () => {
    setActiveIndex((current) => (current + 1) % backers.length);
  };

  const prevSlide = () => {
    setActiveIndex(
      (current) => (current - 1 + backers.length) % backers.length,
    );
  };

  const goToSlide = (index: number) => {
    setActiveIndex(index);
    if (autoplayIntervalRef.current) {
      clearInterval(autoplayIntervalRef.current);
      autoplayIntervalRef.current = setInterval(nextSlide, 5000);
    }
  };

  useEffect(() => {
    if (autoplay) {
      autoplayIntervalRef.current = setInterval(nextSlide, 5000);
    }

    return () => {
      if (autoplayIntervalRef.current) {
        clearInterval(autoplayIntervalRef.current);
      }
    };
  }, [autoplay, backers.length, nextSlide]);

  const handleMouseEnter = () => {
    setAutoplay(false);
    if (autoplayIntervalRef.current) {
      clearInterval(autoplayIntervalRef.current);
      autoplayIntervalRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    setAutoplay(true);
    if (!autoplayIntervalRef.current) {
      autoplayIntervalRef.current = setInterval(nextSlide, 5000);
    }
  };

  return (
    <div
      className="relative rounded-xl overflow-hidden backdrop-blur-md bg-white/60 border border-purple-100/50 shadow-md hover:shadow-lg transition-all duration-300"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="carousel-container h-[80px] md:h-[80px] px-2 sm:px-6 flex items-center">
        <button
          onClick={prevSlide}
          className="absolute left-0 sm:left-1 z-10 p-1 rounded-full bg-white/70 backdrop-blur-sm border border-purple-100/30 shadow-sm hover:bg-white/90 transition-all duration-200"
          aria-label="Previous slide"
        >
          <ChevronLeft size={16} className="text-purple-700" />
        </button>

        <div className="flex-1 overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {backers.map((backer) => (
              <div
                key={backer.id}
                className="min-w-full flex items-center justify-center px-2 sm:px-4"
              >
                <div className="flex items-center max-w-full">
                  <div className="relative h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 flex-shrink-0">
                    <Image
                      src={backer.logo}
                      alt={backer.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 640px) 24px, 32px"
                    />
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-semibold text-purple-900 text-xs sm:text-sm truncate">
                      {backer.name}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-1 sm:line-clamp-2">
                      {backer.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={nextSlide}
          className="absolute right-0 sm:right-1 z-10 p-1 rounded-full bg-white/70 backdrop-blur-sm border border-purple-100/30 shadow-sm hover:bg-white/90 transition-all duration-200"
          aria-label="Next slide"
        >
          <ChevronRight size={16} className="text-purple-700" />
        </button>
      </div>

      <div className="absolute bottom-1 sm:bottom-2 left-0 right-0 flex justify-center space-x-1">
        {backers.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${
              index === activeIndex
                ? 'w-3 sm:w-4 bg-purple-500'
                : 'w-1 sm:w-1.5 bg-purple-200 hover:bg-purple-300'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default BackersCarousel;
