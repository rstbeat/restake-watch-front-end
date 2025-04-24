'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  // Since we only have two backers, we can simplify this component significantly
  // and just show both side by side without complicated carousel logic

  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 py-2 overflow-x-auto">
      {backers.map((backer) => (
        <div
          key={backer.id}
          className="w-full sm:w-1/2 bg-white/60 rounded-md p-2 sm:p-3 shadow-sm hover:shadow transition-all duration-300"
        >
          <div className="flex items-center">
            <div className="relative h-6 w-6 sm:h-8 sm:w-8 mr-2 flex-shrink-0">
              <Image
                src={backer.logo}
                alt={backer.name}
                fill
                className="object-contain"
                sizes="(max-width: 640px) 24px, 32px"
                priority
              />
            </div>
            <div>
              <h3 className="font-medium text-[#ab3bd2] text-xs sm:text-sm">
                {backer.name}
              </h3>
              <p className="text-xs text-gray-600 line-clamp-2 sm:line-clamp-1">
                {backer.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BackersCarousel;
