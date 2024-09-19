import React, { useCallback, useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchOperatorData } from '../app/api/restake/restake';
import { OperatorData } from '../app/interface/operatorData.interface';

interface OperatorDataFormated {
  operatorAddress: string;
  // operatorName: string;
  marketShared: string;
  ethRestaked: string;
  numberOfStrategies: number;
  mostUsedStrategies: string;
}

const weeklyOperatorData = [
  { week: 'Week 1', operators: 5 },
  { week: 'Week 2', operators: 6 },
  { week: 'Week 3', operators: 4 },
  { week: 'Week 4', operators: 7 },
  { week: 'Week 5', operators: 5 },
  { week: 'Week 6', operators: 8 },
];

const OperatorOverview: React.FC = () => {
  // const mockData = generateMockData(50);

  // Operator Data
  const [operatorData, setOperatorData] = useState<
    OperatorDataFormated[] | null
  >(null);
  const [, setIsLoadingOperatorData] = useState(false);

  const fetchOperatorDataCallback = useCallback(async () => {
    try {
      setIsLoadingOperatorData(true);
      const data = await fetchOperatorData();
      const operatorDataResponse = data.operatorData.map(
        (operator: OperatorData) => ({
          operatorAddress: operator['Operator Address'].substr(2, 25),
          // operatorName: operator['Operator Name'],
          marketShared: operator['Market Share'].toFixed(6),
          ethRestaked: operator['ETH Restaked'].toFixed(6),
          numberOfStrategies: operator['Number of Strategies'],
          mostUsedStrategies: operator['Most Used Strategy'],
        }),
      );
      setOperatorData(operatorDataResponse);
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Operators Needed to Control 1/3 of Total Restaked ETH
          </CardTitle>
          <CardDescription>Weekly data since May 2024</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={weeklyOperatorData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="operators" fill="#8884d8">
                <LabelList dataKey="operators" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 font-medium leading-none">
            Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
          </div>
          <div className="leading-none text-muted-foreground">
            Showing weekly data for the last 6 weeks
          </div>
        </CardFooter>
      </Card>

      <div className="bg-white p-6 rounded-lg mt-8 shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          <span className="mr-2">⏱️</span>
          Concentration of stake among operators
        </h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Operator Address</TableHead>
                {/* <TableHead>Operator Name</TableHead> */}
                <TableHead>Market Shared</TableHead>
                <TableHead>ETH Restaked</TableHead>
                <TableHead>Number of Strategies</TableHead>
                <TableHead>Most Used Strategies</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operatorData ? (
                operatorData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono">
                      {row.operatorAddress}
                    </TableCell>
                    {/* <TableCell>{row.operatorName}</TableCell> */}
                    <TableCell>{row.marketShared}</TableCell>
                    <TableCell>{row.ethRestaked}</TableCell>
                    <TableCell>{row.numberOfStrategies}</TableCell>
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
