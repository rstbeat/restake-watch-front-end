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

        return matchesSearchTerm && matchesProfessionalOperator && matchesDVT;
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
  ]);

  const paginatedData = useMemo(() => {
    if (!filteredAndSortedData) return null;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedData, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [showOnlyDVT, searchTerm, selectedProfessionalOperators]);

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
              Top 5 operators control {operatorData
                .sort((a, b) => parseFloat(b.marketShared) - parseFloat(a.marketShared))
                .slice(0, 5)
                .reduce((sum: number, op) => sum + parseFloat(op.marketShared), 0)
                .toFixed(1)}% of all restaked assets
            </p>
            <p className="text-sm text-red-600 mt-1">
              {operatorData.filter(op => parseFloat(op.marketShared) > 5).length} operators have more than 5% market share each, indicating significant concentration
            </p>
            <p className="text-sm text-red-600 mt-1">
              Professional operators like P2P and Node Monster manage multiple individual nodes, further increasing concentration risk
            </p>
          </div>
        )}

        <div className="mb-4 flex items-center space-x-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search by Name, Address, or Professional Operator"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex items-center space-x-2">
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
          <div className="flex items-center space-x-2">
            <div>
              <label
                htmlFor="professional-operator-select"
                className="text-sm font-medium leading-none"
              >
                Professional Operator
              </label>
              <select
                id="professional-operator-select"
                multiple
                value={selectedProfessionalOperators}
                onChange={(e) => {
                  const options = Array.from(
                    e.target.selectedOptions,
                    (option) => option.value,
                  );
                  setSelectedProfessionalOperators(options);
                }}
                className="mt-1 block w-full pl-3 pr-10 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                {professionalOperators.map((operator) => (
                  <option key={operator} value={operator}>
                    {operator}
                  </option>
                ))}
              </select>
            </div>
            {selectedProfessionalOperators.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedProfessionalOperators([])}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingOperatorData ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    <Skeleton className="w-full h-[20px] rounded-full" />
                  </TableCell>
                </TableRow>
              ) : paginatedData && paginatedData.length > 0 ? (
                paginatedData.map((row, index) => (
                  <TableRow
                    key={row.operatorAddress || index}
                    className="hover:bg-gray-50"
                  >
                    <TableCell className="font-semibold text-center">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>
                    <TableCell className="font-medium text-center">
                      {row.operatorName}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-center">
                      <div className="flex items-center justify-center">
                        <span className="mr-2">
                          {truncateAddress(row.operatorAddress)}
                        </span>
                        {row.operatorAddress && (
                          <Button
                            variant="ghost"
                            onClick={() => copyToClipboard(row.operatorAddress)}
                            className="p-1"
                            title={
                              copiedAddress === row.operatorAddress
                                ? 'Copied!'
                                : 'Copy full address'
                            }
                          >
                            {copiedAddress === row.operatorAddress ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <span>{row.marketShared}%</span>
                        {parseFloat(row.marketShared) > 5 && (
                          <Badge color="red" text="High" />
                        )}
                        {parseFloat(row.marketShared) >= 1 &&
                          parseFloat(row.marketShared) <= 5 && (
                            <Badge color="yellow" text="Medium" />
                          )}
                        {/* No badge for below 1% */}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
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
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No operator data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
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

export default OperatorOverview;
