import React from 'react';
import {
  Shield,
  BarChart2,
  DollarSign,
  ExternalLink,
  FileText,
  Target,
  Award,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Add the StyledIcon component
const StyledIcon: React.FC<{
  icon: React.ReactNode;
  gradientColors: string[];
  size?: string;
}> = ({ icon, gradientColors, size = 'h-6 w-6' }) => {
  return (
    <div
      className={`flex items-center justify-center rounded-full p-2 ${size}`}
      style={{
        background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
        boxShadow: `0 2px 6px rgba(0, 0, 0, 0.08)`,
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
  <div className="flex items-start space-x-3 p-3">
    <div className="flex-shrink-0">{icon}</div>
    <div>
      <h3 className="text-sm font-semibold text-[#1a202c]">{title}</h3>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
  </div>
);

const About: React.FC = () => {
  return (
    <Card className="mt-6 overflow-hidden border-none shadow-md">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 py-4">
        <div className="flex items-center">
          <StyledIcon
            icon={<Target className="h-4 w-4" />}
            gradientColors={['#6366f1', '#8b5cf6']}
            size="h-10 w-10"
          />
          <div className="ml-3">
            <h2 className="text-xl font-bold text-[#1a202c]">
              About restake.watch
            </h2>
            <p className="text-sm text-gray-600">
              The analytics platform for the restaking ecosystem.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0 pt-0">
        <Tabs defaultValue="mission" className="w-full">
          <TabsList className="w-full justify-start px-4 pt-1 bg-white border-b">
            <TabsTrigger
              value="mission"
              className="text-sm data-[state=active]:bg-purple-50"
            >
              Mission
            </TabsTrigger>
            <TabsTrigger
              value="features"
              className="text-sm data-[state=active]:bg-purple-50"
            >
              Features
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mission" className="p-4">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg mb-3">
              <p className="text-sm text-gray-700">
                Restake Watch brings transparency to the restaking ecosystem
                through objective, data-driven analysis of protocols, operators,
                and AVSs. We strive to be the trusted source of information for
                users navigating restaking complexities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-gray-100">
                <h4 className="text-sm font-semibold text-[#1a202c] mb-1 flex items-center">
                  <Shield className="h-3 w-3 mr-1 text-green-500" />
                  Our Values
                </h4>
                <ul className="space-y-1 text-xs text-gray-600">
                  <li className="flex items-start">
                    <span className="h-1 w-1 rounded-full bg-purple-400 mt-1.5 mr-1.5 flex-shrink-0"></span>
                    <span>
                      <strong>Objectivity:</strong> Unbiased analysis based on
                      data
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="h-1 w-1 rounded-full bg-purple-400 mt-1.5 mr-1.5 flex-shrink-0"></span>
                    <span>
                      <strong>Transparency:</strong> Open methodologies
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="h-1 w-1 rounded-full bg-purple-400 mt-1.5 mr-1.5 flex-shrink-0"></span>
                    <span>
                      <strong>Independence:</strong> Independent from analyzed
                      protocols
                    </span>
                  </li>
                </ul>
              </div>

              <div className="p-3 rounded-lg border border-gray-100">
                <h4 className="text-sm font-semibold text-[#1a202c] mb-1 flex items-center">
                  <Award className="h-3 w-3 mr-1 text-blue-500" />
                  Our Impact
                </h4>
                <ul className="space-y-1 text-xs text-gray-600">
                  <li className="flex items-start">
                    <span className="h-1 w-1 rounded-full bg-purple-400 mt-1.5 mr-1.5 flex-shrink-0"></span>
                    <span>
                      Backed by Ethereum Foundation (ESP) and Obol Collective
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="h-1 w-1 rounded-full bg-purple-400 mt-1.5 mr-1.5 flex-shrink-0"></span>
                    <span>Helped safeguard millions in assets</span>
                  </li>
                  <li className="flex items-start">
                    <span className="h-1 w-1 rounded-full bg-purple-400 mt-1.5 mr-1.5 flex-shrink-0"></span>
                    <span>
                      Established standards for analyzing restaking risks
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="features" className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <FeatureItem
                icon={
                  <StyledIcon
                    icon={<Shield className="h-3 w-3" />}
                    gradientColors={['#10b981', '#22c55e']}
                    size="h-6 w-6"
                  />
                }
                title="Impartial Risk Analysis"
                description="Neutral, fact-based interpretations of data to understand restaking risks."
              />
              <FeatureItem
                icon={
                  <StyledIcon
                    icon={<BarChart2 className="h-3 w-3" />}
                    gradientColors={['#8b5cf6', '#d946ef']}
                    size="h-6 w-6"
                  />
                }
                title="Comprehensive Metrics"
                description="Analysis of security, decentralization, and health of restaking projects."
              />
              <FeatureItem
                icon={
                  <StyledIcon
                    icon={<Award className="h-3 w-3" />}
                    gradientColors={['#3b82f6', '#06b6d4']}
                    size="h-6 w-6"
                  />
                }
                title="Academic Rigor"
                description="Methodologies grounded in research and technical expertise."
              />
              <FeatureItem
                icon={
                  <StyledIcon
                    icon={<DollarSign className="h-3 w-3" />}
                    gradientColors={['#f97316', '#eab308']}
                    size="h-6 w-6"
                  />
                }
                title="Ecosystem Support"
                description="Committed to enhancing monitoring and best practices in restaking."
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Contact CTA */}
        <div className="mx-4 mb-4 p-3 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg border border-purple-200">
          <div className="flex items-center">
            <div className="flex-grow">
              <h3 className="text-sm font-semibold text-[#1a202c]">
                Have information or insights?
              </h3>
              <p className="text-xs text-gray-700">
                We're seeking funding and valuable knowledge to improve our
                monitoring.
              </p>
            </div>
            <a
              href="https://signal.me/#eu/espejelomar.01"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 bg-[#ab3bd2] text-white text-xs rounded-md hover:bg-[#922fb8] transition-colors shadow-sm"
            >
              Contact on Signal
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default About;
