import React, { useRef, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';

interface TimelineItemProps {
  date: string;
  title: string;
  description: string;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  date,
  title,
  description,
}) => (
  <div className="flex-shrink-0 w-64 mr-8">
    <div className="bg-white p-4 rounded-lg shadow-md h-full border-t-4 border-[#1a202c]">
      <time className="text-sm font-medium text-[#1a202c] mb-2 block">
        {date}
      </time>
      <h3 className="text-lg font-semibold text-[#1a202c] mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
);

const Roadmap: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = scrollRef.current;
    if (element) {
      const animateScroll = () => {
        const currentScroll = element.scrollLeft;
        const maxScroll = element.scrollWidth - element.clientWidth;
        if (currentScroll < maxScroll) {
          element.scrollTo(currentScroll + 1, 0);
        } else {
          element.scrollTo(0, 0);
        }
      };

      const intervalId = setInterval(animateScroll, 50);
      return () => clearInterval(intervalId);
    }
  }, []);

  return (
    <Card className="mt-8 overflow-hidden">
      <CardHeader>
        <h2 className="text-2xl font-bold text-[#1a202c]">Roadmap</h2>
        <p className="text-sm text-gray-600">
          Our upcoming milestones and features
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex overflow-x-auto py-4 px-6 scrollbar-hide"
          >
            <TimelineItem
              date="October 2024"
              title="Paper Launch"
              description="Launch of 'Mirroring Risks' paper and AVS information integration"
            />
            <TimelineItem
              date="November 2024"
              title="DVT and Withdraws Risk Metrics"
              description="Adding DVT risk metrics and withdrawal times for operators"
            />
            <TimelineItem
              date="December 2024"
              title="Liquidity & Staging"
              description="Liquidity measures metrics and staging system for operators and platforms"
            />
            <TimelineItem
              date="January 2024"
              title="Symbiotic Integration"
              description="Adding Symbiotic data to our platform"
            />
          </div>
          <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-white pointer-events-none"></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Roadmap;
