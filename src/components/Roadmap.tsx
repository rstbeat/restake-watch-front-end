import React, { useRef, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { ChevronRight, CheckCircle, ExternalLink } from 'lucide-react';

// Add the StyledIcon component
const SmallStyledIcon: React.FC<{
  icon: React.ReactNode;
  gradientColors: string[];
}> = ({ icon, gradientColors }) => {
  return (
    <div
      className="flex items-center justify-center rounded-full p-1.5 h-6 w-6 shrink-0"
      style={{
        background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
        boxShadow: `0 2px 4px rgba(0, 0, 0, 0.1)`,
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
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  date,
  title,
  description,
  completed = false,
  link,
  highlighted = false,
}) => (
  <div className="flex-shrink-0 w-64 mr-8">
    <div
      className={`bg-white p-4 rounded-lg shadow-md h-full border-t-4 ${
        completed
          ? 'border-green-600'
          : highlighted
            ? 'border-purple-600'
            : 'border-[#1a202c]'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <time className="text-sm font-medium text-[#1a202c] block">{date}</time>
        {completed && (
          <SmallStyledIcon
            icon={<CheckCircle className="h-3 w-3" />}
            gradientColors={['#10b981', '#22c55e']}
          />
        )}
      </div>
      <h3 className="text-lg font-semibold text-[#1a202c] mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          View Paper <ExternalLink className="ml-1 h-3 w-3" />
        </a>
      )}
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
        <h2 className="text-2xl font-bold text-[#1a202c]">
          EigenLayer Metrics Roadmap
        </h2>
        <p className="text-sm text-gray-600">
          Our upcoming milestones and metrics implementation for the EigenLayer
          ecosystem
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex overflow-x-auto py-4 px-6 scrollbar-hide"
          >
            <TimelineItem
              date="March 2025"
              title="Fortify or Falter Paper"
              description="Release of research paper with metrics design for the restaking ecosystem"
              completed={true}
              link="https://hackmd.io/eYiQLgHhS428QQD28_ObaQ"
            />
            <TimelineItem
              date="March 2025"
              title="ECI Implementation"
              description="Launch of Exposure Concentration Index (ECI) metric for EigenLayer"
              completed={true}
            />
            <TimelineItem
              date="March 2025"
              title="WCI Implementation"
              description="Launch of Whitelisting Concentration Index (WCI) metric for EigenLayer"
            />
            <TimelineItem
              date="April 2025"
              title="GBP Implementation"
              description="Launch of Governance Bribery Potential (GBP) metric for EigenLayer"
            />
            <TimelineItem
              date="April 2025"
              title="CAPVAR Implementation"
              description="Launch of Cross-Asset Price & Volatile Asset Risk (CAPVAR) metric for EigenLayer"
            />
            <TimelineItem
              date="April 2025"
              title="CF Implementation"
              description="Launch of Contagion Factor (CF) metric for EigenLayer"
            />
            <TimelineItem
              date="May 2025"
              title="Symbiotic Data"
              description="Integration of symbiotic operator, restakers, and network concentration data - a particularly interesting expansion"
              highlighted={true}
            />
          </div>
          <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-white pointer-events-none"></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Roadmap;
