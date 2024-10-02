import React from 'react';
import { Treemap, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import * as Tooltip from '@radix-ui/react-tooltip';
import { InfoCircledIcon } from '@radix-ui/react-icons';

const COLORS = ['#1a202c', '#2d3748', '#4a5568', '#718096', '#a0aec0', '#cbd5e0'];

interface PlatformData {
  operatorData: { name: string; value: number }[];
  keyMetrics: {
    totalRestaked: number | null;
    activeOperators: number | null;
    totalRestakers: number | null;
    stakerHerfindahl: number | null;
    operatorHerfindahl: number | null;
    top33PercentOperators: number | null;
  };
}

interface OverviewProps {
  currentPlatformData: PlatformData;
}

const InfoTooltip: React.FC<{ content: string }> = ({ content }) => (
  <Tooltip.Provider>
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <InfoCircledIcon className="inline-block ml-2 cursor-help" />
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
          <p className="mb-2">
            Total Restaked: {currentPlatformData.keyMetrics.totalRestaked?.toLocaleString() ?? 'N/A'} ETH
            <InfoTooltip content="The total amount of ETH that has been restaked across all operators and strategies." />
          </p>
          <p className="mb-2">
            Active Operators: {currentPlatformData.keyMetrics.activeOperators?.toLocaleString() ?? 'N/A'}
            <InfoTooltip content="The number of operators currently active in the restaking ecosystem." />
          </p>
          <p className="mb-2">
            Active Restakers: {currentPlatformData.keyMetrics.totalRestakers?.toLocaleString() ?? 'N/A'}
            <InfoTooltip content="The total number of unique addresses that have restaked ETH." />
          </p>
          <p className="mb-2">
            Staker Herfindahl Index: {currentPlatformData.keyMetrics.stakerHerfindahl?.toFixed(4) ?? 'N/A'}
            <InfoTooltip content="The Herfindahl Index measures market concentration. It's calculated as the sum of squared market shares. Values range from 0 to 1, where 0 indicates perfect competition and 1 indicates a monopoly. For restaking:
            • Below 0.01: Very low concentration
            • 0.01 to 0.15: Low to moderate concentration
            • 0.15 to 0.25: Moderate to high concentration
            • Above 0.25: High concentration
            A lower value is generally better for decentralization." />
          </p>
          <p className="mb-2">
            Operator Herfindahl Index: {currentPlatformData.keyMetrics.operatorHerfindahl?.toFixed(4) ?? 'N/A'}
            <InfoTooltip content="Similar to the Staker Herfindahl Index, but for operators. It measures the concentration of restaked ETH among operators. Interpretation is the same as the Staker Herfindahl Index." />
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Control Thresholds</h3>
          <p className="mb-2">
            Restakers needed for 1/3 control: {currentPlatformData.keyMetrics.top33PercentOperators ?? 'N/A'}
            <InfoTooltip content="The minimum number of restakers required to collectively control 1/3 of the total restaked ETH. A higher number indicates more decentralization and is generally better for the ecosystem's health." />
          </p>
          <p className="mb-2">
            Operators needed for 1/3 control: {Math.ceil((currentPlatformData.keyMetrics.activeOperators ?? 0) / 3)}
            <InfoTooltip content="The minimum number of operators required to collectively control 1/3 of the total restaked ETH. Similar to the restaker metric, a higher number here indicates more decentralization and is preferable for ecosystem resilience." />
          </p>
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
            fill="#1a202c"
          >
            {
              operatorData.map((entry, index) => (
                <Treemap.Child key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))
            }
            <RechartsTooltip
              content={({ payload }) => {
                if (payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-2 shadow-md rounded text-gray-800">
                      <p>{`${data.name}: ${data.value}%`}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </Treemap>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Overview;