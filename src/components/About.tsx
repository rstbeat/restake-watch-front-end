import React from 'react';
import {
  Shield,
  BarChart2,
  DollarSign,
  Coffee,
  Phone,
  ExternalLink,
  FileText,
  Target,
  TrendingUp,
  Award,
  Calendar,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  <div className="flex items-start space-x-3 p-4 rounded-lg hover:bg-purple-50 transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex-shrink-0">{icon}</div>
    <div>
      <h3 className="text-md font-semibold text-[#1a202c]">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
);

// Publications component
const PublicationItem: React.FC<{
  title: string;
  authors: string;
  date: string;
  url: string;
}> = ({ title, authors, date, url }) => (
  <div className="p-4 border border-purple-100 rounded-md hover:bg-purple-50 transition-all duration-300 transform hover:-translate-y-1 hover:border-purple-300 hover:shadow-md">
    <a href={url} target="_blank" rel="noopener noreferrer" className="block">
      <h4 className="text-md font-semibold text-[#1a202c] flex items-center">
        {title}
        <ExternalLink className="ml-2 h-3 w-3 text-gray-400" />
      </h4>
      <div className="flex items-center mt-2 text-xs text-gray-500">
        <Calendar className="h-3 w-3 mr-1" />
        <span>{date}</span>
        <span className="mx-2">•</span>
        <span>By {authors}</span>
      </div>
    </a>
  </div>
);

