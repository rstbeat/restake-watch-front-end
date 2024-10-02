import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import MetricCard from './MetricCard';

const COLORS = ['#4A90E2', '#50C878', '#9B59B6', '#F39C12'];
const CHART_COLORS = ['#4A90E2', '#E8F4FD'];

interface Thresholds {
  min: number;
  max: number;
  green: number;
  yellow: number;
}

interface PlatformData {
  operatorData: { name: string; value: number }[];
  monthlyTVLData: { date: string; tvl: number }[];
  keyMetrics: {
    totalRestaked: number | null;
    activeOperators: number | null;
    totalRestakers: number | null;
    p2pMarketShare: number | null;
    stakerHerfindahl: number | null;
    top33PercentOperators: number | null;
  };
}

interface OverviewProps {
  currentPlatformData: PlatformData;
  metricThresholds: Record<string, Thresholds>;
}

const Overview: React.FC<OverviewProps> = ({
  currentPlatformData,
  metricThresholds,
}) => {
  const getRiskAssessment = (
    p2pMarketShare: number | null,
    thresholds: Thresholds,
  ): string => {
    if (p2pMarketShare === null) {
      return 'Insufficient data to assess risk.';
    }
    if (p2pMarketShare > thresholds.yellow) {
      return 'High operator concentration risk. Immediate diversification recommended.';
    }
    if (p2pMarketShare > thresholds.green) {
      return 'Moderate operator concentration. Monitor closely and consider diversification strategies.';
    }
    return 'Healthy operator distribution. Continue monitoring for changes.';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Share of total restaked ETH operated by P2P.org"
          value={currentPlatformData.keyMetrics.p2pMarketShare}
          thresholds={metricThresholds.p2pMarketShare}
          format={(v) => (v ? `${(v * 100).toFixed(2)}%` : 'N/A')}
        />
        <MetricCard
          title="Individual restakers needed to control 1/3 of the total restake"
          value={currentPlatformData.keyMetrics.stakerHerfindahl}
          thresholds={metricThresholds.stakerHerfindahl}
          format={(v) => v?.toString() ?? 'N/A'}
        />
        <MetricCard
          title="Operators needed to control 1/3 of the total restake"
          value={currentPlatformData.keyMetrics.top33PercentOperators}
          thresholds={metricThresholds.top33PercentOperators}
          format={(v) => v?.toString() ?? 'N/A'}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            Key Metrics
          </h3>
          <p className="mb-2">
            Total Restaked:{' '}
            {currentPlatformData.keyMetrics.totalRestaked?.toLocaleString() ??
              'N/A'}{' '}
            ETH
          </p>
          <p className="mb-2">
            Active Operators:{' '}
            {currentPlatformData.keyMetrics.activeOperators?.toLocaleString() ??
              'N/A'}
          </p>
          <p>
            Total Restakers:{' '}
            {currentPlatformData.keyMetrics.totalRestakers?.toLocaleString() ??
              'N/A'}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 col-span-2">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            Risk Assessment
          </h3>
          <p className="text-gray-700">
            {getRiskAssessment(
              currentPlatformData.keyMetrics.p2pMarketShare,
              metricThresholds.p2pMarketShare,
            )}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Operator Distribution
          </h2>
          {currentPlatformData.operatorData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={currentPlatformData.operatorData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {currentPlatformData.operatorData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center mt-10 text-gray-500">No data available</p>
          )}
        </div>
        {/* <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Monthly TVL (Last 5 Months)
          </h2>
          {currentPlatformData.monthlyTVLData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={currentPlatformData.monthlyTVLData}>
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #d1d5db',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="tvl"
                  stroke={CHART_COLORS[0]}
                  fill={CHART_COLORS[1]}
                  fillOpacity={0.8}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center mt-10 text-gray-500">No data available</p>
          )}
        </div> */}
      </div>
    </div>
  );
};

export default Overview;
