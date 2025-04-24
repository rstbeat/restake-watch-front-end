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
    <div className="flex flex-wrap sm:flex-nowrap gap-3 py-2">
      {backers.map((backer) => (
        <div
          key={backer.id}
          className="w-full sm:w-1/2 bg-white/60 rounded-md p-3 shadow-sm hover:shadow transition-all duration-300"
        >
          <div className="flex items-center">
            <div className="relative h-8 w-8 mr-2 flex-shrink-0">
              <Image
                src={backer.logo}
                alt={backer.name}
                fill
                className="object-contain"
                sizes="32px"
                priority
              />
            </div>
            <div>
              <h3 className="font-medium text-[#ab3bd2] text-sm">
                {backer.name}
              </h3>
              <p className="text-xs text-gray-600 line-clamp-1">
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
