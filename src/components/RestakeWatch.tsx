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
  OperatorData,
  OperatorDataFormated,
  StakerData,
} from '../app/interface/operatorData.interface';
import { fetchOperatorData, fetchStakerData } from '../app/api/restake/restake';

// const COLORS = ['#4A90E2', '#50C878', '#9B59B6', '#F39C12'];
// const CHART_COLORS = ['#4A90E2', '#E8F4FD'];

interface Thresholds {
  min: number;
  max: number;
  green: number;
  yellow: number;
}

// const getStatusColor = (value: number, thresholds: Thresholds): string => {
//   if (value <= thresholds.green) return 'bg-green-500';
//   if (value <= thresholds.yellow) return 'bg-yellow-500';
//   return 'bg-red-500';
// };

// interface MetricCardProps {
//   title: string;
//   value: number | null;
//   thresholds: Thresholds;
//   format?: (v: number | null) => string;
// }

// const MetricCard: React.FC<MetricCardProps> = ({
//   title,
//   value,
//   thresholds,
//   format = (v) => v?.toString() ?? 'N/A',
// }) => {
//   const statusColor =
//     value !== null ? getStatusColor(value, thresholds) : 'bg-gray-300';
//   return (
//     <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg">
//       <h3 className="text-lg font-semibold mb-3 text-gray-800">{title}</h3>
//       <div className="flex items-center justify-between">
//         <span className="text-3xl font-bold text-gray-900">
//           {format(value)}
//         </span>
//         <div className={`w-4 h-4 rounded-full ${statusColor}`}></div>
//       </div>
//     </div>
//   );
// };

interface PlatformData {
  operatorData: { name: string; value: number }[];
  monthlyTVLData: { date: string; tvl: number }[];
  keyMetrics: {
    totalRestaked: number | null;
    activeOperators: number | null;
    totalRestakers: number | null;
    p2pMarketShare: number | null;
    stakerHerfindahl: number | null;
    top33PercentOperators: number | null;
  };
  criticalAlert: string;
}

type PlatformType = 'eigenlayer' | 'symbiotic' | 'karak';

