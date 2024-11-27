import React from 'react';
import { Shield, BarChart2, DollarSign, Coffee } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

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
        <h2 className="text-2xl font-bold text-[#1a202c]">
          About restake.watch
        </h2>
        <p className="text-sm text-gray-600">
          The L2Beat of the Restaking Ecosystem
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <FeatureItem
            icon={<Shield className="w-5 h-5 text-green-500" />}
            title="Impartial Analysis"
            description="We offer neutral, fact-based interpretations of data points, helping users understand the complexities of restaking protocols."
          />
          <FeatureItem
            icon={<BarChart2 className="w-5 h-5 text-purple-500" />}
            title="Beyond Basic Metrics"
            description="Our analyses go beyond TVL to include metrics on security, decentralization, and overall health of restaking projects."
          />
          <FeatureItem
            icon={<DollarSign className="w-5 h-5 text-orange-500" />}
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
