'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface Backer {
  id: number;
  name: string;
  logo: string;
  description?: string;
}

interface BackersCarouselProps {
  backers: Backer[];
  autoplay?: boolean;
  interval?: number;
}

const BackersCarousel: React.FC<BackersCarouselProps> = ({
  backers,
  autoplay = true,
  interval = 3000,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (autoplay) {
      timerRef.current = setInterval(() => {
        setActiveIndex((current) => (current + 1) % backers.length);
      }, interval);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [autoplay, backers.length, interval]);

  const goToSlide = (index: number) => {
    setActiveIndex(index);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setActiveIndex((current) => (current + 1) % backers.length);
      }, interval);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 shadow-sm">
      {/* Header with title */}
      <div className="p-2 border-b border-indigo-100">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center">
          <span className="inline-block w-1 h-4 bg-gradient-to-b from-purple-500 to-indigo-600 rounded-sm mr-1.5"></span>
          Backed By Industry Leaders
        </h3>
      </div>

      {/* Carousel container */}
      <div className="relative h-24 md:h-28 overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {backers.map((backer) => (
            <div
              key={backer.id}
              className="min-w-full flex items-center p-2 md:p-3"
            >
              <div className="flex items-center justify-center w-16 md:w-20 flex-shrink-0">
                <div className="relative h-10 w-10 md:h-12 md:w-12 transform transition-transform duration-300 hover:scale-110">
                  <Image
                    src={backer.logo}
                    alt={backer.name}
                    fill
                    className="object-contain drop-shadow-sm"
                    sizes="(max-width: 768px) 40px, 48px"
                    priority
                  />
                </div>
              </div>
              <div className="flex-1 pl-2 md:pl-3">
                <h4 className="font-medium text-xs md:text-sm text-gray-900 mb-0.5">
                  {backer.name}
                </h4>
                {backer.description && (
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {backer.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Indicators */}
      <div className="flex justify-center p-1.5 space-x-1.5">
        {backers.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              index === activeIndex
                ? 'bg-purple-500 w-3'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Subtle animation decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-10 bg-gradient-to-br from-purple-400 to-transparent rounded-full transform translate-x-12 -translate-y-12"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 opacity-10 bg-gradient-to-tr from-indigo-400 to-transparent rounded-full transform -translate-x-8 translate-y-8"></div>
    </div>
  );
};

export default BackersCarousel;
