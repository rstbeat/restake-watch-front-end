import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  AlertTriangle,
  Copy,
  Check,
  Search,
  Info,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  BarChart3,
  FileDown,
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
import { Checkbox } from '@/components/ui/checkbox';
import * as Tooltip from '@radix-ui/react-tooltip';
import { fetchOperatorData, fetchETHPrice } from '../app/api/restake/restake';
import { OperatorDataFormated } from '../app/interface/operatorData.interface';

// Add these new interfaces to help with strategy data
interface StrategyData {
  strategy_name: string;
  token_name: string;
  token_amount: number;
  token_value_eth: number;
}

// Update the OperatorDataFormated interface with detailed strategies
interface OperatorDataWithStrategies extends OperatorDataFormated {
  strategies?: StrategyData[];
}

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

// Updated Badge component to fix dynamic class issues
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

const OperatorOverview: React.FC = () => {
  const [operatorData, setOperatorData] = useState<
    OperatorDataWithStrategies[] | null
  >(null);
  const [isLoadingOperatorData, setIsLoadingOperatorData] = useState(false);
  const [sortColumn, setSortColumn] =
    useState<keyof OperatorDataWithStrategies>('marketShared');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyDVT, setShowOnlyDVT] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [selectedProfessionalOperators, setSelectedProfessionalOperators] =
    useState<string[]>([]);
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [filteredMarketShare, setFilteredMarketShare] = useState<number | null>(
    null,
  );
  const [ethPrice, setEthPrice] = useState<number>(0);

  const fetchOperatorDataCallback = useCallback(async () => {
    try {
      setIsLoadingOperatorData(true);
      const data = await fetchOperatorData();
      const operatorDataResponse: OperatorDataWithStrategies[] =
        data?.operatorData?.map((item: any) => {
          return {
            operatorAddress: item['Operator Address'] || '',
            operatorName: item['Operator Name'] || 'Unknown',
            majorOperator: item['Major Operator'] || '',
            marketShared: Number((item['Market Share'] || 0) * 100).toFixed(1),
            ethRestaked: new Intl.NumberFormat('en-US', {
              notation: 'compact',
              compactDisplay: 'short',
              minimumFractionDigits: 1,
              maximumFractionDigits: 2,
            }).format(Number(item['ETH Equivalent Value'] || 0)),
            numberOfStrategies: item['Number of Strategies'] || 0,
            dvtTechnology: item['DVT Technology'] || 'None',
            mostUsedStrategies: item['Most Used Strategies'] || [],
            strategies: item['strategies'] || [],
          };
        }) || [];
      setOperatorData(operatorDataResponse);
    } catch (error) {
      console.error('An error occurred while fetching operator data', error);
      setOperatorData([]);
    } finally {
      setIsLoadingOperatorData(false);
    }
  }, []);

  useEffect(() => {
    if (!operatorData) {
      fetchOperatorDataCallback();
    }
  }, [operatorData, fetchOperatorDataCallback]);

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

  const professionalOperators = useMemo(() => {
    if (!operatorData) return [];
    const operatorsSet = new Set<string>();
    operatorData.forEach((operator: OperatorDataWithStrategies) => {
      if (operator.majorOperator) {
        operatorsSet.add(operator.majorOperator);
      }
    });
    return Array.from(operatorsSet);
  }, [operatorData]);

  const getOperatorGroupColor = useCallback(
    (operatorGroup: string | null): string => {
      if (!operatorGroup) return '';

      const colorMap: { [key: string]: string } = {
        P2P: 'purple',
        'Node Monster': 'green',
        Figment: 'blue',
        Stakefish: 'orange',
        // Add more mappings as needed
      };

      // For any group not in the mapping, return a default color
      for (const [group, color] of Object.entries(colorMap)) {
        if (operatorGroup.toLowerCase().includes(group.toLowerCase())) {
          return color;
        }
      }

      return 'gray';
    },
    [],
  );

  const toggleRowExpansion = (address: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [address]: !prev[address],
    }));
  };

  const filteredAndSortedData = useMemo(() => {
    if (!operatorData) return null;
    return [...operatorData]
      .filter((operator) => {
        const matchesSearchTerm =
          operator.operatorAddress
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          operator.operatorName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (operator.majorOperator &&
            operator.majorOperator
              .toLowerCase()
              .includes(searchTerm.toLowerCase()));

        const matchesProfessionalOperator =
          selectedProfessionalOperators.length === 0 ||
          (operator.majorOperator &&
            selectedProfessionalOperators.includes(operator.majorOperator));

        const matchesDVT = !showOnlyDVT || operator.dvtTechnology !== 'None';

        // Add market share filter
        const matchesMarketShare =
          filteredMarketShare === null ||
          (filteredMarketShare === 5 &&
            parseFloat(operator.marketShared) > 5) ||
          (filteredMarketShare === 1 &&
            parseFloat(operator.marketShared) >= 1 &&
            parseFloat(operator.marketShared) <= 5) ||
          (filteredMarketShare === 0 && parseFloat(operator.marketShared) < 1);

        return (
          matchesSearchTerm &&
          matchesProfessionalOperator &&
          matchesDVT &&
          matchesMarketShare
        );
      })
      .sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        // Add null checks
        if (aValue === undefined || bValue === undefined) return 0;

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [
    operatorData,
    sortColumn,
    sortDirection,
    searchTerm,
    showOnlyDVT,
    selectedProfessionalOperators,
    filteredMarketShare,
  ]);

  const paginatedData = useMemo(() => {
    if (!filteredAndSortedData) return null;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedData, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    showOnlyDVT,
    searchTerm,
    selectedProfessionalOperators,
    filteredMarketShare,
  ]);

  const totalPages = useMemo(() => {
    if (!filteredAndSortedData) return 0;
    return Math.ceil(filteredAndSortedData.length / itemsPerPage);
  }, [filteredAndSortedData, itemsPerPage]);

  const handleSort = (column: keyof OperatorDataWithStrategies) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({
    column,
  }: {
    column: keyof OperatorDataWithStrategies;
  }) => {
    if (column !== sortColumn) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortDirection === 'asc' ? (
      <ChevronUp className="ml-2 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-2 h-4 w-4" />
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAddress(text);
      setTimeout(() => setCopiedAddress(null), 2000);
    });
  };

  const truncateAddress = (address: string) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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

  // Helper function to extract numeric value from formatted ETH string
  const extractETHValue = (ethString: string): number => {
    // Convert notations like "849K" to their numeric values
    const value = ethString.replace(/[^0-9.]/g, '');
    const multiplier = ethString.includes('K')
      ? 1_000
      : ethString.includes('M')
        ? 1_000_000
        : ethString.includes('B')
          ? 1_000_000_000
          : 1;

    return parseFloat(value) * multiplier;
  };

  // Helper function to format strategy value display
  const formatStrategyValue = (value: number): string => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K ETH`;
    } else {
      return `${value.toFixed(2)} ETH`;
    }
  };

  const renderFilterControls = () => (
    <div className="mb-6">
      <div className="relative flex-grow mb-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="text"
          placeholder="Search by Name, Address, or Professional Operator"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center">
          <h4 className="text-sm font-semibold mr-2">Market Share:</h4>
          <Button
            variant={filteredMarketShare === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilteredMarketShare(null)}
            className="text-xs"
          >
            All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilteredMarketShare(5)}
            className={`text-xs ${filteredMarketShare === 5 ? 'bg-red-100 border-red-300 hover:bg-red-200' : ''}`}
          >
            High Share (&gt;5%)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilteredMarketShare(1)}
            className={`text-xs ${filteredMarketShare === 1 ? 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200' : ''}`}
          >
            Medium Share (1-5%)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilteredMarketShare(0)}
            className={`text-xs ${filteredMarketShare === 0 ? 'bg-green-100 border-green-300 hover:bg-green-200' : ''}`}
          >
            Low Share (&lt;1%)
          </Button>
        </div>

        <div className="flex items-center space-x-2 ml-auto">
          <Checkbox
            id="show-only-dvt"
            checked={showOnlyDVT}
            onCheckedChange={(checked) => setShowOnlyDVT(checked as boolean)}
          />
          <label
            htmlFor="show-only-dvt"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Show only DVT operators
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm font-medium">Professional Operator:</label>
          <select
            value={selectedProfessionalOperators[0] || ''}
            onChange={(e) => {
              if (e.target.value) {
                setSelectedProfessionalOperators([e.target.value]);
              } else {
                setSelectedProfessionalOperators([]);
              }
            }}
            className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Operators</option>
            {professionalOperators.map((operator) => (
              <option key={operator} value={operator}>
                {operator}
              </option>
            ))}
          </select>
          {selectedProfessionalOperators.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedProfessionalOperators([])}
              className="text-xs"
            >
              Clear
            </Button>
          )}
        </div>

        <div className="flex items-center text-sm text-gray-600 ml-auto">
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
            <TableHead className="text-center">
              <Button
                variant="ghost"
                onClick={() => handleSort('operatorName')}
                className="font-semibold"
              >
                Name
                <SortIcon column="operatorName" />
              </Button>
            </TableHead>
            <TableHead className="text-center">Operator Address</TableHead>
            <TableHead className="text-center">
              <Button
                variant="ghost"
                onClick={() => handleSort('marketShared')}
                className="font-semibold"
              >
                Market Share
                <SortIcon column="marketShared" />
              </Button>
            </TableHead>
            <TableHead className="text-center">
              <Button
                variant="ghost"
                onClick={() => handleSort('ethRestaked')}
                className="font-semibold"
              >
                Total Assets Value (ETH/USD)
                <SortIcon column="ethRestaked" />
              </Button>
              <InfoTooltip content="Total value of all assets managed by this operator, converted to ETH equivalent" />
            </TableHead>
            <TableHead className="text-center">
              DVT Status
              <InfoTooltip content="DVT (Distributed Validator Technology) improves validator security and decentralization. Obol is a leading DVT solution that enables validators to be run by multiple machines and operators, enhancing fault-tolerance and reducing slashing risk." />
            </TableHead>
            <TableHead className="text-center">
              <Button
                variant="ghost"
                onClick={() => handleSort('majorOperator')}
                className="font-semibold"
              >
                Professional Operator
                <SortIcon column="majorOperator" />
              </Button>
              <InfoTooltip content="The professional operator this operator belongs to. Professional operators are established entities that manage significant amounts of staked ETH across multiple addresses." />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoadingOperatorData ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <div className="flex flex-col items-center justify-center">
                  <Skeleton className="w-3/4 h-[20px] rounded-full mb-2" />
                  <Skeleton className="w-2/3 h-[20px] rounded-full mb-2" />
                  <Skeleton className="w-1/2 h-[20px] rounded-full" />
                </div>
              </TableCell>
            </TableRow>
          ) : paginatedData && paginatedData.length > 0 ? (
            paginatedData.map((row, index) => {
              const operatorGroupColor = getOperatorGroupColor(
                row.majorOperator,
              );
              const isExpanded = expandedRows[row.operatorAddress] || false;

              return (
                <React.Fragment key={row.operatorAddress || index}>
                  <TableRow
                    className={`hover:bg-gray-50 transition-colors
                      ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                      ${row.majorOperator ? `border-l-4 border-l-${operatorGroupColor}-400` : ''}
                      ${isExpanded ? 'border-b-0' : ''}`}
                  >
                    <TableCell className="font-semibold text-center">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRowExpansion(row.operatorAddress)}
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
                      {row.operatorName}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <div className="font-mono text-sm px-3 py-1.5 bg-gray-100 rounded-l-md border border-r-0 border-gray-200 max-w-[180px] truncate">
                          {truncateAddress(row.operatorAddress)}
                        </div>
                        <button
                          onClick={() => copyToClipboard(row.operatorAddress)}
                          className={`p-2 border border-gray-200 rounded-r-md transition-colors ${
                            copiedAddress === row.operatorAddress
                              ? 'bg-green-100 text-green-700 border-green-300'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                          title={
                            copiedAddress === row.operatorAddress
                              ? 'Copied!'
                              : 'Copy full address'
                          }
                        >
                          {copiedAddress === row.operatorAddress ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-center justify-center">
                        <div className="flex items-center mb-1 w-full max-w-[150px]">
                          <span
                            className={`mr-2 font-semibold ${
                              parseFloat(row.marketShared) > 5
                                ? 'text-red-600'
                                : parseFloat(row.marketShared) > 1
                                  ? 'text-amber-600'
                                  : 'text-green-600'
                            }`}
                          >
                            {row.marketShared}%
                          </span>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`${
                                parseFloat(row.marketShared) > 5
                                  ? 'bg-red-500'
                                  : parseFloat(row.marketShared) > 1
                                    ? 'bg-amber-500'
                                    : 'bg-green-500'
                              } h-2 rounded-full transition-all`}
                              style={{
                                width: `${Math.min(parseFloat(row.marketShared) * 5, 100)}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        {parseFloat(row.marketShared) > 5 && (
                          <Badge color="red" text="High" />
                        )}
                        {parseFloat(row.marketShared) >= 1 &&
                          parseFloat(row.marketShared) <= 5 && (
                            <Badge color="yellow" text="Medium" />
                          )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {row.ethRestaked} ETH
                        </span>
                        {ethPrice > 0 && (
                          <span className="text-xs text-gray-500">
                            {formatUSDValue(
                              extractETHValue(row.ethRestaked) * ethPrice,
                            )}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {row.dvtTechnology !== 'None' ? (
                        <Badge color="green" text={row.dvtTechnology} />
                      ) : (
                        <Badge color="gray" text="None" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.majorOperator ? (
                        <Badge color="blue" text={row.majorOperator} />
                      ) : (
                        <Badge color="gray" text="Independent" />
                      )}
                    </TableCell>
                  </TableRow>

                  {isExpanded && (
                    <TableRow className="bg-purple-50 border-t-0">
                      <TableCell colSpan={9} className="p-0">
                        <div className="p-4 border-t-2 border-purple-200">
                          <div className="text-sm">
                            <h4 className="font-semibold mb-3 text-purple-700 flex items-center">
                              <Info className="h-4 w-4 mr-2" />
                              Additional Information
                            </h4>
                            <div className="grid grid-cols-1 gap-4 mb-4">
                              <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
                                <h5 className="font-medium text-gray-800 mb-2 border-b pb-2">
                                  Operator Details
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="py-1">
                                      <span className="text-gray-600 font-medium">
                                        Full Address:
                                      </span>{' '}
                                      <span className="font-mono bg-gray-50 px-1 rounded">
                                        {row.operatorAddress}
                                      </span>
                                    </p>
                                    <p className="py-1">
                                      <span className="text-gray-600 font-medium">
                                        Market Share:
                                      </span>{' '}
                                      <span className="font-semibold">
                                        {row.marketShared}%
                                      </span>{' '}
                                      of total restaked ETH
                                    </p>
                                  </div>
                                  <div>
                                    <p className="py-1">
                                      <span className="text-gray-600 font-medium">
                                        ETH Restaked:
                                      </span>{' '}
                                      <span className="font-semibold">
                                        {row.ethRestaked}
                                      </span>
                                    </p>
                                    {ethPrice > 0 && (
                                      <p className="py-1">
                                        <span className="text-gray-600 font-medium">
                                          USD Value:
                                        </span>{' '}
                                        <span className="font-semibold">
                                          {formatUSDValue(
                                            extractETHValue(row.ethRestaked) *
                                              ethPrice,
                                          )}
                                        </span>
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Strategy section with improved styling */}
                            {row.strategies && row.strategies.length > 0 && (
                              <div className="mt-4">
                                <h5 className="font-medium text-gray-800 mb-3 border-b pb-2 flex items-center">
                                  <BarChart3 className="h-4 w-4 mr-2 text-purple-600" />
                                  All Strategies With Assets
                                </h5>
                                <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    {row.strategies
                                      .sort(
                                        (a, b) =>
                                          b.token_value_eth - a.token_value_eth,
                                      )
                                      .map((strategy, idx) => (
                                        <div
                                          key={idx}
                                          className="flex justify-between items-center p-3 bg-gray-50 rounded-md hover:bg-purple-50 transition-colors border border-gray-200"
                                        >
                                          <div className="flex flex-col">
                                            <span className="font-medium text-gray-800">
                                              {strategy.strategy_name}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                              {strategy.token_name}
                                            </span>
                                          </div>
                                          <div className="flex flex-col items-end">
                                            <Badge
                                              color={
                                                strategy.token_value_eth > 10000
                                                  ? 'blue'
                                                  : strategy.token_value_eth >
                                                      1000
                                                    ? 'green'
                                                    : 'gray'
                                              }
                                              text={`${new Intl.NumberFormat(
                                                'en-US',
                                                {
                                                  notation: 'compact',
                                                  maximumFractionDigits: 1,
                                                },
                                              ).format(
                                                strategy.token_amount,
                                              )} ${strategy.token_name}`}
                                            />
                                            {ethPrice > 0 && (
                                              <span className="text-xs text-gray-500 mt-1">
                                                {formatUSDValue(
                                                  strategy.token_value_eth *
                                                    ethPrice,
                                                )}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              </div>
                            )}
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
                    No operator data available
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setShowOnlyDVT(false);
                      setSelectedProfessionalOperators([]);
                      setFilteredMarketShare(null);
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
              icon={<BarChart3 className="h-4 w-4" />}
              gradientColors={['#3b82f6', '#06b6d4']}
              size="h-9 w-9"
            />
          </div>
          All Operators by Market Share
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Displaying the concentration of restaked ETH among all operators in
          the ecosystem
        </p>

        {operatorData && operatorData.length > 0 && (
          <div className="bg-red-50 p-4 rounded-lg mb-4 border border-red-200">
            <p className="text-red-700 font-medium">
              Top 5 operators control{' '}
              {operatorData
                .sort(
                  (a, b) =>
                    parseFloat(b.marketShared) - parseFloat(a.marketShared),
                )
                .slice(0, 5)
                .reduce(
                  (sum: number, op) => sum + parseFloat(op.marketShared),
                  0,
                )
                .toFixed(1)}
              % of all restaked assets
            </p>
            <p className="text-sm text-red-600 mt-1">
              {
                operatorData.filter((op) => parseFloat(op.marketShared) > 5)
                  .length
              }{' '}
              operators have more than 5% market share each, indicating
              significant concentration
            </p>
            <p className="text-sm text-red-600 mt-1">
              Professional operators like P2P and Node Monster manage multiple
              individual nodes, further increasing concentration risk
            </p>
          </div>
        )}

        {renderFilterControls()}
        {renderTable()}

        <div className="mt-4 flex items-center justify-between">
          <div>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(
              currentPage * itemsPerPage,
              filteredAndSortedData?.length || 0,
            )}{' '}
            of {filteredAndSortedData?.length || 0} operators
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
      </div>
    </div>
  );
};

export default OperatorOverview;
