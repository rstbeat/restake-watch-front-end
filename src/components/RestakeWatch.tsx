import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AlertTriangle, X } from 'lucide-react';
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
import Sidebar from './Sidebar';
import OperatorOverview from './OperatorOverview';
import RestakerOverview from './RestakerOverview';
import Overview from './Overview';
import Footer from './Footer';
import {
  OperatorDataResponse,
  StakerData,
} from '../app/interface/operatorData.interface';
import { fetchOperatorData, fetchStakerData } from '../app/api/restake/restake';

type PlatformType = 'eigenlayer' | 'symbiotic' | 'karak';

const RestakeWatch: React.FC = () => {
  const [activePlatform, setActivePlatform] = useState<PlatformType>('eigenlayer');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const aboutRef = useRef<HTMLDivElement>(null);

  const [operatorData, setOperatorData] = useState<OperatorDataResponse | null>(null);
  const [stakerData, setStakerData] = useState<any | null>(null);
  const [isLoadingOperatorData, setIsLoadingOperatorData] = useState(false);
  const [isLoadingStakerData, setIsLoadingStakerData] = useState(false);

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

  const fetchOperatorDataCallback = useCallback(async () => {
    if (activePlatform !== 'eigenlayer') return;
    try {
      setIsLoadingOperatorData(true);
      const data = await fetchOperatorData();
      // Process data as before
      setOperatorData(data);
    } catch (error) {
      console.error('Error fetching operator data:', error);
    } finally {
      setIsLoadingOperatorData(false);
    }
  }, [activePlatform]);

  const fetchStakerDataCallback = useCallback(async () => {
    if (activePlatform !== 'eigenlayer') return;
    try {
      setIsLoadingStakerData(true);
      const data = await fetchStakerData();
      // Process data as before
      setStakerData(data);
    } catch (error) {
      console.error('Error fetching staker data:', error);
    } finally {
      setIsLoadingStakerData(false);
    }
  }, [activePlatform]);

  useEffect(() => {
    fetchOperatorDataCallback();
    fetchStakerDataCallback();
  }, [fetchOperatorDataCallback, fetchStakerDataCallback]);

  const renderContent = () => {
    if (activePlatform !== 'eigenlayer') {
      return (
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
          <p>Data for {activePlatform.charAt(0).toUpperCase() + activePlatform.slice(1)} is not yet available.</p>
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
            className="data-[state=active]:bg-blue-100"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="operators"
            className="data-[state=active]:bg-blue-100"
          >
            Operators
          </TabsTrigger>
          <TabsTrigger
            value="restakers"
            className="data-[state=active]:bg-blue-100"
          >
            Restakers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Overview
            currentPlatformData={operatorData}
            restakeData={stakerData}
          />
        </TabsContent>

        <TabsContent value="operators" className="space-y-6">
          <OperatorOverview operatorData={operatorData?.operatorData as any} />
        </TabsContent>

        <TabsContent value="restakers" className="space-y-6">
          <RestakerOverview />
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-gray-900">
      <div className="flex flex-1">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          setIsMobileOpen={setIsMobileSidebarOpen}
        >
          <Select
            value={activePlatform}
            onValueChange={(value: PlatformType) => setActivePlatform(value)}
          >
            <SelectTrigger className="w-full border-gray-300 bg-white text-gray-900">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="eigenlayer">EigenLayer</SelectItem>
              <SelectItem value="symbiotic">Symbiotic</SelectItem>
              <SelectItem value="karak">Karak</SelectItem>
            </SelectContent>
          </Select>
        </Sidebar>

        <div className="flex-1 flex flex-col overflow-hidden">
          {showBanner && (
            <div className="bg-amber-100 text-amber-900 py-2 px-4 flex justify-between items-center">
              <div className="flex-1 text-center">
                New release:{' '}
                <Link
                  href="https://hackmd.io/@espejelomar/BkgcuG4MR"
                  className="underline font-medium"
                >
                  A Hitchhikers Guide to Restaking and Its Risks
                </Link>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBanner(false)}
              >
                <X className="h-4 w-4 text-amber-900" />
              </Button>
            </div>
          )}

          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {activePlatform === 'eigenlayer' && (
                <div className="mb-4 text-sm text-gray-500">
                  Last updated: {operatorData?.lastUpdated ?? 'N/A'}
                </div>
              )}

              {activePlatform === 'eigenlayer' && (
                <Alert
                  variant="destructive"
                  className="mb-6 bg-red-100 border-red-400 text-red-800"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>
                    Critical Alert for EigenLayer
                  </AlertTitle>
                  <AlertDescription>
                    Significant Centralization Risk: P2P.org controls over 28% of restaked ETH. Combined with other major operators (Luganodes, DSRV, Pier Two, and Finoa Consensus), these entities control more than 50% of all restaked ETH. This concentration poses substantial risks to the network's decentralization and resilience.
                  </AlertDescription>
                </Alert>
              )}

              {renderContent()}

              <div
                ref={aboutRef}
                className="mt-12 bg-white p-8 rounded-lg shadow-md border border-gray-200 transition-opacity duration-500"
              >
                <h2 className="text-2xl font-bold mb-4 text-gray-800">
                  About Restake Watch
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Restake Watch is a public goods organization, soon to be a
                  company, dedicated to providing transparency to the restaking
                  ecosystem. We aim to serve as an impartial and autonomous
                  watchdog, always acting in the best interest of users and the
                  broader ecosystem.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Our commitment is to remain genuinely neutral and grounded in
                  reality and facts. We receive generous funding from the
                  Ethereum Foundation Ecosystem Support Grants.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Additionally, we are actively seeking further funding and
                  donations to enhance our monitoring capabilities and continue
                  advancing the ecosystem.
                </p>
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