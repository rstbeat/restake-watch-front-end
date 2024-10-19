import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  AlertTriangle,
  Copy,
  Check,
  Search,
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
import { Skeleton } from './ui/skeleton';
import { Input } from '@/components/ui/input';
import { fetchStakerData } from '../app/api/restake/restake';
import { StakerData } from '../app/interface/operatorData.interface';

interface RestakerData {
  restakerAddress: string;
  amountRestaked: string;
  ethRestaked: string;
  numberOfStrategies: number;
  mostUsedStrategies: string;
}

const RestakerOverview: React.FC = () => {
  const [stakerData, setStakerData] = useState<RestakerData[] | null>(null);
  const [isLoadingStakerData, setIsLoadingStakerData] = useState(false);
  const [sortColumn, setSortColumn] =
    useState<keyof RestakerData>('amountRestaked');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchStakerDataCallback = useCallback(async () => {
    try {
      setIsLoadingStakerData(true);
      const data = await fetchStakerData();
      const stakerDataResponse = data.stakerData.map((data: StakerData) => ({
        restakerAddress: data['Staker Address'],
        amountRestaked: Number(data['Market Share'] * 100).toFixed(2),
        ethRestaked: new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 1,
          maximumFractionDigits: 2,
        }).format(Number(data['ETH Restaked'].toFixed(2))),
        numberOfStrategies: data['Number of Strategies'],
        mostUsedStrategies: data['Most Used Strategy'],
      }));
      setStakerData(stakerDataResponse);
    } catch (error) {
      console.error('An error occurred while fetching staker data', error);
    } finally {
      setIsLoadingStakerData(false);
    }
  }, []);

  useEffect(() => {
    if (!stakerData) {
      fetchStakerDataCallback();
    }
  }, [stakerData, fetchStakerDataCallback]);

  const filteredAndSortedData = useMemo(() => {
    if (!stakerData) return null;
    return [...stakerData]
      .filter((staker) =>
        staker.restakerAddress.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [stakerData, sortColumn, sortDirection, searchTerm]);

  const handleSort = (column: keyof RestakerData) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ column }: { column: keyof RestakerData }) => {
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
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg mt-8 shadow-md">
        <h2 className="text-xl font-semibold mb-2 text-gray-800 flex items-center">
          <span className="mr-2">🏆</span>
          Top 50 Restakers by Market Share
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Displaying the distribution of restaked ETH among the most significant
          restakers in the ecosystem
        </p>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search by Restaker Address"
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
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Restaker Address</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('amountRestaked')}
                    className="font-semibold"
                  >
                    Market Share
                    <SortIcon column="amountRestaked" />
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
                    Strategies
                    <SortIcon column="numberOfStrategies" />
                  </Button>
                </TableHead>
                <TableHead>Most Used Strategy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingStakerData ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <Skeleton className="w-full h-[20px] rounded-full" />
                  </TableCell>
                </TableRow>
              ) : filteredAndSortedData && filteredAndSortedData.length > 0 ? (
                filteredAndSortedData.map((row, index) => (
                  <TableRow
                    key={row.restakerAddress}
                    className="hover:bg-gray-50"
                  >
                    <TableCell className="font-semibold">{index + 1}</TableCell>
                    <TableCell className="font-mono text-sm">
                      <div className="flex items-center">
                        <span className="mr-2">
                          {truncateAddress(row.restakerAddress)}
                        </span>
                        <Button
                          variant="ghost"
                          onClick={() => copyToClipboard(row.restakerAddress)}
                          className="p-1"
                          title={
                            copiedAddress === row.restakerAddress
                              ? 'Copied!'
                              : 'Copy full address'
                          }
                        >
                          {copiedAddress === row.restakerAddress ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      <div className="flex items-center">
                        {row.amountRestaked}%
                        {parseFloat(row.amountRestaked) > 5 && (
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
                    <TableCell>{row.mostUsedStrategies}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No restaker data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default RestakerOverview;
