import React, { useState, useEffect } from 'react';
import {
  Treemap,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';

import * as Tooltip from '@radix-ui/react-tooltip';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Shield,
  Users,
  Wallet,
  Network,
  ServerCog,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { OperatorDataResponse } from '../app/interface/operatorData.interface';
import { fetchOperatorData } from '../app/api/restake/restake';
import { LucideIcon } from 'lucide-react';

interface OverviewProps {
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
    <Card className="mb-6 border-l-4 border-l-purple-500">
      <CardHeader className="pb-2">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-purple-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">
            Risk Assessment
          </h3>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-2 font-medium">
          The current operator landscape presents significant centralization
          risks:
        </p>
        <ul className="list-disc pl-5 mb-2 space-y-1">
          <li>
            Only 5 operators are needed to control 1/3 of restaked ETH,
            indicating a high concentration of power.
          </li>
          <li>
            Major operators, particularly P2P, hold substantial market shares,
            potentially compromising network decentralization.
          </li>
        </ul>
        <p className="mb-2 italic">
          However, the restaker market appears more evenly distributed, which
          partially mitigates overall centralization concerns.
        </p>
        <p className="font-medium">
          Key: Implement measures to prevent further consolidation among top
          operators; Encourage growth of mid-sized operators.
        </p>
      </CardContent>
    </Card>
  );
};

