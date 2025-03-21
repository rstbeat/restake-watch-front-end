import React, { useState, useEffect, useCallback } from 'react';
import {
  Treemap,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Label,
  ReferenceLine,
  Area,
  AreaChart,
  BarChart,
  Bar,
  Cell,
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
  Share2,
  AlertCircle,
  CheckCircle,
  Info,
  ExternalLink,
  PieChart,
  FileSpreadsheet,
  DollarSign,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { OperatorDataResponse } from '../app/interface/operatorData.interface';
import { fetchOperatorData, fetchETHPrice } from '../app/api/restake/restake';
import { LucideIcon } from 'lucide-react';

interface OverviewProps {
  restakeData: any | null;
}

// New interface for strategy data
interface StrategyMetrics {
  totalAssets: number;
  totalEntities: number;
  top5HoldersPercentage: number;
  herfindahlIndex: number;
}

interface StrategiesData {
  strategyConcentrationMetrics: {
    [key: string]: StrategyMetrics;
  };
  totalRestakedAssetsPerStrategy: {
    [key: string]: number;
  };
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
          {/* <Icon className="h-5 w-5 text-gray-500" /> */}
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

// Concentration Summary Box Component
interface ConcentrationSummaryProps {
  entityType: 'operators' | 'restakers';
  concentrationMetrics?: {
    top33PercentCount?: number;
    bottom33PercentCount?: number;
    herfindahlIndex?: number;
  };
}

const ConcentrationSummary: React.FC<ConcentrationSummaryProps> = ({
  entityType,
  concentrationMetrics,
}) => {
  if (!concentrationMetrics) return null;

  const {
    top33PercentCount = 0,
    bottom33PercentCount = 0,
    herfindahlIndex = 0,
  } = concentrationMetrics;
  const isHealthy = herfindahlIndex < 0.15;

  // Different border color based on entity type for visual distinction
  const borderColor =
    entityType === 'operators' ? 'border-purple-400' : 'border-blue-400';

  // Create tweetable text
  const tweetText = encodeURIComponent(
    `Just ${top33PercentCount} ${entityType} control 33% of restaked ETH on EigenLayer, while ${bottom33PercentCount} smaller ones secure another 33%. Concentration index: ${herfindahlIndex.toFixed(4)}. ${isHealthy ? 'Overall healthy' : 'Concerning concentration'}. @TheRestakeWatch @eigenlayer`,
  );
  const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;

  return (
    <div
      className={`mb-4 border-2 ${borderColor} rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow`}
    >
      {/* Header */}
      <div
        className={`${entityType === 'operators' ? 'bg-purple-50' : 'bg-blue-50'} border-b ${borderColor} px-4 py-2 flex items-center justify-between`}
      >
        <h4 className="text-sm font-semibold text-gray-800">
          Exposure Concentration Summary (
          {entityType === 'operators' ? 'Operators' : 'Restakers'})
        </h4>
        <div className="flex items-center space-x-2">
          <div
            className={`text-xs font-medium rounded-full px-2 py-0.5 ${isHealthy ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}
          >
            {isHealthy ? 'Healthy Overall' : 'Concerning'}
          </div>
          <a
            href={tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 transition-colors"
            title="Share on Twitter"
          >
            <Share2 size={14} className="mr-1" />
            Tweet
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 bg-white">
        <div className="flex flex-col space-y-2">
          <div className="flex items-start">
            <div className="shrink-0 text-red-600 mr-2">⚠️</div>
            <div>
              <span className="font-bold text-red-600">Risk Alert:</span>{' '}
              <span>
                Just{' '}
                <span className="font-bold text-red-600">
                  {top33PercentCount}
                </span>{' '}
                {entityType} control 33% of restaked ETH.
              </span>
            </div>
          </div>

          <div className="flex items-start">
            <div className="shrink-0 text-green-600 mr-2">✓</div>
            <div>
              <span className="font-bold text-green-600">Positive Factor:</span>{' '}
              <span>
                <span className="font-bold text-green-600">
                  {bottom33PercentCount}
                </span>{' '}
                smaller {entityType} secure another 33%.
              </span>
            </div>
          </div>

          <div className="pt-1 border-t border-gray-100">
            <span className="text-sm">
              Overall decentralization remains{' '}
              {isHealthy ? (
                <span className="font-semibold text-green-600">healthy</span>
              ) : (
                <span className="font-semibold text-orange-600">
                  concerning
                </span>
              )}{' '}
              <span className="text-gray-600">
                (concentration index:{' '}
                <span className="font-semibold">
                  {herfindahlIndex.toFixed(4)}
                </span>
                )
              </span>
            </span>
            <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
              <strong>About the index:</strong> The Herfindahl index measures
              market concentration from 0 to 1. Values below 0.15 indicate
              healthy decentralization, while higher values suggest concerning
              concentration.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// General Metrics Summary component
interface GeneralMetricsSummaryProps {
  totalETHRestaked?: number;
  activeOperators?: number;
  activeRestakers?: number;
}

const GeneralMetricsSummary: React.FC<GeneralMetricsSummaryProps> = ({
  totalETHRestaked = 0,
  activeOperators = 0,
  activeRestakers = 0,
}) => {
  // Format values for display
  const formattedETH = new Intl.NumberFormat('en-US').format(totalETHRestaked);
  const formattedOperators = new Intl.NumberFormat('en-US').format(
    activeOperators,
  );
  const formattedRestakers = new Intl.NumberFormat('en-US').format(
    activeRestakers,
  );

  // Create tweetable text
  const tweetText = encodeURIComponent(
    `${formattedETH} ETH currently restaked on EigenLayer across ${formattedOperators} active operators and ${formattedRestakers} restakers. @TheRestakeWatch @eigenlayer`,
  );
  const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;

  return (
    <div className="mb-4 border-2 border-blue-300 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="bg-blue-50 border-b border-blue-300 px-4 py-2 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-800">
          EigenLayer Network Overview
        </h4>
        <div className="flex items-center space-x-2">
          <div className="text-xs font-medium rounded-full px-2 py-0.5 bg-blue-100 text-blue-800">
            Current Stats
          </div>
          <a
            href={tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 transition-colors"
            title="Share on Twitter"
          >
            <Share2 size={14} className="mr-1" />
            Tweet
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 bg-white">
        <div className="flex flex-col space-y-2">
          <div className="flex items-start">
            <div className="shrink-0 text-blue-600 mr-2">💰</div>
            <div>
              <span className="font-bold text-blue-600">Total Restaked:</span>{' '}
              <span>
                <span className="font-bold text-blue-600">{formattedETH}</span>{' '}
                ETH
              </span>
            </div>
          </div>

          <div className="flex items-start">
            <div className="shrink-0 text-purple-600 mr-2">🏢</div>
            <div>
              <span className="font-bold text-purple-600">
                Active Operators:
              </span>{' '}
              <span>
                <span className="font-bold text-purple-600">
                  {formattedOperators}
                </span>{' '}
                entities securing the network (with more than 0 restaked assets)
              </span>
            </div>
          </div>

          <div className="flex items-start">
            <div className="shrink-0 text-green-600 mr-2">👥</div>
            <div>
              <span className="font-bold text-green-600">
                Active Restakers:
              </span>{' '}
              <span>
                <span className="font-bold text-green-600">
                  {formattedRestakers}
                </span>{' '}
                unique addresses
              </span>
            </div>
          </div>
        </div>
      </div>
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
    majorOperatorGroupMetrics?: {
      [operatorName: string]: {
        total_eth_restaked: number;
        total_market_share: number;
      };
    };
  } | null;
}

// UnifiedRiskMetricsOverview component
interface UnifiedRiskMetricsOverviewProps {
  restakeData: {
    activeRestakers?: number;
    concentrationMetrics?: {
      top33PercentCount?: number;
      bottom33PercentCount?: number;
      herfindahlIndex?: number;
    };
  } | null;
  operatorData: {
    totalETHRestaked?: number;
    activeEntities?: number;
    concentrationMetrics?: {
      top33PercentCount?: number;
      bottom33PercentCount?: number;
      herfindahlIndex?: number;
    };
    majorOperatorGroupMetrics?: {
      [operatorName: string]: {
        total_eth_restaked: number;
        total_market_share: number;
      };
    };
  } | null;
}

// Tooltip with term definition
const TermTooltip: React.FC<{ term: string; definition: string }> = ({
  term,
  definition,
}) => (
  <Tooltip.Provider>
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <span className="border-b border-dotted border-gray-500 cursor-help">
          {term}
        </span>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className="bg-gray-800 text-white p-2 rounded shadow-lg max-w-xs text-sm">
          <p>{definition}</p>
          <Tooltip.Arrow className="fill-gray-800" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  </Tooltip.Provider>
);

// Styled Icon component for better visual appeal
const StyledIcon: React.FC<{
  icon: React.ReactNode;
  gradientColors: string[];
  size?: string;
}> = ({ icon, gradientColors, size = 'h-6 w-6' }) => {
  return (
    <div
      className={`flex items-center justify-center rounded-full p-3 ${size}`}
      style={{
        background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
        boxShadow: `0 4px 10px rgba(0, 0, 0, 0.08)`,
      }}
    >
      <div className="text-white">{icon}</div>
    </div>
  );
};

// Small styled icon for inline usage in alerts and expandable sections
const SmallStyledIcon: React.FC<{
  icon: React.ReactNode;
  gradientColors: string[];
}> = ({ icon, gradientColors }) => {
  return (
    <div
      className="flex items-center justify-center rounded-full p-1.5 h-6 w-6 shrink-0"
      style={{
        background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
        boxShadow: `0 2px 4px rgba(0, 0, 0, 0.1)`,
      }}
    >
      <div className="text-white">{icon}</div>
    </div>
  );
};

// Risk indicator component
const RiskIndicator: React.FC<{
  level: 'critical' | 'warning' | 'positive' | 'neutral';
  title: string;
  description: React.ReactNode;
}> = ({ level, title, description }) => {
  const levelStyles = {
    critical: {
      icon: <AlertCircle className="h-3 w-3" />,
      colors: ['#ef4444', '#f97316'],
      border: 'border-red-200',
      bg: 'bg-red-50',
      title: 'text-red-800 font-bold',
    },
    warning: {
      icon: <AlertTriangle className="h-3 w-3" />,
      colors: ['#f97316', '#eab308'],
      border: 'border-orange-200',
      bg: 'bg-orange-50',
      title: 'text-orange-800 font-bold',
    },
    positive: {
      icon: <CheckCircle className="h-3 w-3" />,
      colors: ['#10b981', '#22c55e'],
      border: 'border-green-200',
      bg: 'bg-green-50',
      title: 'text-green-800 font-bold',
    },
    neutral: {
      icon: <Info className="h-3 w-3" />,
      colors: ['#3b82f6', '#60a5fa'],
      border: 'border-blue-200',
      bg: 'bg-blue-50',
      title: 'text-blue-800 font-bold',
    },
  };

  return (
    <div
      className={`flex p-3 rounded-lg border ${levelStyles[level].border} ${levelStyles[level].bg}`}
    >
      <div className="mr-3">
        <SmallStyledIcon
          icon={levelStyles[level].icon}
          gradientColors={levelStyles[level].colors}
        />
      </div>
      <div>
        <h4 className={`text-sm ${levelStyles[level].title} mb-1`}>{title}</h4>
        <div className="text-sm">{description}</div>
      </div>
    </div>
  );
};

// Expandable section component
const ExpandableSection: React.FC<{
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  severity?: 'critical' | 'warning' | 'positive' | 'neutral';
}> = ({ title, children, defaultOpen = false, severity = 'neutral' }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const severityClasses = {
    critical: 'text-red-700 bg-red-50 border-red-300',
    warning: 'text-orange-700 bg-orange-50 border-orange-300',
    positive: 'text-green-700 bg-green-50 border-green-300',
    neutral: 'text-blue-700 bg-blue-50 border-blue-300',
  };

  const severityIcons = {
    critical: {
      icon: <AlertCircle className="h-3 w-3" />,
      colors: ['#ef4444', '#f97316'],
    },
    warning: {
      icon: <AlertTriangle className="h-3 w-3" />,
      colors: ['#f97316', '#eab308'],
    },
    positive: {
      icon: <CheckCircle className="h-3 w-3" />,
      colors: ['#10b981', '#22c55e'],
    },
    neutral: {
      icon: <Info className="h-3 w-3" />,
      colors: ['#3b82f6', '#60a5fa'],
    },
  };

  return (
    <div
      className={`rounded-lg border ${severity !== 'neutral' ? 'border-l-4' : ''} ${
        severity === 'critical'
          ? 'border-l-red-500'
          : severity === 'warning'
            ? 'border-l-orange-500'
            : severity === 'positive'
              ? 'border-l-green-500'
              : 'border-gray-200'
      }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full p-4 text-left font-medium ${severityClasses[severity]} rounded-t-lg hover:bg-opacity-80 transition-colors`}
      >
        <div className="flex items-center">
          <SmallStyledIcon
            icon={severityIcons[severity].icon}
            gradientColors={severityIcons[severity].colors}
          />
          <span className="ml-2">{title}</span>
        </div>
        <div className="flex items-center justify-center rounded-full p-1 h-6 w-6 bg-white bg-opacity-30">
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>
      {isOpen && <div className="p-4 bg-white">{children}</div>}
    </div>
  );
};

// Key metrics summary card
const MetricSummaryCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  usdValue?: string;
}> = ({ title, value, icon, description, usdValue }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
    <div className="flex items-center mb-3">
      {icon}
      <h3 className="text-gray-700 font-medium ml-3">{title}</h3>
    </div>
    <div className="mb-1">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {usdValue && (
        <p className="text-md font-normal text-gray-600 mt-1">
          (${usdValue} USD)
        </p>
      )}
    </div>
    {description && (
      <p className="text-xs text-gray-500 mt-auto">{description}</p>
    )}
  </div>
);

const UnifiedRiskMetricsOverview: React.FC<UnifiedRiskMetricsOverviewProps> = ({
  restakeData,
  operatorData,
}) => {
  const [ethPrice, setEthPrice] = useState<number>(0);

  // Format values for display
  const totalETHValue = operatorData?.totalETHRestaked || 0;
  const formattedETH = new Intl.NumberFormat('en-US').format(totalETHValue);
  const formattedOperators = new Intl.NumberFormat('en-US').format(
    operatorData?.activeEntities || 0,
  );
  const formattedRestakers = new Intl.NumberFormat('en-US').format(
    restakeData?.activeRestakers || 0,
  );

  // Calculate USD value
  const usdValue = totalETHValue * ethPrice;
  const formattedUSD =
    usdValue > 0
      ? new Intl.NumberFormat('en-US').format(Math.round(usdValue))
      : '';

  // Fetch ETH price
  useEffect(() => {
    const getEthPrice = async () => {
      try {
        const price = await fetchETHPrice();
        setEthPrice(price);
      } catch (error) {
        console.error('Error fetching ETH price:', error);
      }
    };

    getEthPrice();

    // Refresh price every 5 minutes
    const interval = setInterval(getEthPrice, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Get concentration data
  const operatorTopCount =
    operatorData?.concentrationMetrics?.top33PercentCount || '?';
  const restakerTopCount =
    restakeData?.concentrationMetrics?.top33PercentCount || '?';

  // Get the major operator market shares with case-insensitive lookup
  const findOperatorData = (operatorName: string) => {
    if (!operatorData?.majorOperatorGroupMetrics) return null;

    // Try different possible key formats
    const possibleKeys = [
      operatorName.toLowerCase(), // 'p2p'
      operatorName.toUpperCase(), // 'P2P'
      operatorName.replace(' ', '_').toLowerCase(), // 'node_monster'
      operatorName, // Exact match
    ];

    // Search for any matching key
    for (const key of Object.keys(operatorData.majorOperatorGroupMetrics)) {
      if (
        possibleKeys.includes(key.toLowerCase()) ||
        key.toLowerCase().includes(operatorName.toLowerCase())
      ) {
        return operatorData.majorOperatorGroupMetrics[key];
      }
    }

    return null;
  };

  // Get P2P data
  const p2pData = findOperatorData('p2p');
  const p2pShare = p2pData ? p2pData.total_market_share * 100 : 0;
  const formattedP2PShare = p2pShare.toFixed(1);

  // Get Node Monster data
  const nodeMonsterData = findOperatorData('node monster');
  const nodeMonsterShare = nodeMonsterData
    ? nodeMonsterData.total_market_share * 100
    : 0;
  const formattedNodeMonsterShare = nodeMonsterShare.toFixed(1);

  // Calculate combined market share
  const combinedShare = p2pShare + nodeMonsterShare;
  const formattedCombinedShare = combinedShare.toFixed(1);

  return (
    <>
      {/* Risk Overview Card */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <div className="mr-3">
              <StyledIcon
                icon={<Shield className="h-5 w-5" />}
                gradientColors={['#8b5cf6', '#d946ef']}
                size="h-10 w-10"
              />
            </div>
            Risk Overview
          </h2>
          <p className="text-sm text-gray-600">
            A comprehensive view of key metrics and associated risks in the
            EigenLayer ecosystem
          </p>
        </CardHeader>
        <CardContent>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <MetricSummaryCard
              title="Total Restaked Value (ETH)"
              value={formattedETH}
              usdValue={formattedUSD}
              icon={
                <StyledIcon
                  icon={<Wallet className="h-4 w-4" />}
                  gradientColors={['#3b82f6', '#06b6d4']}
                  size="h-9 w-9"
                />
              }
              description="ETH value of all restaked assets (includes Beacon Chain ETH, stETH, PEPE, EIGEN, etc.)"
            />
            <MetricSummaryCard
              title="Active Operators"
              value={formattedOperators}
              icon={
                <StyledIcon
                  icon={<Users className="h-4 w-4" />}
                  gradientColors={['#8b5cf6', '#d946ef']}
                  size="h-9 w-9"
                />
              }
              description="Number of active operators securing the network (with more than 0 restaked assets)"
            />
            <MetricSummaryCard
              title="Active Restakers"
              value={formattedRestakers}
              icon={
                <StyledIcon
                  icon={<Network className="h-4 w-4" />}
                  gradientColors={['#10b981', '#06b6d4']}
                  size="h-9 w-9"
                />
              }
              description="Number of unique addresses restaking ETH (with more than 0 restaked assets)"
            />
          </div>

          {/* Critical Risk Metrics Alert */}
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <h3 className="text-base font-bold text-red-800 mb-3 flex items-center">
              <SmallStyledIcon
                icon={<AlertCircle className="h-3 w-3" />}
                gradientColors={['#ef4444', '#f97316']}
              />
              <span className="ml-2">Critical Risk Metrics</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="shrink-0 mr-2">
                  <SmallStyledIcon
                    icon={<AlertCircle className="h-3 w-3" />}
                    gradientColors={['#ef4444', '#f97316']}
                  />
                </div>
                <p className="text-sm text-red-800">
                  <span className="font-bold">Governance Risk:</span> EigenLayer
                  relies on a 9-of-13 community multisig that can execute
                  IMMEDIATE upgrades without a timelock.
                </p>
              </div>
              <div className="flex items-start">
                <div className="shrink-0 mr-2">
                  <SmallStyledIcon
                    icon={<AlertCircle className="h-3 w-3" />}
                    gradientColors={['#ef4444', '#f97316']}
                  />
                </div>
                <p className="text-sm text-red-800">
                  <span className="font-bold">Operator Concentration:</span>{' '}
                  Just {operatorTopCount} operators control 33% of restaked ETH.
                  Their compromise or collusion could trigger a cascading
                  effect.
                </p>
              </div>
              <div className="flex items-start">
                <div className="shrink-0 mr-2">
                  <SmallStyledIcon
                    icon={<AlertCircle className="h-3 w-3" />}
                    gradientColors={['#ef4444', '#f97316']}
                  />
                </div>
                <p className="text-sm text-red-800">
                  <span className="font-bold">Major Operator Risk:</span>{' '}
                  Between P2P ({formattedP2PShare}%) and Node Monster (
                  {formattedNodeMonsterShare}%), these two professional
                  operators control{' '}
                  <span className="font-bold">{formattedCombinedShare}%</span>{' '}
                  of total restaked assets.
                </p>
              </div>
              <div className="flex items-start">
                <div className="shrink-0 mr-2">
                  <SmallStyledIcon
                    icon={<AlertCircle className="h-3 w-3" />}
                    gradientColors={['#ef4444', '#f97316']}
                  />
                </div>
                <p className="text-sm text-red-800">
                  <span className="font-bold">Restaker Concentration:</span> The
                  top {restakerTopCount} individual restakers control 33% of all
                  restaked assets.
                </p>
              </div>
              <div className="flex items-start">
                <div className="shrink-0 mr-2">
                  <SmallStyledIcon
                    icon={<AlertCircle className="h-3 w-3" />}
                    gradientColors={['#ef4444', '#f97316']}
                  />
                </div>
                <p className="text-sm text-red-800">
                  <span className="font-bold">
                    Limited Permissionless Participation:
                  </span>{' '}
                  Only 2 out of 19 AVSs allow operators to secure them without
                  whitelisting.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Risk Analysis Card */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <div className="mr-3">
              <StyledIcon
                icon={<FileSpreadsheet className="h-5 w-5" />}
                gradientColors={['#3b82f6', '#06b6d4']}
                size="h-10 w-10"
              />
            </div>
            Detailed Risk Analysis
          </h2>
          <p className="text-sm text-gray-600">
            In-depth explanation of key risk factors in the EigenLayer ecosystem
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Governance Risk - now also closed by default */}
            <ExpandableSection
              title="Governance Risk"
              severity="critical"
              defaultOpen={false}
            >
              <RiskIndicator
                level="critical"
                title="Malicious Governance Attack Vector"
                description={
                  <p>
                    EigenLayer relies on a 9-of-13 community multisig with
                    immediate upgrade capabilities. This introduces a critical
                    point of failure if these key holders are compromised or
                    collude maliciously.
                  </p>
                }
              />
              <RiskIndicator
                level="critical"
                title="No Timelock on Upgrades"
                description={
                  <p>
                    The current governance setup lacks a timelock mechanism,
                    allowing for immediate execution of changes without allowing
                    users time to withdraw in response to potentially adverse
                    governance decisions.
                  </p>
                }
              />
            </ExpandableSection>

            {/* Operator Risk */}
            <ExpandableSection
              title="Operator Concentration Risk"
              severity="warning"
              defaultOpen={false}
            >
              <RiskIndicator
                level="critical"
                title="Excess Concentration of Stake"
                description={
                  <p>
                    Just {operatorTopCount} operators control 33% of all
                    restaked ETH. This concentration creates risk if these large
                    operators are compromised or act maliciously.
                  </p>
                }
              />
              <RiskIndicator
                level="warning"
                title="Single Entity Dominance"
                description={
                  <p>
                    P2P controls{' '}
                    <span className="font-bold">{formattedP2PShare}%</span> of
                    the total TVL across its various operators. This level of
                    dominance by a single entity introduces systemic risk.
                  </p>
                }
              />
              <RiskIndicator
                level="positive"
                title="Healthy Long Tail Distribution"
                description={
                  <p>
                    Approximately{' '}
                    <strong>
                      {operatorData?.concentrationMetrics
                        ?.bottom33PercentCount || '1000+'}
                    </strong>{' '}
                    smaller operators collectively secure 33% of restaked ETH,
                    creating a healthy "long tail" that improves overall
                    decentralization.
                  </p>
                }
              />
              <RiskIndicator
                level="positive"
                title="Moderate Market Concentration"
                description={
                  <p>
                    The Herfindahl-Hirschman Index (HHI) for operators is{' '}
                    <strong>
                      {(
                        operatorData?.concentrationMetrics?.herfindahlIndex || 0
                      ).toFixed(4)}
                    </strong>
                    , indicating a market with moderate concentration. Values
                    below 0.15 suggest sufficient diversity among operators.
                  </p>
                }
              />
            </ExpandableSection>

            {/* Restaker Risk */}
            <ExpandableSection
              title="Restaker Concentration Risk"
              severity="warning"
              defaultOpen={false}
            >
              <RiskIndicator
                level="critical"
                title="Excess Concentration of Stake"
                description={
                  <p>
                    The top {restakerTopCount} restakers control 33% of all
                    restaked assets. This creates a centralization risk as these
                    accounts could significantly impact the protocol if they
                    acted together.
                  </p>
                }
              />
              <RiskIndicator
                level="warning"
                title="Whale Influence"
                description={
                  <p>
                    Large holdings by a few addresses give these restakers
                    outsized influence over the ecosystem and potentially over
                    governance votes. Their actions could potentially cause
                    market volatility.
                  </p>
                }
              />
              <RiskIndicator
                level="positive"
                title="Broad Participation Base"
                description={
                  <p>
                    Approximately{' '}
                    <strong>
                      {restakeData?.concentrationMetrics
                        ?.bottom33PercentCount || '1000+'}
                    </strong>{' '}
                    smaller restakers collectively hold 33% of restaked ETH,
                    indicating a healthy level of grassroots participation.
                  </p>
                }
              />
              <RiskIndicator
                level="positive"
                title="Low Concentration Index"
                description={
                  <p>
                    The Herfindahl-Hirschman Index (HHI) for restakers is{' '}
                    <strong>
                      {(
                        restakeData?.concentrationMetrics?.herfindahlIndex || 0
                      ).toFixed(4)}
                    </strong>
                    . This low value (well below the 0.15 threshold) suggests a
                    diverse and relatively decentralized distribution of stake.
                  </p>
                }
              />
            </ExpandableSection>

            {/* Technical Risk */}
            <ExpandableSection
              title="Technical Risk"
              severity="warning"
              defaultOpen={false}
            >
              <RiskIndicator
                level="positive"
                title="Validator Technology Improvements"
                description={
                  <p>
                    {/* This value should eventually come from the API */}
                    <strong>7</strong> operators are running
                    <TermTooltip
                      term=" distributed validator technology"
                      definition="A technology that allows validators to be run by multiple machines and operators, enhancing fault-tolerance and reducing slashing risk."
                    />{' '}
                    by Obol Collective, providing higher validator uptime
                    through fault-tolerance and reduced slashing risk via key
                    sharing.
                  </p>
                }
              />
            </ExpandableSection>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

const EnhancedMetrics: React.FC<EnhancedMetricsProps> = ({
  restakeData,
  operatorData,
}) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Replacing the two separate sections with the unified overview */}
      <UnifiedRiskMetricsOverview
        restakeData={restakeData}
        operatorData={operatorData}
      />
    </div>
  );
};

const CustomTreemapContent = (props: any) => {
  const { root, x, y, width, height, name, value, percentage } = props;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: props.fill || '#9C27B0',
          stroke: '#fff',
          strokeWidth: 2,
        }}
      />
      {width > 50 && height > 30 && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fill: '#ffffff',
            fontSize: '14px',
            fontFamily: 'sans-serif',
            fontWeight: 700, // Changed from 500 to 700 for bolder text
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)', // Added subtle shadow for better readability
          }}
        >
          {name}
        </text>
      )}
    </g>
  );
};

// LorenzCurveChart component to visualize inequality distribution
interface LorenzCurveChartProps {
  lorenzData?: [number, number][];
  giniIndex?: number;
  title: string;
  description?: string;
}

// Replace with a more intuitive visualization
interface StakeDistributionChartProps {
  lorenzData?: [number, number][];
  title: string;
  description?: string;
  top33PercentCount?: number;
  entityType?: 'operators' | 'restakers';
}

const StakeDistributionChart: React.FC<StakeDistributionChartProps> = ({
  lorenzData,
  title,
  description,
  top33PercentCount,
  entityType = 'operators',
}) => {
  // State for scale toggle
  const [useLogScale, setUseLogScale] = useState(false);

  // Skip if no lorenz data available
  if (!lorenzData || lorenzData.length === 0) {
    return null;
  }

  // Important thresholds to highlight
  const thresholds = [33, 50, 67, 80, 90];

  // Process data to create a more intuitive visualization
  const formatDistributionData = () => {
    const totalPoints = Math.min(50, lorenzData.length);
    const step = Math.max(1, Math.floor(lorenzData.length / totalPoints));

    const data: Array<{
      position: number;
      percentOfEntities: number;
      cumulativeStake: number;
      individualStake: number;
    }> = [];
    
    const formattedThresholdPoints: Record<number, { entities: number; position: number }> = {};

    // Always include first point
    data.push({
      position: 1,
      percentOfEntities: lorenzData[0][0] * 100,
      cumulativeStake: lorenzData[0][1] * 100,
      individualStake: lorenzData[0][1] * 100, // Add individual stake
    });

    // Process other points
    for (let i = step; i < lorenzData.length; i += step) {
      const percentOfEntities = lorenzData[i][0] * 100;
      const cumulativeStake = lorenzData[i][1] * 100;
      const previousCumulativeStake = lorenzData[i - step][1] * 100;
      const individualStake = cumulativeStake - previousCumulativeStake;

      // Check if we crossed any thresholds
      thresholds.forEach((threshold) => {
        if (!formattedThresholdPoints[threshold] && cumulativeStake >= threshold) {
          const prevPoint = lorenzData[i - step];
          const prevStake = prevPoint[1] * 100;
          const prevEntities = prevPoint[0] * 100;

          if (prevStake < threshold) {
            const ratio =
              (threshold - prevStake) / (cumulativeStake - prevStake);
            const interpolatedEntities =
              prevEntities + ratio * (percentOfEntities - prevEntities);
            formattedThresholdPoints[threshold] = {
              entities: interpolatedEntities,
              position: Math.round(
                (interpolatedEntities * lorenzData.length) / 100,
              ),
            };
          } else {
            formattedThresholdPoints[threshold] = {
              entities: percentOfEntities,
              position: Math.round(
                (percentOfEntities * lorenzData.length) / 100,
              ),
            };
          }
        }
      });

      data.push({
        position: Math.round((percentOfEntities * lorenzData.length) / 100),
        percentOfEntities,
        cumulativeStake,
        individualStake,
      });
    }

    // Always include last point
    const lastIndex = lorenzData.length - 1;
    const previousCumulativeStake = lorenzData[lastIndex - 1][1] * 100;
    const finalCumulativeStake = lorenzData[lastIndex][1] * 100;
    data.push({
      position: lorenzData.length,
      percentOfEntities: lorenzData[lastIndex][0] * 100,
      cumulativeStake: finalCumulativeStake,
      individualStake: finalCumulativeStake - previousCumulativeStake,
    });

    return { data, thresholdPoints: formattedThresholdPoints };
  };

  const { data, thresholdPoints } = formatDistributionData();
  const totalEntities = lorenzData.length;

  const colorScheme = {
    operators: {
      main: '#8b5cf6',
      light: '#c4b5fd',
      gradient: ['#8b5cf6', '#d946ef'],
    },
    restakers: {
      main: '#3b82f6',
      light: '#93c5fd',
      gradient: ['#3b82f6', '#06b6d4'],
    },
  };

  const colors = colorScheme[entityType];

  // Custom tooltip content
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-lg rounded border border-gray-200">
          <p className="font-semibold text-gray-900">{`${entityType === 'operators' ? 'Individual Operator Node' : 'Restaker'} #${label}`}</p>
          <div className="space-y-1 mt-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Cumulative Restake (ETH value):</span>{' '}
              <span className="text-gray-900">
                {data.cumulativeStake.toFixed(2)}%
              </span>
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Individual Restake (ETH value):</span>{' '}
              <span className="text-gray-900">
                {data.individualStake.toFixed(4)}%
              </span>
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Percentile:</span>{' '}
              <span className="text-gray-900">
                {data.percentOfEntities.toFixed(2)}%
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-black flex items-center">
              <div className="mr-3">
                <StyledIcon
                  icon={<FileSpreadsheet className="h-4 w-4" />}
                  gradientColors={colors.gradient}
                  size="h-9 w-9"
                />
              </div>
              {title}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {description ||
                'Visualization of restake distribution among entities.'}
            </p>
          </div>
          <button
            onClick={() => setUseLogScale(!useLogScale)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              useLogScale
                ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {useLogScale ? 'Linear Scale' : 'Log Scale'}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          {top33PercentCount !== undefined && (
            <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
              <span>
                Just {top33PercentCount} {entityType} control 33% of all restake
              </span>
              <InfoTooltip
                content={`Only ${top33PercentCount} ${entityType} control one-third of all restaked ETH, indicating high concentration.`}
              />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-gray-200 p-4 mb-4 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Key Insights:
          </h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <div className="shrink-0 text-red-600 mr-2">⚠️</div>
              <span>
                The chart shows how assets (converted to ETH value) are distributed among {entityType},
                from largest to smallest.
              </span>
            </li>
            <li className="flex items-start">
              <div className="shrink-0 text-purple-600 mr-2">📊</div>
              <span>
                The steep initial rise shows that a small number of {entityType} control a large percentage of the total restake.
              </span>
            </li>
            {Object.entries(thresholdPoints).map(
              ([threshold, point]: [string, any]) => (
                <li key={threshold} className="flex items-start">
                  <div className="shrink-0 text-blue-600 mr-2">🔍</div>
                  <span>
                    <strong>{threshold}%</strong> of total restake is controlled by just{' '}
                    <strong>{point.position}</strong> {entityType} (
                    {point.entities.toFixed(1)}% of all {entityType})
                  </span>
                </li>
              ),
            )}
          </ul>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 70, bottom: 40 }}
          >
            <defs>
              <linearGradient id="colorStake" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.main} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors.main} stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="position"
              label={{
                value: `Number of ${entityType} (from largest to smallest)`,
                position: 'bottom',
                offset: 20,
              }}
              domain={[1, totalEntities]}
              type="number"
              scale={useLogScale ? 'log' : 'linear'}
              allowDecimals={false}
              tickFormatter={(value: number) => value.toString()}
            />
            <YAxis
              label={{
                value: 'Cumulative restake percentage',
                angle: -90,
                position: 'insideLeft',
                offset: -10,
                style: {
                  textAnchor: 'middle',
                },
              }}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
            />
            <RechartsTooltip content={CustomTooltip} />
            <Area
              type="monotone"
              dataKey="cumulativeStake"
              stroke={colors.main}
              fillOpacity={1}
              fill="url(#colorStake)"
              isAnimationActive={false}
            />

            {/* Add reference lines at key thresholds */}
            {thresholds.map(
              (threshold) =>
                thresholdPoints[threshold] && (
                  <ReferenceLine
                    key={`threshold-${threshold}`}
                    x={thresholdPoints[threshold].position}
                    stroke={colors.main}
                    strokeDasharray="3 3"
                    label={{
                      value: `${threshold}% of restake`,
                      position: 'insideTopRight',
                      fill: colors.main,
                      fontSize: 12,
                    }}
                  />
                ),
            )}
          </AreaChart>
        </ResponsiveContainer>

        <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            How to interpret this chart:
          </h4>
          <p className="text-sm text-gray-600">
            This chart shows how assets (converted to ETH value) are distributed among {entityType === 'operators' ? 'individual operator nodes' : entityType},
            ordered from largest to smallest. Unlike the Professional Operator Dominance chart, this visualization considers each operator node separately, even if multiple nodes are managed by the same professional operator group. The steep rise at the beginning
            indicates that a small number of {entityType === 'operators' ? 'individual nodes' : entityType} control a large
            percentage of the total restake. Use the scale toggle to switch
            between linear and logarithmic views - the logarithmic view helps
            visualize the distribution among smaller {entityType}. For details on which professional groups operate multiple nodes, visit the Operators tab.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// New component for Strategy visualization
const StrategiesOverview: React.FC<{ 
  strategiesData: StrategiesData | null,
  ethPrice?: number
}> = ({ strategiesData, ethPrice = 0 }) => {
  const [useLogScale, setUseLogScale] = useState(false);
  
  console.log('StrategiesOverview rendering:', {
    hasData: !!strategiesData,
    metricsKeys: strategiesData?.strategyConcentrationMetrics ? 
      Object.keys(strategiesData.strategyConcentrationMetrics).length : 0,
    assetsKeys: strategiesData?.totalRestakedAssetsPerStrategy ? 
      Object.keys(strategiesData.totalRestakedAssetsPerStrategy).length : 0
  });
  
  if (!strategiesData) return null;
  
  const { strategyConcentrationMetrics, totalRestakedAssetsPerStrategy } = strategiesData;
  
  // Log all available strategies with their values
  console.log('ALL STRATEGIES DATA:', {
    // List all strategies with their assets
    allStrategiesWithAssets: Object.entries(totalRestakedAssetsPerStrategy)
      .map(([key, value]) => ({ 
        name: key.replace(/_/g, ' '), 
        assets: value,
        hasMetrics: !!strategyConcentrationMetrics[key]
      }))
      .sort((a, b) => b.assets - a.assets),
    
    // Number of strategies that have concentration metrics
    totalStrategiesWithMetrics: Object.keys(strategyConcentrationMetrics).length,
    
    // Number of strategies with assets > 0
    totalStrategiesWithAssets: Object.values(totalRestakedAssetsPerStrategy)
      .filter(value => value > 0).length,
    
    // Sum of all assets
    totalAssets: Object.values(totalRestakedAssetsPerStrategy)
      .reduce((sum, value) => sum + value, 0)
  });
  
  // Use the same purple color array as the Professional Operator Dominance chart
  const strategyColors = [
    '#9C27B0', // Base purple
    '#8E24AA',
    '#7B1FA2', 
    '#6A1B9A',
    '#4A148C',
    '#38006b',
  ];
  
  // Format and sort strategies by total restaked assets
  const strategiesWithData = Object.keys(totalRestakedAssetsPerStrategy)
    .filter(strategy => totalRestakedAssetsPerStrategy[strategy] > 0)
    .map(strategy => ({
      name: strategy.replace(/_/g, ' '),
      rawName: strategy,
      assets: totalRestakedAssetsPerStrategy[strategy],
      metrics: strategyConcentrationMetrics[strategy] || null,
    }))
    .sort((a, b) => b.assets - a.assets);
  
  // Calculate total assets
  const totalAssets = strategiesWithData.reduce((sum, strategy) => sum + strategy.assets, 0);
  
  // Prepare treemap data
  const treeMapData = strategiesWithData.map((strategy, index) => {
    // Only skip strategies with zero assets
    if (strategy.assets <= 0) return null;
    
    return {
      name: strategy.name,
      value: strategy.assets,
      percentage: ((strategy.assets / totalAssets) * 100).toFixed(4),
      fill: strategyColors[index % strategyColors.length],
    };
  }).filter(Boolean);
  
  // Get top 5 strategies for detailed cards
  const topStrategies = strategiesWithData.slice(0, 10);
  
  // Log strategies being displayed in different sections
  console.log('STRATEGIES BEING DISPLAYED:', {
    // Strategies in treemap (all with assets > 0)
    treemapStrategies: treeMapData.map(item => item?.name),
    treemapCount: treeMapData.length,
    
    // Strategies in table (top 25)
    tableStrategies: strategiesWithData.slice(0, 25).map(s => s.name),
    tableCount: Math.min(25, strategiesWithData.length),
    
    // Strategies in expandable cards (top 10)
    cardStrategies: topStrategies.map(s => s.name),
    cardCount: topStrategies.length,
    
    // Strategies with zero assets (filtered out)
    strategiesWithZeroAssets: Object.entries(totalRestakedAssetsPerStrategy)
      .filter(([_, value]) => value <= 0)
      .map(([key, _]) => key.replace(/_/g, ' ')),
      
    // Total number of strategies with assets > 0
    totalStrategiesCount: strategiesWithData.length
  });
  
  // Function to determine risk level based on concentration metrics
  const getConcentrationRiskLevel = (metrics: StrategyMetrics | null): 'critical' | 'warning' | 'positive' | 'neutral' => {
    if (!metrics) return 'neutral';
    
    if (metrics.top5HoldersPercentage > 75 || metrics.herfindahlIndex > 0.25) {
      return 'critical';
    } else if (metrics.top5HoldersPercentage > 50 || metrics.herfindahlIndex > 0.15) {
      return 'warning';
    } else {
      return 'positive';
    }
  };
  
  // Calculate high risk strategies total value
  const highRiskStrategies = strategiesWithData.filter(s => s.metrics?.top5HoldersPercentage > 75);
  const highRiskETHValue = highRiskStrategies.reduce((sum, s) => sum + s.assets, 0);
  const highRiskUSDValue = ethPrice > 0 ? highRiskETHValue * ethPrice : 0;
  const highRiskPercentage = (highRiskETHValue / totalAssets * 100).toFixed(1);
  
  // Format USD value with appropriate suffix (B for billions, M for millions)
  const formatUSDValue = (value: number): string => {
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(1)}B+`;
    } else if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M+`;
    } else {
      return `$${Math.round(value).toLocaleString()}`;
    }
  };
  
  const formattedHighRiskUSD = formatUSDValue(highRiskUSDValue);
  
  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <div className="mr-3">
              <StyledIcon
                icon={<DollarSign className="h-5 w-5" />}
                gradientColors={['#9C27B0', '#d946ef']}
                size="h-10 w-10"
              />
            </div>
            {formattedHighRiskUSD} Restaked in  Strategies Where Top 5 Operators Control 75%+
          </h2>
          <p className="text-sm text-gray-600">
            Distribution of assets across different strategies on EigenLayer, with concentration risk metrics
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-gray-200 p-4 mb-4 bg-gray-50">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Insights:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <div className="shrink-0 text-blue-600 mr-2">📊</div>
                <span>
                  BeaconChain ETH ({((totalRestakedAssetsPerStrategy['BeaconChain_ETH'] || 0) / totalAssets * 100).toFixed(1)}%) 
                  and Lido ({((totalRestakedAssetsPerStrategy['Lido'] || 0) / totalAssets * 100).toFixed(1)}%) 
                  are the most widely used strategies, accounting for {((
                    (totalRestakedAssetsPerStrategy['BeaconChain_ETH'] || 0) + 
                    (totalRestakedAssetsPerStrategy['Lido'] || 0)
                  ) / totalAssets * 100).toFixed(1)}% of all restaked assets.
                </span>
              </li>
              <li className="flex items-start">
                <div className="shrink-0 text-red-600 mr-2">⚠️</div>
                <span>
                  {highRiskStrategies.length} out of {strategiesWithData.length} strategies show critical concentration risk, 
                  with top 5 operators controlling over 75% of the strategy's assets. These high-risk strategies account for {highRiskETHValue.toLocaleString()} ETH 
                  {highRiskUSDValue > 0 ? ` (${formattedHighRiskUSD} USD) ` : ' '}
                  ({highRiskPercentage}% of all restaked assets).
                </span>
              </li>
              <li className="flex items-start">
                <div className="shrink-0 text-orange-600 mr-2">🔍</div>
                <span>
                  Smaller strategies tend to have higher concentration risks, with fewer operators participating and higher inequality metrics.
                </span>
              </li>
              <li className="flex items-start">
                <div className="shrink-0 text-purple-600 mr-2">ℹ️</div>
                <span>
                  <strong>Note:</strong> All metrics shown here reflect the distribution of assets among operators, not restakers. This provides insights into operator-level concentration within each strategy.
                </span>
              </li>
            </ul>
          </div>
          
          {/* Strategy Distribution Chart */}
          <div className="pl-0 -ml-36">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={strategiesWithData.slice(0, 10)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 60, bottom: 30 }}
                barSize={10}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis 
                  type="number" 
                  tickFormatter={(value) => `${value.toLocaleString()} ETH`}
                  label={{ 
                    value: 'ETH Value',
                    position: 'insideBottom',
                    offset: -15,
                    style: { 
                      fontSize: 14,
                      fontWeight: 500,
                      fill: '#666'
                    }
                  }}
                  domain={useLogScale ? [0.1, 'dataMax'] : [0, 'dataMax']}
                  scale={useLogScale ? 'log' : 'linear'}
                  allowDecimals={true}
                  tick={{ fontSize: 11 }}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={240}
                  tick={{ fontSize: 11, textAnchor: 'end' }}
                  axisLine={false}
                  tickLine={false}
                  interval={0} // Display every tick/label
                  tickMargin={5}
                />
                <RechartsTooltip
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const strategy = payload[0].payload;
                      const metrics = strategy.metrics;
                      const percentage = ((strategy.assets / totalAssets) * 100).toFixed(4);
                      return (
                        <div className="bg-white p-3 shadow-lg rounded border border-purple-200">
                          <p className="font-semibold text-black text-base">{strategy.name}</p>
                          <div className="space-y-1 mt-2">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Total Assets:</span>{' '}
                              <span className="text-gray-900">{strategy.assets.toLocaleString()} ETH</span>
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Network Share:</span>{' '}
                              <span className="text-gray-900">{percentage}%</span>
                            </p>
                            {metrics && (
                              <>
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Total Operators:</span>{' '}
                                  <span className="text-gray-900">{metrics.totalEntities}</span>
                                </p>
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Top 5 Operators Control:</span>{' '}
                                  <span className={metrics.top5HoldersPercentage > 75 ? "text-red-600 font-bold" : "text-gray-900"}>
                                    {metrics.top5HoldersPercentage.toFixed(1)}%
                                  </span>
                                </p>
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Concentration Index:</span>{' '}
                                  <span className={metrics.herfindahlIndex > 0.25 ? "text-red-600 font-bold" : "text-gray-900"}>
                                    {metrics.herfindahlIndex.toFixed(4)}
                                  </span>
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="assets" 
                  name="ETH Value"
                  isAnimationActive={false}
                  radius={[0, 3, 3, 0]} // Rounded corners on right side only
                  minPointSize={3} // Ensures very small values still appear as tiny bars
                >
                  {strategiesWithData.map((entry, index) => (
                    <Cell 
                      key={`cell-${entry.rawName}`} 
                      fill={strategyColors[index % strategyColors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 flex justify-end space-x-2">
            <button 
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                useLogScale 
                  ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              onClick={() => {
                setUseLogScale(!useLogScale);
                console.log(`Switched to ${!useLogScale ? 'logarithmic' : 'linear'} scale`);
              }}
            >
              {useLogScale ? 'Linear Scale' : 'Log Scale'}
            </button>
          </div>
          
          
          <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">How to interpret this visualization:</h4>
            <p className="text-sm text-gray-600">
              This chart shows all strategies in EigenLayer by total ETH value. Each bar represents a strategy,
              with longer bars indicating more widely used strategies. Data is based on operator distribution, not restaker distribution.
              Hover over any bar to see detailed statistics about each strategy, 
              including operator concentration metrics. Strategies with high concentration have their top 5 operators
              controlling a significant percentage of assets, creating potential risks.
              {useLogScale && (
                <p className="mt-2 text-sm text-purple-700 bg-purple-50 p-2 rounded">
                  <strong>Log Scale Active:</strong> This view compresses the scale to better visualize both large and small strategies.
                  The difference between very large strategies (millions of ETH) and very small ones (less than 1 ETH) becomes more visible.
                </p>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Strategy Concentration Risk Table */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <div className="mr-3">
              <StyledIcon
                icon={<AlertTriangle className="h-5 w-5" />}
                gradientColors={['#f97316', '#ef4444']}
                size="h-10 w-10"
              />
            </div>
            Strategy Concentration Risk Assessment
          </h2>
          <p className="text-sm text-gray-600">
            Detailed analysis of concentration risks across different strategies
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3">Strategy</th>
                  <th className="px-4 py-3">Total Assets</th>
                  <th className="px-4 py-3">Operators</th>
                  <th className="px-4 py-3">Top 5 Operators %</th>
                  <th className="px-4 py-3">Herfindahl</th>
                  <th className="px-4 py-3">Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {strategiesWithData.slice(0, 25).map((strategy) => {
                  const riskLevel = getConcentrationRiskLevel(strategy.metrics);
                  const riskColors = {
                    critical: 'bg-red-100 text-red-800',
                    warning: 'bg-orange-100 text-orange-800',
                    positive: 'bg-green-100 text-green-800',
                    neutral: 'bg-blue-100 text-blue-800',
                  };
                  
                  return (
                    <tr key={strategy.rawName} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{strategy.name}</td>
                      <td className="px-4 py-3">{strategy.assets.toLocaleString()}</td>
                      <td className="px-4 py-3">{strategy.metrics?.totalEntities || 'N/A'}</td>
                      <td className="px-4 py-3 font-medium">
                        {strategy.metrics ? (
                          <span className={strategy.metrics.top5HoldersPercentage > 75 ? 'text-red-600' : 'text-gray-700'}>
                            {strategy.metrics.top5HoldersPercentage.toFixed(1)}%
                          </span>
                        ) : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        {strategy.metrics ? strategy.metrics.herfindahlIndex.toFixed(4) : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        {strategy.metrics && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskColors[riskLevel]}`}>
                            {riskLevel === 'critical' ? 'High Risk' : 
                             riskLevel === 'warning' ? 'Medium Risk' : 
                             'Low Risk'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p>* Showing top 25 strategies by total value. Concentration metrics explanation:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Total Assets:</strong> Sum of all assets managed by the strategy.</li>
              <li><strong>Operators:</strong> Number of unique operators in the strategy.</li>
              <li><strong>Top 5 Operators %:</strong> Percentage of strategy assets controlled by the top 5 operators. Higher values indicate more centralization.</li>
              <li><strong>Herfindahl Index:</strong> Measure of operator concentration (0-1). Higher values indicate more concentration.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      
      {/* Top Strategies Detailed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {topStrategies.map((strategy) => {
          const riskLevel = getConcentrationRiskLevel(strategy.metrics);
          const marketShare = (strategy.assets / totalAssets * 100).toFixed(1);
          
          return (
            <ExpandableSection
              key={strategy.rawName}
              title={`${strategy.name} (${marketShare}% of network)`}
              severity={riskLevel}
              defaultOpen={false}
            >
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Total Assets:</span>
                  <span className="font-semibold">{strategy.assets.toLocaleString()} ETH</span>
                </div>
                
                {strategy.metrics && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Operators:</span>
                      <span className="font-semibold">{strategy.metrics.totalEntities}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Top 5 Operators Control:</span>
                      <span className={strategy.metrics.top5HoldersPercentage > 75 ? 'font-bold text-red-600' : 'font-semibold'}>
                        {strategy.metrics.top5HoldersPercentage.toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Concentration Index:</span>
                      <span className={strategy.metrics.herfindahlIndex > 0.25 ? 'font-bold text-red-600' : 'font-semibold'}>
                        {strategy.metrics.herfindahlIndex.toFixed(4)}
                      </span>
                    </div>
                    
                    <RiskIndicator
                      level={riskLevel}
                      title={`${strategy.name} Risk Assessment`}
                      description={
                        <p>
                          {riskLevel === 'critical' 
                            ? `This strategy has critical concentration risk with top 5 operators controlling ${strategy.metrics.top5HoldersPercentage.toFixed(1)}% of assets.`
                            : riskLevel === 'warning'
                            ? `This strategy has moderate concentration risk with relatively few operators and top 5 operators controlling ${strategy.metrics.top5HoldersPercentage.toFixed(1)}% of assets.`
                            : `This strategy has good distribution across ${strategy.metrics.totalEntities} operators with reasonable concentration metrics.`
                          }
                        </p>
                      }
                    />
                  </>
                )}
              </div>
            </ExpandableSection>
          );
        })}
      </div>
    </>
  );
};

const Overview: React.FC<OverviewProps> = ({ restakeData }) => {
  const [operatorData, setOperatorData] = useState<OperatorDataResponse | null>(
    null,
  );

  // Add state for strategies data
  const [strategiesData, setStrategiesData] = useState<StrategiesData | null>(null);
  const [ethPrice, setEthPrice] = useState<number>(0);
  
  // Format USD value with appropriate suffix (B for billions, M for millions)
  const formatUSDValue = (value: number): string => {
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(1)}B+`;
    } else if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M+`;
    } else {
      return `$${Math.round(value).toLocaleString()}`;
    }
  };

  // Add diagnostic log for initial data
  console.log('Overview component - Initial restakeData:', {
    hasData: !!restakeData,
    keys: restakeData ? Object.keys(restakeData) : [],
    hasStrategyMetrics: !!restakeData?.strategyConcentrationMetrics,
    hasAssetsPerStrategy: !!restakeData?.totalRestakedAssetsPerStrategy,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchOperatorData();
        setOperatorData(data);
        
        // Log detailed information about strategy data
        console.log('Strategy data check from operatorData:', {
          strategyMetricsExists: !!data?.strategyConcentrationMetrics,
          strategyMetricsType: typeof data?.strategyConcentrationMetrics,
          strategyMetricsKeys: data?.strategyConcentrationMetrics ? 
            Object.keys(data.strategyConcentrationMetrics) : [],
          assetsPerStrategyExists: !!data?.totalRestakedAssetsPerStrategy,
          assetsPerStrategyType: typeof data?.totalRestakedAssetsPerStrategy,
          assetsPerStrategyKeys: data?.totalRestakedAssetsPerStrategy ? 
            Object.keys(data.totalRestakedAssetsPerStrategy) : [],
        });
        
        // Use strategy data from operatorData instead of restakeData
        if (data?.strategyConcentrationMetrics && data?.totalRestakedAssetsPerStrategy) {
          console.log('Setting strategies data from operator API');
          
          // Transform data to use totalEntities instead of totalRestakers if needed
          const transformedMetrics: Record<string, StrategyMetrics> = {};
          
          Object.entries(data.strategyConcentrationMetrics).forEach(([key, metrics]) => {
            // Map totalRestakers to totalEntities if it exists
            if ('totalRestakers' in metrics) {
              transformedMetrics[key] = {
                totalAssets: metrics.totalAssets,
                totalEntities: (metrics as any).totalRestakers as number,
                top5HoldersPercentage: metrics.top5HoldersPercentage,
                herfindahlIndex: metrics.herfindahlIndex
              };
            } else if ('totalEntities' in metrics) {
              transformedMetrics[key] = metrics as unknown as StrategyMetrics;
            }
          });
          
          setStrategiesData({
            strategyConcentrationMetrics: transformedMetrics,
            totalRestakedAssetsPerStrategy: data.totalRestakedAssetsPerStrategy
          });
        } else {
          console.log('No strategy data available from operator API');
          setStrategiesData(null);
        }
      } catch (error) {
        console.error('Error fetching operator data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const getEthPrice = async () => {
      try {
        const price = await fetchETHPrice();
        setEthPrice(price);
      } catch (error) {
        console.error('Error fetching ETH price:', error);
      }
    };

    getEthPrice();

    // Refresh price every 5 minutes
    const interval = setInterval(getEthPrice, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Check if strategiesData is being updated correctly
  useEffect(() => {
    console.log('strategiesData updated:', {
      exists: !!strategiesData,
      metricsCount: strategiesData?.strategyConcentrationMetrics ? 
        Object.keys(strategiesData.strategyConcentrationMetrics).length : 0,
      assetsCount: strategiesData?.totalRestakedAssetsPerStrategy ? 
        Object.keys(strategiesData.totalRestakedAssetsPerStrategy).length : 0,
    });
  }, [strategiesData]);

  // Find operator data helper function
  const findOperatorData = (operatorName: string) => {
    if (!operatorData?.majorOperatorGroupMetrics) return null;

    // Try different possible key formats
    const possibleKeys = [
      operatorName.toLowerCase(), // 'p2p'
      operatorName.toUpperCase(), // 'P2P'
      operatorName.replace(' ', '_').toLowerCase(), // 'node_monster'
      operatorName, // Exact match
    ];

    // Search for any matching key
    for (const key of Object.keys(operatorData.majorOperatorGroupMetrics)) {
      if (
        possibleKeys.includes(key.toLowerCase()) ||
        key.toLowerCase().includes(operatorName.toLowerCase())
      ) {
        return operatorData.majorOperatorGroupMetrics[key];
      }
    }

    return null;
  };

  // Get operator data
  const p2pData = findOperatorData('p2p');
  const nodeMonsterData = findOperatorData('node monster');
  const p2pShare = p2pData ? p2pData.total_market_share * 100 : 0;
  const nodeMonsterShare = nodeMonsterData ? nodeMonsterData.total_market_share * 100 : 0;
  const formattedP2PShare = p2pShare.toFixed(1);
  const formattedNodeMonsterShare = nodeMonsterShare.toFixed(1);
  const combinedShare = p2pShare + nodeMonsterShare;
  const formattedCombinedShare = combinedShare.toFixed(1);
  
  // Calculate USD value of assets in top operators
  const topOperatorsETHValue = (operatorData?.totalETHRestaked || 0) * (combinedShare / 100);
  const topOperatorsUSDValue = ethPrice > 0 ? topOperatorsETHValue * ethPrice : 0;
  const formattedTopOperatorsUSD = formatUSDValue(topOperatorsUSDValue);

  // Color array for different sections
  const purpleColors = [
    '#9C27B0', // Base purple
    '#8E24AA',
    '#7B1FA2',
    '#6A1B9A',
    '#4A148C',
    '#38006b',
  ];

  const totalRestaked = operatorData?.totalETHRestaked || 0;
  const majorOperatorData = !operatorData?.majorOperatorGroupMetrics
    ? []
    : Object.entries(operatorData.majorOperatorGroupMetrics).map(
        ([key, value], index) => {
          const ethAmount = Number(value.total_eth_restaked.toFixed(2));
          return {
            name: key.replaceAll('_', ' '),
            value: ethAmount,
            percentage: ((ethAmount / totalRestaked) * 100).toFixed(2),
            fill: purpleColors[index % purpleColors.length],
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
      fill: purpleColors[majorOperatorData.length % purpleColors.length],
    });
  }

  return (
    <div className="space-y-6">
      {/* <RiskAssessment /> */}
      <EnhancedMetrics restakeData={restakeData} operatorData={operatorData} />
      <CompactNotes />
      
      {/* Add Strategies Overview component with ethPrice */}
      {strategiesData && <StrategiesOverview strategiesData={strategiesData} ethPrice={ethPrice} />}
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-black flex items-center">
                <div className="mr-3">
                  <StyledIcon
                    icon={<PieChart className="h-4 w-4" />}
                    gradientColors={['#9C27B0', '#d946ef']}
                    size="h-9 w-9"
                  />
                </div>
                {ethPrice > 0 && p2pData && nodeMonsterData ? 
                  `${formattedTopOperatorsUSD} Restaked in Top 2 Professional Operators` :
                  `Professional Operator Dominance in EigenLayer`
                }
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                A few professional operator groups control a significant portion of the network through multiple individual nodes. This visualization shows the relative size of each major operator group's assets (converted to ETH value equivalent), with larger boxes representing more concentrated control.
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 items-center">
            {p2pData && (
              <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <span>P2P controls {formattedP2PShare}% of total restaked assets (ETH value)</span>
                <InfoTooltip content="P2P is the largest professional operator in EigenLayer, managing nodes for multiple projects and clients, highlighting significant concentration risk." />
              </div>
            )}
            {nodeMonsterData && (
              <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <span>Top 2 operator groups control {formattedCombinedShare}% of network assets (in ETH value)</span>
                <InfoTooltip content="The combined dominance of P2P and Node Monster represents a significant centralization concern." />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-gray-200 p-4 mb-4 bg-gray-50">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Insights:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <div className="shrink-0 text-red-600 mr-2">⚠️</div>
                <span>Professional operator groups dominate EigenLayer, with P2P controlling {formattedP2PShare}% of all restaked assets (ETH value).</span>
              </li>
              <li className="flex items-start">
                <div className="shrink-0 text-purple-600 mr-2">📊</div>
                <span>The two largest operator groups (P2P and Node Monster) together control {formattedCombinedShare}% of all network assets (in ETH value).</span>
              </li>
              <li className="flex items-start">
                <div className="shrink-0 text-blue-600 mr-2">🔍</div>
                <span>Box size represents the ETH value of all assets held by each professional operator group - larger boxes indicate more concentrated control.</span>
              </li>
              <li className="flex items-start">
                <div className="shrink-0 text-orange-600 mr-2">ℹ️</div>
                <span>Note: Professional operators like P2P may operate nodes for multiple companies such as Puffer, Swell, etc. Visit the Operators tab for more detailed breakdown.</span>
              </li>
            </ul>
          </div>

          {majorOperatorData.length > 0 && (
            <ResponsiveContainer width="100%" height={400}>
              <Treemap
                data={majorOperatorData}
                dataKey="value"
                nameKey="name"
                content={<CustomTreemapContent />}
                aspectRatio={4 / 3}
                isAnimationActive={false}
              >
                <RechartsTooltip
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 shadow-lg rounded border border-purple-200">
                          <p className="font-semibold text-black text-base">{data.name}</p>
                          <div className="space-y-1 mt-2">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Total Assets (ETH value):</span>{' '}
                              <span className="text-gray-900">{data.value.toLocaleString()} ETH</span>
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Network Share:</span>{' '}
                              <span className="text-gray-900">{data.percentage}%</span>
                            </p>
                            {data.name === 'P2P' && (
                              <p className="text-xs text-red-600 mt-1">
                                Largest professional operator - significant concentration risk
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </Treemap>
            </ResponsiveContainer>
          )}

          <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">How to interpret this visualization:</h4>
            <p className="text-sm text-gray-600">
              Each box represents a professional operator group that may manage multiple individual nodes (often for different companies/clients), with the size proportional to the ETH value of all their restaked assets (including Beacon Chain ETH, stETH, and other assets converted to ETH value). Larger boxes indicate more concentrated control over the network. The dominance of a few large boxes highlights centralization risks in EigenLayer's current state. Hover over any box to see detailed statistics about each operator group's control over the network.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Replace Lorenz Curve with more intuitive Stake Distribution Chart */}
      {operatorData?.concentrationMetrics?.lorenzCurve && (
        <StakeDistributionChart
          lorenzData={operatorData.concentrationMetrics.lorenzCurve}
          title="Operator Stake Concentration"
          description="This chart shows how assets (converted to ETH value) are concentrated among individual operator nodes (not operator groups), from largest to smallest. A steep initial curve indicates high concentration at the node level."
          top33PercentCount={
            operatorData.concentrationMetrics.top33PercentCount
          }
          entityType="operators"
        />
      )}

      {restakeData?.concentrationMetrics?.lorenzCurve && (
        <StakeDistributionChart
          lorenzData={restakeData.concentrationMetrics.lorenzCurve}
          title="Restaker Stake Concentration"
          description="This chart shows how assets (converted to ETH value) are concentrated among restakers, from largest to smallest. A steep initial curve indicates high concentration."
          top33PercentCount={restakeData.concentrationMetrics.top33PercentCount}
          entityType="restakers"
        />
      )}
    </div>
  );
};

export default Overview;
