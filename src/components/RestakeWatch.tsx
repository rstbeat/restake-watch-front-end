import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  X,
  Twitter,
  ChevronRight,
  Phone,
  Menu,
  DollarSign,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import Sidebar from './Sidebar';
import OperatorOverview from './OperatorOverview';
import RestakerOverview from './RestakerOverview';
import StrategyOverview from './StrategyOverview';
import Overview from './Overview';
import Footer from './Footer';
import Roadmap from './Roadmap';
import About from './About';
import { OperatorDataResponse } from '../app/interface/operatorData.interface';
import { fetchStakerData, fetchOperatorData } from '../app/api/restake/restake';

type PlatformType = 'eigenlayer' | 'symbiotic' | 'karak';

const RestakeWatch: React.FC = () => {
  const [activePlatform, setActivePlatform] =
    useState<PlatformType>('eigenlayer');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const aboutRef = useRef<HTMLDivElement>(null);

  const [stakerData, setStakerData] = useState<any | null>(null);
  const [operatorData, setOperatorData] = useState<OperatorDataResponse | null>(
    null,
  );
  const [isLoadingStakerData, setIsLoadingStakerData] = useState(false);
  const [isLoadingOperatorData, setIsLoadingOperatorData] = useState(false);

  const [isSetModalOpen, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (aboutRef.current) {
        const rect = aboutRef.current.getBoundingClientRect();
        const isVisible = rect.top <= window.innerHeight && rect.bottom >= 0;
        aboutRef.current.style.opacity = isVisible ? '1' : '0';
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchStakerDataCallback = useCallback(async () => {
    if (activePlatform !== 'eigenlayer') return;
    try {
      setIsLoadingStakerData(true);
      const data = await fetchStakerData();
      setStakerData(data);
    } catch (error) {
      console.error('Error fetching staker data:', error);
    } finally {
      setIsLoadingStakerData(false);
    }
  }, [activePlatform]);

  const fetchOperatorDataCallback = useCallback(async () => {
    if (activePlatform !== 'eigenlayer') return;
    try {
      setIsLoadingOperatorData(true);
      const data = await fetchOperatorData();
      setOperatorData(data);
    } catch (error) {
      console.error('Error fetching operator data:', error);
    } finally {
      setIsLoadingOperatorData(false);
    }
  }, [activePlatform]);

  useEffect(() => {
    fetchStakerDataCallback();
    fetchOperatorDataCallback();
  }, [fetchStakerDataCallback, fetchOperatorDataCallback]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
    };
    return new Date(dateString).toLocaleString('en-US', options) + ' UTC';
  };

  const renderContent = () => {
    if (activePlatform !== 'eigenlayer') {
      return (
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-4 text-[#ab3bd2]">
            Coming Soon
          </h2>
          <p>
            Data for{' '}
            {activePlatform.charAt(0).toUpperCase() + activePlatform.slice(1)}{' '}
            is not yet available.
          </p>
        </div>
      );
    }

    return (
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="bg-white rounded-lg shadow-md">
          <TabsTrigger
            value="overview"
            className="text-[#000000] font-bold data-[state=active]:bg-[#ab3bd2] data-[state=active]:text-white"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="operators"
            className="text-[#000000] font-bold data-[state=active]:bg-[#ab3bd2] data-[state=active]:text-white"
          >
            Operators
          </TabsTrigger>
          <TabsTrigger
            value="restakers"
            className="text-[#000000] font-bold data-[state=active]:bg-[#ab3bd2] data-[state=active]:text-white"
          >
            Restakers
          </TabsTrigger>
          <TabsTrigger
            value="strategies"
            className="text-[#000000] font-bold data-[state=active]:bg-[#ab3bd2] data-[state=active]:text-white"
          >
            Strategies
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {Overview && <Overview restakeData={stakerData} />}
        </TabsContent>

        <TabsContent value="operators" className="space-y-6">
          {OperatorOverview && <OperatorOverview />}
        </TabsContent>

        <TabsContent value="restakers" className="space-y-6">
          {RestakerOverview && <RestakerOverview />}
        </TabsContent>

        <TabsContent value="strategies" className="space-y-6">
          {StrategyOverview && <StrategyOverview />}
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#e6e7ec] text-[#000000] font-bold">
      <div className="flex flex-1">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          setIsMobileOpen={setIsMobileSidebarOpen}
        >
          <Select
            value={activePlatform}
            onValueChange={(value: PlatformType) => setActivePlatform(value)}
          >
            <SelectTrigger className="w-full border-gray-300 bg-white text-[#000000] focus:border-[#ab3bd2]">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="eigenlayer">EigenLayer</SelectItem>
              <SelectItem value="symbiotic">Symbiotic</SelectItem>
              <SelectItem value="karak">Karak</SelectItem>
            </SelectContent>
          </Select>
        </Sidebar>

        <div className="flex-1 flex flex-col overflow-hidden md:ml-48">
          {showBanner && (
            <div className="bg-[#e6e7ec] text-gray-500 py-2 border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-gray-500" />
                  <span>
                    New paper release:{' '}
                    <Link
                      href="https://hackmd.io/@espejelomar/H14XiPt51g"
                      className="underline font-semibold hover:text-[#ab3bd2]"
                    >
                      Fortify or Falter: A Comprehensive Restaking Risk
                      Assessment
                    </Link>
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBanner(false)}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#e6e7ec] text-[#000000]">
            <div className="bg-[#e6e7ec] text-[#000000] py-4 border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center w-full justify-between">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl mb-0">
                      The L2Beat of the Restaking Ecosystem
                    </h1>
                  </div>
                  <div className="hidden lg:flex items-center space-x-4">
                    <div className="flex items-center px-3 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-md border border-purple-100">
                      <div className="flex items-center mr-2">
                        <div className="relative h-5 w-5 mr-1">
                          <Image
                            src="/ethereum-logo.png"
                            alt="Ethereum Foundation"
                            fill
                            className="object-contain"
                            sizes="20px"
                            priority
                          />
                        </div>
                        <div className="relative h-5 w-5">
                          <Image
                            src="/obol-logo.png"
                            alt="Obol Collective"
                            fill
                            className="object-contain"
                            sizes="20px"
                            priority
                          />
                        </div>
                      </div>
                      <span className="text-xs font-medium text-gray-800">
                        ESP &amp; Obol Backed
                      </span>
                    </div>
                    <a
                      href="https://twitter.com/therestakewatch"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#000000] hover:text-[#ab3bd2] transition-colors"
                      aria-label="Twitter"
                    >
                      <Twitter size={20} />
                    </a>
                    <a
                      href="https://signal.me/#eu/espejelomar.01"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#000000] hover:text-[#ab3bd2] transition-colors"
                      aria-label="Signal"
                    >
                      <Phone size={20} />
                    </a>
                    <a
                      href="https://signal.me/#eu/espejelomar.01"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 bg-purple-100 text-[#ab3bd2] hover:bg-purple-200 rounded-md transition-colors"
                    >
                      <DollarSign className="mr-1 h-4 w-4" /> Funding & Insights
                    </a>
                    <Button
                      size="sm"
                      className="bg-[#ab3bd2] text-white hover:bg-[#922fb8]"
                      onClick={() => {
                        const aboutSection = document.getElementById('about');
                        if (aboutSection) {
                          aboutSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    >
                      Learn More
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>

                  <div className="block md:hidden">
                    <div className="flex items-center space-x-2">
                      <a
                        href="https://signal.me/#eu/espejelomar.01"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-2 py-1 bg-purple-100 text-[#ab3bd2] text-xs hover:bg-purple-200 rounded-md transition-colors"
                      >
                        <DollarSign className="mr-1 h-3 w-3" /> Funding & Tips
                      </a>
                      <Button
                        size="sm"
                        className="bg-[#ab3bd2] text-white hover:bg-[#922fb8]"
                        onClick={() => setIsMobileSidebarOpen(true)}
                      >
                        <Menu className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {activePlatform === 'eigenlayer' && (
                <div className="mb-4 text-sm">
                  <p>
                    Last updated:{' '}
                    {operatorData?.lastUpdated
                      ? formatDate(operatorData.lastUpdated)
                      : 'Loading...'}
                  </p>
                </div>
              )}

              {/* Backers Section */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-3 rounded-lg shadow-sm mb-4">
                <div className="flex flex-col space-y-2">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Backed By Industry Leaders
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative h-7 w-7">
                        <Image
                          src="/ethereum-logo.png"
                          alt="Ethereum Foundation"
                          fill
                          className="object-contain"
                          sizes="28px"
                          priority
                        />
                      </div>
                      <div className="relative h-7 w-7">
                        <Image
                          src="/obol-logo.png"
                          alt="Obol Collective"
                          fill
                          className="object-contain"
                          sizes="28px"
                          priority
                        />
                      </div>
                    </div>
                    <div className="text-xs text-gray-700 ml-3">
                      <p>
                        Our mission to bring transparency to the restaking
                        ecosystem is supported by grants from the{' '}
                        <span className="font-medium">
                          Ethereum Foundation (ESP)
                        </span>{' '}
                        and <span className="font-medium">Obol Collective</span>
                        .
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {renderContent()}

              <Roadmap />

              <div id="about" ref={aboutRef}>
                <About />
              </div>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RestakeWatch;