const CompactNotes = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="mt-4 border-l-4 border-l-purple-500">
      <CardHeader className="pb-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full text-left text-sm font-bold text-purple-700 hover:text-purple-900 focus:outline-none"
        >
          <span>Important Notes and Disclaimers</span>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </CardHeader>
      {isOpen && (
        <CardContent>
          <div className="text-sm text-gray-700 space-y-3">
            <p>
              <strong>1. EIGEN Token and Other Strategies:</strong> The value
              and distribution of the EIGEN token and other strategies are not
              yet factored into these metrics. This requires further research to
              understand how their distribution may rebalance the concentration
              of stake.
            </p>

            <p>
              <strong>2. ETH Value Conversion:</strong> Tokens from strategies
              pegged to the ETH value like stETH or swETH are considered 1:1
              with the ETH price, which is not the case. In a future iteration,
              we will account for this discrepancy.
            </p>

            <p>
              <strong>3. Data Source:</strong> Currently, the metrics are
              derived from data in the EigenLayer Delegation Manager smart
              contract. Future iterations will incorporate data from additional
              smart contracts for a more comprehensive analysis.
            </p>

            <p>
              <strong>4. Future Enhancements:</strong> The Restake Watch project
              is continuously evolving. Upcoming updates will include:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Additional concentration metrics</li>
              <li>Withdrawal times from operators</li>
              <li>Presence and distribution of validators (DVT)</li>
              <li>Others!</li>
            </ul>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tooltip: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon: Icon,
  label,
  value,
  tooltip,
}) => (
  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <Icon className="h-5 w-5 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-600">{label}</h3>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <InfoCircledIcon className="h-4 w-4 text-gray-400 cursor-help" />
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="bg-gray-800 text-white p-2 rounded shadow-lg max-w-xs text-sm">
                  {tooltip}
                  <Tooltip.Arrow className="fill-gray-800" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>
        <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

interface SemaphoreIndicatorProps {
  value: number;
  thresholds: {
    green: number;
    yellow: number;
  };
}

const SemaphoreIndicator: React.FC<SemaphoreIndicatorProps> = ({
  value,
  thresholds,
}) => {
  let color =
    value >= thresholds.green
      ? 'bg-green-500'
      : value >= thresholds.yellow
        ? 'bg-yellow-500'
        : 'bg-red-500';

  return (
    <div className="flex items-center mt-2">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span className="ml-2 text-2xl font-semibold text-gray-900">{value}</span>
    </div>
  );
};

interface EnhancedMetricsProps {
  restakeData: {
    activeRestakers?: number;
    concentrationMetrics?: {
      top33PercentCount?: number;
    };
  } | null;
  operatorData: {
    totalETHRestaked?: number;
    activeEntities?: number;
    concentrationMetrics?: {
      top33PercentCount?: number;
    };
  } | null;
}

const EnhancedMetrics: React.FC<EnhancedMetricsProps> = ({
  restakeData,
  operatorData,
}) => {
  const restakerThresholds = { green: 20, yellow: 10 };
  const operatorThresholds = { green: 15, yellow: 8 };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Key Metrics
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <MetricCard
              icon={Wallet}
              label="Total Restaked ETH"
              value={new Intl.NumberFormat('en-US').format(
                operatorData?.totalETHRestaked || 0,
              )}
              tooltip="The total amount of ETH that has been restaked across all operators and strategies."
            />
            <MetricCard
              icon={Users}
              label="Active Operators"
              value={operatorData?.activeEntities || 'N/A'}
              tooltip="The number of operators currently active in the restaking ecosystem."
            />
            <MetricCard
              icon={Network}
              label="Active Restakers"
              value={restakeData?.activeRestakers || 'N/A'}
              tooltip="The total number of unique addresses that have restaked ETH."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Risk Metrics
          </h3>
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-600 flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Restakers needed for 1/3 control
                <Tooltip.Provider>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <InfoCircledIcon className="ml-2 h-4 w-4 text-gray-400 cursor-help" />
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content className="bg-gray-800 text-white p-2 rounded shadow-lg max-w-xs text-sm">
                        The minimum number of restakers required to control 1/3
                        of total restaked ETH. Higher is better.
                        <Tooltip.Arrow className="fill-gray-800" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>
              </h4>
              <SemaphoreIndicator
                value={
                  restakeData?.concentrationMetrics?.top33PercentCount || 0
                }
                thresholds={restakerThresholds}
              />
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-600 flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Operators needed for 1/3 control
                <Tooltip.Provider>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <InfoCircledIcon className="ml-2 h-4 w-4 text-gray-400 cursor-help" />
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content className="bg-gray-800 text-white p-2 rounded shadow-lg max-w-xs text-sm">
                        The minimum number of operators required to control 1/3
                        of total restaked ETH. Higher is better.
                        <Tooltip.Arrow className="fill-gray-800" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>
              </h4>
              <SemaphoreIndicator
                value={
                  operatorData?.concentrationMetrics?.top33PercentCount || 0
                }
                thresholds={operatorThresholds}
              />
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-600 flex items-center">
                <ServerCog className="h-4 w-4 mr-2" />
                DVT Operators (Obol)
                <Tooltip.Provider>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <InfoCircledIcon className="ml-2 h-4 w-4 text-gray-400 cursor-help" />
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content className="bg-gray-800 text-white p-2 rounded shadow-lg max-w-xs text-sm">
                        DVT enables validators to be run by multiple machines,
                        enhancing security and reducing slashing risk.
                        <Tooltip.Arrow className="fill-gray-800" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>
              </h4>
              <div className="mt-2 flex items-center">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="ml-2 text-2xl font-semibold text-gray-900">
                  7
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Overview: React.FC<OverviewProps> = ({ restakeData }) => {
  const [operatorData, setOperatorData] = useState<OperatorDataResponse | null>(
    null,
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchOperatorData();
        setOperatorData(data);
      } catch (error) {
        console.error('Error fetching operator data:', error);
      }
    };

    fetchData();
  }, []);

  const totalRestaked = operatorData?.totalETHRestaked || 0;
  const majorOperatorData = !operatorData?.majorOperatorGroupMetrics
    ? []
    : Object.entries(operatorData.majorOperatorGroupMetrics).map(
        ([key, value]) => {
          const ethAmount = Number(value.total_eth_restaked.toFixed(2));
          return {
            name: key.replaceAll('_', ' '),
            value: ethAmount,
            percentage: ((ethAmount / totalRestaked) * 100).toFixed(2),
          };
        },
      );

  if (
    totalRestaked > majorOperatorData.reduce((acc, curr) => acc + curr.value, 0)
  ) {
    const othersAmount =
      totalRestaked -
      majorOperatorData.reduce((acc, curr) => acc + curr.value, 0);
    majorOperatorData.push({
      name: 'Others',
      value: Number(othersAmount.toFixed(2)),
      percentage: ((othersAmount / totalRestaked) * 100).toFixed(2),
    });
  }

  // Compute the maximum value for color scaling
  // Compute the maximum value for color scaling
  const maxValue = Math.max(...majorOperatorData.map((d) => d.value));

  // Function to map values to colors
  const getColor = (value: number, maxValue: number): string => {
    const lightness = 80 - (50 * value) / maxValue;
    return `hsl(280, 60%, ${lightness}%)`;
  };

  interface CustomizedContentProps {
    x: number;
    y: number;
    width: number;
    height: number;
    index: number;
    depth: number;
    name: string;
    value: number;
    root?: any;
    payload?: any;
    rank?: any;
    children?: any;
  }

  // Convert to Functional Component and pass props directly
  const CustomizedContent: React.FC<CustomizedContentProps> = (props) => {
    const { x, y, width, height, name, value } = props;
    const fillColor = getColor(value, maxValue);

    const minDimension = Math.min(width, height);
    const fontSize = Math.min(minDimension / 6, 14);
    const shouldRenderText = width > 30 && height > 20;

    const formatName = (name: string): string => {
      if (width < 100) {
        return name.split(' ')[0];
      }
      return name;
    };

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={fillColor}
          stroke="#fff"
          strokeWidth={1}
        />
        {shouldRenderText && (
          <>
            <text
              x={x + width / 2}
              y={y + height / 2}
              textAnchor="middle"
              fill="#fff"
              fontSize={fontSize}
              fontWeight="500"
              dominantBaseline="middle"
            >
              {formatName(name)}
            </text>
            {height > 50 && width > 80 && (
              <text
                x={x + width / 2}
                y={y + height / 2 + fontSize + 2}
                textAnchor="middle"
                fill="#fff"
                fontSize={fontSize * 0.8}
                fontWeight="400"
                dominantBaseline="middle"
              >
                {`${value.toLocaleString()} ETH`}
              </text>
            )}
          </>
        )}
      </g>
    );
  };

  return (
    <div className="space-y-6">
      <RiskAssessment />
      <EnhancedMetrics restakeData={restakeData} operatorData={operatorData} />
      <CompactNotes />
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-[#000000]">
            Share of Total Restaked ETH by Major Operators
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            This chart represents operator groups that manage multiple
            individual operators. The data shown is the aggregated sum for each
            group.
          </p>
        </CardHeader>
        <CardContent>
          {majorOperatorData.length > 0 && (
            <ResponsiveContainer width="100%" height={400}>
              <Treemap
                data={majorOperatorData}
                dataKey="value"
                nameKey="name"
                stroke="#fff"
                aspectRatio={4 / 3}
                isAnimationActive={false}
                content={CustomizedContent} // Pass the component directly
              >
                <RechartsTooltip
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-2 shadow-md rounded text-[#000000]">
                          <p className="font-semibold">{data.name}</p>
                          <p>{`${data.value.toLocaleString()} ETH`}</p>
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
