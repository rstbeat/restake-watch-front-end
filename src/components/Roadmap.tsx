import React, { useRef, useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import {
  ChevronRight,
  CheckCircle,
  ExternalLink,
  ChevronLeft,
} from 'lucide-react';

// Styled icon component with gradient background
const SmallStyledIcon: React.FC<{
  icon: React.ReactNode;
  gradientColors: string[];
  size?: string;
}> = ({ icon, gradientColors, size = 'h-6 w-6' }) => {
  return (
    <div
      className={`flex items-center justify-center rounded-full p-1.5 shrink-0 ${size}`}
      style={{
        background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
        boxShadow: `0 2px 8px rgba(0, 0, 0, 0.15)`,
      }}
    >
      <div className="text-white">{icon}</div>
    </div>
  );
};

interface TimelineItemProps {
  date: string;
  title: string;
  description: string;
  completed?: boolean;
  link?: string;
  highlighted?: boolean;
  index: number;
  activeIndex: number;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  date,
  title,
  description,
  completed = false,
  link,
  highlighted = false,
  index,
  activeIndex,
}) => {
  const isActive = index === activeIndex;

  return (
    <div
      className={`flex-shrink-0 w-72 transition-all duration-500 transform ${
        isActive ? 'scale-105 z-10' : 'scale-100 opacity-80'
      }`}
    >
      <div
        className={`backdrop-blur-md p-5 rounded-xl h-full transition-all duration-300
          ${
            completed
              ? 'bg-gradient-to-br from-green-50/90 to-emerald-50/90 border border-green-200/50 shadow-md hover:shadow-lg'
              : highlighted
                ? 'bg-gradient-to-br from-purple-50/90 to-indigo-50/90 border border-purple-200/50 shadow-md hover:shadow-lg'
                : 'bg-white/70 border border-gray-100/50 shadow-sm hover:shadow-md'
          } ${isActive ? 'shadow-lg' : ''}`}
      >
        <div className="absolute h-1 top-0 left-0 right-0 rounded-t-xl overflow-hidden">
          <div
            className={`h-full ${
              completed
                ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                : highlighted
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500'
                  : 'bg-gradient-to-r from-gray-400 to-gray-500'
            }`}
            style={{ width: '100%' }}
          />
        </div>

        <div className="flex justify-between items-start mb-3 mt-1">
          <time className="text-sm font-medium text-gray-700 px-2 py-0.5 rounded-full bg-white/60 backdrop-blur-sm border border-gray-100/40 shadow-sm">
            {date}
          </time>
          {completed && (
            <SmallStyledIcon
              icon={<CheckCircle className="h-3 w-3" />}
              gradientColors={['#10b981', '#22c55e']}
            />
          )}
        </div>

        <h3 className="text-lg font-semibold mb-2 text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>

        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 bg-white/60 px-3 py-1.5 rounded-full shadow-sm hover:shadow backdrop-blur-sm transition-all duration-200 border border-indigo-100/30"
          >
            View Paper <ExternalLink className="ml-1.5 h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
};

const Roadmap: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  const timelineItems = [
    {
      date: 'March 2025',
      title: 'Fortify or Falter Paper',
      description:
        'Release of research paper with metrics design for the restaking ecosystem',
      completed: true,
      link: 'https://hackmd.io/eYiQLgHhS428QQD28_ObaQ',
    },
    {
      date: 'March 2025',
      title: 'ECI Implementation',
      description:
        'Launch of Exposure Concentration Index (ECI) metric for EigenLayer',
      completed: true,
    },
    {
      date: 'March 2025',
      title: 'WCI Implementation',
      description:
        'Launch of Whitelisting Concentration Index (WCI) metric for EigenLayer',
      completed: true,
    },
    {
      date: 'April 2025',
      title: 'GBP Implementation',
      description:
        'Launch of Governance Bribery Potential (GBP) metric for EigenLayer',
      completed: true,
    },
    {
      date: 'May 2025',
      title: 'AVS Slashing Parameters',
      description:
        'Creation of slashing parameters for AVS metrics to monitor validator performance and security',
      completed: true,
    },
    {
      date: 'May 2025',
      title: 'Slashing Tracker X Bot',
      description:
        'Development of a Twitter bot to track and report slashing events in real-time',
      completed: true,
    },
    {
      date: 'June 2025',
      title: 'CAPVAR Implementation',
      description:
        'Launch of Cross-Asset Price & Volatile Asset Risk (CAPVAR) metric for EigenLayer',
    },
    {
      date: 'June 2025',
      title: 'CF Implementation',
      description: 'Launch of Contagion Factor (CF) metric for EigenLayer',
    },
    {
      date: 'June 2025',
      title: 'Symbiotic Data',
      description:
        'Integration of symbiotic operator, restakers, and network concentration data - a particularly interesting expansion',
      highlighted: true,
    },
  ];

  // Handle scrolling
  useEffect(() => {
    if (!autoScroll || isHovering) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % timelineItems.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [autoScroll, isHovering, timelineItems.length]);

  // Control scroll position based on active index
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const itemWidth = 288; // Width of each item (w-72) + margin
    const scrollPosition =
      activeIndex * itemWidth - element.clientWidth / 2 + itemWidth / 2;

    element.scrollTo({
      left: scrollPosition,
      behavior: 'smooth',
    });
  }, [activeIndex]);

  // Navigate to prev/next
  const handlePrev = () => {
    setActiveIndex(
      (prev) => (prev - 1 + timelineItems.length) % timelineItems.length,
    );
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % timelineItems.length);
  };

  return (
    <Card className="mt-8 overflow-hidden" glassEffect="medium">
      <CardHeader className="relative pb-0">
        <div className="absolute inset-0 opacity-5 overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500"></div>
          <div className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500"></div>
        </div>

        <div className="relative">
          <div className="flex items-center mb-1">
            <SmallStyledIcon
              icon={<ChevronRight className="h-3 w-3" />}
              gradientColors={['#7c3aed', '#6366f1']}
              size="h-7 w-7"
            />
            <h2 className="text-2xl font-bold text-gray-900 ml-2">
              EigenLayer Metrics Roadmap
            </h2>
          </div>
          <p className="text-sm text-gray-600 ml-9">
            Our upcoming milestones and metrics implementation for the
            EigenLayer ecosystem
          </p>

          {/* Indicator dots */}
          <div className="flex space-x-1 mt-4 ml-9">
            {timelineItems.map((_, idx) => (
              <button
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === activeIndex
                    ? 'w-6 bg-purple-500'
                    : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                }`}
                onClick={() => setActiveIndex(idx)}
                aria-label={`Go to milestone ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 mt-3">
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex overflow-x-auto py-6 px-8 scrollbar-hide"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="flex space-x-4">
              {timelineItems.map((item, idx) => (
                <TimelineItem
                  key={idx}
                  date={item.date}
                  title={item.title}
                  description={item.description}
                  completed={item.completed}
                  link={item.link}
                  highlighted={item.highlighted}
                  index={idx}
                  activeIndex={activeIndex}
                />
              ))}
            </div>
          </div>

          {/* Navigation controls */}
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:shadow-lg hover:bg-white/90 transition-all duration-200 border border-gray-200/50 z-20"
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:shadow-lg hover:bg-white/90 transition-all duration-200 border border-gray-200/50 z-20"
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
          </button>

          {/* Gradient fades */}
          <div className="absolute top-0 left-0 bottom-0 w-16 bg-gradient-to-r from-white via-white/90 to-transparent pointer-events-none z-10"></div>
          <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-white via-white/90 to-transparent pointer-events-none z-10"></div>

          {/* Progress bar */}
          <div className="h-1 bg-gray-100 mx-8 mt-1 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
              style={{
                width: `${(activeIndex / (timelineItems.length - 1)) * 100}%`,
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Roadmap;
