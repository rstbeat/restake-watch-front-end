import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ArrowUpDown, AlertTriangle, Copy, Check } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { OperatorDataFormated } from '../app/interface/operatorData.interface';
import { Button } from '@/components/ui/button';

interface OperatorOverviewProps {
  operatorData: OperatorDataFormated[] | null;
}

const OperatorOverview: React.FC<OperatorOverviewProps> = ({ operatorData }) => {
  const [sortColumn, setSortColumn] = useState<keyof OperatorDataFormated>('marketShared');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);


  const sortedData = useMemo(() => {
    if (!operatorData) return null;
    return [...operatorData].sort((a, b) => {
      if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [operatorData, sortColumn, sortDirection]);

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
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg mt-8 shadow-md">
        <h2 className="text-xl font-semibold mb-2 text-gray-800 flex items-center">
          <span className="mr-2">🏢</span>
          Top 50 Operators by Market Share
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Displaying the concentration of restaked ETH among the most significant operators in the ecosystem
        </p>
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
                    Strategies
                    <SortIcon column="numberOfStrategies" />
                  </Button>
                </TableHead>
                <TableHead>Most Used Strategy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData ? (
                sortedData.map((row, index) => (
                  <TableRow key={row.operatorAddress} className="hover:bg-gray-50">
                    <TableCell className="font-semibold">{index + 1}</TableCell>
                    <TableCell className="font-mono text-sm">
                      <div className="flex items-center">
                        <span className="mr-2">{truncateAddress(row.operatorAddress)}</span>
                        <Button
                          variant="ghost"
                          onClick={() => copyToClipboard(row.operatorAddress)}
                          className="p-1"
                          title={copiedAddress === row.operatorAddress ? "Copied!" : "Copy full address"}
                        >
                          {copiedAddress === row.operatorAddress ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      <div className="flex items-center">
                        {parseFloat(row.marketShared).toFixed(2)}%
                        {parseFloat(row.marketShared) > 10 && (
                          <AlertTriangle 
                            className="ml-2 h-4 w-4 text-yellow-500" 
                            title="High market share concentration"
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{parseFloat(row.ethRestaked).toLocaleString()} ETH</TableCell>
                    <TableCell className="text-center">{row.numberOfStrategies}</TableCell>
                    <TableCell>{row.mostUsedStrategies}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <Skeleton className="w-full h-[20px] rounded-full" />
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

export default OperatorOverview;