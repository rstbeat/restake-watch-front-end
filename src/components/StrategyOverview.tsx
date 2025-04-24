import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
  FileDown,
  Info,
  ExternalLink,
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
import * as Tooltip from '@radix-ui/react-tooltip';

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
    red: 'bg-red-500 text-white border-2 border-red-600 shadow-md',
    yellow: 'bg-yellow-500 text-white border-2 border-yellow-600 shadow-md',
    green: 'bg-green-500 text-white border-2 border-green-600 shadow-md',
    blue: 'bg-blue-500 text-white border-2 border-blue-600 shadow-md',
    gray: 'bg-gray-100 text-gray-800 border-2 border-gray-300',
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

// InfoTooltip component
const InfoTooltip: React.FC<{ content: string }> = ({ content }) => (
  <Tooltip.Provider>
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <Info className="inline-block ml-2 cursor-help h-4 w-4 text-gray-500" />
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className="bg-gray-800 text-white p-2 rounded shadow-lg max-w-xs">
          <p className="text-sm">{content}</p>
          <Tooltip.Arrow className="fill-gray-800" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  </Tooltip.Provider>
);

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
  const [strategiesData, setStrategiesData] = useState<StrategiesData | null>(
    null,
  );
  const [isLoadingStrategyData, setIsLoadingStrategyData] = useState(false);
  const [sortColumn, setSortColumn] = useState<keyof StrategyData>('assets');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [ethPrice, setEthPrice] = useState<number>(0);
  // New state for expandable rows and risk level filter
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [filteredRiskLevel, setFilteredRiskLevel] = useState<string | null>(
    null,
  );

  const fetchStrategyData = useCallback(async () => {
    try {
      setIsLoadingStrategyData(true);
      const data = await fetchOperatorData();

      if (
        data?.strategyConcentrationMetrics &&
        data?.totalRestakedAssetsPerStrategy
      ) {
        // Use the metrics data directly, no transformation needed
        const transformedMetrics: Record<string, StrategyMetrics> = {};

        Object.entries(data.strategyConcentrationMetrics).forEach(
          ([key, metrics]) => {
            transformedMetrics[key] = metrics as unknown as StrategyMetrics;
          },
        );

        setStrategiesData({
          strategyConcentrationMetrics: transformedMetrics,
          totalRestakedAssetsPerStrategy: data.totalRestakedAssetsPerStrategy,
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

  // Toggle expansion function
  const toggleRowExpansion = (name: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  // Function to determine risk level based on concentration metrics
  const getConcentrationRiskLevel = (
    metrics: StrategyMetrics | null,
  ): 'critical' | 'warning' | 'positive' | 'neutral' => {
    if (!metrics) return 'neutral';

    if (metrics.top5HoldersPercentage > 75 || metrics.herfindahlIndex > 0.25) {
      return 'critical';
    } else if (
      metrics.top5HoldersPercentage > 50 ||
      metrics.herfindahlIndex > 0.15
    ) {
      return 'warning';
    } else {
      return 'positive';
    }
  };

  // Add a helper function to convert risk levels to appropriate badge colors
  const getRiskBadge = (risk: string): { color: string; text: string } => {
    switch (risk) {
      case 'critical':
        return { color: 'red', text: 'High Risk' };
      case 'warning':
        return { color: 'yellow', text: 'Medium Risk' };
      case 'positive':
        return { color: 'green', text: 'Low Risk' };
      default:
        return { color: 'gray', text: 'Unknown' };
    }
  };

  const strategiesWithData = useMemo(() => {
    if (!strategiesData) return [];

    return Object.keys(strategiesData.totalRestakedAssetsPerStrategy)
      .filter(
        (strategy) =>
          strategiesData.totalRestakedAssetsPerStrategy[strategy] > 0,
      )
      .map((strategy) => ({
        name: strategy.replace(/_/g, ' '),
        rawName: strategy,
        assets: strategiesData.totalRestakedAssetsPerStrategy[strategy],
        metrics: strategiesData.strategyConcentrationMetrics[strategy] || null,
      }));
  }, [strategiesData]);

  const filteredAndSortedData = useMemo(() => {
    if (!strategiesWithData.length) return [];

    return [...strategiesWithData]
      .filter((strategy) => {
        const matchesSearchTerm = strategy.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        // Add risk level filter
        const strategyRiskLevel = getConcentrationRiskLevel(strategy.metrics);
        const matchesRiskLevel =
          filteredRiskLevel === null || strategyRiskLevel === filteredRiskLevel;

        return matchesSearchTerm && matchesRiskLevel;
      })
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
  }, [
    strategiesWithData,
    sortColumn,
    sortDirection,
    searchTerm,
    filteredRiskLevel,
  ]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedData, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredAndSortedData.length / itemsPerPage);
  }, [filteredAndSortedData, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filteredRiskLevel]);

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
      return `$${(value / 1_000_000_000).toFixed(1)}B`;
    } else if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    } else {
      return `$${Math.round(value).toLocaleString()}`;
    }
  };

  // Calculate high risk strategies total value
  const highRiskStrategies = strategiesWithData.filter(
    (s) => s.metrics?.top5HoldersPercentage > 75,
  );
  const highRiskETHValue = highRiskStrategies.reduce(
    (sum: number, s) => sum + s.assets,
    0,
  );
  const highRiskUSDValue = ethPrice > 0 ? highRiskETHValue * ethPrice : 0;
  const totalETHValue = strategiesWithData.reduce(
    (sum: number, s) => sum + s.assets,
    0,
  );
  const highRiskPercentage =
    totalETHValue > 0
      ? ((highRiskETHValue / totalETHValue) * 100).toFixed(1)
      : '0';

  // Render filter controls
  const renderFilterControls = () => (
    <div className="mb-6">
      <div className="relative flex-grow mb-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="text"
          placeholder="Search by Strategy Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="flex flex-wrap gap-3 mb-4 justify-between">
        <div className="flex items-center">
          <h4 className="text-sm font-semibold mr-2">Risk Level:</h4>
          <Button
            variant={filteredRiskLevel === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilteredRiskLevel(null)}
            className="text-xs"
          >
            All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilteredRiskLevel('critical')}
            className={`text-xs ${filteredRiskLevel === 'critical' ? 'bg-red-100 border-red-300 hover:bg-red-200' : ''}`}
          >
            High Risk
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilteredRiskLevel('warning')}
            className={`text-xs ${filteredRiskLevel === 'warning' ? 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200' : ''}`}
          >
            Medium Risk
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilteredRiskLevel('positive')}
            className={`text-xs ${filteredRiskLevel === 'positive' ? 'bg-green-100 border-green-300 hover:bg-green-200' : ''}`}
          >
            Low Risk
          </Button>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <ExternalLink className="h-4 w-4 mr-1 text-purple-600" />
          <a 
            href="https://signal.me/#eu/espejelomar.01" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-purple-700 transition-colors"
          >
            Need data export? Contact us on Signal
          </a>
        </div>
      </div>
    </div>
  );

  // Render enhanced table
  const renderTable = () => (
    <div className="overflow-x-auto max-h-[70vh] border rounded-lg shadow-sm">
      <Table>
        <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
          <TableRow className="border-b-2 border-purple-200">
            <TableHead className="w-[50px] text-center">
              <span className="text-purple-700">#</span>
            </TableHead>
            <TableHead className="w-[50px] text-center">
              <div className="flex justify-center">
                <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded-full">
                  Details
                </span>
              </div>
            </TableHead>
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
                Total Assets Value (ETH/USD)
                <SortIcon column="assets" />
              </Button>
              <InfoTooltip content="Total value of all assets managed by this strategy, converted to ETH equivalent" />
            </TableHead>
            <TableHead>
              Operators
              <InfoTooltip content="Number of unique operators in the strategy" />
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('metrics')}
                className="font-semibold text-left"
              >
                Top 5 Operators %
                <SortIcon column="metrics" />
              </Button>
              <InfoTooltip content="Percentage of strategy assets controlled by the top 5 operators. Higher values indicate more centralization." />
            </TableHead>
            <TableHead>
              Herfindahl
              <InfoTooltip content="Herfindahl-Hirschman Index measures market concentration (0-1). Higher values indicate more concentration." />
            </TableHead>
            <TableHead>Risk Level</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoadingStrategyData ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <div className="flex flex-col items-center justify-center">
                  <Skeleton className="w-3/4 h-[20px] rounded-full mb-2" />
                  <Skeleton className="w-2/3 h-[20px] rounded-full mb-2" />
                  <Skeleton className="w-1/2 h-[20px] rounded-full" />
                </div>
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
              const isExpanded = expandedRows[strategy.rawName] || false;

              return (
                <React.Fragment key={strategy.rawName}>
                  <TableRow
                    className={`hover:bg-gray-50 transition-colors
                      ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                      ${isExpanded ? 'border-b-0' : ''}
                      ${
                        riskLevel === 'critical'
                          ? 'border-l-4 border-l-red-400'
                          : riskLevel === 'warning'
                            ? 'border-l-4 border-l-yellow-400'
                            : riskLevel === 'positive'
                              ? 'border-l-4 border-l-green-400'
                              : ''
                      }`}
                  >
                    <TableCell className="font-semibold text-center">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRowExpansion(strategy.rawName)}
                        className="p-1 h-8 w-8 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-700 hover:text-purple-800 transition-colors border border-purple-200"
                        title="Click for details"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">
                      {strategy.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold">
                          {strategy.assets.toLocaleString()} ETH
                        </span>
                        {ethPrice > 0 && (
                          <span className="text-xs text-gray-500">
                            {formatUSDValue(strategy.assets * ethPrice)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        color={
                          strategy.metrics?.totalEntities &&
                          strategy.metrics.totalEntities > 20
                            ? 'green'
                            : strategy.metrics?.totalEntities &&
                                strategy.metrics.totalEntities > 10
                              ? 'blue'
                              : 'gray'
                        }
                        text={
                          strategy.metrics?.totalEntities?.toString() || 'N/A'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {strategy.metrics ? (
                        <div className="flex flex-col">
                          <div className="flex items-center mb-1 w-full max-w-[150px]">
                            <span
                              className={`mr-2 font-semibold ${
                                strategy.metrics.top5HoldersPercentage > 75
                                  ? 'text-red-600'
                                  : strategy.metrics.top5HoldersPercentage > 50
                                    ? 'text-amber-600'
                                    : 'text-green-600'
                              }`}
                            >
                              {strategy.metrics.top5HoldersPercentage.toFixed(
                                1,
                              )}
                              %
                            </span>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`${
                                  strategy.metrics.top5HoldersPercentage > 75
                                    ? 'bg-red-500'
                                    : strategy.metrics.top5HoldersPercentage >
                                        50
                                      ? 'bg-amber-500'
                                      : 'bg-green-500'
                                } h-2 rounded-full transition-all`}
                                style={{
                                  width: `${Math.min(strategy.metrics.top5HoldersPercentage, 100)}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      {strategy.metrics ? (
                        <span
                          className={
                            strategy.metrics.herfindahlIndex > 0.25
                              ? 'text-red-600 font-semibold'
                              : strategy.metrics.herfindahlIndex > 0.15
                                ? 'text-amber-600 font-semibold'
                                : 'text-gray-700'
                          }
                        >
                          {strategy.metrics.herfindahlIndex.toFixed(4)}
                        </span>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const strategyRiskLevel = getConcentrationRiskLevel(
                          strategy.metrics,
                        );
                        const riskBadge = getRiskBadge(strategyRiskLevel);
                        return (
                          <Badge
                            color={riskBadge.color}
                            text={riskBadge.text}
                          />
                        );
                      })()}
                    </TableCell>
                  </TableRow>

                  {isExpanded && (
                    <TableRow className="bg-purple-50 border-t-0">
                      <TableCell colSpan={9} className="p-0">
                        <div className="p-4 border-t-2 border-purple-200">
                          <div className="text-sm">
                            <h4 className="font-semibold mb-3 text-purple-700 flex items-center">
                              <Info className="h-4 w-4 mr-2" />
                              Strategy Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
                                <h5 className="font-medium text-gray-800 mb-2 border-b pb-2">
                                  Asset Information
                                </h5>
                                <p className="py-1">
                                  <span className="text-gray-600 font-medium">
                                    Strategy Name:
                                  </span>{' '}
                                  <span className="font-semibold">
                                    {strategy.name}
                                  </span>
                                </p>
                                <p className="py-1">
                                  <span className="text-gray-600 font-medium">
                                    Total ETH:
                                  </span>{' '}
                                  <span className="font-semibold">
                                    {strategy.assets.toLocaleString()}
                                  </span>
                                </p>
                                {ethPrice > 0 && (
                                  <p className="py-1">
                                    <span className="text-gray-600 font-medium">
                                      USD Value:
                                    </span>{' '}
                                    <span className="font-semibold">
                                      {formatUSDValue(
                                        strategy.assets * ethPrice,
                                      )}
                                    </span>
                                  </p>
                                )}
                                <p className="py-1">
                                  <span className="text-gray-600 font-medium">
                                    Network Share:
                                  </span>{' '}
                                  <span className="font-semibold">
                                    {(
                                      (strategy.assets / totalETHValue) *
                                      100
                                    ).toFixed(2)}
                                    %
                                  </span>{' '}
                                  of total restaked ETH
                                </p>
                              </div>
                              <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
                                <h5 className="font-medium text-gray-800 mb-2 border-b pb-2">
                                  Concentration Metrics
                                </h5>
                                {strategy.metrics ? (
                                  <>
                                    <p className="py-1">
                                      <span className="text-gray-600 font-medium">
                                        Total Operators:
                                      </span>{' '}
                                      <span className="font-semibold">
                                        {strategy.metrics.totalEntities}
                                      </span>
                                    </p>
                                    <p className="py-1">
                                      <span className="text-gray-600 font-medium">
                                        Top 5 Operators Control:
                                      </span>{' '}
                                      <span
                                        className={
                                          strategy.metrics
                                            .top5HoldersPercentage > 75
                                            ? 'text-red-600 font-semibold'
                                            : 'font-semibold'
                                        }
                                      >
                                        {strategy.metrics.top5HoldersPercentage.toFixed(
                                          1,
                                        )}
                                        %
                                      </span>
                                    </p>
                                    <p className="py-1">
                                      <span className="text-gray-600 font-medium">
                                        Herfindahl Index:
                                      </span>{' '}
                                      <span
                                        className={
                                          strategy.metrics.herfindahlIndex >
                                          0.25
                                            ? 'text-red-600 font-semibold'
                                            : 'font-semibold'
                                        }
                                      >
                                        {strategy.metrics.herfindahlIndex.toFixed(
                                          4,
                                        )}
                                      </span>
                                    </p>
                                    <p className="py-1">
                                      <span className="text-gray-600 font-medium">
                                        Risk Assessment:
                                      </span>{' '}
                                      <Badge
                                        color={
                                          riskLevel === 'critical'
                                            ? 'red'
                                            : riskLevel === 'warning'
                                              ? 'yellow'
                                              : 'green'
                                        }
                                        text={
                                          riskLevel === 'critical'
                                            ? 'High concentration risk'
                                            : riskLevel === 'warning'
                                              ? 'Moderate concentration risk'
                                              : 'Well-distributed'
                                        }
                                      />
                                    </p>
                                  </>
                                ) : (
                                  <p className="text-gray-500 italic">
                                    Concentration metrics not available for this
                                    strategy
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <div className="flex flex-col items-center">
                  <p className="text-gray-500 mb-2">
                    No strategy data available
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setFilteredRiskLevel(null);
                    }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

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
              {highRiskPercentage}% of restaked assets (
              {highRiskETHValue.toLocaleString()} ETH
              {ethPrice > 0 ? ` / ${formatUSDValue(highRiskUSDValue)}` : ''})
              are in highly concentrated strategies
            </p>
            <p className="text-sm text-red-600 mt-1">
              {highRiskStrategies.length} strategies have critical concentration
              risk with top 5 operators controlling more than 75% of assets
            </p>
            <p className="text-sm text-red-600 mt-1">
              Strategies with high concentration risk are vulnerable to operator
              collusion or failures
            </p>
          </div>
        )}

        {renderFilterControls()}
        {renderTable()}

        <div className="mt-4 flex items-center justify-between">
          <div>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)}{' '}
            of {filteredAndSortedData.length} strategies
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="text-sm px-3 py-1 bg-gray-100 rounded-md">
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
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="font-medium mb-2">Concentration metrics explanation:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Total Assets:</strong> Sum of all assets managed by the
              strategy.
            </li>
            <li>
              <strong>Operators:</strong> Number of unique operators in the
              strategy.
            </li>
            <li>
              <strong>Top 5 Operators %:</strong> Percentage of strategy assets
              controlled by the top 5 operators. Higher values indicate more
              centralization.
            </li>
            <li>
              <strong>Herfindahl Index:</strong> Measure of operator
              concentration (0-1). Higher values indicate more concentration.
            </li>
            <li>
              <strong>Risk Levels:</strong>
              <ul className="list-none pl-5 mt-1 space-y-1">
                <li className="flex items-center">
                  <Badge color="red" text="High Risk" />{' '}
                  <span className="ml-2">
                    Top 5 operators control more than 75% of assets or
                    Herfindahl Index {'>'} 0.25
                  </span>
                </li>
                <li className="flex items-center">
                  <Badge color="yellow" text="Medium Risk" />{' '}
                  <span className="ml-2">
                    Top 5 operators control 50-75% of assets or Herfindahl Index
                    between 0.15-0.25
                  </span>
                </li>
                <li className="flex items-center">
                  <Badge color="green" text="Low Risk" />{' '}
                  <span className="ml-2">
                    Well-distributed strategy with no significant concentration
                  </span>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StrategyOverview;
