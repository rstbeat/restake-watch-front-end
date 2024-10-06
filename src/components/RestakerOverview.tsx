import React, { useCallback, useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { fetchStakerData } from '../app/api/restake/restake';
import { Skeleton } from './ui/skeleton';
import { StakerData } from '../app/interface/operatorData.interface';

interface RestakerData {
  ethRestaked: any;
  restakerAddress: string;
  // restakerName: string;
  amountRestaked: string;
  // percentageOfTotal: string;
  numberOfStrategies: number;
  mostUsedStrategies: string;
}

const weeklyRestakerData = [
  { week: 'Week 1', restakers: 1000 },
  { week: 'Week 2', restakers: 1200 },
  { week: 'Week 3', restakers: 950 },
  { week: 'Week 4', restakers: 1300 },
  { week: 'Week 5', restakers: 1100 },
  { week: 'Week 6', restakers: 1400 },
];

const RestakerOverview: React.FC = () => {
  const [stakerData, setStakerData] = useState<RestakerData[] | null>(null);
  const [, setIsLoadingStakerData] = useState(false);

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
      console.error('Ha ocurrido un error');
    } finally {
      setIsLoadingStakerData(false);
    }
  }, []);

  useEffect(() => {
    if (!stakerData) {
      fetchStakerDataCallback();
    }
  }, [stakerData, fetchStakerDataCallback]);

  return (
    <div className="space-y-6">
      {/* <Card>
        <CardHeader>
          <CardTitle>
            Restakers Needed to Control 1/3 of Total Restaked ETH
          </CardTitle>
          <CardDescription>Weekly data since May 2024</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={weeklyRestakerData}
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
              <Bar dataKey="restakers" fill="#82ca9d">
                <LabelList dataKey="restakers" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 font-medium leading-none">
            Trending up by 3.8% this month <TrendingUp className="h-4 w-4" />
          </div>
          <div className="leading-none text-muted-foreground">
            Showing weekly data for the last 6 weeks
          </div>
        </CardFooter>
      </Card> */}

      <div className="bg-white p-6 rounded-lg mt-8 shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          <span className="mr-2">⏱️</span>
          Distribution of stake among restakers
        </h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Restaker Address</TableHead>
                <TableHead>Market Share</TableHead>
                <TableHead>ETH Restaked</TableHead>
                <TableHead>Number of Strategies</TableHead>
                <TableHead>Most Used Strategy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stakerData ? (
                stakerData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono">
                      {row.restakerAddress}
                    </TableCell>
                    <TableCell>{row.amountRestaked + '%'}</TableCell>
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

export default RestakerOverview;
