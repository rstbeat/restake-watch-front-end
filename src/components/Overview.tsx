import React, { useState } from 'react';
import {
  Treemap,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';
import * as Tooltip from '@radix-ui/react-tooltip';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { OperatorDataResponse } from '../app/interface/operatorData.interface';


const COLORS = [
  '#1a202c',
  '#2d3748',
  '#4a5568',
  '#718096',
  '#a0aec0',
  '#cbd5e0',
];

interface OverviewProps {
  currentPlatformData: OperatorDataResponse | null;
  restakeData: any | null;
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

const RiskAssessment = () => {
  return (
    <Card className="mb-6 border-l-4 border-l-yellow-500">
      <CardHeader className="pb-2">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">Risk Assessment</h3>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-2 font-medium">The current operator landscape presents significant centralization risks:</p>
        <ul className="list-disc pl-5 mb-2 space-y-1">
          <li>Only 5 operators are needed to control 1/3 of restaked ETH, indicating a high concentration of power.</li>
          <li>Major operators, particularly P2P, hold substantial market shares, potentially compromising network decentralization.</li>
        </ul>
        <p className="mb-2 italic">However, the restaker market appears more evenly distributed, which partially mitigates overall centralization concerns.</p>
        <p className="font-medium">Key: Implement measures to prevent further consolidation among top operators; Encourage growth of mid-sized operators.</p>
      </CardContent>
    </Card>
  );
};

const SemaphoreIndicator: React.FC<{ value: number, thresholds: { green: number, yellow: number } }> = ({ value, thresholds }) => {
  let color = 'bg-red-500';
  if (value >= thresholds.green) {
    color = 'bg-green-500';
  } else if (value >= thresholds.yellow) {
    color = 'bg-yellow-500';
  }
  return <span className={`inline-block w-3 h-3 rounded-full ml-2 ${color}`} />;
};

const CompactNotes = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="mt-4 border-l-4 border-l-blue-500">
      <CardHeader className="pb-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full text-left text-sm font-bold text-blue-700 hover:text-blue-900 focus:outline-none"
        >
          <span>Important Notes and Disclaimers</span>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </CardHeader>
      {isOpen && (
        <CardContent>
          <div className="text-sm text-gray-700 space-y-3">
            <p><strong>1. EIGEN Token:</strong> The value and distribution of the EIGEN token are not yet factored into these metrics. This requires further research to understand how its distribution may rebalance the concentration of stake.</p>
            
            <p><strong>2. ETH Value Conversion:</strong> To obtain the ETH value, we perform conversions between assets on different strategies (e.g., Lido, Swell). These conversion rates are variable. The rates used in these calculations were last updated on October 5, 2023.</p>
            
            <p><strong>3. Data Source:</strong> Currently, the metrics are derived from data in the EigenLayer Delegation Manager smart contract. Future iterations will incorporate data from additional smart contracts for a more comprehensive analysis.</p>
            
            <p><strong>4. Future Enhancements:</strong> The Restake Watch project is continuously evolving. Upcoming updates will include:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Additional concentration metrics</li>
              <li>Withdrawal times from operators</li>
              <li>Presence and distribution of validators (DVT)</li>
              <li>Others!</li>
            </ul>
            
            <p><strong>Note:</strong> These enhancements aim to provide a more holistic view of the restaking ecosystem and its associated risks.</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
};


const Overview: React.FC<OverviewProps> = ({
  currentPlatformData,
  restakeData,
}) => {
  const totalRestaked = currentPlatformData?.totalETHRestaked || 0;
  const operatorData = !currentPlatformData?.majorOperatorGroupMetrics
    ? []
    : Object.entries(currentPlatformData.majorOperatorGroupMetrics).map(([key, value]) => {
        const ethAmount = Number(value.total_eth_restaked.toFixed(2));
        return {
          name: key.replaceAll('_', ' '),
          value: ethAmount,
          percentage: ((ethAmount / totalRestaked) * 100).toFixed(2),
        };
      });

  // Add "Others" category if there's any remaining ETH
  const totalMajorOperators = operatorData.reduce((acc, curr) => acc + curr.value, 0);
  if (totalRestaked > totalMajorOperators) {
    const othersAmount = totalRestaked - totalMajorOperators;
    operatorData.push({
      name: 'Others',
      value: Number(othersAmount.toFixed(2)),
      percentage: ((othersAmount / totalRestaked) * 100).toFixed(2),
    });
  }

  const restakerThresholds = { green: 20, yellow: 10 };
  const operatorThresholds = { green: 15, yellow: 8 };

  return (
    <div className="space-y-6">
      <RiskAssessment />
      <CompactNotes />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-800">Key Metrics</h3>
          </CardHeader>
          <CardContent>
            <p className="mb-2">
              Total Restaked: {new Intl.NumberFormat('en-US').format(totalRestaked)} ETH
              <InfoTooltip content="The total amount of ETH that has been restaked across all operators and strategies." />
            </p>
            <p className="mb-2">
              Active Operators: {currentPlatformData?.activeEntities || 'N/A'}
              <InfoTooltip content="The number of operators currently active in the restaking ecosystem. Active means they have a positive amount of ETH restaked." />
            </p>
            <p className="mb-2">
              Active Restakers: {restakeData?.activeRestakers || 'N/A'}
              <InfoTooltip content="The total number of unique restaker addresses that have restaked ETH. Active means they have a positive amount of ETH restaked." />
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-800">Market Concentration Metrics</h3>
          </CardHeader>
          <CardContent>
            <h4 className="font-semibold mt-2 mb-2">Restaker Metrics</h4>
            <p className="mb-2">
              Restakers needed for 1/3 control: {restakeData?.concentrationMetrics?.top33PercentCount || 'N/A'}
              <SemaphoreIndicator 
                value={restakeData?.concentrationMetrics?.top33PercentCount || 0} 
                thresholds={restakerThresholds} 
              />
              <InfoTooltip content="The minimum number of restakers required to collectively control 1/3 of the total restaked ETH. Higher numbers indicate better decentralization. Green: >20, Yellow: >10, Red: ≤10" />
            </p>
            <h4 className="font-semibold mt-4 mb-2">Operator Metrics</h4>
            <p className="mb-2">
              Operators needed for 1/3 control: {currentPlatformData?.concentrationMetrics?.top33PercentCount || 'N/A'}
              <SemaphoreIndicator 
                value={currentPlatformData?.concentrationMetrics?.top33PercentCount || 0} 
                thresholds={operatorThresholds} 
              />
              <InfoTooltip content="The minimum number of operators required to collectively control 1/3 of the total restaked ETH. Higher numbers indicate better decentralization. Green: >15, Yellow: >8, Red: ≤8" />
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-800">Share of Total Restaked ETH by Major Operators</h2>
          <p className="text-sm text-gray-600 mt-1">
            This chart represents operator groups that manage multiple individual operators. 
            The data shown is the aggregated sum for each group.
          </p>
        </CardHeader>
        <CardContent>
          {operatorData.length > 0 && (
            <ResponsiveContainer width="100%" height={300} style={{ aspectRatio: '4/3' }}>
              <Treemap
                data={operatorData}
                dataKey="value"
                stroke="#fff"
                fill="#1a202c"
              >
                {operatorData.map((_entry, index) => (
                  <Treemap
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
                <RechartsTooltip
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-2 shadow-md rounded text-gray-800">
                          <p className="font-semibold">{data.name}</p>
                          <p>{`${new Intl.NumberFormat('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(data.value)} ETH`}</p>
                          <p>{`${data.percentage}% of total`}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </Treemap>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Overview;