import React from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#1a202c', '#2d3748', '#4a5568', '#718096', '#a0aec0', '#cbd5e0'];

interface PlatformData {
  operatorData: { name: string; value: number }[];
  keyMetrics: {
    totalRestaked: number | null;
    activeOperators: number | null;
    totalRestakers: number | null;
    stakerHerfindahl: number | null;
    top33PercentOperators: number | null;
  };
}

interface OverviewProps {
  currentPlatformData: PlatformData;
}

const Overview: React.FC<OverviewProps> = ({ currentPlatformData }) => {
  const operatorData = [
    { name: 'P2P.org', value: 32.98 },
    { name: 'Luganodes', value: 15.5 },
    { name: 'Pier Two', value: 12.3 },
    { name: 'Finoa Consensus Services', value: 10.2 },
    { name: 'DSRV', value: 8.5 },
    { name: 'Others', value: 20.52 },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold mb-3 text-gray-800">Risk Assessment</h3>
        <p className="text-gray-700">
          Current operator distribution suggests a moderate level of centralization. 
          Continuous monitoring and diversification strategies are recommended.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Key Metrics</h3>
          <p className="mb-2">Total Restaked: {currentPlatformData.keyMetrics.totalRestaked?.toLocaleString() ?? 'N/A'} ETH</p>
          <p className="mb-2">Active Operators: {currentPlatformData.keyMetrics.activeOperators?.toLocaleString() ?? 'N/A'}</p>
          <p className="mb-2">Total Restakers: {currentPlatformData.keyMetrics.totalRestakers?.toLocaleString() ?? 'N/A'}</p>
          <p className="mb-2">Staker Herfindahl Index: {currentPlatformData.keyMetrics.stakerHerfindahl?.toFixed(2) ?? 'N/A'}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Control Thresholds</h3>
          <p className="mb-2">Restakers needed for 1/3 control: {currentPlatformData.keyMetrics.top33PercentOperators ?? 'N/A'}</p>
          <p className="mb-2">Operators needed for 1/3 control: {Math.ceil((currentPlatformData.keyMetrics.activeOperators ?? 0) / 3)}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Share of Total Restaked ETH by Major Operators</h2>
        <ResponsiveContainer width="100%" height={300}>
          <Treemap
            data={operatorData}
            dataKey="value"
            ratio={4 / 3}
            stroke="#fff"
            fill="#8884d8"
          >
            <Tooltip content={({ payload }) => {
              if (payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-2 shadow-md rounded">
                    <p>{`${data.name}: ${data.value}%`}</p>
                  </div>
                );
              }
              return null;
            }}/>
          </Treemap>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Overview;