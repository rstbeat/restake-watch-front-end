import React, { useState, useEffect, useCallback } from 'react';
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
  Share2,
  AlertCircle,
  CheckCircle,
  Info,
  ExternalLink,
  PieChart,
  FileSpreadsheet,
  DollarSign,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { OperatorDataResponse } from '../app/interface/operatorData.interface';
import { fetchOperatorData, fetchETHPrice } from '../app/api/restake/restake';
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
      operatorName.toLowerCase(),             // 'p2p'
      operatorName.toUpperCase(),             // 'P2P'
      operatorName.replace(' ', '_').toLowerCase(),  // 'node_monster'
      operatorName                            // Exact match
    ];
    
    // Search for any matching key
    for (const key of Object.keys(operatorData.majorOperatorGroupMetrics)) {
      if (possibleKeys.includes(key.toLowerCase()) || key.toLowerCase().includes(operatorName.toLowerCase())) {
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
  const nodeMonsterShare = nodeMonsterData ? nodeMonsterData.total_market_share * 100 : 0;
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
                  <span className="font-bold">Major Operator Risk:</span> Between P2P ({formattedP2PShare}%) and Node Monster ({formattedNodeMonsterShare}%), these two professional operators control <span className="font-bold">{formattedCombinedShare}%</span> of total restaked assets.
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
                level="warning"
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
            </ExpandableSection>

            {/* Restaker Risk */}
            <ExpandableSection
              title="Restaker Concentration Risk"
              severity="warning"
              defaultOpen={false}
            >
              <RiskIndicator
                level="warning"
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
                    Some operators are running
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

  // Color array for different sections (maintained from previous version)
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
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-black flex items-center">
            <div className="mr-3">
              <StyledIcon
                icon={<PieChart className="h-4 w-4" />}
                gradientColors={['#9C27B0', '#d946ef']}
                size="h-9 w-9"
              />
            </div>
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
                          <p className="text-black">{`${data.value.toLocaleString()} ETH`}</p>
                          <p className="text-black">{`${data.percentage}% of total`}</p>
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
