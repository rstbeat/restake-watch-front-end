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
import { fetchOperatorData } from '../app/api/restake/restake';
import { OperatorDataFormated } from '../app/interface/operatorData.interface';

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
    OperatorDataFormated[] | null
  >(null);
  const [isLoadingOperatorData, setIsLoadingOperatorData] = useState(false);
  const [sortColumn, setSortColumn] =
    useState<keyof OperatorDataFormated>('marketShared');
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

  const fetchOperatorDataCallback = useCallback(async () => {
    try {
      setIsLoadingOperatorData(true);
      const data = await fetchOperatorData();
      const operatorDataResponse: OperatorDataFormated[] =
        data?.operatorData?.map((item: any) => ({
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
        })) || [];
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

  const professionalOperators = useMemo(() => {
    if (!operatorData) return [];
    const operatorsSet = new Set<string>();
    operatorData.forEach((operator) => {
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

  const exportToCsv = () => {
    if (!operatorData) return;

    // Define CSV headers and create CSV content
    const headers = [
      'Name',
      'Address',
      'Market Share',
      'ETH Restaked',
      'DVT',
      'Professional Operator',
    ];
    const csvContent = [
      headers.join(','),
      ...operatorData.map((row) =>
        [
          `"${row.operatorName}"`,
          `"${row.operatorAddress}"`,
          `${row.marketShared}%`,
          row.ethRestaked,
          `"${row.dvtTechnology}"`,
          `"${row.majorOperator || 'Independent'}"`,
        ].join(','),
      ),
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'operator_data.csv');
    link.click();
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

  const handleSort = (column: keyof OperatorDataFormated) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ column }: { column: keyof OperatorDataFormated }) => {
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

        <Button
          variant="outline"
          size="sm"
          onClick={exportToCsv}
          className="ml-auto"
        >
          <FileDown className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>
    </div>
  );

  const renderTable = () => (
    <div className="overflow-x-auto max-h-[70vh] border rounded-lg shadow-sm">
      <Table>
        <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
          <TableRow>
            <TableHead className="w-[50px] text-center">#</TableHead>
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
                Total Assets (ETH)
                <SortIcon column="ethRestaked" />
              </Button>
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
            <TableHead className="w-[50px]"></TableHead>
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

                    <TableCell className="text-center font-medium">
                      {row.ethRestaked} ETH
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

                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRowExpansion(row.operatorAddress)}
                        className="p-0 h-8 w-8"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>

                  {isExpanded && (
                    <TableRow className="bg-gray-50 border-t-0">
                      <TableCell colSpan={8} className="p-4">
                        <div className="text-sm">
                          <h4 className="font-semibold mb-2 text-gray-700">
                            Additional Information
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-3 rounded border border-gray-200">
                              <h5 className="font-medium text-gray-800 mb-2">
                                Operator Details
                              </h5>
                              <p>
                                <span className="text-gray-600">
                                  Full Address:
                                </span>{' '}
                                {row.operatorAddress}
                              </p>
                              <p>
                                <span className="text-gray-600">
                                  Market Share:
                                </span>{' '}
                                {row.marketShared}% of total restaked ETH
                              </p>
                              <p>
                                <span className="text-gray-600">
                                  ETH Restaked:
                                </span>{' '}
                                {row.ethRestaked}
                              </p>
                            </div>
                            <div className="bg-white p-3 rounded border border-gray-200">
                              <h5 className="font-medium text-gray-800 mb-2">
                                Most Used Strategies
                              </h5>
                              {row.mostUsedStrategies &&
                              row.mostUsedStrategies.length > 0 ? (
                                <div className="space-y-2">
                                  {row.mostUsedStrategies
                                    .slice(0, 3)
                                    .map((strategy: any, idx: number) => (
                                      <div
                                        key={idx}
                                        className="flex justify-between items-center p-1 border-b border-gray-100"
                                      >
                                        <span>
                                          {strategy.name || 'Unknown Strategy'}
                                        </span>
                                        <Badge
                                          color="blue"
                                          text={
                                            strategy.percentage
                                              ? `${strategy.percentage}%`
                                              : 'N/A'
                                          }
                                        />
                                      </div>
                                    ))}
                                </div>
                              ) : (
                                <p className="text-gray-500 italic">
                                  No strategy data available
                                </p>
                              )}
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
