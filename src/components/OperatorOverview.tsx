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

const OperatorOverview: React.FC = () => {
  const [operatorData, setOperatorData] = useState<OperatorDataFormated[] | null>(null);
  const [isLoadingOperatorData, setIsLoadingOperatorData] = useState(false);
  const [sortColumn, setSortColumn] = useState<keyof OperatorDataFormated>('marketShared');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyDVT, setShowOnlyDVT] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);

  const fetchOperatorDataCallback = useCallback(async () => {
    try {
      setIsLoadingOperatorData(true);
      const data = await fetchOperatorData();
      const operatorDataResponse = data?.operatorData?.map((item: any) => ({
        operatorAddress: item['Operator Address'] || '',
        marketShared: Number((item['Market Share'] || 0) * 100).toFixed(2),
        ethRestaked: new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 1,
          maximumFractionDigits: 2,
        }).format(Number((item['ETH Restaked'] || 0).toFixed(2))),
        numberOfStrategies: item['Number of Strategies'] || 0,
        dvtTechnology: item['DVT Technology'] || 'None',
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

  const filteredAndSortedData = useMemo(() => {
    if (!operatorData) return null;
    return [...operatorData]
      .filter((operator) =>
        operator.operatorAddress.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((operator) => !showOnlyDVT || operator.dvtTechnology !== 'None')
      .sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [operatorData, sortColumn, sortDirection, searchTerm, showOnlyDVT]);

  const paginatedData = useMemo(() => {
    if (!filteredAndSortedData) return null;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedData, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [showOnlyDVT, searchTerm]);

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
          <span className="mr-2">🏢</span>
          All Operators by Market Share
        </h2>
        <p className="text-sm text-gray-600 mb-4">
        Displaying the concentration of restaked ETH among all operators in the ecosystem
        </p>
        <div className="mb-4 flex items-center space-x-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search by Operator Address"
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
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Operator Address</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('marketShared')}
                    className="font-semibold"
                  >
                    Market Share
                    <SortIcon column="marketShared" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('ethRestaked')}
                    className="font-semibold"
                  >
                    ETH Restaked
                    <SortIcon column="ethRestaked" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('numberOfStrategies')}
                    className="font-semibold"
                  >
                    # Strategies
                    <SortIcon column="numberOfStrategies" />
                  </Button>
                </TableHead>
                <TableHead>
                  DVT Status
                  <InfoTooltip content="DVT (Distributed Validator Technology) improves validator security and decentralization. Obol is a leading DVT solution that enables validators to be run by multiple machines and operators, enhancing fault-tolerance and reducing slashing risk." />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingOperatorData ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <Skeleton className="w-full h-[20px] rounded-full" />
                  </TableCell>
                </TableRow>
              ) : paginatedData && paginatedData.length > 0 ? (
                paginatedData.map((row, index) => (
                  <TableRow
                    key={row.operatorAddress || index}
                    className="hover:bg-gray-50"
                  >
                    <TableCell className="font-semibold">{index + 1}</TableCell>
                    <TableCell className="font-mono text-sm">
                      <div className="flex items-center">
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
                    <TableCell className="font-semibold">
                      <div className="flex items-center">
                        {row.marketShared}%
                        {parseFloat(row.marketShared) > 10 && (
                          <span title="High market share concentration">
                            <AlertTriangle className="ml-2 h-4 w-4 text-yellow-500" />
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{row.ethRestaked} ETH</TableCell>
                    <TableCell className="text-center">
                      {row.numberOfStrategies}
                    </TableCell>
                    <TableCell>
                      {row.dvtTechnology !== 'None' ? (
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          <span className="text-green-600">{row.dvtTechnology}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500">None</span>
                      )}
                    </TableCell>
                    </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No operator data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div>
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedData?.length || 0)} of {filteredAndSortedData?.length || 0} operators
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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