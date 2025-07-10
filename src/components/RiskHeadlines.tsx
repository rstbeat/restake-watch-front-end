'use client';

import React, { useState, useMemo } from 'react';
import { AlertTriangle, Share2, Copy } from 'lucide-react';

// Types for the risk headline data
interface RiskHeadlineData {
  governance: {
    title: string;
    subtitle: string;
    tweet: string;
    severity: 'critical' | 'warning' | 'info';
  };
  concentration: {
    title: string;
    subtitle: string;
    tweet: string;
    severity: 'critical' | 'warning' | 'info';
  };
  whales: {
    title: string;
    subtitle: string;
    tweet: string;
    severity: 'critical' | 'warning' | 'info';
  };
  avs: {
    title: string;
    subtitle: string;
    tweet: string;
    severity: 'critical' | 'warning' | 'info';
  };
}

interface RiskHeadlinesProps {
  operatorData: {
    totalETHRestaked?: number;
    majorOperatorGroupMetrics?: {
      [operatorName: string]: {
        total_eth_restaked: number;
        total_market_share: number;
      };
    };
  } | null;
  restakeData: {
    stakerData?: Array<{
      'Staker Address': string;
      'ETH Equivalent Value'?: number;
      'Market Share': number;
    }>;
  } | null;
  ethPrice: number;
  avsPermissionStats?: {
    permissionedPercentage: number;
    permissionedCount: number;
    totalCount: number;
  } | null;
}

const RiskHeadlines: React.FC<RiskHeadlinesProps> = ({
  operatorData,
  restakeData,
  ethPrice,
  avsPermissionStats,
}) => {
  const [copiedTweet, setCopiedTweet] = useState<string | null>(null);

  // Calculate dynamic values
  const riskData = useMemo((): RiskHeadlineData => {
    // Calculate total TVL in USD
    const totalETH = operatorData?.totalETHRestaked || 0;
    const totalUSD = totalETH * ethPrice;
    const formattedTVL = totalUSD >= 1_000_000_000 
      ? `$${(totalUSD / 1_000_000_000).toFixed(1)}B`
      : `$${(totalUSD / 1_000_000).toFixed(0)}M`;

    // Get P2P market share
    const findOperatorData = (operatorName: string) => {
      if (!operatorData?.majorOperatorGroupMetrics) return null;

      // Try different possible key formats
      const possibleKeys = [
        operatorName.toLowerCase(), // 'p2p'
        operatorName.toUpperCase(), // 'P2P'
        operatorName.replace(' ', '_').toLowerCase(), // 'p2p'
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

    const p2pData = findOperatorData('p2p');
    const p2pShare = p2pData ? (p2pData.total_market_share * 100).toFixed(1) : '15.8';

    // Calculate top 20 wallet concentration
    const stakerData = restakeData?.stakerData || [];
    const sortedStakers = [...stakerData].sort((a, b) => (b['ETH Equivalent Value'] || 0) - (a['ETH Equivalent Value'] || 0));
    const top20Stakers = sortedStakers.slice(0, 20);
    const top20Share = top20Stakers.reduce((sum, staker) => sum + (staker['Market Share'] || 0), 0);
    const whalePercentage = (top20Share * 100).toFixed(0);

    // AVS permissioning stats
    const avsGatekeptPercentage = avsPermissionStats?.permissionedPercentage?.toFixed(0) || '89';
    const avsGatekeptCount = avsPermissionStats?.permissionedCount || 17;
    const totalAvsCount = avsPermissionStats?.totalCount || 19;

    return {
      governance: {
        title: `${formattedTVL} Controlled by 9 People`,
        subtitle: "Zero timelock = Instant rug possible",
        tweet: `🚨 @eigenlayer has ${formattedTVL} controlled by just 9 people with NO timelock. That's $${((totalUSD / 1_000_000_000) / 9).toFixed(0)}M per person they could steal instantly.`,
        severity: 'critical'
      },
      concentration: {
        title: `1 Operator = ${p2pShare}% of Network`,
        subtitle: "P2P controls more than healthy limits",
        tweet: `🚨 ONE operator (P2P) controls ${p2pShare}% of @eigenlayer. For context, Ethereum's largest validator has <1%.`,
        severity: 'critical'
      },
      whales: {
        title: `Top 20 Wallets = ${whalePercentage}% of TVL`,
        subtitle: "Unknown whales dominate the ecosystem",
        tweet: `🐋 Just 20 addresses control ${whalePercentage}% of @eigenlayer's TVL. These anonymous whales could coordinate attacks or cause massive dumps.`,
        severity: 'warning'
      },
      avs: {
        title: `${avsGatekeptPercentage}% of AVSs are Gatekept`,
        subtitle: "Permissioned systems dominate",
        tweet: `🚪 ${avsGatekeptPercentage}% of @eigenlayer AVSs require whitelisting. This isn't decentralized - it's a private club.`,
        severity: 'warning'
      }
    };
  }, [operatorData, restakeData, ethPrice, avsPermissionStats]);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTweet(type);
      setTimeout(() => setCopiedTweet(null), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };



  const getSeverityStyles = (severity: 'critical' | 'warning' | 'info') => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          title: 'text-red-900',
          subtitle: 'text-red-700',
          icon: 'text-red-500'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          title: 'text-yellow-900',
          subtitle: 'text-yellow-700',
          icon: 'text-yellow-500'
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          title: 'text-blue-900',
          subtitle: 'text-blue-700',
          icon: 'text-blue-500'
        };
    }
  };

  const renderRiskCard = (key: string, data: RiskHeadlineData[keyof RiskHeadlineData]) => {
    const styles = getSeverityStyles(data.severity);

    return (
      <div 
        key={key} 
        className={`${styles.bg} ${styles.border} border-l-4 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:scale-[1.01]`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <AlertTriangle className={`h-4 w-4 ${styles.icon} shrink-0`} />
            <h3 className={`text-base font-bold ${styles.title} leading-tight`}>
              {data.title}
            </h3>
          </div>
          <button
            onClick={() => copyToClipboard(data.tweet, key)}
            className={`p-1.5 rounded-md ${styles.icon} hover:bg-white/50 transition-colors`}
            title="Copy tweet"
          >
            {copiedTweet === key ? (
              <div className="h-3.5 w-3.5 text-green-600 font-bold">✓</div>
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
        
        <p className={`text-xs ${styles.subtitle} mb-2`}>
          {data.subtitle}
        </p>
        
        <div className="bg-white/60 rounded-md p-2 border border-gray-200/50">
          <div className="flex items-start space-x-1.5">
            <Share2 className={`h-3 w-3 ${styles.icon} shrink-0 mt-0.5`} />
            <p className="text-xs text-gray-700 font-mono leading-relaxed">
              {data.tweet}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center">
          <span className="mr-2">🚨</span>
          Risk Headlines That Demand Attention
        </h2>
        <p className="text-gray-600 text-sm">
          Critical risk metrics with shareable content
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.entries(riskData).map(([key, data]) => 
          renderRiskCard(key, data)
        )}
      </div>

      {copiedTweet && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-3 py-2 rounded-md shadow-lg text-sm">
          Tweet copied to clipboard!
        </div>
      )}
    </div>
  );
};

export default RiskHeadlines; 