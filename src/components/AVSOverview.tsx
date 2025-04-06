import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Copy,
  Check,
  Search,
  Info,
  ChevronLeft,
  ChevronRight,
  FileDown,
  Network,
  HelpCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { Input } from './ui/input';
import { Card, CardHeader, CardContent } from './ui/card';
import { fetchAVSData, fetchETHPrice } from '../app/api/restake/restake';
import * as Tooltip from '@radix-ui/react-tooltip';
import {
  AVSDataItem,
  AVSDataResponse,
  AVSDataFormatted,
} from '../app/interface/avsData.interface';

// Badge component for color-coded risk levels
const Badge: React.FC<{ color: string; text: string }> = ({ color, text }) => {
  const colorClasses: { [key: string]: string } = {
    red: 'bg-red-500 text-white border-2 border-red-600 shadow-md',
    yellow: 'bg-yellow-500 text-white border-2 border-yellow-600 shadow-md',
    green: 'bg-green-500 text-white border-2 border-green-600 shadow-md',
    blue: 'bg-blue-500 text-white border-2 border-blue-600 shadow-md',
    purple: 'bg-purple-500 text-white border-2 border-purple-600 shadow-md',
    gray: 'bg-gray-100 text-gray-800 border-2 border-gray-300',
  };

  const classes = colorClasses[color] || colorClasses['gray'];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${classes}`}
    >
      {text}
    </span>
  );
};

// InfoTooltip component
const InfoTooltip: React.FC<{ content: string }> = ({ content }) => (
  <Tooltip.Provider>
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <Info className="inline-block ml-2 cursor-help h-4 w-4 text-gray-500" />
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

// StyledIcon component used across overview components
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

interface AVSRelationship {
  avsAddress: string;
  operatorAddress: string;
  strategyAddress: string;
  shares: number;
  ethValue: number;
  usdValue: number;
  statusDate: string;
}

// Add a new interface for AVS aggregated data
interface AVSAggregate {
  avsAddress: string;
  totalETH: number;
  totalUSD: number;
  uniqueOperators: string[];
  uniqueStrategies: string[];
  relationships: AVSRelationship[];
  latestStatusDate: string;
}

// Define the structure for the items in the initial fetched data
interface InitialDataItem {
  avs?: string | null;
  operator?: string | null;
  strategy?: string | null;
  shares?: number | string | null; // Allow string as it might come from API like that initially
  eth?: number | null;
  usd?: number | null;
  status_date?: string | null;
  // Add other potential fields if known, otherwise keep it minimal
}

const AVSOverview: React.FC = () => {
  const [avsData, setAVSData] = useState<AVSDataItem[] | null>(null);
  const [isLoadingAVSData, setIsLoadingAVSData] = useState(false);
  const [sortColumn, setSortColumn] = useState<string>('totalETH');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [ethPrice, setEthPrice] = useState<number>(0);
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});
  const [selectedAVS, setSelectedAVS] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [relationships, setRelationships] = useState<AVSRelationship[]>([]);
  const [avsAggregates, setAvsAggregates] = useState<AVSAggregate[]>([]);

  // Fetch AVS data from the API with fallback logic
  const fetchAVSDataCallback = useCallback(async () => {
    try {
      setIsLoadingAVSData(true);
      console.log('Fetching AVS data...');
      
      // Instead of using full=true, we'll fetch per AVS to get complete data
      // First get a list of all AVS addresses
      let allRelationships: AVSRelationship[] = []; // Explicitly type the array
      
      // First try to get some initial data to find AVS addresses
      const initialUrl = 'https://eigenlayer.restakeapi.com/aoss/?date_start=2025-01-01&date_end=2025-12-31';
      console.log('Fetching initial data to identify AVS addresses:', initialUrl);
      
      const initialResponse = await fetch(initialUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!initialResponse.ok) {
        console.error(`Initial API error: ${initialResponse.status}`);
        throw new Error(`Initial API error: ${initialResponse.status}`);
      }
      
      const initialData = await initialResponse.json();
      
      if (!initialData || !initialData.data || !Array.isArray(initialData.data)) {
        console.error('Invalid API response format from initial request');
        throw new Error('Invalid API response format');
      }
      
      console.log(`Initial API returned ${initialData.data.length} records`);
      
      // Extract unique AVS addresses
      const avsSet = new Set<string>(); // Specify Set type
      initialData.data.forEach((item: InitialDataItem) => { // Add type annotation here
        if (item && item.avs && typeof item.avs === 'string') {
          avsSet.add(item.avs);
        }
      });
      
      const avsAddresses = Array.from(avsSet); // Type inferred as string[]
      console.log(`Found ${avsAddresses.length} unique AVS addresses`);
      
      // Process the initial data
      const initialTransformedData = initialData.data // Keep type inference for map result
        .filter((item: InitialDataItem) => item && item.avs && item.operator && item.strategy) 
        .map((item: InitialDataItem) => ({ // Keep type inference for map result
          avsAddress: item.avs!, 
          operatorAddress: item.operator!, 
          strategyAddress: item.strategy!, 
          shares: typeof item.shares === 'number' ? item.shares : 0,
          ethValue: typeof item.eth === 'number' ? item.eth : 0,
          usdValue: typeof item.usd === 'number' ? item.usd : 0,
          statusDate: item.status_date || 'Unknown'
        }));
      
      allRelationships = [...initialTransformedData]; // Assign correctly typed data
      console.log(`Transformed ${initialTransformedData.length} initial relationships`);
      
      // Now fetch data for each AVS separately to get complete data
      if (avsAddresses.length > 0) {
        console.log(`Fetching data for each of the ${avsAddresses.length} AVS addresses...`);
        
        // For each AVS, fetch its relationships
        for (let i = 0; i < avsAddresses.length; i++) {
          const avsAddress = avsAddresses[i];
          console.log(`Fetching data for AVS ${i+1}/${avsAddresses.length}: ${avsAddress}`);
          
          const avsUrl = `https://eigenlayer.restakeapi.com/aoss/?avs=${avsAddress}`;
          
          try {
            const avsResponse = await fetch(avsUrl, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            });
            
            if (!avsResponse.ok) {
              console.warn(`Error fetching AVS ${avsAddress}: ${avsResponse.status}`);
              continue;
            }
            
            const avsData = await avsResponse.json();
            
            if (!avsData || !avsData.data || !Array.isArray(avsData.data)) {
              console.warn(`Invalid response for AVS ${avsAddress}`);
              continue;
            }
            
            console.log(`Received ${avsData.data.length} relationships for AVS ${avsAddress}`);
            
            // Transform this AVS's data
            const avsTransformedData = avsData.data // Keep type inference for map result
              .filter((item: InitialDataItem) => item && item.avs && item.operator && item.strategy) 
              .map((item: InitialDataItem) => ({ // Keep type inference for map result
                avsAddress: item.avs!, 
                operatorAddress: item.operator!, 
                strategyAddress: item.strategy!, 
                shares: typeof item.shares === 'number' ? item.shares : 0,
                ethValue: typeof item.eth === 'number' ? item.eth : 0,
                usdValue: typeof item.usd === 'number' ? item.usd : 0,
                statusDate: item.status_date || 'Unknown'
              }));
            
            // Add to our collection, avoiding duplicates
            const existingIds = new Set(allRelationships.map(r => 
              `${r.avsAddress}-${r.operatorAddress}-${r.strategyAddress}`
            ));
            
            for (const rel of avsTransformedData) {
              const relId = `${rel.avsAddress}-${rel.operatorAddress}-${rel.strategyAddress}`;
              if (!existingIds.has(relId)) {
                allRelationships.push(rel);
                existingIds.add(relId);
              }
            }
            
          } catch (avsError) {
            console.error(`Error processing AVS ${avsAddress}:`, avsError);
          }
        }
      }
      
      console.log(`Total relationships after fetching all AVS data: ${allRelationships.length}`);
      setRelationships(allRelationships);
      
      // Aggregate data by AVS
      console.log('Starting AVS aggregation...');
      const avsMap = new Map<string, AVSAggregate>();
      
      // Get unique AVS addresses for debugging
      const uniqueAVSAddressesFromRelationships = new Set(allRelationships.map(r => r.avsAddress));
      console.log(`Found ${uniqueAVSAddressesFromRelationships.size} unique AVS addresses from relationships`);
      
      // Group by AVS and aggregate data
      let successfulAggregations = 0;
      let failedAggregations = 0;
      
      allRelationships.forEach(rel => {
        try {
          // Ensure rel and its key properties are valid
          if (!rel || typeof rel.avsAddress !== 'string' || !rel.avsAddress) {
            console.warn('Skipping relationship with invalid or missing AVS address:', rel);
            failedAggregations++;
            return;
          }
          
          const avsAddressKey = rel.avsAddress; // Use a clearly typed variable
          const existing = avsMap.get(avsAddressKey);
          
          // Ensure values used for calculations are numbers
          const ethValue = typeof rel.ethValue === 'number' ? rel.ethValue : 0;
          const usdValue = typeof rel.usdValue === 'number' ? rel.usdValue : 0;
          const operatorAddress = typeof rel.operatorAddress === 'string' ? rel.operatorAddress : null;
          const strategyAddress = typeof rel.strategyAddress === 'string' ? rel.strategyAddress : null;
          const statusDate = typeof rel.statusDate === 'string' ? rel.statusDate : 'Unknown';

          if (existing) {
            // Add to existing aggregate
            existing.totalETH += ethValue;
            existing.totalUSD += usdValue;
            
            // Add operator if unique and valid
            if (operatorAddress && !existing.uniqueOperators.includes(operatorAddress)) {
              existing.uniqueOperators.push(operatorAddress);
            }
            
            // Add strategy if unique and valid
            if (strategyAddress && !existing.uniqueStrategies.includes(strategyAddress)) {
              existing.uniqueStrategies.push(strategyAddress);
            }
            
            // Add relationship (ensure rel itself matches AVSRelationship)
            existing.relationships.push({
              ...rel,
              avsAddress: avsAddressKey, // Ensure correct type
              operatorAddress: operatorAddress || 'Unknown', // Handle potential null
              strategyAddress: strategyAddress || 'Unknown', // Handle potential null
              ethValue: ethValue,
              usdValue: usdValue,
              statusDate: statusDate
            });
            
            // Update latest status date if newer
            if (statusDate && statusDate !== 'Unknown') {
              const currentDate = existing.latestStatusDate !== 'Unknown' ? new Date(existing.latestStatusDate) : new Date(0); // Handle 'Unknown'
              const newDate = new Date(statusDate);
              if (newDate > currentDate) {
                existing.latestStatusDate = statusDate;
              }
            }
            successfulAggregations++;
          } else {
            // Create new aggregate - ensure operator/strategy are valid strings
            if (!operatorAddress || !strategyAddress) {
              console.warn('Skipping relationship for new aggregate due to missing operator or strategy:', rel);
              failedAggregations++;
              return;
            }
            
            avsMap.set(avsAddressKey, {
              avsAddress: avsAddressKey, // Use the typed key
              totalETH: ethValue,
              totalUSD: usdValue,
              uniqueOperators: [operatorAddress], // Known to be string here
              uniqueStrategies: [strategyAddress], // Known to be string here
              relationships: [{
                ...rel,
                 avsAddress: avsAddressKey, // Ensure correct type
                 operatorAddress: operatorAddress, // Known to be string
                 strategyAddress: strategyAddress, // Known to be string
                 ethValue: ethValue,
                 usdValue: usdValue,
                 statusDate: statusDate
              }],
              latestStatusDate: statusDate
            });
            successfulAggregations++;
          }
        } catch (error) {
          console.error('Error aggregating relationship:', error, rel);
          failedAggregations++;
        }
      });
      
      // Convert Map to Array
      const avsAggregates = Array.from(avsMap.values()); // Keep TS inference
      console.log(`Created ${avsAggregates.length} AVS aggregates`);
      console.log(`Aggregation stats: ${successfulAggregations} successful, ${failedAggregations} failed`);
      
      setAvsAggregates(avsAggregates); // This should now work if types align
      setAVSData(initialData.data); // Keep original data format for reference
      
    } catch (error) {
      console.error('Error fetching AVS data:', error);
      setAVSData([]);
      setRelationships([]);
      setAvsAggregates([]);
    } finally {
      setIsLoadingAVSData(false);
    }
  }, []);

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

  // Fetch AVS data when component mounts
  useEffect(() => {
    if (!avsData) {
      fetchAVSDataCallback();
    }
  }, [avsData, fetchAVSDataCallback]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedAVS]);

  // Toggle row expansion
  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Copy address to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAddress(text);
      setTimeout(() => setCopiedAddress(null), 2000);
    });
  };

  // Sort data
  const handleSort = (column: string) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  // Truncate Ethereum address
  const truncateAddress = (address: string) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Format USD value with appropriate suffix
  const formatUSDValue = (value: number): string => {
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(1)}B`;
    } else if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    } else {
      return `$${Math.round(value).toLocaleString()}`;
    }
  };

  // Extract unique AVS addresses
  const uniqueAVSs = useMemo(() => {
    if (!relationships.length) return [];
    
    const avsList = Array.from(new Set(relationships.map(r => r.avsAddress)));
    return avsList;
  }, [relationships]);

  // Get value statistics for an AVS
  const getAVSStats = (avsAddress: string) => {
    const avsRelationships = relationships.filter(r => r.avsAddress === avsAddress);
    const totalEth = avsRelationships.reduce((sum, r) => sum + r.ethValue, 0);
    const totalUsd = avsRelationships.reduce((sum, r) => sum + r.usdValue, 0);
    const operatorCount = new Set(avsRelationships.map(r => r.operatorAddress)).size;
    const strategyCount = new Set(avsRelationships.map(r => r.strategyAddress)).size;
    
    return { totalEth, totalUsd, operatorCount, strategyCount };
  };

  // Get total ETH and USD values
  const totalValues = useMemo(() => {
    if (!relationships.length) return { eth: 0, usd: 0 };
    
    const totalEth = relationships.reduce((sum, r) => sum + r.ethValue, 0);
    const totalUsd = relationships.reduce((sum, r) => sum + r.usdValue, 0);
    
    return { eth: totalEth, usd: totalUsd };
  }, [relationships]);

  // Sort and filter relationships
  const filteredAndSortedData = useMemo(() => {
    if (!relationships.length) return [];
    
    return [...relationships]
      .filter(rel => {
        const matchesSearch = 
          rel.avsAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rel.operatorAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rel.strategyAddress.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesSelectedAVS = !selectedAVS || rel.avsAddress === selectedAVS;
        
        return matchesSearch && matchesSelectedAVS;
      })
      .sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        return sortDirection === 'asc' 
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });
  }, [relationships, searchTerm, selectedAVS, sortColumn, sortDirection]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedData, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(filteredAndSortedData.length / itemsPerPage);
  }, [filteredAndSortedData, itemsPerPage]);

  // Sort and filter aggregated AVS data
  const filteredAndSortedAVS = useMemo(() => {
    if (!avsAggregates.length) return [];
    
    return [...avsAggregates]
      .filter(avs => {
        return avs.avsAddress.toLowerCase().includes(searchTerm.toLowerCase());
      })
      .sort((a, b) => {
        // Sort by the selected column
        if (sortColumn === 'totalETH') {
          return sortDirection === 'asc' ? a.totalETH - b.totalETH : b.totalETH - a.totalETH;
        }
        if (sortColumn === 'totalUSD') {
          return sortDirection === 'asc' ? a.totalUSD - b.totalUSD : b.totalUSD - a.totalUSD;
        }
        if (sortColumn === 'operatorCount') {
          return sortDirection === 'asc' 
            ? a.uniqueOperators.length - b.uniqueOperators.length 
            : b.uniqueOperators.length - a.uniqueOperators.length;
        }
        if (sortColumn === 'strategyCount') {
          return sortDirection === 'asc' 
            ? a.uniqueStrategies.length - b.uniqueStrategies.length 
            : b.uniqueStrategies.length - a.uniqueStrategies.length;
        }
        if (sortColumn === 'relationshipCount') {
          return sortDirection === 'asc' 
            ? a.relationships.length - b.relationships.length 
            : b.relationships.length - a.relationships.length;
        }
        
        // Default: sort by address
        return sortDirection === 'asc' 
          ? a.avsAddress.localeCompare(b.avsAddress) 
          : b.avsAddress.localeCompare(a.avsAddress);
      });
  }, [avsAggregates, sortColumn, sortDirection, searchTerm]);
  
  // Paginate aggregated AVS data
  const paginatedAVS = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedAVS.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedAVS, currentPage, itemsPerPage]);
  
  // Calculate total pages for AVS pagination
  const totalPagesAVS = useMemo(() => {
    return Math.ceil(filteredAndSortedAVS.length / itemsPerPage);
  }, [filteredAndSortedAVS, itemsPerPage]);
  
  // Get operator analytics for a specific AVS
  const getOperatorAnalytics = (avsAddress: string) => {
    const avs = avsAggregates.find(a => a.avsAddress === avsAddress);
    if (!avs || !avs.relationships || !Array.isArray(avs.relationships)) return [];
    
    // Count value by operator
    const operatorValues: { [key: string]: { eth: number, usd: number, count: number } } = {};
    
    avs.relationships.forEach(rel => {
      if (!rel || !rel.operatorAddress) return;
      
      if (!operatorValues[rel.operatorAddress]) {
        operatorValues[rel.operatorAddress] = { eth: 0, usd: 0, count: 0 };
      }
      operatorValues[rel.operatorAddress].eth += typeof rel.ethValue === 'number' ? rel.ethValue : 0;
      operatorValues[rel.operatorAddress].usd += typeof rel.usdValue === 'number' ? rel.usdValue : 0;
      operatorValues[rel.operatorAddress].count += 1;
    });
    
    // Convert to array and sort by ETH value
    const sortedOperators = Object.entries(operatorValues)
      .map(([address, values]) => ({
        address,
        eth: values.eth,
        usd: values.usd,
        count: values.count
      }))
      .sort((a, b) => b.eth - a.eth);
    
    return sortedOperators;
  };
  
  // Get strategy analytics for a specific AVS
  const getStrategyAnalytics = (avsAddress: string) => {
    const avs = avsAggregates.find(a => a.avsAddress === avsAddress);
    if (!avs || !avs.relationships || !Array.isArray(avs.relationships)) return [];
    
    // Count value by strategy
    const strategyValues: { [key: string]: { eth: number, usd: number, count: number } } = {};
    
    avs.relationships.forEach(rel => {
      if (!rel || !rel.strategyAddress) return;
      
      if (!strategyValues[rel.strategyAddress]) {
        strategyValues[rel.strategyAddress] = { eth: 0, usd: 0, count: 0 };
      }
      strategyValues[rel.strategyAddress].eth += typeof rel.ethValue === 'number' ? rel.ethValue : 0;
      strategyValues[rel.strategyAddress].usd += typeof rel.usdValue === 'number' ? rel.usdValue : 0;
      strategyValues[rel.strategyAddress].count += 1;
    });
    
    // Convert to array and sort by ETH value
    const sortedStrategies = Object.entries(strategyValues)
      .map(([address, values]) => ({
        address,
        eth: values.eth,
        usd: values.usd,
        count: values.count
      }))
      .sort((a, b) => b.eth - a.eth);
    
    return sortedStrategies;
  };

  // Create the sort icon component
  const SortIcon = ({ column }: { column: string }) => {
    if (column !== sortColumn) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortDirection === 'asc' ? (
      <ChevronUp className="ml-2 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-2 h-4 w-4" />
    );
  };

  // Generate unique ID for each relationship
  const getRelationshipId = (rel: AVSRelationship) => {
    return `${rel.avsAddress}-${rel.operatorAddress}-${rel.strategyAddress}`;
  };

  // Render filter controls for AVS view
  const renderFilterControls = () => (
    <div className="mb-6">
      <div className="relative flex-grow mb-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="text"
          placeholder="Search by AVS Address"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="flex flex-wrap gap-3 mb-4 justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAVSDataCallback}
            disabled={isLoadingAVSData}
          >
            {isLoadingAVSData ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Loading...
              </>
            ) : (
              <>Load All AVS</>
            )}
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (!avsAggregates.length) return;
            
            // Define CSV headers and content
            const headers = [
              'AVS Address',
              'Total ETH Value',
              'Total USD Value',
              'Unique Operators',
              'Unique Strategies',
              'Total Relationships',
              'Latest Update'
            ];
            
            const csvContent = [
              headers.join(','),
              ...avsAggregates.map(avs => [
                `"${avs.avsAddress}"`,
                avs.totalETH,
                avs.totalUSD,
                avs.uniqueOperators.length,
                avs.uniqueStrategies.length,
                avs.relationships.length,
                `"${avs.latestStatusDate}"`
              ].join(','))
            ].join('\n');
            
            // Create download link
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', 'avs_summary.csv');
            link.click();
          }}
        >
          <FileDown className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>
    </div>
  );

  // Render the AVS table
  const renderAVSTable = () => (
    <div className="overflow-x-auto max-h-[70vh] border rounded-lg shadow-sm">
      <Table>
        <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
          <TableRow className="border-b-2 border-purple-200">
            <TableHead className="w-[50px] text-center">
              <span className="text-purple-700">#</span>
            </TableHead>
            <TableHead className="w-[50px] text-center">
              <div className="flex justify-center">
                <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded-full">
                  Details
                </span>
              </div>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => {
                  if (sortColumn === 'avsAddress') {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortColumn('avsAddress');
                    setSortDirection('asc');
                  }
                }}
                className="font-semibold"
              >
                AVS Address
                {sortColumn === 'avsAddress' ? (
                  sortDirection === 'asc' ? (
                    <ChevronUp className="ml-2 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-2 h-4 w-4" />
                  )
                ) : (
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                )}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => {
                  if (sortColumn === 'totalETH') {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortColumn('totalETH');
                    setSortDirection('desc');
                  }
                }}
                className="font-semibold"
              >
                Total ETH Value
                {sortColumn === 'totalETH' ? (
                  sortDirection === 'asc' ? (
                    <ChevronUp className="ml-2 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-2 h-4 w-4" />
                  )
                ) : (
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                )}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => {
                  if (sortColumn === 'totalUSD') {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortColumn('totalUSD');
                    setSortDirection('desc');
                  }
                }}
                className="font-semibold"
              >
                Total USD Value
                {sortColumn === 'totalUSD' ? (
                  sortDirection === 'asc' ? (
                    <ChevronUp className="ml-2 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-2 h-4 w-4" />
                  )
                ) : (
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                )}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => {
                  if (sortColumn === 'operatorCount') {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortColumn('operatorCount');
                    setSortDirection('desc');
                  }
                }}
                className="font-semibold"
              >
                Operators
                {sortColumn === 'operatorCount' ? (
                  sortDirection === 'asc' ? (
                    <ChevronUp className="ml-2 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-2 h-4 w-4" />
                  )
                ) : (
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                )}
              </Button>
              <InfoTooltip content="Number of unique operators connected to this AVS" />
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => {
                  if (sortColumn === 'strategyCount') {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortColumn('strategyCount');
                    setSortDirection('desc');
                  }
                }}
                className="font-semibold"
              >
                Strategies
                {sortColumn === 'strategyCount' ? (
                  sortDirection === 'asc' ? (
                    <ChevronUp className="ml-2 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-2 h-4 w-4" />
                  )
                ) : (
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                )}
              </Button>
              <InfoTooltip content="Number of unique strategies used by this AVS" />
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => {
                  if (sortColumn === 'relationshipCount') {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortColumn('relationshipCount');
                    setSortDirection('desc');
                  }
                }}
                className="font-semibold"
              >
                Relationships
                {sortColumn === 'relationshipCount' ? (
                  sortDirection === 'asc' ? (
                    <ChevronUp className="ml-2 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-2 h-4 w-4" />
                  )
                ) : (
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                )}
              </Button>
              <InfoTooltip content="Total number of AVS-Operator-Strategy relationships" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoadingAVSData ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <div className="flex flex-col items-center justify-center">
                  <Skeleton className="w-3/4 h-[20px] rounded-full mb-2" />
                  <Skeleton className="w-2/3 h-[20px] rounded-full mb-2" />
                  <Skeleton className="w-1/2 h-[20px] rounded-full" />
                </div>
              </TableCell>
            </TableRow>
          ) : paginatedAVS && paginatedAVS.length > 0 ? (
            paginatedAVS.map((avs, index) => {
              if (!avs || typeof avs !== 'object') {
                console.error('Invalid AVS item:', avs);
                return null;
              }
              
              const isExpanded = expandedRows[avs.avsAddress] || false;

              return (
                <React.Fragment key={avs.avsAddress}>
                  <TableRow
                    className={`hover:bg-gray-50 transition-colors
                      ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                      ${isExpanded ? 'border-b-0' : ''}`}
                  >
                    <TableCell className="font-semibold text-center">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRowExpansion(avs.avsAddress)}
                        className="p-1 h-8 w-8 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-700 hover:text-purple-800 transition-colors border border-purple-200"
                        title="Click for details"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="font-mono text-sm px-3 py-1.5 bg-purple-100 rounded-l-md border border-r-0 border-purple-200 max-w-[180px] truncate">
                          {truncateAddress(avs.avsAddress)}
                        </div>
                        <button
                          onClick={() => copyToClipboard(avs.avsAddress)}
                          className={`p-2 border border-purple-200 rounded-r-md transition-colors ${
                            copiedAddress === avs.avsAddress
                              ? 'bg-green-100 text-green-700 border-green-300'
                              : 'bg-purple-50 hover:bg-purple-100'
                          }`}
                          title={
                            copiedAddress === avs.avsAddress
                              ? 'Copied!'
                              : 'Copy full address'
                          }
                        >
                          {copiedAddress === avs.avsAddress ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-center">
                      {typeof avs.totalETH === 'number' ? avs.totalETH.toLocaleString() : '0'} ETH
                    </TableCell>
                    <TableCell className="text-center">
                      {formatUSDValue(typeof avs.totalUSD === 'number' ? avs.totalUSD : 0)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        color={
                          avs.uniqueOperators?.length > 20
                            ? 'green'
                            : avs.uniqueOperators?.length > 10
                            ? 'blue'
                            : avs.uniqueOperators?.length > 5
                            ? 'yellow'
                            : 'red'
                        }
                        text={avs.uniqueOperators?.length.toString() || '0'}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        color={
                          avs.uniqueStrategies?.length > 15
                            ? 'green'
                            : avs.uniqueStrategies?.length > 10
                            ? 'blue'
                            : avs.uniqueStrategies?.length > 5
                            ? 'yellow'
                            : 'red'
                        }
                        text={avs.uniqueStrategies?.length.toString() || '0'}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        color={
                          avs.relationships?.length > 50
                            ? 'green'
                            : avs.relationships?.length > 30
                            ? 'blue'
                            : avs.relationships?.length > 10
                            ? 'yellow'
                            : 'red'
                        }
                        text={avs.relationships?.length.toString() || '0'}
                      />
                    </TableCell>
                  </TableRow>

                  {isExpanded && (
                    <TableRow className="bg-purple-50 border-t-0">
                      <TableCell colSpan={8} className="p-0">
                        <div className="p-4 border-t-2 border-purple-200">
                          <div className="text-sm">
                            <h4 className="font-semibold mb-3 text-purple-700 flex items-center">
                              <Info className="h-4 w-4 mr-2" />
                              AVS Details
                            </h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
                                <h5 className="font-medium text-gray-800 mb-2 border-b pb-2">
                                  Overview Information
                                </h5>
                                <p className="py-1">
                                  <span className="text-gray-600 font-medium">
                                    AVS Address:
                                  </span>{' '}
                                  <span className="font-mono bg-gray-50 px-1 rounded break-all">
                                    {avs.avsAddress}
                                  </span>
                                </p>
                                <p className="py-1">
                                  <span className="text-gray-600 font-medium">
                                    Latest Update:
                                  </span>{' '}
                                  <span className="font-medium">
                                    {avs.latestStatusDate || 'Unknown'}
                                  </span>
                                </p>
                                <p className="py-1">
                                  <span className="text-gray-600 font-medium">
                                    Total Relationships:
                                  </span>{' '}
                                  <span className="font-medium">
                                    {avs.relationships?.length || 0} connections between operators and strategies
                                  </span>
                                </p>
                              </div>
                              
                              <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
                                <h5 className="font-medium text-gray-800 mb-2 border-b pb-2">
                                  Value Information
                                </h5>
                                <p className="py-1">
                                  <span className="text-gray-600 font-medium">
                                    Total ETH Value:
                                  </span>{' '}
                                  <span className="font-semibold">
                                    {typeof avs.totalETH === 'number' ? avs.totalETH.toLocaleString() : '0'} ETH
                                  </span>
                                </p>
                                <p className="py-1">
                                  <span className="text-gray-600 font-medium">
                                    Total USD Value:
                                  </span>{' '}
                                  <span className="font-semibold">
                                    {formatUSDValue(typeof avs.totalUSD === 'number' ? avs.totalUSD : 0)}
                                  </span>
                                </p>
                                <p className="py-1">
                                  <span className="text-gray-600 font-medium">
                                    Average Per Relationship:
                                  </span>{' '}
                                  <span className="font-semibold">
                                    {avs.relationships?.length > 0 && typeof avs.totalETH === 'number'
                                      ? (avs.totalETH / avs.relationships.length).toFixed(2)
                                      : '0'} ETH
                                  </span>
                                </p>
                              </div>
                            </div>
                            
                            {/* Top Operators Section */}
                            <div className="mb-4">
                              <h5 className="font-medium text-gray-800 mb-2 border-b pb-2">
                                Top 5 Operators by ETH Value
                              </h5>
                              <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Operator Address
                                      </th>
                                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ETH Value
                                      </th>
                                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        USD Value
                                      </th>
                                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Strategies
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {(getOperatorAnalytics(avs.avsAddress)?.slice(0, 5).map((op, idx) => (
                                      <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                                          <div className="font-mono text-xs">
                                            {truncateAddress(op.address)}
                                            <button
                                              onClick={() => copyToClipboard(op.address)}
                                              className="ml-2 text-gray-400 hover:text-gray-600"
                                            >
                                              <Copy className="h-3 w-3 inline" />
                                            </button>
                                          </div>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                                          {typeof op.eth === 'number' ? op.eth.toLocaleString() : '0'} ETH
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                                          {formatUSDValue(typeof op.usd === 'number' ? op.usd : 0)}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-center">
                                          {op.count || 0}
                                        </td>
                                      </tr>
                                    ))) || (
                                      <tr>
                                        <td colSpan={4} className="px-4 py-4 text-center text-sm text-gray-500">
                                          No operator data available
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                            
                            {/* Top Strategies Section */}
                            <div>
                              <h5 className="font-medium text-gray-800 mb-2 border-b pb-2">
                                Top 5 Strategies by ETH Value
                              </h5>
                              <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Strategy Address
                                      </th>
                                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ETH Value
                                      </th>
                                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        USD Value
                                      </th>
                                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Operators
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {(getStrategyAnalytics(avs.avsAddress)?.slice(0, 5).map((strat, idx) => (
                                      <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                                          <div className="font-mono text-xs">
                                            {truncateAddress(strat.address)}
                                            <button
                                              onClick={() => copyToClipboard(strat.address)}
                                              className="ml-2 text-gray-400 hover:text-gray-600"
                                            >
                                              <Copy className="h-3 w-3 inline" />
                                            </button>
                                          </div>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                                          {typeof strat.eth === 'number' ? strat.eth.toLocaleString() : '0'} ETH
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                                          {formatUSDValue(typeof strat.usd === 'number' ? strat.usd : 0)}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-center">
                                          {strat.count || 0}
                                        </td>
                                      </tr>
                                    ))) || (
                                      <tr>
                                        <td colSpan={4} className="px-4 py-4 text-center text-sm text-gray-500">
                                          No strategy data available
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <div className="flex flex-col items-center">
                  <p className="text-gray-500 mb-2">
                    {searchTerm
                      ? 'No matching AVS found' 
                      : 'No AVS data available. Please check the network connection.'}
                  </p>
                  {searchTerm && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchTerm('');
                      }}
                    >
                      Clear Search
                    </Button>
                  )}
                  {!searchTerm && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchAVSDataCallback}
                    >
                      Retry Loading
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  // Render pagination controls
  const renderPagination = () => (
    <div className="mt-4 flex items-center justify-between">
      <div>
        Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
        {Math.min(currentPage * itemsPerPage, filteredAndSortedAVS.length)}{' '}
        of {filteredAndSortedAVS.length} AVS services
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <div className="text-sm px-3 py-1 bg-gray-100 rounded-md">
          Page {currentPage} of {totalPagesAVS}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPagesAVS))
          }
          disabled={currentPage === totalPagesAVS}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );

  // Render AVS summary cards
  const renderAVSSummary = () => {
    if (!avsAggregates.length) return null;

    // Calculate total values
    const totalETH = avsAggregates.reduce((sum, avs) => sum + avs.totalETH, 0);
    const totalUSD = avsAggregates.reduce((sum, avs) => sum + avs.totalUSD, 0);
    
    // Get total unique operators and strategies
    const allOperators = new Set<string>();
    const allStrategies = new Set<string>();
    avsAggregates.forEach(avs => {
      avs.uniqueOperators.forEach(op => allOperators.add(op));
      avs.uniqueStrategies.forEach(strat => allStrategies.add(strat));
    });
    
    // Get total relationships
    const totalRelationships = avsAggregates.reduce(
      (sum, avs) => sum + avs.relationships.length, 
      0
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <h3 className="text-sm font-medium text-gray-600">AVS Services</h3>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-gray-900">
              {avsAggregates.length}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <h3 className="text-sm font-medium text-gray-600">
              Total ETH Value
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-gray-900">
              {totalETH.toLocaleString()} ETH
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <h3 className="text-sm font-medium text-gray-600">
              Total USD Value
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-gray-900">
              {formatUSDValue(totalUSD)}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <h3 className="text-sm font-medium text-gray-600">
              Unique Operators
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-gray-900">
              {allOperators.size}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <h3 className="text-sm font-medium text-gray-600">
              Unique Strategies
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-gray-900">
              {allStrategies.size}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render information panel
  const renderInfoPanel = () => (
    <div className="mt-4 text-sm text-gray-600 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <p className="font-medium mb-2">AVS Overview Explanation:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>AVS (Actively Validated Service):</strong> A service in the EigenLayer ecosystem that validators can opt to support.
        </li>
        <li>
          <strong>Operators:</strong> Entities managing validation infrastructure on behalf of stakers for each AVS.
        </li>
        <li>
          <strong>Strategies:</strong> The staking approach used to secure the assets backing each AVS.
        </li>
        <li>
          <strong>Relationships:</strong> Connections between an AVS, operator, and strategy that represent the flow of capital.
        </li>
        <li>
          <strong>ETH/USD Value:</strong> The equivalent value of all relationships for each AVS.
        </li>
      </ul>
      <p className="mt-2 italic">
        This aggregated view focuses on each AVS service, showing the total value, number of operators, 
        strategies, and relationships. Expanding a row shows detailed breakdowns of top operators and strategies
        for each AVS service.
      </p>
    </div>
  );

  // Add debug output function
  const renderDebugOutput = () => {
    return (
      <div className="mb-4 p-2 bg-gray-50 border border-gray-200 rounded text-gray-700 text-xs">
        <details>
          <summary className="cursor-pointer font-medium mb-2">Debug Information (Click to expand)</summary>
          <div className="space-y-2 pl-2">
            <div><strong>API Data Status:</strong> {avsData ? `Received ${avsData.length} raw records` : 'No data'}</div>
            <div><strong>Relationships:</strong> {relationships.length} valid relationships extracted</div>
            <div><strong>AVS Aggregates:</strong> {avsAggregates.length} services found</div>
            <div><strong>Filtered AVS:</strong> {filteredAndSortedAVS.length} matching search criteria</div>
            <div><strong>Paginated AVS:</strong> {paginatedAVS?.length || 0} displayed on current page</div>
            <div><strong>Sort Settings:</strong> Column: {sortColumn}, Direction: {sortDirection}</div>
            <div><strong>Current Page:</strong> {currentPage} of {totalPagesAVS || 0}</div>
            
            {relationships.length > 0 && (
              <>
                <hr className="my-2" />
                <div><strong>First 3 Relationships Sample:</strong></div>
                <pre className="bg-black text-green-500 p-2 rounded overflow-auto max-h-40 text-[10px]">
                  {JSON.stringify(relationships.slice(0, 3), null, 2)}
                </pre>
              </>
            )}
            
            {avsAggregates.length > 0 ? (
              <>
                <hr className="my-2" />
                <div><strong>First AVS Aggregate Sample:</strong></div>
                <pre className="bg-black text-green-500 p-2 rounded overflow-auto max-h-40 text-[10px]">
                  {JSON.stringify(avsAggregates[0], null, 2)}
                </pre>
              </>
            ) : relationships.length > 0 ? (
              <>
                <hr className="my-2" />
                <div className="text-red-500 font-semibold">AVS Aggregation Failed Despite Having Relationships!</div>
                <div className="space-y-2">
                  <div>
                    <button 
                      className="px-2 py-1 bg-blue-500 text-white rounded text-xs mr-2"
                      onClick={() => {
                        // Debug: Try to manually aggregate relationships
                        try {
                          console.log('Manual aggregation debug:');
                          console.log('Relationships:', relationships);
                          
                          // Create a map of AVS addresses
                          const uniqueAVSAddresses = new Set(relationships.map(r => r.avsAddress));
                          console.log('Unique AVS addresses:', uniqueAVSAddresses);
                          
                          // Check if there are any valid AVS addresses
                          if (uniqueAVSAddresses.size === 0) {
                            console.error('No valid AVS addresses found in relationships');
                            alert('No valid AVS addresses found in relationships');
                            return;
                          }
                          
                          // Try to create a simple AVS aggregate
                          const firstAddress = Array.from(uniqueAVSAddresses)[0];
                          console.log('First AVS address:', firstAddress);
                          
                          const relationsForAvs = relationships.filter(r => r.avsAddress === firstAddress);
                          console.log('Relations for first AVS:', relationsForAvs);
                          
                          const simpleAggregate = {
                            avsAddress: firstAddress,
                            totalETH: relationsForAvs.reduce((sum, r) => sum + (typeof r.ethValue === 'number' ? r.ethValue : 0), 0),
                            totalUSD: relationsForAvs.reduce((sum, r) => sum + (typeof r.usdValue === 'number' ? r.usdValue : 0), 0),
                            uniqueOperators: Array.from(new Set(relationsForAvs.map(r => r.operatorAddress))),
                            uniqueStrategies: Array.from(new Set(relationsForAvs.map(r => r.strategyAddress))),
                            relationships: relationsForAvs,
                            latestStatusDate: relationsForAvs[0]?.statusDate || 'Unknown'
                          };
                          
                          console.log('Simple aggregate:', simpleAggregate);
                          alert(`Manual aggregation successful! Found ${relationsForAvs.length} relationships for AVS ${firstAddress.substring(0, 8)}...`);
                        } catch (error) {
                          console.error('Manual aggregation failed:', error);
                          alert(`Manual aggregation error: ${error}`);
                        }
                      }}
                    >
                      Debug: Try Manual Aggregation
                    </button>
                    
                    <button
                      className="px-2 py-1 bg-yellow-500 text-white rounded text-xs ml-2"
                      onClick={async () => {
                        // Re-fetch data with extra debugging
                        try {
                          console.log('Performing debug re-fetch of data...');
                          
                          // Try a specific full=true request which should return all data
                          const debugApiUrl = 'https://eigenlayer.restakeapi.com/aoss/?full=true';
                          console.log('Debug API URL:', debugApiUrl);
                          
                          const response = await fetch(debugApiUrl, {
                            method: 'GET',
                            headers: {
                              'Content-Type': 'application/json',
                              'Accept': 'application/json'
                            }
                          });
                          
                          console.log('API response status:', response.status);
                          
                          if (!response.ok) {
                            const errorText = await response.text();
                            console.error(`API error: ${response.status}, Response: ${errorText}`);
                            alert(`API error: ${response.status}`);
                            return;
                          }
                          
                          const data = await response.json();
                          console.log('Raw API response:', data);
                          
                          if (!data || !data.data || !Array.isArray(data.data)) {
                            console.error('Invalid response format:', data);
                            alert('Invalid API response format');
                            return;
                          }
                          
                          console.log(`API returned ${data.data.length} records`);
                          console.log('First 3 records from API:', data.data.slice(0, 3));
                          
                          // Check for valid AVS fields in records
                          const validRecords = data.data.filter(item => 
                            item && typeof item.avs === 'string' && item.avs.length > 0
                          );
                          
                          console.log(`Found ${validRecords.length} records with valid AVS addresses`);
                          
                          if (validRecords.length === 0) {
                            alert('No valid AVS addresses found in API response');
                            return;
                          }
                          
                          // Get unique AVS addresses
                          const avsAddresses = validRecords.map(item => item.avs);
                          const uniqueAVSes = Array.from(new Set(avsAddresses));
                          
                          console.log(`Found ${uniqueAVSes.length} unique AVS addresses`);
                          console.log('First 5 unique AVS addresses:', uniqueAVSes.slice(0, 5));
                          
                          // Create manual AVS aggregates
                          const manualAggregates = uniqueAVSes.map(avsAddress => {
                            const avsRecords = validRecords.filter(item => item.avs === avsAddress);
                            
                            const totalETH = avsRecords.reduce((sum, item) => 
                              sum + (typeof item.eth === 'number' ? item.eth : 0), 0
                            );
                            
                            const totalUSD = avsRecords.reduce((sum, item) => 
                              sum + (typeof item.usd === 'number' ? item.usd : 0), 0
                            );
                            
                            const uniqueOperators = Array.from(new Set(
                              avsRecords
                                .filter(item => typeof item.operator === 'string')
                                .map(item => item.operator)
                            ));
                            
                            const uniqueStrategies = Array.from(new Set(
                              avsRecords
                                .filter(item => typeof item.strategy === 'string')
                                .map(item => item.strategy)
                            ));
                            
                            // Transform records to relationships
                            const relationships = avsRecords.map(item => ({
                              avsAddress: item.avs,
                              operatorAddress: item.operator,
                              strategyAddress: item.strategy,
                              shares: typeof item.shares === 'number' ? item.shares : 0,
                              ethValue: typeof item.eth === 'number' ? item.eth : 0,
                              usdValue: typeof item.usd === 'number' ? item.usd : 0,
                              statusDate: item.status_date || 'Unknown'
                            }));
                            
                            return {
                              avsAddress,
                              totalETH,
                              totalUSD,
                              uniqueOperators,
                              uniqueStrategies,
                              relationships,
                              latestStatusDate: avsRecords[0]?.status_date || 'Unknown'
                            };
                          });
                          
                          console.log(`Created ${manualAggregates.length} debug aggregates`);
                          
                          // Update both relationships and aggregates
                          const allRelationships = manualAggregates.flatMap(agg => agg.relationships);
                          setRelationships(allRelationships);
                          setAvsAggregates(manualAggregates);
                          
                          alert(`Debug fetch successful: Created ${manualAggregates.length} AVS aggregates from ${allRelationships.length} relationships`);
                        } catch (error) {
                          console.error('Debug re-fetch error:', error);
                          alert(`Debug re-fetch error: ${error}`);
                        }
                      }}
                    >
                      Debug Re-fetch Data
                    </button>
                    
                    <button 
                      className="px-2 py-1 bg-purple-500 text-white rounded text-xs ml-2"
                      onClick={() => {
                        try {
                          // Create test data
                          const testRel1 = {
                            avsAddress: '0x1234567890abcdef1234567890abcdef12345678',
                            operatorAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
                            strategyAddress: '0x7890abcdef1234567890abcdef1234567890abcd',
                            shares: 1000,
                            ethValue: 100,
                            usdValue: 200000,
                            statusDate: '2025-02-10'
                          };
                          
                          const testRel2 = {
                            avsAddress: '0x1234567890abcdef1234567890abcdef12345678',
                            operatorAddress: '0xdef1234567890abcdef1234567890abcdef1234',
                            strategyAddress: '0x90abcdef1234567890abcdef1234567890abcde',
                            shares: 2000,
                            ethValue: 200,
                            usdValue: 400000,
                            statusDate: '2025-02-11'
                          };
                          
                          const testRelationships = [testRel1, testRel2];
                          
                          const testAggregate = {
                            avsAddress: '0x1234567890abcdef1234567890abcdef12345678',
                            totalETH: 300,
                            totalUSD: 600000,
                            uniqueOperators: [
                              '0xabcdef1234567890abcdef1234567890abcdef12',
                              '0xdef1234567890abcdef1234567890abcdef1234'
                            ],
                            uniqueStrategies: [
                              '0x7890abcdef1234567890abcdef1234567890abcd',
                              '0x90abcdef1234567890abcdef1234567890abcde'
                            ],
                            relationships: testRelationships,
                            latestStatusDate: '2025-02-11'
                          };
                          
                          setRelationships(testRelationships);
                          setAvsAggregates([testAggregate]);
                          
                          console.log('Created test data:', testRelationships, [testAggregate]);
                          alert('Test data created successfully!');
                        } catch (error) {
                          console.error('Error creating test data:', error);
                          alert(`Error creating test data: ${error}`);
                        }
                      }}
                    >
                      Create Test Data
                    </button>
                    
                    <button
                      className="px-2 py-1 bg-blue-500 text-white rounded text-xs ml-2"
                      onClick={async () => {
                        try {
                          // Try specific AVS address
                          console.log('Trying specific AVS API call...');
                          
                          // Some known AVS addresses to try
                          const testAVSAddresses = [
                            '0x0328635ba5ff28476118595234b5b7236b906c0b',
                            '0x49d69f5fa0f801c841f2e1df6d7c0f3f96df7c8b',
                            '0x69aea91cdcc94103e65f58f01c0716e76c638a70',
                            '0x2d1c31aab44e2e33c2020a8ae647e68b7c8e05fb'
                          ];
                          
                          // Try the first one
                          const avsToTry = testAVSAddresses[0];
                          const specificUrl = `https://eigenlayer.restakeapi.com/aoss/?avs=${avsToTry}`;
                          console.log(`Trying specific AVS: ${avsToTry}`);
                          console.log(`URL: ${specificUrl}`);
                          
                          const response = await fetch(specificUrl, {
                            method: 'GET',
                            headers: {
                              'Content-Type': 'application/json',
                              'Accept': 'application/json'
                            }
                          });
                          
                          console.log('Response status:', response.status);
                          
                          if (!response.ok) {
                            const errorText = await response.text();
                            console.error(`API error: ${response.status}, Response: ${errorText}`);
                            alert(`API error: ${response.status}`);
                            return;
                          }
                          
                          const data = await response.json();
                          console.log('Specific AVS API response:', data);
                          
                          if (!data || !data.data || !Array.isArray(data.data)) {
                            console.error('Invalid response format:', data);
                            alert('Invalid API response format');
                            return;
                          }
                          
                          console.log(`API returned ${data.data.length} records for AVS ${avsToTry}`);
                          
                          if (data.data.length === 0) {
                            alert(`No data found for AVS ${avsToTry}. Trying different approach...`);
                            
                            // Try a date range as a fallback
                            const dateUrl = `https://eigenlayer.restakeapi.com/aoss/?date_start=2025-01-01&date_end=2025-03-31`;
                            console.log(`Trying date range: ${dateUrl}`);
                            
                            const dateResponse = await fetch(dateUrl);
                            const dateData = await dateResponse.json();
                            
                            console.log('Date range response:', dateData);
                            
                            if (!dateData || !dateData.data || !Array.isArray(dateData.data) || dateData.data.length === 0) {
                              alert('No data found using date range either. The API may be empty or have a different format.');
                              return;
                            }
                            
                            console.log(`Date range API returned ${dateData.data.length} records`);
                            
                            // Let's look at the structure
                            console.log('First record structure:', dateData.data[0]);
                            
                            // Try to extract the field names
                            const fieldNames = Object.keys(dateData.data[0] || {});
                            console.log('Field names in first record:', fieldNames);
                            
                            // Alert the user with the field names for diagnosis
                            alert(`Found ${dateData.data.length} records with date range. Field names: ${fieldNames.join(', ')}`);
                            return;
                          }
                          
                          // Try to adapt relationships based on the API structure
                          const firstRecord = data.data[0];
                          console.log('First record structure:', firstRecord);
                          
                          // Extract field names to understand the API structure
                          const fieldNames = Object.keys(firstRecord || {});
                          console.log('Field names in API response:', fieldNames);
                          
                          // Create relationships based on the actual structure
                          const adaptedRelationships = [];
                          let avsField = 'avs';
                          let operatorField = 'operator';
                          let strategyField = 'strategy';
                          let sharesField = 'shares';
                          let ethField = 'eth';
                          let usdField = 'usd';
                          let dateField = 'status_date';
                          
                          // Try to guess field names if they don't match expectations
                          if (!firstRecord[avsField]) {
                            const possibleAvsFields = fieldNames.filter(f => 
                              f.includes('avs') || f.includes('service') || f.includes('contract')
                            );
                            if (possibleAvsFields.length > 0) {
                              avsField = possibleAvsFields[0];
                              console.log(`Guessing AVS field as ${avsField}`);
                            }
                          }
                          
                          if (!firstRecord[operatorField]) {
                            const possibleOpFields = fieldNames.filter(f => 
                              f.includes('op') || f.includes('validator') || f.includes('node')
                            );
                            if (possibleOpFields.length > 0) {
                              operatorField = possibleOpFields[0];
                              console.log(`Guessing operator field as ${operatorField}`);
                            }
                          }
                          
                          // Adapt each record to our relationship structure
                          data.data.forEach(record => {
                            try {
                              adaptedRelationships.push({
                                avsAddress: record[avsField] || avsToTry,
                                operatorAddress: record[operatorField] || 'unknown',
                                strategyAddress: record[strategyField] || 'unknown',
                                shares: typeof record[sharesField] === 'number' ? record[sharesField] : 0,
                                ethValue: typeof record[ethField] === 'number' ? record[ethField] : 0,
                                usdValue: typeof record[usdField] === 'number' ? record[usdField] : 0,
                                statusDate: record[dateField] || new Date().toISOString().split('T')[0]
                              });
                            } catch (recordError) {
                              console.error('Error adapting record:', recordError, record);
                            }
                          });
                          
                          console.log(`Adapted ${adaptedRelationships.length} relationships`);
                          
                          if (adaptedRelationships.length === 0) {
                            alert('Could not adapt any relationships from the API response.');
                            return;
                          }
                          
                          // Create aggregate for this AVS
                          const totalETH = adaptedRelationships.reduce((sum, r) => sum + r.ethValue, 0);
                          const totalUSD = adaptedRelationships.reduce((sum, r) => sum + r.usdValue, 0);
                          const uniqueOperators = Array.from(new Set(adaptedRelationships.map(r => r.operatorAddress)));
                          const uniqueStrategies = Array.from(new Set(adaptedRelationships.map(r => r.strategyAddress)));
                          
                          const adaptedAggregate = {
                            avsAddress: avsToTry,
                            totalETH,
                            totalUSD,
                            uniqueOperators,
                            uniqueStrategies,
                            relationships: adaptedRelationships,
                            latestStatusDate: adaptedRelationships[0]?.statusDate || 'Unknown'
                          };
                          
                          // Update state
                          setRelationships(adaptedRelationships);
                          setAvsAggregates([adaptedAggregate]);
                          
                          alert(`Successfully loaded ${adaptedRelationships.length} relationships for AVS ${avsToTry}`);
                        } catch (error) {
                          console.error('Error fetching specific AVS:', error);
                          alert(`Error fetching specific AVS: ${error}`);
                        }
                      }}
                    >
                      Try Specific AVS
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </details>
      </div>
    );
  };

  // Main render method
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg mt-8 shadow-md">
        <h2 className="text-xl font-semibold mb-2 text-gray-800 flex items-center">
          <div className="mr-3">
            <StyledIcon
              icon={<Network className="h-4 w-4" />}
              gradientColors={['#8b5cf6', '#d946ef']}
              size="h-9 w-9"
            />
          </div>
          AVS Service Overview
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Aggregated analysis of AVS services and their connections to operators and strategies in the EigenLayer ecosystem
        </p>

        {/* Debug information - remove in production */}
        {isLoadingAVSData && (
          <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm">
            Loading AVS data... Please wait.
          </div>
        )}
        
        {!isLoadingAVSData && (
          <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm flex flex-col gap-2">
            <div>
              {avsAggregates.length === 0 ? (
                <div>No AVS data found. API status: {avsData ? `Data received with ${avsData.length} items but no valid aggregates were created` : 'No data received'}</div>
              ) : (
                <div>Found {avsAggregates.length} AVS services with {relationships.length} total relationships</div>
              )}
            </div>
            
            {avsAggregates.length === 0 && (
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={fetchAVSDataCallback}
                >
                  Retry Loading
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      // Try a specific AVS that we know exists
                      const testApiUrl = 'https://eigenlayer.restakeapi.com/aoss/?avs=0x0328635ba5ff28476118595234b5b7236b906c0b';
                      console.log('Testing with specific AVS URL:', testApiUrl);
                      
                      const response = await fetch(testApiUrl, {
                        method: 'GET',
                        headers: {
                          'Content-Type': 'application/json',
                          'Accept': 'application/json'
                        }
                      });
                      
                      const data = await response.json();
                      console.log('Test API response:', data);
                      
                      alert(`Test API returned ${data?.data?.length || 0} records`);
                    } catch (error) {
                      console.error('Test API error:', error);
                      alert(`Test API failed: ${error}`);
                    }
                  }}
                >
                  Test Specific AVS
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      // Try a direct request with a date range
                      const testApiUrl = 'https://eigenlayer.restakeapi.com/aoss/?date_start=2025-01-01&date_end=2025-03-31';
                      console.log('Testing with date range URL:', testApiUrl);
                      
                      const response = await fetch(testApiUrl, {
                        method: 'GET',
                        headers: {
                          'Content-Type': 'application/json',
                          'Accept': 'application/json'
                        }
                      });
                      
                      const data = await response.json();
                      console.log('Date range API response:', data);
                      
                      alert(`Date range API returned ${data?.data?.length || 0} records`);
                    } catch (error) {
                      console.error('Date range API error:', error);
                      alert(`Date range API failed: ${error}`);
                    }
                  }}
                >
                  Test Date Range
                </Button>
              </div>
            )}
          </div>
        )}

        {avsAggregates.length > 0 && renderAVSSummary()}
        {renderFilterControls()}
        {renderAVSTable()}
        {avsAggregates.length > 0 && renderPagination()}
        {renderInfoPanel()}
        {renderDebugOutput()}
      </div>
    </div>
  );
};

export default AVSOverview; 