import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { fetchOperatorData, fetchETHPrice } from '../app/api/restake/restake';

interface StrategyMetrics {
  totalAssets: number;
  totalEntities: number;
  top5HoldersPercentage: number;
  herfindahlIndex: number;
}

interface StrategyData {
  name: string;
  rawName: string;
  assets: number;
  metrics: StrategyMetrics | null;
}

interface StrategiesData {
  strategyConcentrationMetrics: {
    [key: string]: StrategyMetrics;
  };
  totalRestakedAssetsPerStrategy: {
    [key: string]: number;
  };
}

// Badge component for color-coded risk levels
const Badge: React.FC<{ color: string; text: string }> = ({ color, text }) => {
  const colorClasses: { [key: string]: string } = {
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    gray: 'bg-gray-100 text-gray-800',
  };

  const classes = colorClasses[color] || colorClasses['gray'];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${classes}`}
    >
      {text}
    </span>
  );
};

// StyledIcon component used across overview components
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

const StrategyOverview: React.FC = () => {
  const [strategiesData, setStrategiesData] = useState<StrategiesData | null>(null);
  const [isLoadingStrategyData, setIsLoadingStrategyData] = useState(false);
  const [sortColumn, setSortColumn] = useState<keyof StrategyData>('assets');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [ethPrice, setEthPrice] = useState<number>(0);

  const fetchStrategyData = useCallback(async () => {
    try {
      setIsLoadingStrategyData(true);
      const data = await fetchOperatorData();
      
      if (data?.strategyConcentrationMetrics && data?.totalRestakedAssetsPerStrategy) {
        // Transform data to use totalEntities instead of totalRestakers if needed
        const transformedMetrics: Record<string, StrategyMetrics> = {};
        
        Object.entries(data.strategyConcentrationMetrics).forEach(([key, metrics]) => {
          // Map totalRestakers to totalEntities if it exists
          if ('totalRestakers' in metrics) {
            transformedMetrics[key] = {
              totalAssets: metrics.totalAssets,
              totalEntities: (metrics as any).totalRestakers as number,
              top5HoldersPercentage: metrics.top5HoldersPercentage,
              herfindahlIndex: metrics.herfindahlIndex
            };
          } else if ('totalEntities' in metrics) {
            transformedMetrics[key] = metrics as unknown as StrategyMetrics;
          }
        });
        
        setStrategiesData({
          strategyConcentrationMetrics: transformedMetrics,
          totalRestakedAssetsPerStrategy: data.totalRestakedAssetsPerStrategy
        });
      }
    } catch (error) {
      console.error('Error fetching strategy data:', error);
      setStrategiesData(null);
    } finally {
      setIsLoadingStrategyData(false);
    }
  }, []);

  useEffect(() => {
    if (!strategiesData) {
      fetchStrategyData();
    }
  }, [strategiesData, fetchStrategyData]);

  useEffect(() => {
    const getEthPrice = async () => {
      try {
        const price = await fetchETHPrice();
        setEthPrice(price);
      } catch (error) {
        console.error('Error fetching ETH price:', error);
      }
    };

    getEthPrice();

    // Refresh price every 5 minutes
    const interval = setInterval(getEthPrice, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Function to determine risk level based on concentration metrics
  const getConcentrationRiskLevel = (metrics: StrategyMetrics | null): 'critical' | 'warning' | 'positive' | 'neutral' => {
    if (!metrics) return 'neutral';
    
    if (metrics.top5HoldersPercentage > 75 || metrics.herfindahlIndex > 0.25) {
      return 'critical';
    } else if (metrics.top5HoldersPercentage > 50 || metrics.herfindahlIndex > 0.15) {
      return 'warning';
    } else {
      return 'positive';
    }
  };

  const strategiesWithData = useMemo(() => {
    if (!strategiesData) return [];

    return Object.keys(strategiesData.totalRestakedAssetsPerStrategy)
      .filter(strategy => strategiesData.totalRestakedAssetsPerStrategy[strategy] > 0)
      .map(strategy => ({
        name: strategy.replace(/_/g, ' '),
        rawName: strategy,
        assets: strategiesData.totalRestakedAssetsPerStrategy[strategy],
        metrics: strategiesData.strategyConcentrationMetrics[strategy] || null,
      }));
  }, [strategiesData]);

  const filteredAndSortedData = useMemo(() => {
    if (!strategiesWithData.length) return [];
    
    return [...strategiesWithData]
      .filter((strategy) => 
        strategy.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (sortColumn === 'metrics') {
          const aValue = a.metrics?.herfindahlIndex || 0;
          const bValue = b.metrics?.herfindahlIndex || 0;
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        const aString = String(aValue);
        const bString = String(bValue);
        return sortDirection === 'asc' 
          ? aString.localeCompare(bString) 
          : bString.localeCompare(aString);
      });
  }, [strategiesWithData, sortColumn, sortDirection, searchTerm]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedData, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredAndSortedData.length / itemsPerPage);
  }, [filteredAndSortedData, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleSort = (column: keyof StrategyData) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ column }: { column: keyof StrategyData }) => {
    if (column !== sortColumn) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortDirection === 'asc' ? (
      <ChevronUp className="ml-2 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-2 h-4 w-4" />
    );
  };

  // Format USD value with appropriate suffix
  const formatUSDValue = (value: number): string => {
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(1)}B+`;
    } else if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M+`;
    } else {
      return `$${Math.round(value).toLocaleString()}`;
    }
  };

  // Calculate high risk strategies total value
  const highRiskStrategies = strategiesWithData.filter(s => s.metrics?.top5HoldersPercentage > 75);
  const highRiskETHValue = highRiskStrategies.reduce((sum, s) => sum + s.assets, 0);
  const highRiskUSDValue = ethPrice > 0 ? highRiskETHValue * ethPrice : 0;
  const totalETHValue = strategiesWithData.reduce((sum, s) => sum + s.assets, 0);
  const highRiskPercentage = totalETHValue > 0 ? (highRiskETHValue / totalETHValue * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg mt-8 shadow-md">
        <h2 className="text-xl font-semibold mb-2 text-gray-800 flex items-center">
          <div className="mr-3">
            <StyledIcon
              icon={<AlertTriangle className="h-4 w-4" />}
              gradientColors={['#f97316', '#ef4444']}
              size="h-9 w-9"
            />
          </div>
          Strategy Concentration Risk Assessment
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Detailed analysis of concentration risks across different strategies
        </p>
        
        {highRiskStrategies.length > 0 && (
          <div className="bg-red-50 p-4 rounded-lg mb-4 border border-red-200">
            <p className="text-red-700 font-medium">
              {highRiskPercentage}% of restaked assets ({highRiskETHValue.toLocaleString()} ETH
              {ethPrice > 0 ? ` / ${formatUSDValue(highRiskUSDValue)}` : ''}) are in high-risk concentrated strategies
            </p>
            <p className="text-sm text-red-600 mt-1">
              {highRiskStrategies.length} strategies have critical concentration risk with top 5 operators controlling more than 75% of assets
            </p>
          </div>
        )}
        
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search by Strategy Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center">#</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('name')}
                    className="font-semibold"
                  >
                    Strategy
                    <SortIcon column="name" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('assets')}
                    className="font-semibold"
                  >
                    Total Assets
                    <SortIcon column="assets" />
                  </Button>
                </TableHead>
                <TableHead>Operators</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('metrics')}
                    className="font-semibold text-left"
                  >
                    Top 5 Operators %
                    <SortIcon column="metrics" />
                  </Button>
                </TableHead>
                <TableHead>Herfindahl</TableHead>
                <TableHead>Risk Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingStrategyData ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    <Skeleton className="w-full h-[20px] rounded-full" />
                  </TableCell>
                </TableRow>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((strategy, index) => {
                  const riskLevel = getConcentrationRiskLevel(strategy.metrics);
                  const riskColors = {
                    critical: 'red',
                    warning: 'yellow',
                    positive: 'green',
                    neutral: 'gray',
                  };
                  const riskText = {
                    critical: 'High Risk',
                    warning: 'Medium Risk',
                    positive: 'Low Risk',
                    neutral: 'Unknown',
                  };
                  
                  return (
                    <TableRow
                      key={strategy.rawName}
                      className="hover:bg-gray-50"
                    >
                      <TableCell className="font-semibold text-center">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {strategy.name}
                      </TableCell>
                      <TableCell>
                        {strategy.assets.toLocaleString()} ETH
                        {ethPrice > 0 && (
                          <div className="text-xs text-gray-500">
                            {formatUSDValue(strategy.assets * ethPrice)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{strategy.metrics?.totalEntities || 'N/A'}</TableCell>
                      <TableCell className="font-medium">
                        {strategy.metrics ? (
                          <span className={strategy.metrics.top5HoldersPercentage > 75 ? 'text-red-600' : 'text-gray-700'}>
                            {strategy.metrics.top5HoldersPercentage.toFixed(1)}%
                          </span>
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {strategy.metrics ? strategy.metrics.herfindahlIndex.toFixed(4) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {strategy.metrics && (
                          <Badge 
                            color={riskColors[riskLevel]} 
                            text={riskText[riskLevel]} 
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No strategy data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>Concentration metrics explanation:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Total Assets:</strong> Sum of all assets managed by the strategy.</li>
            <li><strong>Operators:</strong> Number of unique operators in the strategy.</li>
            <li><strong>Top 5 Operators %:</strong> Percentage of strategy assets controlled by the top 5 operators. Higher values indicate more centralization.</li>
            <li><strong>Herfindahl Index:</strong> Measure of operator concentration (0-1). Higher values indicate more concentration.</li>
          </ul>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(
              currentPage * itemsPerPage,
              filteredAndSortedData.length
            )}{' '}
            of {filteredAndSortedData.length} strategies
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="text-sm">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyOverview; 