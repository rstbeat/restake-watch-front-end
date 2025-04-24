'use client';

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  AlertTriangle,
  Copy,
  Check,
  Search,
  Info,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  BarChart3,
  FileDown,
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
import { Checkbox } from './ui/checkbox';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

// Define interfaces for the AVS data
interface AVSData {
  avsName: string;
  category: string;
  permissionModel: string;
  implementationStatus: string;
  amountManaged: number; // in ETH
  slashingConditions: SlashingConditions;
  specificMechanism: string;
  notableChanges: string;
  slashingPenaltyDetails: string;
  slashingNotes: string;
}

interface SlashingConditions {
  incorrectSig: boolean;
  doubleSigning: boolean;
  commitmentBreach: boolean;
  inactivity: boolean;
  dkgMalice: boolean;
  failureToSettle: boolean;
  falseNegative: boolean;
}

// CSV data interfaces
interface WhitelistingInfo {
  avsName: string;
  category: string;
  permissionModel: string;
  specificMechanism: string;
  notableChanges: string;
  keySource: string;
  amountManaged: string;
}

interface SlashingInfo {
  avsName: string;
  incorrectSig: string;
  doubleSigning: string;
  commitmentBreach: string;
  inactivity: string;
  dkgMalice: string;
  failureToSettle: string;
  falseNegative: string;
  penaltyDetails: string;
  implementationStatus: string;
  followsEthereum: string;
  notImplemented: string;
  notes: string;
}

// Helper function to parse CSV
const parseCSV = (csvText: string): string[][] => {
  const rows = csvText.split('\n');
  return rows.map((row) => {
    // Handle commas within quotes properly
    const result = [];
    let inQuotes = false;
    let currentEntry = '';

    for (let i = 0; i < row.length; i++) {
      const char = row[i];

      if (char === '"' && (i === 0 || row[i - 1] !== '\\')) {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(currentEntry);
        currentEntry = '';
      } else {
        currentEntry += char;
      }
    }

    result.push(currentEntry);
    return result;
  });
};

// Helper function to convert string to boolean
const stringToBoolean = (value: string): boolean => {
  return value.toLowerCase() === 'true';
};

// Tooltip component
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

// Badge component
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

