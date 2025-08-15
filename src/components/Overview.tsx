import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  PieChart,
  Pie,
} from 'recharts';

import { trackEvent } from '@/lib/analytics';

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
  FileSpreadsheet,
  DollarSign,
  Copy,
  Check,
  LucideIcon,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { OperatorDataResponse } from '../app/interface/operatorData.interface';
import {
  fetchOperatorData,
  fetchETHPrice,
  fetchEthereumStats,
} from '../app/api/restake/restake';
import { Skeleton } from '../components/ui/skeleton';

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
    <Card className="mt-4 border-l-4 border-l-purple-500" glassEffect="medium">
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
    strategyConcentrationMetrics?: {
      [key: string]: {
        totalAssets: number;
        totalEntities: number;
        top5HoldersPercentage: number;
        herfindahlIndex: number;
      };
    };
    totalRestakedAssetsPerStrategy?: {
      [key: string]: number;
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
    stakerData?: Array<{
      'Staker Address': string;
      'ETH Equivalent Value'?: number;
      'Market Share'?: number;
      'Number of Strategies'?: number;
      strategies?: any[];
    }>;
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
    strategyConcentrationMetrics?: {
      [key: string]: {
        totalAssets: number;
        totalEntities: number;
        top5HoldersPercentage: number;
        herfindahlIndex: number;
      };
    };
    totalRestakedAssetsPerStrategy?: {
      [key: string]: number;
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

// Function to determine risk level based on concentration metrics
const getConcentrationRiskLevel = (
  metrics: StrategyMetrics | null,
): 'critical' | 'warning' | 'positive' | 'neutral' => {
  if (!metrics) return 'neutral';

  if (metrics.top5HoldersPercentage > 75 || metrics.herfindahlIndex > 0.25) {
    return 'critical';
  } else if (
    metrics.top5HoldersPercentage > 50 ||
    metrics.herfindahlIndex > 0.15
  ) {
    return 'warning';
  } else {
    return 'positive';
  }
};

// Add a helper function to convert risk levels to appropriate badge colors
const getRiskBadge = (risk: string): { color: string; label: string } => {
  switch (risk) {
    case 'critical':
      return {
        color: 'bg-red-500 text-white border-2 border-red-600 shadow-md',
        label: 'High Risk',
      };
    case 'warning':
      return {
        color: 'bg-yellow-500 text-white border-2 border-yellow-600 shadow-md',
        label: 'Medium Risk',
      };
    case 'positive':
      return {
        color: 'bg-green-500 text-white border-2 border-green-600 shadow-md',
        label: 'Low Risk',
      };
    default:
      return {
        color: 'bg-gray-100 text-gray-800 border-2 border-gray-300',
        label: 'Unknown',
      };
  }
};

// Also update the RiskIndicator component for better visibility
const RiskIndicator: React.FC<{
  level: 'critical' | 'warning' | 'positive' | 'neutral';
  title: string;
  description: React.ReactNode;
}> = ({ level, title, description }) => {
  const getLevelStyles = () => {
    switch (level) {
      case 'critical':
        return {
          bg: 'bg-red-500',
          border: 'border-2 border-red-600',
          text: 'text-white',
          icon: '⚠️',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500',
          border: 'border-2 border-yellow-600',
          text: 'text-white',
          icon: '⚠️',
        };
      case 'positive':
        return {
          bg: 'bg-green-500',
          border: 'border-2 border-green-600',
          text: 'text-white',
          icon: '✓',
        };
      default:
        return {
          bg: 'bg-gray-100',
          border: 'border-2 border-gray-300',
          text: 'text-gray-800',
          icon: 'ℹ️',
        };
    }
  };

  const styles = getLevelStyles();

  return (
    <div className={`rounded-lg ${styles.bg} ${styles.border} p-4 shadow-md`}>
      <div className="flex items-start">
        <span className="text-lg mr-2">{styles.icon}</span>
        <div>
          <h4 className={`font-bold ${styles.text} text-sm mb-1`}>{title}</h4>
          <div className={`${styles.text} text-sm`}>{description}</div>
        </div>
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

  const severityColors = {
    critical: 'bg-red-100 border-l-4 border-l-red-500 border border-red-300',
    warning:
      'bg-yellow-100 border-l-4 border-l-yellow-500 border border-yellow-300',
    positive:
      'bg-green-100 border-l-4 border-l-green-500 border border-green-300',
    neutral: 'bg-gray-50 border border-gray-200',
  };

  const severityTextColors = {
    critical: 'text-red-700',
    warning: 'text-yellow-700',
    positive: 'text-green-700',
    neutral: 'text-gray-700',
  };

  return (
    <div
      className={`rounded-lg overflow-hidden shadow-md ${severityColors[severity]}`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-4 text-left"
      >
        <div className="flex items-center">
          {severity === 'critical' && (
            <span className="mr-2 text-lg bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center">
              !
            </span>
          )}
          <h3 className={`text-lg font-bold ${severityTextColors[severity]}`}>
            {title}
          </h3>
        </div>
        <div>
          {isOpen ? (
            <ChevronUp className={`h-5 w-5 ${severityTextColors[severity]}`} />
          ) : (
            <ChevronDown
              className={`h-5 w-5 ${severityTextColors[severity]}`}
            />
          )}
        </div>
      </button>
      {isOpen && <div className="p-4 bg-white">{children}</div>}
    </div>
  );
};

// Key metrics summary card
const MetricSummaryCard: React.FC<{
  title: string;
  value: string | number | React.ReactNode;
  icon: React.ReactNode;
  description?: string;
  usdValue?: string;
}> = ({ title, value, icon, description, usdValue }) => (
  <div className="rounded-lg border border-purple-100 p-5 shadow-md hover:shadow-lg transition-all duration-300 backdrop-blur-md bg-white/70">
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
  const [ethereumStats, setEthereumStats] = useState<{
    totalEthSupply: number;
    totalStEthSupply: number;
  } | null>(null);

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

  // Fetch Ethereum stats
  useEffect(() => {
    const getEthereumStats = async () => {
      try {
        const stats = await fetchEthereumStats();
        setEthereumStats(stats);
      } catch (error) {
        console.error('Error fetching Ethereum stats:', error);
      }
    };

    getEthereumStats();
  }, []);

  // Calculate restaked percentages if stats are available
  const restakePercents = useMemo(() => {
    if (!ethereumStats || !operatorData) return null;

    // Get BeaconChain ETH and Lido from strategies
    const beaconChainETH =
      operatorData.totalRestakedAssetsPerStrategy?.['BeaconChain_ETH'] || 0;
    const lidoETH = operatorData.totalRestakedAssetsPerStrategy?.['Lido'] || 0;

    return {
      ethPercent: (
        (beaconChainETH / ethereumStats.totalEthSupply) *
        100
      ).toFixed(2),
      stethPercent: ((lidoETH / ethereumStats.totalStEthSupply) * 100).toFixed(
        2,
      ),
      combinedPercent: (
        ((beaconChainETH + lidoETH) /
          (ethereumStats.totalEthSupply + ethereumStats.totalStEthSupply)) *
        100
      ).toFixed(2),
    };
  }, [ethereumStats, operatorData]);

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
              description="ETH value of all restaked assets (includes Beacon Chain ETH, stETH, EIGEN, etc.)"
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

          {/* Second row of metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <MetricSummaryCard
              title="Top 5 Operators Control"
              value={(() => {
                // Fetch the raw data from the API response directly
                if (!operatorData) return 'N/A';

                // If we can access the raw operator data from the API response
                const rawOperators = (operatorData as any).operatorData;
                if (!rawOperators || !Array.isArray(rawOperators)) {
                  // Fallback to estimate based on concentration metrics if raw data not available
                  if (operatorData.concentrationMetrics?.top33PercentCount) {
                    const topCount =
                      operatorData.concentrationMetrics.top33PercentCount;
                    return `~${topCount <= 5 ? 33 : Math.round((33 * 5) / topCount)}%`;
                  }
                  return 'N/A';
                }

                // Exactly match the calculation in OperatorOverview.tsx
                return (
                  rawOperators
                    .sort(
                      (a, b) =>
                        (b['Market Share'] || 0) - (a['Market Share'] || 0),
                    )
                    .slice(0, 5)
                    .reduce(
                      (sum, op) => sum + (op['Market Share'] || 0) * 100,
                      0,
                    )
                    .toFixed(1) + '%'
                );
              })()}
              icon={
                <StyledIcon
                  icon={<ServerCog className="h-4 w-4" />}
                  gradientColors={['#ef4444', '#f97316']}
                  size="h-9 w-9"
                />
              }
              description={(() => {
                if (!operatorData?.totalETHRestaked)
                  return 'Percentage of all restaked ETH controlled by the top 5 operators';

                // Calculate percentage using the appropriate method
                let percentage = 0;
                const rawOperators = (operatorData as any).operatorData;

                if (rawOperators && Array.isArray(rawOperators)) {
                  // If we have raw data, calculate exactly
                  percentage = rawOperators
                    .sort(
                      (a, b) =>
                        (b['Market Share'] || 0) - (a['Market Share'] || 0),
                    )
                    .slice(0, 5)
                    .reduce(
                      (sum, op) => sum + (op['Market Share'] || 0) * 100,
                      0,
                    );
                } else if (
                  operatorData.concentrationMetrics?.top33PercentCount
                ) {
                  // Fallback to estimate
                  const topCount =
                    operatorData.concentrationMetrics.top33PercentCount;
                  percentage =
                    topCount <= 5 ? 33 : Math.round((33 * 5) / topCount);
                }

                // Calculate ETH value
                const ethValue =
                  (operatorData.totalETHRestaked * percentage) / 100;
                const formattedETH = new Intl.NumberFormat('en-US').format(
                  Math.round(ethValue),
                );

                // Calculate USD value if ETH price is available
                const usdValue = ethPrice > 0 ? ethValue * ethPrice : 0;
                const formattedUSD =
                  usdValue > 0
                    ? new Intl.NumberFormat('en-US').format(
                        Math.round(usdValue),
                      )
                    : '';

                return `${formattedETH} ETH${formattedUSD ? ` ($${formattedUSD})` : ''} controlled by the top 5 operators`;
              })()}
            />
            <MetricSummaryCard
              title="Top 20 Restakers Control"
              value={(() => {
                if (!restakeData?.stakerData) return 'N/A';

                const percentage =
                  restakeData.stakerData
                    .slice(0, 20)
                    .reduce(
                      (sum, staker) => sum + (staker['Market Share'] || 0),
                      0,
                    ) * 100;

                return `${percentage.toFixed(1)}%`;
              })()}
              icon={
                <StyledIcon
                  icon={<Wallet className="h-4 w-4" />}
                  gradientColors={['#ef4444', '#f97316']}
                  size="h-9 w-9"
                />
              }
              description={(() => {
                if (!restakeData?.stakerData || !operatorData?.totalETHRestaked)
                  return 'Percentage of all restaked ETH controlled by the top 20 restaker wallets';

                const percentage =
                  restakeData.stakerData
                    .slice(0, 20)
                    .reduce(
                      (sum, staker) => sum + (staker['Market Share'] || 0),
                      0,
                    ) * 100;

                // Calculate ETH value
                const ethValue =
                  (operatorData.totalETHRestaked * percentage) / 100;
                const formattedETH = new Intl.NumberFormat('en-US').format(
                  Math.round(ethValue),
                );

                // Calculate USD value if ETH price is available
                const usdValue = ethPrice > 0 ? ethValue * ethPrice : 0;
                const formattedUSD =
                  usdValue > 0
                    ? new Intl.NumberFormat('en-US').format(
                        Math.round(usdValue),
                      )
                    : '';

                return `${formattedETH} ETH${formattedUSD ? ` ($${formattedUSD})` : ''} controlled by the top 20 wallets`;
              })()}
            />
            <MetricSummaryCard
              title="Strategy Count"
              value={
                operatorData?.totalRestakedAssetsPerStrategy
                  ? Object.keys(
                      operatorData.totalRestakedAssetsPerStrategy,
                    ).filter(
                      (key) =>
                        operatorData?.totalRestakedAssetsPerStrategy?.[key] !==
                          undefined &&
                        operatorData?.totalRestakedAssetsPerStrategy?.[key] > 0,
                    ).length
                  : 'N/A'
              }
              icon={
                <StyledIcon
                  icon={<DollarSign className="h-4 w-4" />}
                  gradientColors={['#8b5cf6', '#d946ef']}
                  size="h-9 w-9"
                />
              }
              description="Number of active strategies in the EigenLayer ecosystem"
            />
          </div>

          {/* Third row of metrics - Ethereum ecosystem stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <MetricSummaryCard
              title="ETH Restaked vs. Total Supply"
              value={
                restakePercents ? (
                  `${restakePercents.ethPercent}%`
                ) : (
                  <Skeleton className="h-6 w-16 rounded inline-block" />
                )
              }
              icon={
                <StyledIcon
                  icon={<Network className="h-4 w-4" />}
                  gradientColors={['#10b981', '#3b82f6']}
                  size="h-9 w-9"
                />
              }
              description={`${
                operatorData?.totalRestakedAssetsPerStrategy?.[
                  'BeaconChain_ETH'
                ]
                  ? new Intl.NumberFormat('en-US').format(
                      Math.round(
                        operatorData.totalRestakedAssetsPerStrategy[
                          'BeaconChain_ETH'
                        ],
                      ),
                    )
                  : '?'
              } 
                ETH restaked out of ${
                  ethereumStats?.totalEthSupply
                    ? new Intl.NumberFormat('en-US').format(
                        Math.round(ethereumStats.totalEthSupply),
                      )
                    : '?'
                } 
                total ETH in circulation`}
            />
            <MetricSummaryCard
              title="stETH Restaked vs. Total Supply"
              value={
                restakePercents ? (
                  `${restakePercents.stethPercent}%`
                ) : (
                  <Skeleton className="h-6 w-16 rounded inline-block" />
                )
              }
              icon={
                <StyledIcon
                  icon={<Wallet className="h-4 w-4" />}
                  gradientColors={['#3b82f6', '#06b6d4']}
                  size="h-9 w-9"
                />
              }
              description={`${
                operatorData?.totalRestakedAssetsPerStrategy?.['Lido']
                  ? new Intl.NumberFormat('en-US').format(
                      Math.round(
                        operatorData.totalRestakedAssetsPerStrategy['Lido'],
                      ),
                    )
                  : '?'
              } 
                stETH restaked out of ${
                  ethereumStats?.totalStEthSupply
                    ? new Intl.NumberFormat('en-US').format(
                        Math.round(ethereumStats.totalStEthSupply),
                      )
                    : '?'
                } 
                total stETH in circulation`}
            />
            <MetricSummaryCard
              title="Combined Ecosystem Impact"
              value={
                restakePercents ? (
                  `${restakePercents.combinedPercent}%`
                ) : (
                  <Skeleton className="h-6 w-16 rounded inline-block" />
                )
              }
              icon={
                <StyledIcon
                  icon={<ServerCog className="h-4 w-4" />}
                  gradientColors={['#8b5cf6', '#3b82f6']}
                  size="h-9 w-9"
                />
              }
              description={`Percentage of combined ETH and stETH in circulation restaked in EigenLayer (${operatorData?.totalETHRestaked ? formattedETH : '?'} out of ${
                ethereumStats
                  ? new Intl.NumberFormat('en-US').format(
                      Math.round(
                        ethereumStats.totalEthSupply +
                          ethereumStats.totalStEthSupply,
                      ),
                    )
                  : '?'
              } total)`}
            />
          </div>

          {/* Critical Risk Metrics Alert */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Left column - Risk Alert */}
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
                    <span className="font-bold">Governance Risk:</span>{' '}
                    EigenLayer relies on a 9-of-13 community multisig that can
                    execute IMMEDIATE upgrades without a timelock.
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
                    Just {operatorTopCount} operators control 33% of restaked
                    ETH. Their compromise or collusion could trigger a cascading
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
                    <span className="font-bold">Restaker Concentration:</span>{' '}
                    The top {restakerTopCount} individual restakers control 33%
                    of all restaked assets.
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
                    <span className="font-bold">Strategy Risk:</span> Multiple
                    strategies have critical concentration where a small number
                    of operators control a significant percentage of assets.
                    This puts{' '}
                    {ethPrice > 0 &&
                    operatorData?.totalRestakedAssetsPerStrategy
                      ? ((value) => {
                          if (value >= 1_000_000_000) {
                            return `$${(value / 1_000_000_000).toFixed(1)}B+`;
                          } else if (value >= 1_000_000) {
                            return `$${(value / 1_000_000).toFixed(1)}M+`;
                          } else {
                            return `$${Math.round(value).toLocaleString()}`;
                          }
                        })(
                          Object.values(
                            operatorData.totalRestakedAssetsPerStrategy,
                          ).reduce((sum, val) => sum + val, 0) *
                            0.3 *
                            ethPrice,
                        )
                      : '?'}{' '}
                    worth of assets at risk from operator collusion or
                    compromise.
                  </p>
                </div>
              </div>
            </div>

            {/* Right column - Visual Risk Dashboard */}
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-md">
              <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center">
                <SmallStyledIcon
                  icon={<Info className="h-3 w-3" />}
                  gradientColors={['#3b82f6', '#06b6d4']}
                />
                <span className="ml-2">Risk Dashboard</span>
              </h3>

              {/* Governance Risk */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    Governance Risk
                  </span>
                  <span className="text-xs font-semibold py-0.5 px-2 rounded-full bg-red-100 text-red-800">
                    Critical
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-red-500 h-2.5 rounded-full"
                    style={{ width: '90%' }}
                  ></div>
                </div>
              </div>

              {/* Operator Concentration */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    Operator Concentration
                  </span>
                  <span className="text-xs font-semibold py-0.5 px-2 rounded-full bg-orange-100 text-orange-800">
                    High
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-orange-500 h-2.5 rounded-full"
                    style={{
                      width: `${Math.min(operatorData?.concentrationMetrics?.herfindahlIndex ? operatorData.concentrationMetrics.herfindahlIndex * 100 * 3 : 0, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Restaker Concentration */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    Restaker Concentration
                  </span>
                  <span className="text-xs font-semibold py-0.5 px-2 rounded-full bg-yellow-100 text-yellow-800">
                    Moderate
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-yellow-500 h-2.5 rounded-full"
                    style={{
                      width: `${Math.min(restakeData?.concentrationMetrics?.herfindahlIndex ? restakeData.concentrationMetrics.herfindahlIndex * 100 * 3 : 0, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Strategy Concentration */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    Strategy Concentration
                  </span>
                  <span className="text-xs font-semibold py-0.5 px-2 rounded-full bg-red-100 text-red-800">
                    Critical
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-red-500 h-2.5 rounded-full"
                    style={{ width: '85%' }}
                  ></div>
                </div>
              </div>

              {/* Permissionless Participation */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    Permissionless Participation
                  </span>
                  <span className="text-xs font-semibold py-0.5 px-2 rounded-full bg-red-100 text-red-800">
                    Limited
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-red-500 h-2.5 rounded-full"
                    style={{ width: '10%' }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Only 2 out of 19 AVSs allow operators without whitelisting
                </p>
              </div>
            </div>
          </div>

          {/* Bottom section - Strategy breakdown */}
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center">
              <SmallStyledIcon
                icon={<DollarSign className="h-3 w-3" />}
                gradientColors={['#8b5cf6', '#d946ef']}
              />
              <span className="ml-2">Strategy Risk Summary</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Critical Concentration Strategies */}
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-red-800">
                    Critical Concentration
                  </h4>
                  <span className="text-xs font-bold py-0.5 px-2 rounded-full bg-red-100 text-red-800">
                    {operatorData?.strategyConcentrationMetrics
                      ? Object.entries(
                          operatorData.strategyConcentrationMetrics,
                        ).filter(
                          ([_, metrics]) =>
                            (metrics as any).top5HoldersPercentage > 75,
                        ).length
                      : 0}{' '}
                    Strategies
                  </span>
                </div>
                <p className="text-xs text-red-700 mb-2">
                  Top 5 operators control 75%+ of assets in these strategies
                </p>
                <div className="text-sm font-bold text-red-800">
                  {ethPrice > 0 &&
                  operatorData?.totalRestakedAssetsPerStrategy &&
                  operatorData?.strategyConcentrationMetrics
                    ? ((value) => {
                        if (value >= 1_000_000_000) {
                          return `$${(value / 1_000_000_000).toFixed(1)}B+`;
                        } else if (value >= 1_000_000) {
                          return `$${(value / 1_000_000).toFixed(1)}M+`;
                        } else {
                          return `$${Math.round(value).toLocaleString()}`;
                        }
                      })(
                        Object.entries(
                          operatorData.strategyConcentrationMetrics,
                        )
                          .filter(
                            ([key, metrics]) =>
                              (metrics as any).top5HoldersPercentage > 75,
                          )
                          .reduce(
                            (sum: number, [key, _]) =>
                              sum +
                              (operatorData.totalRestakedAssetsPerStrategy?.[
                                key
                              ] || 0),
                            0,
                          ) * ethPrice,
                      )
                    : 'N/A'}{' '}
                  at risk
                </div>
              </div>

              {/* Moderate Concentration Strategies */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-yellow-800">
                    Moderate Concentration
                  </h4>
                  <span className="text-xs font-bold py-0.5 px-2 rounded-full bg-yellow-100 text-yellow-800">
                    {operatorData?.strategyConcentrationMetrics
                      ? Object.entries(
                          operatorData.strategyConcentrationMetrics,
                        ).filter(
                          ([_, metrics]) =>
                            (metrics as any).top5HoldersPercentage <= 75 &&
                            (metrics as any).top5HoldersPercentage > 50,
                        ).length
                      : 0}{' '}
                    Strategies
                  </span>
                </div>
                <p className="text-xs text-yellow-700 mb-2">
                  Top 5 operators control 50-75% of assets in these strategies
                </p>
                <div className="text-sm font-bold text-yellow-800">
                  {ethPrice > 0 &&
                  operatorData?.totalRestakedAssetsPerStrategy &&
                  operatorData?.strategyConcentrationMetrics
                    ? ((value) => {
                        if (value >= 1_000_000_000) {
                          return `$${(value / 1_000_000_000).toFixed(1)}B+`;
                        } else if (value >= 1_000_000) {
                          return `$${(value / 1_000_000).toFixed(1)}M+`;
                        } else {
                          return `$${Math.round(value).toLocaleString()}`;
                        }
                      })(
                        Object.entries(
                          operatorData.strategyConcentrationMetrics,
                        )
                          .filter(
                            ([key, metrics]) =>
                              (metrics as any).top5HoldersPercentage <= 75 &&
                              (metrics as any).top5HoldersPercentage > 50,
                          )
                          .reduce(
                            (sum: number, [key, _]) =>
                              sum +
                              (operatorData.totalRestakedAssetsPerStrategy?.[
                                key
                              ] || 0),
                            0,
                          ) * ethPrice,
                      )
                    : 'N/A'}{' '}
                  managed
                </div>
              </div>

              {/* Healthy Distribution Strategies */}
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-green-800">
                    Healthy Distribution
                  </h4>
                  <span className="text-xs font-bold py-0.5 px-2 rounded-full bg-green-100 text-green-800">
                    {operatorData?.strategyConcentrationMetrics
                      ? Object.entries(
                          operatorData.strategyConcentrationMetrics,
                        ).filter(
                          ([_, metrics]) =>
                            (metrics as any).top5HoldersPercentage <= 50,
                        ).length
                      : 0}{' '}
                    Strategies
                  </span>
                </div>
                <p className="text-xs text-green-700 mb-2">
                  Top 5 operators control less than 50% of assets in these
                  strategies
                </p>
                <div className="text-sm font-bold text-green-800">
                  {ethPrice > 0 &&
                  operatorData?.totalRestakedAssetsPerStrategy &&
                  operatorData?.strategyConcentrationMetrics
                    ? ((value) => {
                        if (value >= 1_000_000_000) {
                          return `$${(value / 1_000_000_000).toFixed(1)}B+`;
                        } else if (value >= 1_000_000) {
                          return `$${(value / 1_000_000).toFixed(1)}M+`;
                        } else {
                          return `$${Math.round(value).toLocaleString()}`;
                        }
                      })(
                        Object.entries(
                          operatorData.strategyConcentrationMetrics,
                        )
                          .filter(
                            ([key, metrics]) =>
                              (metrics as any).top5HoldersPercentage <= 50,
                          )
                          .reduce(
                            (sum: number, [key, _]) =>
                              sum +
                              (operatorData.totalRestakedAssetsPerStrategy?.[
                                key
                              ] || 0),
                            0,
                          ) * ethPrice,
                      )
                    : 'N/A'}{' '}
                  secured
                </div>
              </div>
            </div>
          </div>

          {/* Call to action */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-blue-800 mb-1">
                Want to help improve EigenLayer's risk profile?
              </h3>
              <p className="text-xs text-blue-600">
                Stake with smaller operators or become an operator yourself to
                increase network decentralization.
              </p>
            </div>
            <a
              href="https://docs.eigenlayer.xyz/overview/readme"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              Learn More <ExternalLink className="ml-1 h-3 w-3" />
            </a>
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

            {/* Whale Concentration Risk - New Section */}
            <ExpandableSection
              title="Whale Concentration Risk"
              severity="critical"
              defaultOpen={false}
            >
              <RiskIndicator
                level="critical"
                title="Significant Whale Dominance"
                description={
                  <p>
                    Just 20 whale addresses control{' '}
                    {restakeData?.stakerData && (
                      <strong>
                        {(
                          restakeData.stakerData
                            .slice(0, 20)
                            .reduce(
                              (sum: number, staker: any) =>
                                sum +
                                (staker['ETH Equivalent Value'] || 0) *
                                  ethPrice,
                              0,
                            ) * 100
                        ).toFixed(1)}
                        %
                      </strong>
                    )}{' '}
                    of all restaked assets. This extreme concentration places
                    outsized influence in the hands of very few entities.
                  </p>
                }
              />
              <RiskIndicator
                level="critical"
                title="Unknown Entity Control"
                description={
                  <p>
                    Most of these whale addresses have not been publicly
                    identified. They could represent exchanges, institutional
                    investors, or protocol treasuries, but this opacity creates
                    uncertainty about their potential influence and intentions.
                  </p>
                }
              />
              <RiskIndicator
                level="warning"
                title="Coordinated Action Risk"
                description={
                  <p>
                    If the top 5 whales coordinated their actions, they could
                    control{' '}
                    {restakeData?.stakerData && (
                      <strong>
                        {(
                          restakeData.stakerData
                            .slice(0, 5)
                            .reduce(
                              (sum: number, staker: any) =>
                                sum +
                                (staker['ETH Equivalent Value'] || 0) *
                                  ethPrice,
                              0,
                            ) * 100
                        ).toFixed(1)}
                        %
                      </strong>
                    )}{' '}
                    of all restaked assets, giving them significant potential to
                    influence governance or protocol decisions.
                  </p>
                }
              />
              <RiskIndicator
                level="warning"
                title="Liquidity Risk from Whale Movement"
                description={
                  <p>
                    Large withdrawals by even a few whale addresses could cause
                    significant liquidity shocks and market volatility. The top
                    whale alone controls{' '}
                    {restakeData?.stakerData && restakeData.stakerData[0] && (
                      <strong>
                        {(
                          (restakeData.stakerData[0]['Market Share'] || 0) * 100
                        ).toFixed(2)}
                        %
                      </strong>
                    )}{' '}
                    of all restaked assets.
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

            {/* Strategy Concentration Risk */}
            {operatorData?.strategyConcentrationMetrics && (
              <ExpandableSection
                title="Strategy Concentration Risk"
                severity="critical"
                defaultOpen={false}
              >
                <RiskIndicator
                  level="critical"
                  title="Highly Concentrated Strategies"
                  description={
                    <p>
                      {
                        Object.entries(
                          operatorData.strategyConcentrationMetrics,
                        ).filter(
                          ([_, metrics]) =>
                            (metrics as any).top5HoldersPercentage > 75,
                        ).length
                      }{' '}
                      strategies have critical concentration where the top 5
                      operators control more than 75% of assets, creating
                      significant systemic risk.
                    </p>
                  }
                />

                <RiskIndicator
                  level="critical"
                  title="Significant Assets in High-Risk Strategies"
                  description={
                    <p>
                      {ethPrice > 0 &&
                      operatorData.totalRestakedAssetsPerStrategy
                        ? ((value) => {
                            if (value >= 1_000_000_000) {
                              return `$${(value / 1_000_000_000).toFixed(1)}B+`;
                            } else if (value >= 1_000_000) {
                              return `$${(value / 1_000_000).toFixed(1)}M+`;
                            } else {
                              return `$${Math.round(value).toLocaleString()}`;
                            }
                          })(
                            Object.entries(
                              operatorData.strategyConcentrationMetrics,
                            )
                              .filter(
                                ([key, metrics]) =>
                                  (metrics as any).top5HoldersPercentage > 75,
                              )
                              .reduce(
                                (sum: number, [key, _]) =>
                                  sum +
                                  (operatorData
                                    .totalRestakedAssetsPerStrategy?.[key] ||
                                    0),
                                0,
                              ) * ethPrice,
                          )
                        : ''}{' '}
                      worth of assets are currently in strategies with extreme
                      operator concentration, where failure of a few key
                      operators could lead to cascading effects.
                    </p>
                  }
                />

                <RiskIndicator
                  level="warning"
                  title="Moderate Concentration in Popular Strategies"
                  description={
                    <p>
                      Several popular strategies, including{' '}
                      {Object.entries(operatorData.strategyConcentrationMetrics)
                        .filter(
                          ([key, metrics]) =>
                            (metrics as any).top5HoldersPercentage > 50 &&
                            (metrics as any).top5HoldersPercentage <= 75 &&
                            (operatorData.totalRestakedAssetsPerStrategy?.[
                              key
                            ] || 0) > 10000,
                        ) // Significant size
                        .map(([key, _]) => key.replace(/_/g, ' '))
                        .slice(0, 2) // Take up to 2 examples
                        .join(' and ')}
                      , have moderate concentration with top 5 operators
                      controlling between 50-75% of assets.
                    </p>
                  }
                />

                <RiskIndicator
                  level="positive"
                  title="Well-Distributed Major Strategies"
                  description={
                    <p>
                      {
                        Object.entries(
                          operatorData.strategyConcentrationMetrics,
                        ).filter(
                          ([key, metrics]) =>
                            (metrics as any).top5HoldersPercentage <= 50 &&
                            (operatorData.totalRestakedAssetsPerStrategy?.[
                              key
                            ] || 0) > 50000,
                        ).length // Very significant size
                      }{' '}
                      major strategies (with {'>'}50,000 ETH in assets) have
                      healthy distribution with top 5 operators controlling less
                      than 50% of assets.
                    </p>
                  }
                />
              </ExpandableSection>
            )}
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

    const formattedThresholdPoints: Record<
      number,
      { entities: number; position: number }
    > = {};

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
        if (
          !formattedThresholdPoints[threshold] &&
          cumulativeStake >= threshold
        ) {
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
              <span className="font-medium">
                Cumulative Restake (ETH value):
              </span>{' '}
              <span className="text-gray-900">
                {data.cumulativeStake.toFixed(2)}%
              </span>
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">
                Individual Restake (ETH value):
              </span>{' '}
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
                content={`Only ${top33PercentCount} {entityType} control one-third of all restaked ETH, indicating high concentration.`}
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
                The chart shows how assets (converted to ETH value) are
                distributed among {entityType}, from largest to smallest.
              </span>
            </li>
            <li className="flex items-start">
              <div className="shrink-0 text-purple-600 mr-2">📊</div>
              <span>
                The steep initial rise shows that a small number of {entityType}{' '}
                control a large percentage of the total restake.
              </span>
            </li>
            {Object.entries(thresholdPoints).map(
              ([threshold, point]: [string, any]) => (
                <li key={threshold} className="flex items-start">
                  <div className="shrink-0 text-blue-600 mr-2">🔍</div>
                  <span>
                    <strong>{threshold}%</strong> of total restake is controlled
                    by just <strong>{point.position}</strong> {entityType} (
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
            This chart shows how assets (converted to ETH value) are distributed
            among{' '}
            {entityType === 'operators'
              ? 'individual operator nodes'
              : entityType}
            , ordered from largest to smallest. Unlike the Professional Operator
            Dominance chart, this visualization considers each operator node
            separately, even if multiple nodes are managed by the same
            professional operator group. The steep rise at the beginning
            indicates that a small number of{' '}
            {entityType === 'operators' ? 'individual nodes' : entityType}{' '}
            control a large percentage of the total restake. Use the scale
            toggle to switch between linear and logarithmic views - the
            logarithmic view helps visualize the distribution among smaller{' '}
            {entityType}. For details on which professional groups operate
            multiple nodes, visit the Operators tab.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// New component for Strategy visualization
const StrategiesOverview: React.FC<{
  strategiesData: StrategiesData | null;
  ethPrice?: number;
}> = ({ strategiesData, ethPrice = 0 }) => {
  const [useLogScale, setUseLogScale] = useState(false);

  console.log('StrategiesOverview rendering:', {
    hasData: !!strategiesData,
    metricsKeys: strategiesData?.strategyConcentrationMetrics
      ? Object.keys(strategiesData.strategyConcentrationMetrics).length
      : 0,
    assetsKeys: strategiesData?.totalRestakedAssetsPerStrategy
      ? Object.keys(strategiesData.totalRestakedAssetsPerStrategy).length
      : 0,
  });

  if (!strategiesData) return null;

  const { strategyConcentrationMetrics, totalRestakedAssetsPerStrategy } =
    strategiesData;

  // Log all available strategies with their values
  console.log('ALL STRATEGIES DATA:', {
    // List all strategies with their assets
    allStrategiesWithAssets: Object.entries(totalRestakedAssetsPerStrategy)
      .map(([key, value]) => ({
        name: key.replace(/_/g, ' '),
        assets: value,
        hasMetrics: !!strategyConcentrationMetrics[key],
      }))
      .sort((a, b) => b.assets - a.assets),

    // Number of strategies that have concentration metrics
    totalStrategiesWithMetrics: Object.keys(strategyConcentrationMetrics)
      .length,

    // Number of strategies with assets > 0
    totalStrategiesWithAssets: Object.values(
      totalRestakedAssetsPerStrategy,
    ).filter((value) => value > 0).length,

    // Sum of all assets
    totalAssets: Object.values(totalRestakedAssetsPerStrategy).reduce(
      (sum: number, value) => sum + value,
      0,
    ),
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
    .filter((strategy) => totalRestakedAssetsPerStrategy[strategy] > 0)
    .map((strategy) => ({
      name: strategy.replace(/_/g, ' '),
      rawName: strategy,
      assets: totalRestakedAssetsPerStrategy[strategy],
      metrics: strategyConcentrationMetrics[strategy] || null,
    }))
    .sort((a, b) => b.assets - a.assets);

  // Calculate total assets
  const totalAssets = strategiesWithData.reduce(
    (sum: number, strategy) => sum + strategy.assets,
    0,
  );

  // Prepare treemap data
  const treeMapData = strategiesWithData
    .map((strategy, index) => {
      // Only skip strategies with zero assets
      if (strategy.assets <= 0) return null;

      return {
        name: strategy.name,
        value: strategy.assets,
        percentage: ((strategy.assets / totalAssets) * 100).toFixed(4),
        fill: strategyColors[index % strategyColors.length],
      };
    })
    .filter(Boolean);

  // Get top 5 strategies for detailed cards
  const topStrategies = strategiesWithData.slice(0, 10);

  // Log strategies being displayed in different sections
  console.log('STRATEGIES BEING DISPLAYED:', {
    // Strategies in treemap (all with assets > 0)
    treemapStrategies: treeMapData.map((item) => item?.name),
    treemapCount: treeMapData.length,

    // Strategies in table (top 25)
    tableStrategies: strategiesWithData.slice(0, 25).map((s) => s.name),
    tableCount: Math.min(25, strategiesWithData.length),

    // Strategies in expandable cards (top 10)
    cardStrategies: topStrategies.map((s) => s.name),
    cardCount: topStrategies.length,

    // Strategies with zero assets (filtered out)
    strategiesWithZeroAssets: Object.entries(totalRestakedAssetsPerStrategy)
      .filter(([_, value]) => value <= 0)
      .map(([key, _]) => key.replace(/_/g, ' ')),

    // Total number of strategies with assets > 0
    totalStrategiesCount: strategiesWithData.length,
  });

  // Function to determine risk level based on concentration metrics
  const getConcentrationRiskLevel = (
    metrics: StrategyMetrics | null,
  ): 'critical' | 'warning' | 'positive' | 'neutral' => {
    if (!metrics) return 'neutral';

    if (metrics.top5HoldersPercentage > 75 || metrics.herfindahlIndex > 0.25) {
      return 'critical';
    } else if (
      metrics.top5HoldersPercentage > 50 ||
      metrics.herfindahlIndex > 0.15
    ) {
      return 'warning';
    } else {
      return 'positive';
    }
  };

  // Calculate high risk strategies total value
  const highRiskStrategies = strategiesWithData.filter(
    (s) => s.metrics?.top5HoldersPercentage > 75,
  );
  const highRiskETHValue = highRiskStrategies.reduce(
    (sum: number, s) => sum + s.assets,
    0,
  );
  const highRiskUSDValue = ethPrice > 0 ? highRiskETHValue * ethPrice : 0;
  const highRiskPercentage = ((highRiskETHValue / totalAssets) * 100).toFixed(
    1,
  );

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
            {formattedHighRiskUSD} Restaked in Strategies Where Top 5 Operators
            Control 75%+
          </h2>
          <p className="text-sm text-gray-600">
            Distribution of assets across different strategies on EigenLayer,
            with concentration risk metrics
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-gray-200 p-4 mb-4 bg-gray-50">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Key Insights:
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <div className="shrink-0 text-blue-600 mr-2">📊</div>
                <span>
                  BeaconChain ETH (
                  {(
                    ((totalRestakedAssetsPerStrategy['BeaconChain_ETH'] || 0) /
                      totalAssets) *
                    100
                  ).toFixed(1)}
                  %) and Lido (
                  {(
                    ((totalRestakedAssetsPerStrategy['Lido'] || 0) /
                      totalAssets) *
                    100
                  ).toFixed(1)}
                  %) are the most widely used strategies, accounting for{' '}
                  {(
                    (((totalRestakedAssetsPerStrategy['BeaconChain_ETH'] || 0) +
                      (totalRestakedAssetsPerStrategy['Lido'] || 0)) /
                      totalAssets) *
                    100
                  ).toFixed(1)}
                  % of all restaked assets.
                </span>
              </li>
              <li className="flex items-start">
                <div className="shrink-0 text-red-600 mr-2">⚠️</div>
                <span>
                  {highRiskStrategies.length} out of {strategiesWithData.length}{' '}
                  strategies show critical concentration risk, with top 5
                  operators controlling over 75% of the strategy's assets. These
                  high-risk strategies account for{' '}
                  {highRiskETHValue.toLocaleString()} ETH
                  {highRiskUSDValue > 0
                    ? ` (${formattedHighRiskUSD} USD) `
                    : ' '}
                  ({highRiskPercentage}% of all restaked assets).
                </span>
              </li>
              <li className="flex items-start">
                <div className="shrink-0 text-orange-600 mr-2">🔍</div>
                <span>
                  Smaller strategies tend to have higher concentration risks,
                  with fewer operators participating and higher inequality
                  metrics.
                </span>
              </li>
              <li className="flex items-start">
                <div className="shrink-0 text-purple-600 mr-2">ℹ️</div>
                <span>
                  <strong>Note:</strong> All metrics shown here reflect the
                  distribution of assets among operators, not restakers. This
                  provides insights into operator-level concentration within
                  each strategy.
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
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                />
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
                      fill: '#666',
                    },
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
                      const percentage = (
                        (strategy.assets / totalAssets) *
                        100
                      ).toFixed(4);
                      return (
                        <div className="bg-white p-3 shadow-lg rounded border border-purple-200">
                          <p className="font-semibold text-black text-base">
                            {strategy.name}
                          </p>
                          <div className="space-y-1 mt-2">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Total Assets:</span>{' '}
                              <span className="text-gray-900">
                                {strategy.assets.toLocaleString()} ETH
                              </span>
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">
                                Network Share:
                              </span>{' '}
                              <span className="text-gray-900">
                                {percentage}%
                              </span>
                            </p>
                            {metrics && (
                              <>
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">
                                    Total Operators:
                                  </span>{' '}
                                  <span className="text-gray-900">
                                    {metrics.totalEntities}
                                  </span>
                                </p>
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">
                                    Top 5 Operators Control:
                                  </span>{' '}
                                  <span
                                    className={
                                      metrics.top5HoldersPercentage > 75
                                        ? 'text-red-600 font-bold'
                                        : 'text-gray-900'
                                    }
                                  >
                                    {metrics.top5HoldersPercentage.toFixed(1)}%
                                  </span>
                                </p>
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">
                                    Concentration Index:
                                  </span>{' '}
                                  <span
                                    className={
                                      metrics.herfindahlIndex > 0.25
                                        ? 'text-red-600 font-bold'
                                        : 'text-gray-900'
                                    }
                                  >
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
                console.log(
                  `Switched to ${!useLogScale ? 'logarithmic' : 'linear'} scale`,
                );
              }}
            >
              {useLogScale ? 'Linear Scale' : 'Log Scale'}
            </button>
          </div>

          <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              How to interpret this visualization:
            </h4>
            <p className="text-sm text-gray-600">
              This chart shows all strategies in EigenLayer by total ETH value.
              Each bar represents a strategy, with longer bars indicating more
              widely used strategies. Data is based on operator distribution,
              not restaker distribution. Hover over any bar to see detailed
              statistics about each strategy, including operator concentration
              metrics. Strategies with high concentration have their top 5
              operators controlling a significant percentage of assets, creating
              potential risks.
              {useLogScale && (
                <p className="mt-2 text-sm text-purple-700 bg-purple-50 p-2 rounded">
                  <strong>Log Scale Active:</strong> This view compresses the
                  scale to better visualize both large and small strategies. The
                  difference between very large strategies (millions of ETH) and
                  very small ones (less than 1 ETH) becomes more visible.
                </p>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Top Strategies Detailed Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {topStrategies.map((strategy, index) => {
          const riskLevel = getConcentrationRiskLevel(strategy.metrics);
          const riskBadge = getRiskBadge(riskLevel);

          // Get color for the border based on risk level
          const borderColor =
            riskLevel === 'critical'
              ? 'border-red-400'
              : riskLevel === 'warning'
                ? 'border-yellow-400'
                : 'border-green-400';

          return (
            <div
              key={index}
              className={`bg-white rounded-lg shadow-sm border-l-4 ${borderColor} border border-gray-200 p-3 hover:shadow-md transition-all`}
            >
              <div className="mb-2 border-b border-gray-100 pb-2">
                <div className="flex justify-between items-center">
                  <h3
                    className="text-sm font-bold text-gray-800 truncate"
                    title={strategy.name}
                  >
                    {strategy.name}
                  </h3>
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded-full text-xs font-medium ${riskBadge.color}`}
                  >
                    {riskBadge.label}
                  </span>
                </div>
                <div className="text-right mt-1">
                  <p className="text-base font-bold">
                    {strategy.assets.toLocaleString()} ETH
                  </p>
                  {ethPrice > 0 && (
                    <p className="text-xs text-gray-500">
                      {formatUSDValue(strategy.assets * ethPrice)}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="text-gray-600">Operators:</div>
                <div className="text-right font-semibold">
                  {strategy.metrics?.totalEntities || 'N/A'}
                </div>

                <div className="text-gray-600">Top 5:</div>
                <div
                  className={`text-right font-semibold ${strategy.metrics?.top5HoldersPercentage > 75 ? 'text-red-600' : ''}`}
                >
                  {strategy.metrics?.top5HoldersPercentage.toFixed(1) || 'N/A'}%
                </div>

                <div className="text-gray-600">HHI:</div>
                <div
                  className={`text-right font-semibold ${strategy.metrics?.herfindahlIndex > 0.25 ? 'text-red-600' : ''}`}
                >
                  {strategy.metrics?.herfindahlIndex.toFixed(4) || 'N/A'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

// Copyable address component
const CopyableAddress: React.FC<{ address: string }> = ({ address }) => {
  const [copied, setCopied] = useState(false);

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center">
      <span className="font-mono">
        {address.substring(0, 8)}...{address.substring(address.length - 6)}
      </span>
      <button
        onClick={() => copyAddress(address)}
        className="ml-2 text-gray-400 hover:text-gray-600"
        title="Copy full address"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
    </div>
  );
};

// Add this component definition before the Overview component
const CopyToClipboardButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copyToClipboard}
      className="ml-2 text-gray-400 hover:text-gray-600"
      title="Copy full address"
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );
};

const Overview: React.FC<OverviewProps> = ({ restakeData }) => {
  const [operatorData, setOperatorData] = useState<OperatorDataResponse | null>(
    null,
  );

  // Add state for strategies data
  const [strategiesData, setStrategiesData] = useState<StrategiesData | null>(
    null,
  );
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
          strategyMetricsKeys: data?.strategyConcentrationMetrics
            ? Object.keys(data.strategyConcentrationMetrics)
            : [],
          assetsPerStrategyExists: !!data?.totalRestakedAssetsPerStrategy,
          assetsPerStrategyType: typeof data?.totalRestakedAssetsPerStrategy,
          assetsPerStrategyKeys: data?.totalRestakedAssetsPerStrategy
            ? Object.keys(data.totalRestakedAssetsPerStrategy)
            : [],
        });

        // Use strategy data from operatorData instead of restakeData
        if (
          data?.strategyConcentrationMetrics &&
          data?.totalRestakedAssetsPerStrategy
        ) {
          console.log('Setting strategies data from operator API');

          // Use the metrics data directly, no transformation needed
          const transformedMetrics: Record<string, StrategyMetrics> = {};

          Object.entries(data.strategyConcentrationMetrics).forEach(
            ([key, metrics]) => {
              transformedMetrics[key] = metrics as unknown as StrategyMetrics;
            },
          );

          setStrategiesData({
            strategyConcentrationMetrics: transformedMetrics,
            totalRestakedAssetsPerStrategy: data.totalRestakedAssetsPerStrategy,
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
      metricsCount: strategiesData?.strategyConcentrationMetrics
        ? Object.keys(strategiesData.strategyConcentrationMetrics).length
        : 0,
      assetsCount: strategiesData?.totalRestakedAssetsPerStrategy
        ? Object.keys(strategiesData.totalRestakedAssetsPerStrategy).length
        : 0,
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
  const nodeMonsterShare = nodeMonsterData
    ? nodeMonsterData.total_market_share * 100
    : 0;
  const formattedP2PShare = p2pShare.toFixed(1);
  const formattedNodeMonsterShare = nodeMonsterShare.toFixed(1);
  const combinedShare = p2pShare + nodeMonsterShare;
  const formattedCombinedShare = combinedShare.toFixed(1);

  // Calculate USD value of assets in top operators
  const topOperatorsETHValue =
    (operatorData?.totalETHRestaked || 0) * (combinedShare / 100);
  const topOperatorsUSDValue =
    ethPrice > 0 ? topOperatorsETHValue * ethPrice : 0;
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
    totalRestaked >
    majorOperatorData.reduce((acc: number, curr) => acc + curr.value, 0)
  ) {
    const othersAmount =
      totalRestaked -
      majorOperatorData.reduce((acc: number, curr) => acc + curr.value, 0);
    majorOperatorData.push({
      name: 'Others',
      value: Number(othersAmount.toFixed(2)),
      percentage: ((othersAmount / totalRestaked) * 100).toFixed(2),
      fill: purpleColors[majorOperatorData.length % purpleColors.length],
    });
  }

  // --- Critical risk analytics ---
  useEffect(() => {
    if (restakeData?.stakerData && restakeData.stakerData.length > 0) {
      const top20Share = restakeData.stakerData
        .slice(0, 20)
        .reduce(
          (sum: number, staker: any) =>
            sum + parseFloat(staker['Market Share'] || 0) * 100,
          0,
        );

      if (top20Share > 50) {
        trackEvent('critical_risk_detected', {
          risk_type: 'whale_concentration',
          risk_level: 'critical',
          concentration_percentage: top20Share.toFixed(1),
          top_addresses_count: 20,
        });
      }
    }
  }, [restakeData?.stakerData]);

  useEffect(() => {
    if (
      operatorData?.concentrationMetrics?.top33PercentCount !== undefined &&
      operatorData.concentrationMetrics.top33PercentCount <= 5
    ) {
      trackEvent('critical_risk_detected', {
        risk_type: 'operator_concentration',
        risk_level: 'critical',
        operators_controlling_33_percent:
          operatorData.concentrationMetrics.top33PercentCount,
      });
    }
  }, [operatorData?.concentrationMetrics?.top33PercentCount]);

  return (
    <div className="space-y-6">
      {/* <RiskAssessment /> */}
      <EnhancedMetrics restakeData={restakeData} operatorData={operatorData} />
      <CompactNotes />

      {/* Add Strategies Overview component with ethPrice */}
      {strategiesData && (
        <StrategiesOverview
          strategiesData={strategiesData}
          ethPrice={ethPrice}
        />
      )}

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
                {ethPrice > 0 && p2pData && nodeMonsterData
                  ? `${formattedTopOperatorsUSD} Restaked in Top 2 Professional Operators`
                  : `Professional Operator Dominance in EigenLayer`}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                A few professional operator groups control a significant portion
                of the network through multiple individual nodes. This
                visualization shows the relative size of each major operator
                group's assets (converted to ETH value equivalent), with larger
                boxes representing more concentrated control.
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 items-center">
            {p2pData && (
              <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <span>
                  P2P controls {formattedP2PShare}% of total restaked assets
                  (ETH value)
                </span>
                <InfoTooltip content="P2P is the largest professional operator in EigenLayer, managing nodes for multiple projects and clients, highlighting significant concentration risk." />
              </div>
            )}
            {nodeMonsterData && (
              <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <span>
                  Top 2 operator groups control {formattedCombinedShare}% of
                  network assets (in ETH value)
                </span>
                <InfoTooltip content="The combined dominance of P2P and Node Monster represents a significant centralization concern." />
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
                  Professional operator groups dominate EigenLayer, with P2P
                  controlling {formattedP2PShare}% of all restaked assets (ETH
                  value).
                </span>
              </li>
              <li className="flex items-start">
                <div className="shrink-0 text-purple-600 mr-2">📊</div>
                <span>
                  The two largest operator groups (P2P and Node Monster)
                  together control {formattedCombinedShare}% of all network
                  assets (in ETH value).
                </span>
              </li>
              <li className="flex items-start">
                <div className="shrink-0 text-blue-600 mr-2">🔍</div>
                <span>
                  Box size represents the ETH value of all assets held by each
                  professional operator group - larger boxes indicate more
                  concentrated control.
                </span>
              </li>
              <li className="flex items-start">
                <div className="shrink-0 text-orange-600 mr-2">ℹ️</div>
                <span>
                  Note: Professional operators like P2P may operate nodes for
                  multiple companies such as Puffer, Swell, etc. Visit the
                  Operators tab for more detailed breakdown.
                </span>
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
                          <p className="font-semibold text-black text-base">
                            {data.name}
                          </p>
                          <div className="space-y-1 mt-2">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">
                                Total Assets (ETH value):
                              </span>{' '}
                              <span className="text-gray-900">
                                {data.value.toLocaleString()} ETH
                              </span>
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">
                                Network Share:
                              </span>{' '}
                              <span className="text-gray-900">
                                {data.percentage}%
                              </span>
                            </p>
                            {data.name === 'P2P' && (
                              <p className="text-xs text-red-600 mt-1">
                                Largest professional operator - significant
                                concentration risk
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
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              How to interpret this visualization:
            </h4>
            <p className="text-sm text-gray-600">
              Each box represents a professional operator group that may manage
              multiple individual nodes (often for different companies/clients),
              with the size proportional to the ETH value of all their restaked
              assets (including Beacon Chain ETH, stETH, and other assets
              converted to ETH value). Larger boxes indicate more concentrated
              control over the network. The dominance of a few large boxes
              highlights centralization risks in EigenLayer's current state.
              Hover over any box to see detailed statistics about each operator
              group's control over the network.
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

      {/* EigenLayer Whales Component */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-black flex items-center">
                <div className="mr-3">
                  <StyledIcon
                    icon={<Wallet className="h-4 w-4" />}
                    gradientColors={['#3b82f6', '#10b981']}
                    size="h-9 w-9"
                  />
                </div>
                {ethPrice > 0 && restakeData?.stakerData
                  ? `${formatUSDValue(
                      restakeData.stakerData
                        .slice(0, 20)
                        .reduce(
                          (sum: number, staker: any) =>
                            sum +
                            (staker['ETH Equivalent Value'] || 0) * ethPrice,
                          0,
                        ),
                    )} Restaked in Top 20 EigenLayer Whales`
                  : `Top 20 EigenLayer Whales`}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                A small number of individual restakers hold a significant
                portion of the restaked assets in EigenLayer. These "whales" can
                have a considerable impact on the network's security and
                centralization.
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 items-center">
            {restakeData?.stakerData && restakeData.stakerData.length > 0 && (
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <span>
                  Top 20 whales control{' '}
                  {(
                    restakeData.stakerData
                      .slice(0, 20)
                      .reduce(
                        (sum: number, staker: any) =>
                          sum + (staker['Market Share'] || 0),
                        0,
                      ) * 100
                  ).toFixed(1)}
                  % of total restaked assets
                </span>
                <InfoTooltip content="The concentration of assets in a small number of wallets represents a potential centralization risk for EigenLayer." />
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
                  Just 20 wallets hold a substantial percentage of all restaked
                  assets, creating potential centralization concerns.
                </span>
              </li>
              <li className="flex items-start">
                <div className="shrink-0 text-blue-600 mr-2">🔍</div>
                <span>
                  These whale addresses may represent individuals, institutions,
                  or smart contracts.
                </span>
              </li>
            </ul>

            {/* Make the contact info more prominent */}
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-800 font-medium flex items-center">
                <span className="shrink-0 text-blue-600 mr-2">🐋</span>
                Do you know who these whales are? Help us identify them! Contact
                us at{' '}
                <a
                  href="https://t.me/espejelomar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 underline text-blue-600 hover:text-blue-800"
                >
                  @espejelomar on Telegram
                </a>
              </p>
            </div>
          </div>

          {restakeData?.stakerData && restakeData.stakerData.length > 0 && (
            <>
              {/* Replace table with treemap visualization */}
              <ResponsiveContainer width="100%" height={400}>
                <Treemap
                  data={restakeData.stakerData
                    .slice(0, 20)
                    .map((staker: any, index: number) => ({
                      name: `#${index + 1}: ${staker['Staker Address'].substring(0, 6)}...${staker['Staker Address'].substring(staker['Staker Address'].length - 4)}`,
                      value: staker['ETH Equivalent Value'] || 0,
                      fullAddress: staker['Staker Address'],
                      percentage: staker['Market Share']
                        ? (staker['Market Share'] * 100).toFixed(2)
                        : '0.00',
                      strategies: staker['strategies'] || [],
                      // Use the same purple color palette as Professional Operator Dominance
                      fill: purpleColors[index % purpleColors.length],
                    }))}
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
                          <div className="bg-white p-3 shadow-lg rounded border border-purple-200 max-w-md">
                            <p className="font-semibold text-black text-base">
                              Whale Restaker {data.name.split(':')[0]}
                            </p>
                            <div className="space-y-1 mt-2">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Address:</span>{' '}
                                <span className="text-gray-900 font-mono text-xs break-all">
                                  {data.fullAddress}
                                </span>
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">
                                  Total Assets (ETH value):
                                </span>{' '}
                                <span className="text-gray-900">
                                  {new Intl.NumberFormat('en-US').format(
                                    Math.round(data.value),
                                  )}{' '}
                                  ETH{' '}
                                  <span className="text-xs text-gray-500">
                                    (all assets converted to ETH equivalent)
                                  </span>
                                </span>
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">
                                  Network Share:
                                </span>{' '}
                                <span className="text-gray-900">
                                  {data.percentage}%
                                </span>
                              </p>

                              {/* Display strategy information */}
                              {data.strategies &&
                                data.strategies.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-sm font-medium text-gray-700">
                                      Assets Breakdown:
                                    </p>
                                    <div className="mt-1 max-h-40 overflow-y-auto">
                                      <table className="min-w-full divide-y divide-gray-200 text-xs">
                                        <thead className="bg-gray-50">
                                          <tr>
                                            <th className="px-2 py-1 text-left font-medium text-gray-500">
                                              Token
                                            </th>
                                            <th className="px-2 py-1 text-right font-medium text-gray-500">
                                              Amount
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                          {data.strategies.map(
                                            (strategy: any, idx: number) => (
                                              <tr
                                                key={idx}
                                                className={
                                                  idx % 2 === 0
                                                    ? 'bg-white'
                                                    : 'bg-gray-50'
                                                }
                                              >
                                                <td className="px-2 py-1 whitespace-nowrap font-medium text-gray-900">
                                                  {strategy.token_name}
                                                  <span className="text-xs text-gray-500 ml-1">
                                                    (
                                                    {strategy.strategy_name.replace(
                                                      /_/g,
                                                      ' ',
                                                    )}
                                                    )
                                                  </span>
                                                </td>
                                                <td className="px-2 py-1 whitespace-nowrap text-right text-gray-900">
                                                  {new Intl.NumberFormat(
                                                    'en-US',
                                                    {
                                                      maximumFractionDigits: 2,
                                                    },
                                                  ).format(
                                                    strategy.token_amount,
                                                  )}
                                                </td>
                                              </tr>
                                            ),
                                          )}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
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

              {/* Enhanced table showing top 6 whales with strategy info */}
              <div className="mt-6 overflow-x-auto">
                <h4 className="text-sm font-bold text-gray-700 mb-2">
                  Details of Top 6 Whales
                </h4>
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Rank
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Address
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        ETH Value
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Market Share
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Strategies
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {restakeData.stakerData
                      .slice(0, 6)
                      .map((staker: any, index: number) => (
                        <tr
                          key={staker['Staker Address']}
                          className={
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }
                        >
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div
                                className="flex items-center justify-center rounded-full h-6 w-6 mr-2 flex-shrink-0"
                                style={{
                                  background:
                                    purpleColors[index % purpleColors.length],
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                }}
                              >
                                <span className="text-white text-xs font-bold">
                                  #{index + 1}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <CopyableAddress
                              address={staker['Staker Address']}
                            />
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap font-medium">
                            {new Intl.NumberFormat('en-US', {
                              notation: 'compact',
                              compactDisplay: 'short',
                              minimumFractionDigits: 1,
                              maximumFractionDigits: 2,
                            }).format(staker['ETH Equivalent Value'] || 0)}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap font-medium">
                            {((staker['Market Share'] || 0) * 100).toFixed(2)}%
                          </td>
                          <td className="px-3 py-3">
                            {staker['strategies'] &&
                            staker['strategies'].length > 0 ? (
                              <div className="max-h-20 overflow-y-auto pr-2">
                                <div className="space-y-1">
                                  {staker['strategies']
                                    .slice(0, 3)
                                    .map((strategy: any, idx: number) => (
                                      <div
                                        key={idx}
                                        className="flex justify-between text-xs"
                                      >
                                        <span className="text-gray-700 mr-2">
                                          {strategy.token_name}
                                          <span className="text-gray-500 ml-1">
                                            (
                                            {strategy.strategy_name.replace(
                                              /_/g,
                                              ' ',
                                            )}
                                            )
                                          </span>
                                        </span>
                                        <span className="text-gray-900 font-medium">
                                          {new Intl.NumberFormat('en-US', {
                                            maximumFractionDigits: 1,
                                          }).format(strategy.token_amount)}
                                        </span>
                                      </div>
                                    ))}
                                  {staker['strategies'].length > 3 && (
                                    <div className="text-xs text-blue-600">
                                      + {staker['strategies'].length - 3} more
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500">
                                No strategies
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  How to interpret this visualization:
                </h4>
                <p className="text-sm text-gray-600">
                  Each box represents an individual restaker ("whale"), with the
                  size proportional to their ETH value staked. Larger boxes
                  indicate restakers with more significant holdings who have
                  outsized influence on the network. Hover over any box to see
                  detailed information about each whale, including their full
                  address and holdings. The ETH value shown represents all
                  assets (including non-ETH assets) converted to their ETH
                  equivalent value.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        {/* Add any additional content you want to display here */}
      </div>
    </div>
  );
};

export default Overview;
