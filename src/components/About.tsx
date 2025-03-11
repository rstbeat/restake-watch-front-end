import React from 'react';
import { Shield, BarChart2, DollarSign, Coffee } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

// Add the StyledIcon component
const StyledIcon: React.FC<{
  icon: React.ReactNode;
  gradientColors: string[];
  size?: string;
}> = ({ icon, gradientColors, size = 'h-6 w-6' }) => {
  return (
    <div
      className={`flex items-center justify-center rounded-full p-3 ${size}`}
      style={{
        background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
        boxShadow: `0 4px 10px rgba(0, 0, 0, 0.08)`,
      }}
    >
      <div className="text-white">{icon}</div>
    </div>
  );
};

const FeatureItem: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <div className="flex items-start space-x-3">
    <div className="flex-shrink-0">{icon}</div>
    <div>
      <h3 className="text-md font-semibold text-[#1a202c]">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
);

const About: React.FC = () => {
  return (
    <Card className="mt-8 overflow-hidden">
      <CardHeader>
        <h2 className="text-2xl font-bold text-[#1a202c] flex items-center">
          <div className="mr-3">
            <StyledIcon
              icon={<Coffee className="h-4 w-4" />}
              gradientColors={['#6366f1', '#8b5cf6']}
              size="h-9 w-9"
            />
          </div>
          About restake.watch
        </h2>
        <p className="text-sm text-gray-600">
          The L2Beat of the Restaking Ecosystem
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <FeatureItem
            icon={
              <StyledIcon
                icon={<Shield className="h-3 w-3" />}
                gradientColors={['#10b981', '#22c55e']}
                size="h-7 w-7"
              />
            }
            title="Impartial Analysis"
            description="We offer neutral, fact-based interpretations of data points, helping users understand the complexities of restaking protocols."
          />
          <FeatureItem
            icon={
              <StyledIcon
                icon={<BarChart2 className="h-3 w-3" />}
                gradientColors={['#8b5cf6', '#d946ef']}
                size="h-7 w-7"
              />
            }
            title="Beyond Basic Metrics"
            description="Our analyses go beyond TVL to include metrics on security, decentralization, and overall health of restaking projects."
          />
          <FeatureItem
            icon={
              <StyledIcon
                icon={<DollarSign className="h-3 w-3" />}
                gradientColors={['#f97316', '#eab308']}
                size="h-7 w-7"
              />
            }
            title="Ecosystem Support"
            description="Supported by an Ethereum Foundation grant 🙏, we're seeking additional funding to enhance our monitoring capabilities and advance the ecosystem."
          />
        </div>

        <p className="text-sm text-gray-700 mt-4">
          Restake Watch is committed to serving the best interests of users and
          the broader ecosystem, providing critical insights needed to navigate
          the evolving world of restaking.
        </p>
      </CardContent>
    </Card>
  );
};

export default About;
