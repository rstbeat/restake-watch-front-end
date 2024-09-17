import React from 'react';
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

interface OperatorData {
  operatorAddress: string;
  operatorName: string;
  marketShared: string;
  ethRestaked: string;
  numberOfStrategies: number;
  mostUsedStrategies: string;
}

const generateMockData = (rows: number): OperatorData[] => {
  return Array.from({ length: rows }, (_, i) => ({
    operatorAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
    operatorName: `Operator ${i + 1}`,
    marketShared: (Math.random() * 0.5).toFixed(6),
    ethRestaked: (Math.random() * 200 - 100).toFixed(6),
    numberOfStrategies: Math.floor(Math.random() * 5) + 1,
    mostUsedStrategies: ['Swell', 'Rocket_Pool', 'Lido', 'Binance', 'UNKNOWN'][
      Math.floor(Math.random() * 5)
    ],
  }));
};

const weeklyOperatorData = [
  { week: 'Week 1', operators: 5 },
  { week: 'Week 2', operators: 6 },
  { week: 'Week 3', operators: 4 },
  { week: 'Week 4', operators: 7 },
  { week: 'Week 5', operators: 5 },
  { week: 'Week 6', operators: 8 },
];

const OperatorOverview: React.FC = () => {
  const mockData = generateMockData(50);

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
                <TableHead>Operator Name</TableHead>
                <TableHead>Market Shared</TableHead>
                <TableHead>ETH Restaked</TableHead>
                <TableHead>Number of Strategies</TableHead>
                <TableHead>Most Used Strategies</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono">
                    {row.operatorAddress}
                  </TableCell>
                  <TableCell>{row.operatorName}</TableCell>
                  <TableCell>{row.marketShared}</TableCell>
                  <TableCell>{row.ethRestaked}</TableCell>
                  <TableCell>{row.numberOfStrategies}</TableCell>
                  <TableCell>{row.mostUsedStrategies}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default OperatorOverview;