const RestakeWatch: React.FC = () => {
  // State declarations
  const [activePlatform, setActivePlatform] =
    useState<PlatformType>('eigenlayer');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const aboutRef = useRef<HTMLDivElement>(null);

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

  const platformData: Record<PlatformType, PlatformData> = {
    eigenlayer: {
      operatorData: [
        { name: 'P2P.org', value: 50 },
        { name: 'Other large operators', value: 30 },
        { name: 'Small operators', value: 20 },
      ],
      monthlyTVLData: [
        { date: '2024-04', tvl: 1000000 },
        { date: '2024-05', tvl: 1100000 },
        { date: '2024-06', tvl: 1250000 },
        { date: '2024-07', tvl: 1400000 },
        { date: '2024-08', tvl: 1300000 },
      ],
      keyMetrics: {
        totalRestaked: 1300000,
        activeOperators: 680,
        totalRestakers: 93674,
        p2pMarketShare: 0.329807,
        stakerHerfindahl: 4,
        top33PercentOperators: 2,
      },
      criticalAlert:
        'P2P.org controls over 30% of restaked ETH, posing significant centralization risks.',
    },
    symbiotic: {
      // Placeholder data
      operatorData: [],
      monthlyTVLData: [],
      keyMetrics: {
        totalRestaked: null,
        activeOperators: null,
        totalRestakers: null,
        p2pMarketShare: null,
        stakerHerfindahl: null,
        top33PercentOperators: null,
      },
      criticalAlert: 'Data collection for Symbiotic is in progress.',
    },
    karak: {
      // Placeholder data
      operatorData: [],
      monthlyTVLData: [],
      keyMetrics: {
        totalRestaked: null,
        activeOperators: null,
        totalRestakers: null,
        p2pMarketShare: null,
        stakerHerfindahl: null,
        top33PercentOperators: null,
      },
      criticalAlert: 'Data collection for Karak is in progress.',
    },
  };

  const metricThresholds: Record<string, Thresholds> = {
    p2pMarketShare: { min: 0, max: 1, green: 0.1, yellow: 0.18 },
    stakerHerfindahl: { min: 0, max: 1, green: 0.1, yellow: 0.18 },
    top33PercentOperators: { min: 1, max: 20, green: 10, yellow: 5 },
  };

  const currentPlatformData = platformData[activePlatform];
  const lastUpdateDate = 'September 15, 2024'; // Add this line for the last update date

  // Operator Data
  const [operatorData, setOperatorData] = useState<any | null>(null);
  const [, setIsLoadingOperatorData] = useState(false);

  const fetchOperatorDataCallback = useCallback(async () => {
    try {
      setIsLoadingOperatorData(true);
      const data = await fetchOperatorData();
      data.operatorData = data.operatorData.map((operator: OperatorData) => ({
        operatorAddress: operator['Operator Address'].substr(2, 25),
        // operatorName: operator['Operator Name'],
        marketShared: operator['Market Share'].toFixed(6),
        ethRestaked: operator['ETH Restaked'].toFixed(6),
        numberOfStrategies: operator['Number of Strategies'],
        mostUsedStrategies: operator['Most Used Strategy'],
      }));
      const OperatorDataFormated = data;
      setOperatorData(OperatorDataFormated);
    } catch (error) {
      console.error('Ha ocurrido un error');
    } finally {
      setIsLoadingOperatorData(false);
    }
  }, []);

  useEffect(() => {
    if (!operatorData) {
      fetchOperatorDataCallback();
    }
  }, [operatorData, fetchOperatorDataCallback]);

  const [stakerData, setStakerData] = useState<any | null>(null);
  const [, setIsLoadingStakerData] = useState(false);

  const fetchStakerDataCallback = useCallback(async () => {
    try {
      setIsLoadingStakerData(true);
      const data = await fetchStakerData();
      data.stakerData = data.stakerData.map((data: StakerData) => ({
        restakerAddress: data['Staker Address'].substr(2, 25),
        // restakerName: data['Staker Name'],
        amountRestaked: data['Market Share'].toFixed(2),
        // percentageOfTotal: data['Percentage of Total'],
        numberOfStrategies: data['Number of Strategies'],
        mostUsedStrategies: data['Most Used Strategy'],
      }));
      const stakerDataResponse = data;
      setStakerData(stakerDataResponse);
    } catch (error) {
      console.error('Ha ocurrido un error');
    } finally {
      setIsLoadingStakerData(false);
    }
  }, []);

  useEffect(() => {
    if (!stakerData) {
      fetchStakerDataCallback();
    }
  }, [stakerData, fetchStakerDataCallback]);

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
              <div className="mb-4 text-sm text-gray-500">
                Last updated: {operatorData?.lastUpdated ?? 'N/A'}
              </div>

              <Alert
                variant="destructive"
                className="mb-6 bg-red-100 border-red-400 text-red-800"
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>
                  Critical Alert for{' '}
                  {activePlatform.charAt(0).toUpperCase() +
                    activePlatform.slice(1)}
                </AlertTitle>
                <AlertDescription>
                  {currentPlatformData.criticalAlert}
                </AlertDescription>
              </Alert>

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

                {/* TODO: Revisar el por qué currentPlatformdata y metricThresholds tienen errores al pasar la data */}
                <TabsContent value="overview" className="space-y-6">
                  <Overview
                    currentPlatformData={currentPlatformData as any}
                    test={operatorData}
                    restakeData={stakerData}
                  />
                </TabsContent>

                <TabsContent value="operators" className="space-y-6">
                  <OperatorOverview />
                </TabsContent>

                <TabsContent value="restakers" className="space-y-6">
                  <RestakerOverview />
                </TabsContent>
              </Tabs>

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
