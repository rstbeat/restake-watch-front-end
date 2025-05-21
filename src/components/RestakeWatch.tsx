'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  X,
  Twitter,
  ChevronRight,
  Phone,
  Menu,
  DollarSign,
  Search,
  Home,
  Users,
  BarChart3,
  Layers,
  Info,
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
import { Skeleton } from './ui/skeleton';
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
import BackersCarousel from './BackersCarousel';
import AVSOverview from './AVSOverview';
import { OperatorDataResponse } from '../app/interface/operatorData.interface';
import { fetchStakerData, fetchOperatorData } from '../app/api/restake/restake';

// Color palette CSS variables (to be injected into :root in globals.css)
// Primary: #ab3bd2 (Purple)
// Secondary: #3b82f6 (Blue)
// Accent: #06b6d4 (Cyan)
// Success: #10b981 (Green)
// Warning: #f59e0b (Amber)
// Error: #ef4444 (Red)
// Background: #e6e7ec (Light Gray)
// Text: #171717 (Near Black)

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

  const [scrolled, setScrolled] = useState(false);
  const [visibleSection, setVisibleSection] = useState('overview');

  // Animation states
  const [tabChanged, setTabChanged] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  // Backers data for the carousel
  const backersData = [
    {
      id: '1',
      name: 'Ethereum Foundation (ESP)',
      logo: '/ethereum-logo.png',
      description:
        'Supporting the growth of the Ethereum ecosystem through core protocol research, development, and education.',
    },
    {
      id: '2',
      name: 'Obol Collective',
      logo: '/obol-logo.png',
      description:
        'Providing Distributed Validator Technology that enhances security and decentralization by enabling multiple operators to collaboratively run validators.',
    },
    // Add more backers here as needed
  ];

  // Helper function to apply specific risk color classes that will override glassmorphism effects
  const getRiskColorClass = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'high':
        return 'bg-red-500 text-white border-2 border-red-600 shadow-md';
      case 'medium':
        return 'bg-yellow-500 text-white border-2 border-yellow-600 shadow-md';
      case 'low':
        return 'bg-green-500 text-white border-2 border-green-600 shadow-md';
      default:
        return 'bg-gray-100 text-gray-800 border-2 border-gray-300';
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (aboutRef.current) {
        const rect = aboutRef.current.getBoundingClientRect();
        const isVisible = rect.top <= window.innerHeight && rect.bottom >= 0;
        aboutRef.current.style.opacity = isVisible ? '1' : '0';
      }

      setScrolled(window.scrollY > 50);

      const sections = [
        'overview',
        'operators',
        'restakers',
        'strategies',
        'about',
      ];
      const currentSection = sections.find((section) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 150 && rect.bottom >= 150;
        }
        return false;
      });

      if (currentSection) {
        setVisibleSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle tab change animation
  useEffect(() => {
    if (tabChanged) {
      const timer = setTimeout(() => {
        setTabChanged(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [tabChanged]);

  // Handle data loading animation
  useEffect(() => {
    setDataLoading(isLoadingStakerData || isLoadingOperatorData);
  }, [isLoadingStakerData, isLoadingOperatorData]);

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

  const handleTabChange = (value: string) => {
    setTabChanged(true);
    setActiveTab(value);
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
        onValueChange={handleTabChange}
        className="space-y-6"
      >
        <TabsList className="bg-white rounded-lg shadow-md overflow-x-auto flex whitespace-nowrap w-full">
          <TabsTrigger
            value="overview"
            className="text-[#171717] text-xs sm:text-sm md:text-base font-bold data-[state=active]:bg-[#ab3bd2] data-[state=active]:text-white transition-all duration-300 ease-in-out"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="operators"
            className="text-[#171717] text-xs sm:text-sm md:text-base font-bold data-[state=active]:bg-[#ab3bd2] data-[state=active]:text-white transition-all duration-300 ease-in-out"
          >
            Operators
          </TabsTrigger>
          <TabsTrigger
            value="restakers"
            className="text-[#171717] text-xs sm:text-sm md:text-base font-bold data-[state=active]:bg-[#ab3bd2] data-[state=active]:text-white transition-all duration-300 ease-in-out"
          >
            Restakers
          </TabsTrigger>
          <TabsTrigger
            value="strategies"
            className="text-[#171717] text-xs sm:text-sm md:text-base font-bold data-[state=active]:bg-[#ab3bd2] data-[state=active]:text-white transition-all duration-300 ease-in-out"
          >
            Strategies
          </TabsTrigger>
          <TabsTrigger
            value="avs"
            className="text-[#171717] text-xs sm:text-sm md:text-base font-bold data-[state=active]:bg-[#ab3bd2] data-[state=active]:text-white transition-all duration-300 ease-in-out"
          >
            AVS
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="overview"
          className={`space-y-6 transition-opacity duration-300 ease-in-out ${tabChanged && activeTab === 'overview' ? 'opacity-0 animate-in fade-in-0' : 'opacity-100'}`}
        >
          {Overview && <Overview restakeData={stakerData} />}
        </TabsContent>

        <TabsContent
          value="operators"
          className={`space-y-6 transition-opacity duration-300 ease-in-out ${tabChanged && activeTab === 'operators' ? 'opacity-0 animate-in fade-in-0' : 'opacity-100'}`}
        >
          {OperatorOverview && <OperatorOverview />}
        </TabsContent>

        <TabsContent
          value="restakers"
          className={`space-y-6 transition-opacity duration-300 ease-in-out ${tabChanged && activeTab === 'restakers' ? 'opacity-0 animate-in fade-in-0' : 'opacity-100'}`}
        >
          {RestakerOverview && <RestakerOverview />}
        </TabsContent>

        <TabsContent
          value="strategies"
          className={`space-y-6 transition-opacity duration-300 ease-in-out ${tabChanged && activeTab === 'strategies' ? 'opacity-0 animate-in fade-in-0' : 'opacity-100'}`}
        >
          {StrategyOverview && <StrategyOverview />}
        </TabsContent>

        <TabsContent
          value="avs"
          className={`space-y-6 transition-opacity duration-300 ease-in-out ${tabChanged && activeTab === 'avs' ? 'opacity-0 animate-in fade-in-0' : 'opacity-100'}`}
        >
          {AVSOverview && <AVSOverview />}
        </TabsContent>
      </Tabs>
    );
  };

  const navigateToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      handleTabChange(sectionId);
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#e6e7ec] text-[#171717] font-bold">
      <div className="flex flex-1">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          setIsMobileOpen={setIsMobileSidebarOpen}
        >
          <Select
            value={activePlatform}
            onValueChange={(value: PlatformType) => setActivePlatform(value)}
          >
            <SelectTrigger className="w-full border-gray-300 bg-white text-[#171717] focus:border-[#ab3bd2] transition-colors duration-200">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent className="animate-in fade-in-50 zoom-in-95 duration-150">
              <SelectItem value="eigenlayer">EigenLayer</SelectItem>
              <SelectItem value="symbiotic">Symbiotic</SelectItem>
              <SelectItem value="karak">Karak</SelectItem>
            </SelectContent>
          </Select>
        </Sidebar>

        <div className="flex-1 flex flex-col md:ml-40 w-full">
          {showBanner && (
            <div className="bg-gradient-to-r from-purple-50/90 via-purple-100/90 to-indigo-50/90 backdrop-blur-lg text-gray-700 py-2 sm:py-3 border-b border-purple-200/50 shadow-sm transition-all duration-300 ease-in-out z-20">
              <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex justify-between items-center">
                <div className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto whitespace-nowrap">
                  <div className="p-1 sm:p-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm flex-shrink-0">
                    <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-[#ab3bd2]" />
                  </div>
                  <span className="font-medium text-xs sm:text-sm md:text-base">
                    New paper release:{' '}
                    <Link
                      href="/publications"
                      className="relative inline-block font-semibold hover:text-[#ab3bd2] transition-colors duration-200 after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-[#ab3bd2] after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
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
                  className="rounded-full h-6 w-6 sm:h-7 sm:w-7 p-0 ml-1 text-gray-500 hover:text-[#ab3bd2] hover:bg-white/80 hover:backdrop-blur-sm transition-all duration-200 flex-shrink-0"
                >
                  <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </Button>
              </div>
            </div>
          )}

          <header
            className={`sticky top-0 z-30 transition-all duration-300 ease-in-out ${
              scrolled ? 'shadow-lg' : ''
            }`}
          >
            <div
              className={`bg-[#e6e7ec]/90 backdrop-blur-md text-[#171717] py-4 border-b border-gray-200/50 transition-all duration-300 ${
                scrolled ? 'py-2' : 'py-4'
              }`}
            >
              <div className="max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center w-full justify-between">
                  <div className="flex items-center">
                    <div>
                      <h1
                        className={`font-extrabold tracking-tight bg-gradient-to-r from-[#ab3bd2] to-[#7928ca] bg-clip-text text-transparent drop-shadow-sm transition-all duration-300 ${
                          scrolled
                            ? 'text-xl sm:text-2xl'
                            : 'text-2xl sm:text-3xl md:text-4xl mb-1'
                        }`}
                      >
                        RestakeWatch
                      </h1>
                      <p
                        className={`font-bold transition-all duration-300 ${
                          scrolled
                            ? 'text-xs sm:text-sm hidden md:block'
                            : 'text-sm sm:text-base sm:text-lg'
                        }`}
                      >
                        The{' '}
                        <span className="font-extrabold text-[#ab3bd2] underline decoration-2 underline-offset-2">
                          L2Beat
                        </span>{' '}
                        of the Restaking Ecosystem
                      </p>
                    </div>
                  </div>

                  <div className="hidden lg:flex items-center space-x-4">
                    {scrolled && (
                      <button className="text-gray-500 hover:text-[#ab3bd2] transition-colors duration-200">
                        <Search className="h-5 w-5" />
                      </button>
                    )}

                    {!scrolled && (
                      <>
                        <div className="flex items-center px-3 py-1 bg-white rounded-md border border-purple-200 shadow-sm hover:shadow-md transition-all duration-200">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-[#ab3bd2] mb-0.5">
                              Our Backers:
                            </span>
                            <div className="flex items-center">
                              <div className="relative h-5 w-5 mr-1 transform hover:scale-110 transition-transform duration-200">
                                <Image
                                  src="/ethereum-logo.png"
                                  alt="Ethereum Foundation"
                                  fill
                                  className="object-contain"
                                  sizes="20px"
                                  priority
                                />
                              </div>
                              <div className="relative h-5 w-5 transform hover:scale-110 transition-transform duration-200">
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
                          </div>
                        </div>
                        <a
                          href="https://twitter.com/therestakewatch"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] text-white hover:shadow-md transition-all duration-200 transform hover:scale-105"
                          aria-label="Twitter"
                        >
                          <Twitter size={16} />
                        </a>
                      </>
                    )}

                    <a
                      href="https://signal.me/#eu/espejelomar.01"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center bg-gradient-to-r from-[#ab3bd2] to-[#7928ca] text-white rounded-md hover:from-[#9933c7] hover:to-[#6820b0] shadow-sm hover:shadow-md transition-all duration-200 transform hover:translate-y-[-2px] ${
                        scrolled ? 'px-3 py-1.5 text-xs' : 'px-4 py-2'
                      }`}
                    >
                      <DollarSign
                        className={scrolled ? 'mr-1 h-3 w-3' : 'mr-1.5 h-4 w-4'}
                      />
                      {scrolled ? 'Funding' : 'Got Funding or Insights?'}
                    </a>

                    {!scrolled && (
                      <Button
                        size="sm"
                        className="bg-[#06b6d4] text-white hover:bg-[#0891b2] shadow-sm hover:shadow-md transition-all duration-200 transform hover:translate-y-[-2px]"
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
                    )}
                  </div>

                  <div className="block md:hidden">
                    <div className="flex items-center space-x-2">
                      {scrolled && (
                        <button className="text-gray-500 hover:text-[#ab3bd2] transition-colors duration-200">
                          <Search className="h-4 w-4" />
                        </button>
                      )}
                      <a
                        href="https://signal.me/#eu/espejelomar.01"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-[#ab3bd2] to-[#7928ca] text-white text-xs rounded-md hover:from-[#9933c7] hover:to-[#6820b0] shadow-sm hover:shadow-md transition-all duration-200 transform hover:translate-y-[-1px]"
                      >
                        <DollarSign className="mr-1 h-3 w-3" /> Funding
                      </a>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="p-1 hover:bg-gray-100 rounded-md"
                        onClick={() => setIsMobileSidebarOpen(true)}
                      >
                        <Menu className="h-5 w-5 text-gray-700" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {activePlatform === 'eigenlayer' && (
              <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm overflow-x-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between min-w-max">
                    <div className="flex items-center space-x-2 text-xs sm:text-sm py-3">
                      <span className="text-gray-600 whitespace-nowrap">
                        Platform:{' '}
                        <span className="font-medium text-[#ab3bd2]">
                          EigenLayer
                        </span>
                      </span>
                      <span className="text-gray-400">|</span>
                      <div className="flex items-center whitespace-nowrap">
                        <span className="text-gray-600 mr-1">
                          Last updated:
                        </span>
                        {operatorData?.lastUpdated ? (
                          <span className="text-gray-800">
                            {formatDate(operatorData.lastUpdated)}
                          </span>
                        ) : (
                          <div className="relative">
                            <Skeleton className="h-4 w-24 rounded animate-pulse" />
                            <div
                              className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent ${dataLoading ? 'skeleton-shine' : 'opacity-0'}`}
                              style={{ backgroundSize: '200% 100%' }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="hidden md:flex space-x-6">
                      <button
                        onClick={() => handleTabChange('overview')}
                        className={`text-sm py-3 font-medium border-b-2 transition-all duration-200 ${
                          activeTab === 'overview'
                            ? 'border-[#ab3bd2] text-[#ab3bd2]'
                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                        }`}
                      >
                        Overview
                      </button>
                      <button
                        onClick={() => handleTabChange('operators')}
                        className={`text-sm py-3 font-medium border-b-2 transition-all duration-200 ${
                          activeTab === 'operators'
                            ? 'border-[#ab3bd2] text-[#ab3bd2]'
                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                        }`}
                      >
                        Operators
                      </button>
                      <button
                        onClick={() => handleTabChange('restakers')}
                        className={`text-sm py-3 font-medium border-b-2 transition-all duration-200 ${
                          activeTab === 'restakers'
                            ? 'border-[#ab3bd2] text-[#ab3bd2]'
                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                        }`}
                      >
                        Restakers
                      </button>
                      <button
                        onClick={() => handleTabChange('strategies')}
                        className={`text-sm py-3 font-medium border-b-2 transition-all duration-200 ${
                          activeTab === 'strategies'
                            ? 'border-[#ab3bd2] text-[#ab3bd2]'
                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                        }`}
                      >
                        Strategies
                      </button>
                      <button
                        onClick={() => handleTabChange('avs')}
                        className={`text-sm py-3 font-medium border-b-2 transition-all duration-200 ${
                          activeTab === 'avs'
                            ? 'border-[#ab3bd2] text-[#ab3bd2]'
                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                        }`}
                      >
                        AVS
                      </button>
                    </div>

                    <div className="md:hidden flex overflow-x-auto pb-1 pt-1">
                      <div className="flex space-x-3 px-1">
                        <button
                          onClick={() => handleTabChange('overview')}
                          className={`px-3 py-1 text-xs rounded-full transition-all duration-200 whitespace-nowrap ${
                            activeTab === 'overview'
                              ? 'bg-[#ab3bd2] text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Overview
                        </button>
                        <button
                          onClick={() => handleTabChange('operators')}
                          className={`px-3 py-1 text-xs rounded-full transition-all duration-200 whitespace-nowrap ${
                            activeTab === 'operators'
                              ? 'bg-[#ab3bd2] text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Operators
                        </button>
                        <button
                          onClick={() => handleTabChange('restakers')}
                          className={`px-3 py-1 text-xs rounded-full transition-all duration-200 whitespace-nowrap ${
                            activeTab === 'restakers'
                              ? 'bg-[#ab3bd2] text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Restakers
                        </button>
                        <button
                          onClick={() => handleTabChange('strategies')}
                          className={`px-3 py-1 text-xs rounded-full transition-all duration-200 whitespace-nowrap ${
                            activeTab === 'strategies'
                              ? 'bg-[#ab3bd2] text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Strategies
                        </button>
                        <button
                          onClick={() => handleTabChange('avs')}
                          className={`px-3 py-1 text-xs rounded-full transition-all duration-200 whitespace-nowrap ${
                            activeTab === 'avs'
                              ? 'bg-[#ab3bd2] text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          AVS
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </header>

          <main className="flex-1 bg-[#e6e7ec] text-[#171717]">
            <div className="max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Backers Carousel - More subtle and compact version */}
              <div className="mb-6 bg-gradient-to-r from-purple-50/60 to-indigo-50/60 rounded-lg p-4 shadow-sm border border-purple-100/30">
                <div className="flex flex-row items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-[#ab3bd2]">
                    Proudly Backed By:
                  </h3>
                  <a
                    href="https://signal.me/#eu/espejelomar.01"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-[#ab3bd2] hover:text-[#922fb8] transition-colors duration-200 flex items-center"
                  >
                    Become a partner
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </a>
                </div>
                <div className="max-w-full">
                  <BackersCarousel backers={backersData} />
                </div>
              </div>

              <div
                id="overview"
                className="transition-opacity duration-500 ease-in-out"
              >
                {renderContent()}
              </div>

              <div id="roadmap">
                <Roadmap />
              </div>

              <div
                id="about"
                ref={aboutRef}
                className="transition-opacity duration-500 ease-in-out"
              >
                <About />
              </div>
            </div>
          </main>
        </div>
      </div>
      <Footer />

      {/* Add CSS animations */}
      <style jsx global>{`
        @keyframes skeleton-loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        .skeleton-shine {
          animation: skeleton-loading 1.5s infinite linear;
        }

        .animate-in {
          animation: fadeIn 0.3s ease-out forwards;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .fade-in-0 {
          animation-name: fadeIn;
          animation-duration: 300ms;
          animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        .zoom-in-95 {
          animation-name: zoomIn95;
          animation-duration: 150ms;
          animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes zoomIn95 {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .fade-in-50 {
          animation-name: fadeIn50;
          animation-duration: 150ms;
          animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes fadeIn50 {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default RestakeWatch;