const AVSOverview: React.FC = () => {
  // State for data and filters
  const [avsData, setAvsData] = useState<AVSData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sortColumn, setSortColumn] = useState<keyof AVSData>('amountManaged');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [permissionFilter, setPermissionFilter] = useState<string>('all');
  const [implementationFilter, setImplementationFilter] =
    useState<string>('all');
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Function to toggle row expansion
  const toggleRowExpansion = (avsName: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [avsName]: !prev[avsName],
    }));
  };

  // Fetch and process data from CSV files
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch both CSV files
        const [whitelistingResponse, slashingResponse] = await Promise.all([
          fetch('/data/AVS - whitelisting info.csv'),
          fetch('/data/avs_slashing.csv'),
        ]);

        const whitelistingText = await whitelistingResponse.text();
        const slashingText = await slashingResponse.text();

        // Parse CSV data
        const whitelistingRows = parseCSV(whitelistingText);
        const slashingRows = parseCSV(slashingText);

        // Extract headers
        const whitelistingHeaders = whitelistingRows[0];
        const slashingHeaders = slashingRows[0];

        // Parse whitelisting data
        const whitelistingData: { [key: string]: WhitelistingInfo } = {};
        for (let i = 1; i < whitelistingRows.length; i++) {
          const row = whitelistingRows[i];
          if (row.length >= 7 && row[0].trim()) {
            const avsName = row[0].trim();
            whitelistingData[avsName] = {
              avsName,
              category: row[1].trim(),
              permissionModel: row[2].trim(),
              specificMechanism: row[3].trim(),
              notableChanges: row[4].trim(),
              keySource: row[5].trim(),
              amountManaged: row[6].trim(),
            };
          }
        }

        // Parse slashing data
        const slashingData: { [key: string]: SlashingInfo } = {};
        for (let i = 1; i < slashingRows.length; i++) {
          const row = slashingRows[i];
          if (row.length >= 13 && row[0].trim()) {
            const avsName = row[0].trim();
            slashingData[avsName] = {
              avsName,
              incorrectSig: row[1].trim(),
              doubleSigning: row[2].trim(),
              commitmentBreach: row[3].trim(),
              inactivity: row[4].trim(),
              dkgMalice: row[5].trim(),
              failureToSettle: row[6].trim(),
              falseNegative: row[7].trim(),
              penaltyDetails: row[8].trim(),
              implementationStatus: row[9].trim(),
              followsEthereum: row[10].trim(),
              notImplemented: row[11].trim(),
              notes: row[12].trim(),
            };
          }
        }

        // Merge data from both sources
        const mergedData: AVSData[] = [];

        // First, process all AVSs from whitelisting data
        Object.values(whitelistingData).forEach((whitelist) => {
          const slashing = slashingData[whitelist.avsName] || {
            incorrectSig: 'false',
            doubleSigning: 'false',
            commitmentBreach: 'false',
            inactivity: 'false',
            dkgMalice: 'false',
            failureToSettle: 'false',
            falseNegative: 'false',
            penaltyDetails: 'N/A',
            implementationStatus: 'Not Implemented',
            notes: 'No slashing information available',
          };

          // Convert amount to number
          let amount = 0;
          const amountString = whitelist.amountManaged.replace(/[KMk,]/g, '');
          if (amountString) {
            amount = parseFloat(amountString);
            if (
              whitelist.amountManaged.includes('K') ||
              whitelist.amountManaged.includes('k')
            ) {
              amount *= 1000;
            } else if (whitelist.amountManaged.includes('M')) {
              amount *= 1000000;
            }
          }

          // Map implementation status from slashing data or determine from whitelist
          let implementationStatus = slashing.implementationStatus;
          if (
            implementationStatus === 'Not Implemented' ||
            !implementationStatus
          ) {
            // Try to infer from whitelisting data
            if (
              whitelist.notableChanges
                .toLowerCase()
                .includes('mainnet active') ||
              whitelist.notableChanges.toLowerCase().includes('live')
            ) {
              implementationStatus = 'Mainnet Active';
            } else if (
              whitelist.notableChanges.toLowerCase().includes('testnet')
            ) {
              implementationStatus = 'Testnet Only';
            } else if (
              whitelist.notableChanges.toLowerCase().includes('plan')
            ) {
              implementationStatus = 'Planned';
            }
          }

          // Normalize permission model
          let permissionModel = whitelist.permissionModel;
          if (
            permissionModel.includes('Implicit') ||
            permissionModel.includes('Team')
          ) {
            permissionModel = 'Whitelisted';
          } else if (
            permissionModel.includes('Permission') &&
            !permissionModel.includes('less')
          ) {
            permissionModel = 'Whitelisted';
          }

          mergedData.push({
            avsName: whitelist.avsName,
            category: whitelist.category,
            permissionModel,
            implementationStatus,
            amountManaged: amount,
            slashingConditions: {
              incorrectSig: stringToBoolean(slashing.incorrectSig),
              doubleSigning: stringToBoolean(slashing.doubleSigning),
              commitmentBreach: stringToBoolean(slashing.commitmentBreach),
              inactivity: stringToBoolean(slashing.inactivity),
              dkgMalice: stringToBoolean(slashing.dkgMalice),
              failureToSettle: stringToBoolean(slashing.failureToSettle),
              falseNegative: stringToBoolean(slashing.falseNegative),
            },
            specificMechanism: whitelist.specificMechanism,
            notableChanges: whitelist.notableChanges,
            slashingPenaltyDetails: slashing.penaltyDetails || 'N/A',
            slashingNotes:
              slashing.notes || 'No additional slashing notes available',
          });
        });

        // Then add any AVSs that only exist in slashing data
        Object.values(slashingData).forEach((slashing) => {
          if (!whitelistingData[slashing.avsName]) {
            mergedData.push({
              avsName: slashing.avsName,
              category: 'Unknown',
              permissionModel: 'Unknown',
              implementationStatus:
                slashing.implementationStatus || 'Not Implemented',
              amountManaged: 0,
              slashingConditions: {
                incorrectSig: stringToBoolean(slashing.incorrectSig),
                doubleSigning: stringToBoolean(slashing.doubleSigning),
                commitmentBreach: stringToBoolean(slashing.commitmentBreach),
                inactivity: stringToBoolean(slashing.inactivity),
                dkgMalice: stringToBoolean(slashing.dkgMalice),
                failureToSettle: stringToBoolean(slashing.failureToSettle),
                falseNegative: stringToBoolean(slashing.falseNegative),
              },
              specificMechanism: 'N/A',
              notableChanges: 'No information available',
              slashingPenaltyDetails: slashing.penaltyDetails || 'N/A',
              slashingNotes:
                slashing.notes || 'No additional slashing notes available',
            });
          }
        });

        setAvsData(mergedData);
      } catch (error) {
        console.error('Error fetching AVS data:', error);
        // Fallback to empty array if fetch fails
        setAvsData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    if (!avsData) return [];

    return [...avsData]
      .filter((avs) => {
        const matchesSearchTerm = avs.avsName
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        const matchesPermission =
          permissionFilter === 'all' ||
          avs.permissionModel === permissionFilter;

        const matchesImplementation =
          implementationFilter === 'all' ||
          avs.implementationStatus === implementationFilter;

        return matchesSearchTerm && matchesPermission && matchesImplementation;
      })
      .sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [
    avsData,
    sortColumn,
    sortDirection,
    searchTerm,
    permissionFilter,
    implementationFilter,
  ]);

  // Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedData, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredAndSortedData.length / itemsPerPage);
  }, [filteredAndSortedData, itemsPerPage]);

  // Handle sorting
  const handleSort = (column: keyof AVSData) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, permissionFilter, implementationFilter]);

  // Render sort icon
  const SortIcon = ({ column }: { column: keyof AVSData }) => {
    if (column !== sortColumn) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortDirection === 'asc' ? (
      <ChevronUp className="ml-2 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-2 h-4 w-4" />
    );
  };

  // Format ETH value with appropriate suffix
  const formatETHValue = (value: number): string => {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M ETH`;
    } else if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1)}K ETH`;
    } else {
      return `${value.toFixed(2)} ETH`;
    }
  };

  // Generate status badge color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Mainnet Active':
        return 'green';
      case 'Testnet Only':
        return 'blue';
      case 'Planned':
        return 'yellow';
      case 'Not Implemented':
        return 'gray';
      case 'Inherited (Ethereum)':
        return 'purple';
      default:
        return 'gray';
    }
  };

  // Generate permission model badge color
  const getPermissionColor = (model: string): string => {
    switch (model) {
      case 'Whitelisted':
        return 'purple';
      case 'Permissionless':
        return 'green';
      case 'Hybrid':
        return 'blue';
      default:
        return 'gray';
    }
  };

  // Render the slashing condition indicator
  const renderSlashingIndicator = (condition: boolean) => {
    return condition ? (
      <span
        className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"
        title="Applied"
      ></span>
    ) : (
      <span
        className="inline-block w-3 h-3 rounded-full bg-gray-300 mr-1"
        title="Not Applied"
      ></span>
    );
  };

  // Render expanded detail row
  const renderExpandedDetails = (avs: AVSData) => {
    return (
      <div className="p-4 bg-gray-50 border-t">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">
              Specific Mechanism/Requirements
            </h4>
            <p className="text-sm mb-4">{avs.specificMechanism}</p>
            <InfoTooltip content="The technical approach or requirements for operators to join and validate for this AVS, such as stake thresholds, hardware requirements, or registration processes" />
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">Notable Changes</h4>
            <p className="text-sm mb-4">{avs.notableChanges}</p>
            <InfoTooltip content="Recent updates, version changes, or roadmap developments for this AVS" />
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-semibold text-sm mb-2">
            Slashing Penalty Details
          </h4>
          <p className="text-sm mb-4">{avs.slashingPenaltyDetails}</p>
          <InfoTooltip content="Specific details about the penalties applied when slashing conditions are triggered, such as percentage of stake lost" />
        </div>

        <div className="mt-4">
          <h4 className="font-semibold text-sm mb-2">Notes</h4>
          <p className="text-sm">{avs.slashingNotes}</p>
          <InfoTooltip content="Additional context about the AVS's slashing model, implementation status, or special considerations" />
        </div>

        <div className="mt-4">
          <h4 className="font-semibold text-sm mb-2">
            All Slashing Conditions
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center">
              {renderSlashingIndicator(avs.slashingConditions.incorrectSig)}
              <span className="text-sm">Incorrect Signatures</span>
              <InfoTooltip content="Penalty for signing incorrect or invalid data, proofs, attestations, or checkpoints" />
            </div>
            <div className="flex items-center">
              {renderSlashingIndicator(avs.slashingConditions.doubleSigning)}
              <span className="text-sm">Double Signing</span>
              <InfoTooltip content="Penalty for signing two different blocks or messages for the same slot or task" />
            </div>
            <div className="flex items-center">
              {renderSlashingIndicator(avs.slashingConditions.commitmentBreach)}
              <span className="text-sm">Commitment Breach</span>
              <InfoTooltip content="Penalty for failing to fulfill a prior commitment (e.g., data availability, task execution, promised transactions)" />
            </div>
            <div className="flex items-center">
              {renderSlashingIndicator(avs.slashingConditions.inactivity)}
              <span className="text-sm">Inactivity</span>
              <InfoTooltip content="Penalty for liveness failures, such as failing to participate or respond within required timeframes" />
            </div>
            <div className="flex items-center">
              {renderSlashingIndicator(avs.slashingConditions.dkgMalice)}
              <span className="text-sm">DKG Malice</span>
              <InfoTooltip content="Penalty for malicious behavior during Distributed Key Generation processes, relevant for TSS/MPC-based AVSs" />
            </div>
            <div className="flex items-center">
              {renderSlashingIndicator(avs.slashingConditions.failureToSettle)}
              <span className="text-sm">Failure to Settle</span>
              <InfoTooltip content="Penalty for failing to settle transaction batches or preconfirmations on Layer 1" />
            </div>
            <div className="flex items-center">
              {renderSlashingIndicator(avs.slashingConditions.falseNegative)}
              <span className="text-sm">False Negative</span>
              <InfoTooltip content="Penalty for incorrectly approving or signing something that violates objective rules or policies" />
            </div>
          </div>

          <div className="mt-3 p-3 bg-gray-100 rounded-md">
            <p className="text-xs text-gray-600 italic">
              <strong>Note:</strong> The Permission Model and Slashing
              Conditions are critical factors in assessing an AVS's security
              profile. Whitelisted AVSs have centralized control over which
              operators can participate, while permissionless AVSs allow any
              operator meeting technical requirements. Slashing conditions
              define what behaviors trigger penalties for operators, directly
              impacting the AVS's ability to maintain security and reliability.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Filter controls
  const renderFilterControls = () => (
    <div className="mb-6">
      <div className="relative flex-grow mb-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="text"
          placeholder="Search by AVS Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center">
          <h4 className="text-sm font-semibold mr-2">Permission Model:</h4>
          <Select value={permissionFilter} onValueChange={setPermissionFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select permission model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Models</SelectItem>
              <SelectItem value="Whitelisted">Whitelisted</SelectItem>
              <SelectItem value="Permissionless">Permissionless</SelectItem>
              <SelectItem value="Hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
          <InfoTooltip content="Determines whether an AVS allows any operator to secure it (Permissionless) or restricts operators through whitelisting (Whitelisted). This affects decentralization and accessibility." />
        </div>

        <div className="flex items-center ml-4">
          <h4 className="text-sm font-semibold mr-2">Implementation Status:</h4>
          <Select
            value={implementationFilter}
            onValueChange={setImplementationFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Mainnet Active">Mainnet Active</SelectItem>
              <SelectItem value="Testnet Only">Testnet Only</SelectItem>
              <SelectItem value="Planned">Planned</SelectItem>
              <SelectItem value="Not Implemented">Not Implemented</SelectItem>
              <SelectItem value="Inherited (Ethereum)">
                Inherited (Ethereum)
              </SelectItem>
            </SelectContent>
          </Select>
          <InfoTooltip content="The current deployment stage of the AVS - Mainnet Active (live on Ethereum mainnet), Testnet Only (testing phase), Planned (in development), Not Implemented (early concept), or Inherited (using Ethereum's native mechanisms)" />
        </div>
      </div>
    </div>
  );

  // Main component render
  return (
    <div className="space-y-6">
      <Card className="bg-white p-6 rounded-lg shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold text-purple-600">
            All AVSs by Category/Type
          </CardTitle>
          <p className="text-gray-600 text-sm mt-1">
            Displaying all Actively Validated Services in the ecosystem with
            their operator permission models and slashing conditions
          </p>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6 bg-red-50 text-red-800 border-red-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important Risk Considerations</AlertTitle>
            <AlertDescription>
              AVSs implement various slashing conditions that directly impact
              the security of your staked ETH. The{' '}
              <strong>Permission Model</strong> indicates whether an AVS allows
              any operator to secure it (Permissionless) or restricts operators
              through whitelisting (Whitelisted). Different implementation
              statuses and slashing conditions affect overall risk profile.
              Always research thoroughly before restaking to an AVS.
            </AlertDescription>
          </Alert>

          <div className="bg-purple-50 p-4 rounded-lg mb-6 border border-purple-200">
            <h3 className="text-sm font-bold text-purple-800 mb-1">
              Why We Track This Information
            </h3>
            <p className="text-sm text-purple-700">
              The EigenLayer ecosystem's security depends on both{' '}
              <strong>how operators are permitted to join</strong>{' '}
              (Permissioning) and{' '}
              <strong>what penalties they face for misconduct</strong>{' '}
              (Slashing). Permissioning models range from fully permissionless
              (anyone can join) to strictly whitelisted (selected operators
              only), directly affecting decentralization. Slashing conditions
              define what behaviors result in penalties for operators, providing
              protection against malicious or negligent actions.
            </p>
          </div>

          {renderFilterControls()}

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <>
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
                        <button
                          className="flex items-center font-bold"
                          onClick={() => handleSort('avsName')}
                        >
                          AVS Name <SortIcon column="avsName" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          className="flex items-center font-bold"
                          onClick={() => handleSort('category')}
                        >
                          Category/Type <SortIcon column="category" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          className="flex items-center font-bold"
                          onClick={() => handleSort('permissionModel')}
                        >
                          Operator Permission Model{' '}
                          <SortIcon column="permissionModel" />
                        </button>
                        <InfoTooltip content="Controls which operators can secure the AVS - Whitelisted means restricted access requiring approval, Permissionless means open to all operators meeting objective criteria, Hybrid combines both approaches" />
                      </TableHead>
                      <TableHead>
                        <button
                          className="flex items-center font-bold"
                          onClick={() => handleSort('implementationStatus')}
                        >
                          Implementation Status{' '}
                          <SortIcon column="implementationStatus" />
                        </button>
                        <InfoTooltip content="The current deployment stage of the AVS - Mainnet Active (live on Ethereum mainnet), Testnet Only (testing phase), Planned (in development), Not Implemented (early concept), or Inherited (using Ethereum's native mechanisms)" />
                      </TableHead>
                      <TableHead>
                        <button
                          className="flex items-center font-bold"
                          onClick={() => handleSort('amountManaged')}
                        >
                          Amount Managed <SortIcon column="amountManaged" />
                        </button>
                        <InfoTooltip content="Total value of ETH (or equivalent) managed by this AVS, indicating its economic security and adoption" />
                      </TableHead>
                      <TableHead>
                        <span className="flex items-center font-bold">
                          Slashing Conditions
                          <InfoTooltip content="Conditions under which operator stakes can be penalized (slashed) for misconduct. Red dots indicate active slashing conditions." />
                        </span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          No AVS data found matching your filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedData.map((avs, index) => (
                        <React.Fragment key={avs.avsName}>
                          <TableRow
                            className={`border-b ${
                              avs.implementationStatus === 'Mainnet Active'
                                ? 'bg-green-50'
                                : avs.implementationStatus === 'Testnet Only'
                                  ? 'bg-blue-50'
                                  : ''
                            } hover:bg-gray-50`}
                          >
                            <TableCell className="text-center">
                              {(currentPage - 1) * itemsPerPage + index + 1}
                            </TableCell>
                            <TableCell className="text-center p-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleRowExpansion(avs.avsName)}
                                className="rounded-full p-1 h-7 w-7"
                                aria-label="Toggle details"
                              >
                                {expandedRows[avs.avsName] ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell className="font-medium">
                              {avs.avsName}
                            </TableCell>
                            <TableCell>{avs.category}</TableCell>
                            <TableCell>
                              <Badge
                                color={getPermissionColor(avs.permissionModel)}
                                text={avs.permissionModel}
                              />
                            </TableCell>
                            <TableCell>
                              <Badge
                                color={getStatusColor(avs.implementationStatus)}
                                text={avs.implementationStatus}
                              />
                            </TableCell>
                            <TableCell>
                              <span
                                className={`font-medium ${
                                  avs.amountManaged > 5000
                                    ? 'text-green-600'
                                    : avs.amountManaged > 1000
                                      ? 'text-blue-600'
                                      : 'text-gray-600'
                                }`}
                              >
                                {formatETHValue(avs.amountManaged)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                {renderSlashingIndicator(
                                  avs.slashingConditions.incorrectSig,
                                )}
                                {renderSlashingIndicator(
                                  avs.slashingConditions.doubleSigning,
                                )}
                                {renderSlashingIndicator(
                                  avs.slashingConditions.commitmentBreach,
                                )}
                                {renderSlashingIndicator(
                                  avs.slashingConditions.inactivity,
                                )}
                                {renderSlashingIndicator(
                                  avs.slashingConditions.dkgMalice,
                                )}
                                {renderSlashingIndicator(
                                  avs.slashingConditions.failureToSettle,
                                )}
                                {renderSlashingIndicator(
                                  avs.slashingConditions.falseNegative,
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                          {expandedRows[avs.avsName] && (
                            <TableRow className="bg-gray-50">
                              <TableCell colSpan={8} className="p-0">
                                {renderExpandedDetails(avs)}
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                    {Math.min(
                      currentPage * itemsPerPage,
                      filteredAndSortedData.length,
                    )}{' '}
                    of {filteredAndSortedData.length} entries
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center text-sm">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AVSOverview;