const About: React.FC = () => {
  return (
    <Card className="mt-8 overflow-hidden border-none shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 pb-6">
        <div className="flex items-start sm:items-center flex-col sm:flex-row">
          <div className="mr-3 mb-3 sm:mb-0">
            <StyledIcon
              icon={<Coffee className="h-4 w-4" />}
              gradientColors={['#6366f1', '#8b5cf6']}
              size="h-12 w-12"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[#1a202c] mb-1">
              About restake.watch
            </h2>
            <p className="text-gray-600 max-w-2xl">
              The premier analytics platform for the restaking ecosystem,
              providing comprehensive monitoring and risk assessment of
              operators, restaking protocols, and AVSs.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0 pt-0">
        <Tabs defaultValue="mission" className="w-full">
          <TabsList className="w-full justify-start px-6 pt-2 bg-white border-b">
            <TabsTrigger
              value="mission"
              className="data-[state=active]:bg-purple-50"
            >
              Mission
            </TabsTrigger>
            <TabsTrigger
              value="features"
              className="data-[state=active]:bg-purple-50"
            >
              Features
            </TabsTrigger>
            <TabsTrigger
              value="publications"
              className="data-[state=active]:bg-purple-50"
            >
              Publications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mission" className="p-6 space-y-4">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-lg mb-6">
              <h3 className="text-xl font-semibold text-[#1a202c] mb-3 flex items-center">
                <StyledIcon
                  icon={<Target className="h-3 w-3" />}
                  gradientColors={['#8b5cf6', '#d946ef']}
                  size="h-7 w-7"
                />
                <span className="ml-2">Our Mission</span>
              </h3>
              <p className="text-gray-700 mb-3">
                Restake Watch is dedicated to bringing transparency to the
                restaking ecosystem by providing objective, data-driven analysis
                of restaking protocols, operators, and AVSs. We strive to be the
                trusted source of information for users navigating the
                complexities of restaking.
              </p>
              <p className="text-gray-700">
                As the restaking space evolves, our mission is to shine a light
                on critical metrics and risks that may otherwise go unnoticed,
                empowering users to make informed decisions and encouraging
                protocols to implement best practices.
              </p>
            </div>

            <div className="border-l-4 border-purple-300 pl-4 py-2 italic text-gray-600">
              "The restaking ecosystem is growing rapidly but lacks transparent,
              objective analysis. Restake Watch fills this critical gap with
              comprehensive monitoring and risk assessment."
            </div>

            <div className="flex flex-col md:flex-row gap-4 mt-6">
              <div className="flex-1 p-5 rounded-lg border border-gray-100 hover:border-purple-200 transition-all duration-300 hover:shadow-md">
                <h4 className="font-semibold text-[#1a202c] mb-2 flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-green-500" />
                  Our Values
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400 mt-1.5 mr-2 flex-shrink-0"></span>
                    <span>
                      <strong>Objectivity:</strong> We provide unbiased analysis
                      based solely on data and technical assessment
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400 mt-1.5 mr-2 flex-shrink-0"></span>
                    <span>
                      <strong>Transparency:</strong> Our methodologies are open
                      and we explain our reasoning
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400 mt-1.5 mr-2 flex-shrink-0"></span>
                    <span>
                      <strong>Independence:</strong> We remain independent from
                      the protocols we analyze
                    </span>
                  </li>
                </ul>
              </div>

              <div className="flex-1 p-5 rounded-lg border border-gray-100 hover:border-purple-200 transition-all duration-300 hover:shadow-md">
                <h4 className="font-semibold text-[#1a202c] mb-2 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
                  Our Impact
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400 mt-1.5 mr-2 flex-shrink-0"></span>
                    <span>
                      <strong>Prestigious Backing:</strong> Backed by grants
                      from the Ethereum Foundation (ESP) and Obol Collective
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400 mt-1.5 mr-2 flex-shrink-0"></span>
                    <span>
                      Helped users safeguard millions in assets through risk
                      identification
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400 mt-1.5 mr-2 flex-shrink-0"></span>
                    <span>
                      Prompted improvements in protocol transparency and risk
                      disclosures
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400 mt-1.5 mr-2 flex-shrink-0"></span>
                    <span>
                      Established industry standards for analyzing restaking
                      risks
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="features" className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureItem
                icon={
                  <StyledIcon
                    icon={<Shield className="h-3 w-3" />}
                    gradientColors={['#10b981', '#22c55e']}
                    size="h-8 w-8"
                  />
                }
                title="Impartial Risk Analysis"
                description="We offer neutral, fact-based interpretations of data points, helping users understand the complexities and risks of restaking protocols, operators, and AVSs."
              />
              <FeatureItem
                icon={
                  <StyledIcon
                    icon={<BarChart2 className="h-3 w-3" />}
                    gradientColors={['#8b5cf6', '#d946ef']}
                    size="h-8 w-8"
                  />
                }
                title="Comprehensive Metrics"
                description="Our analysis goes beyond TVL to include key metrics on security, decentralization, overall health, and specific vulnerabilities of restaking projects."
              />
              <FeatureItem
                icon={
                  <StyledIcon
                    icon={<Award className="h-3 w-3" />}
                    gradientColors={['#3b82f6', '#06b6d4']}
                    size="h-8 w-8"
                  />
                }
                title="Academic Rigor"
                description="Our methodologies are grounded in academic research and technical expertise, providing a solid foundation for our assessments and recommendations."
              />
              <FeatureItem
                icon={
                  <StyledIcon
                    icon={<DollarSign className="h-3 w-3" />}
                    gradientColors={['#f97316', '#eab308']}
                    size="h-8 w-8"
                  />
                }
                title="Ecosystem Support"
                description="Supported by an Ethereum Foundation grant, we're committed to enhancing monitoring capabilities and advancing best practices in the restaking ecosystem."
              />
            </div>

            <div className="mt-6 p-5 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
              <p className="text-gray-700">
                Restake Watch is committed to serving the best interests of
                users and the broader ecosystem, providing critical insights
                needed to navigate the evolving world of restaking. We
                continuously improve our methodologies and expand our coverage
                to ensure comprehensive analysis of this rapidly developing
                space.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="publications" id="publications" className="p-6">
            <h3 className="text-xl font-semibold text-[#1a202c] mb-4 flex items-center">
              <StyledIcon
                icon={<FileText className="h-3 w-3" />}
                gradientColors={['#3b82f6', '#06b6d4']}
                size="h-7 w-7"
              />
              <span className="ml-2">Team Publications</span>
            </h3>

            <div className="space-y-4">
              <PublicationItem
                title="Fortify or Falter: A Comprehensive Restaking Risk Assessment"
                authors="Omar Espejel"
                date="February 2025"
                url="https://hackmd.io/@espejelomar/H14XiPt51g"
              />
              <PublicationItem
                title="Mirroring Risks: Lessons from Mainstream Finance in the Restaking Framework"
                authors="Fabricio Mendoza, Omar Espejel"
                date="November 2024"
                url="https://drive.proton.me/urls/58SJCC8N3C#luXJeS5zVfAM"
              />
              <PublicationItem
                title="A Hitchhiker's Guide to Restaking and Its Risks"
                authors="Omar Espejel"
                date="July 2024"
                url="https://hackmd.io/@espejelomar/BkgcuG4MR"
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <div className="m-6 p-5 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg border border-purple-200">
          <h3 className="text-lg font-semibold text-[#1a202c] mb-3">
            Get in Touch
          </h3>
          <p className="text-sm text-gray-700 mb-4">
            Have additional information, insights, or concerns about restaking
            protocols? We're actively seeking funding and looking for
            whistleblowers or anyone with valuable knowledge to improve our
            monitoring.
          </p>
          <a
            href="https://signal.me/#eu/espejelomar.01"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-[#ab3bd2] text-white rounded-md hover:bg-[#922fb8] transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
          >
            Contact espejelomar.01 on Signal
            <ExternalLink className="ml-2 h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default About;
