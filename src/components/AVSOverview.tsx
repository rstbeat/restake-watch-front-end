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
  Layers,
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
  // First, normalize line endings
  const normalizedText = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  const result: string[][] = [];
  let row: string[] = [];
  let currentField = '';
  let inQuotes = false;

  // Process one character at a time
  for (let i = 0; i < normalizedText.length; i++) {
    const char = normalizedText[i];
    const nextChar = i < normalizedText.length - 1 ? normalizedText[i + 1] : '';

    // Handle quotes
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Double quotes inside quotes are escaped quotes
        currentField += '"';
        i++; // Skip the next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    }
    // Handle commas
    else if (char === ',' && !inQuotes) {
      row.push(currentField.trim());
      currentField = '';
    }
    // Handle line breaks
    else if (char === '\n' && !inQuotes) {
      row.push(currentField.trim());
      if (row.length > 0) {
        result.push(row);
      }
      row = [];
      currentField = '';
    }
    // Regular character
    else {
      currentField += char;
    }
  }

  // Handle the last field and row
  if (currentField || row.length > 0) {
    if (currentField) {
      row.push(currentField.trim());
    }
    if (row.length > 0) {
      result.push(row);
    }
  }

  return result;
};

// Helper function to convert string to boolean
const stringToBoolean = (value: string): boolean => {
  return value?.toLowerCase()?.trim() === 'true';
};

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
            penaltyDetails:
              'No specific slashing information found. Penalties would likely use EigenLayer mechanism.',
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

  // Check if all slashing conditions are null/undefined/empty or not found
  const hasNoSlashingInfo = (avs: AVSData): boolean => {
    // Check if penalty details mentions "No specific slashing information found"
    if (
      avs.slashingPenaltyDetails.includes(
        'No specific slashing information found',
      ) ||
      avs.slashingPenaltyDetails === 'N/A'
    ) {
      return true;
    }

    // Check if there's empty data in the notes
    if (
      avs.slashingNotes.includes('No additional slashing notes available') ||
      avs.slashingNotes.includes('No slashing information available')
    ) {
      // Only return true if all conditions are also false
      const conditions = avs.slashingConditions;
      return (
        !conditions.incorrectSig &&
        !conditions.doubleSigning &&
        !conditions.commitmentBreach &&
        !conditions.inactivity &&
        !conditions.dkgMalice &&
        !conditions.failureToSettle &&
        !conditions.falseNegative
      );
    }

    // If all values are empty strings or false in the CSV, then there's no slashing info
    return (
      Object.values(avs.slashingConditions).every((val) => val === false) &&
      // Additional check to ensure we're not incorrectly flagging AVSs with real info
      !avs.slashingPenaltyDetails.includes('Slashing') &&
      !avs.slashingPenaltyDetails.includes('slashing') &&
      !avs.slashingPenaltyDetails.includes('penalty') &&
      !avs.slashingPenaltyDetails.includes('Penalty')
    );
  };

  // Render expanded detail row
  const renderExpandedDetails = (avs: AVSData): React.ReactNode => {
    return (
      <div className="p-4 border-t-2 border-purple-200">
        <div className="text-sm">
          <h4 className="font-semibold mb-3 text-purple-700 flex items-center">
            <Info className="h-4 w-4 mr-2" />
            AVS Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
              <h5 className="font-medium text-gray-800 mb-2 border-b pb-2">
                Specific Mechanism/Requirements
              </h5>
              <p className="py-1">{avs.specificMechanism}</p>
            </div>

            <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
              <h5 className="font-medium text-gray-800 mb-2 border-b pb-2">
                Notable Changes
              </h5>
              <p className="py-1">{avs.notableChanges}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
              <h5 className="font-medium text-gray-800 mb-2 border-b pb-2">
                Slashing Penalty Details
              </h5>
              {avs.slashingPenaltyDetails.includes(
                'No specific slashing information found',
              ) ? (
                <div className="py-2 text-center">
                  <span className="text-xs italic text-amber-700 bg-amber-50 border border-amber-200 p-1.5 rounded flex items-center justify-center">
                    <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                    No specific slashing information available for this AVS
                  </span>
                </div>
              ) : (
                <p className="py-1">{avs.slashingPenaltyDetails}</p>
              )}
            </div>

            <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
              <h5 className="font-medium text-gray-800 mb-2 border-b pb-2">
                Notes
              </h5>
              <p className="py-1">{avs.slashingNotes}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
            <h5 className="font-medium text-gray-800 mb-2 border-b pb-2">
              All Slashing Conditions
            </h5>
            {hasNoSlashingInfo(avs) ? (
              <div className="py-4 text-center">
                <span className="text-sm italic text-gray-600 bg-gray-100 p-2 rounded">
                  No specific slashing information available
                </span>
                <p className="mt-2 text-xs text-gray-500">
                  This AVS either has no documented slashing conditions or we
                  were unable to find information about them.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                <div className="flex items-center">
                  {renderSlashingIndicator(avs.slashingConditions.incorrectSig)}
                  <span className="text-sm">Incorrect Signatures</span>
                  <InfoTooltip content="Penalty for signing incorrect or invalid data, proofs, attestations, or checkpoints" />
                </div>
                <div className="flex items-center">
                  {renderSlashingIndicator(
                    avs.slashingConditions.doubleSigning,
                  )}
                  <span className="text-sm">Double Signing</span>
                  <InfoTooltip content="Penalty for signing two different blocks or messages for the same slot or task" />
                </div>
                <div className="flex items-center">
                  {renderSlashingIndicator(
                    avs.slashingConditions.commitmentBreach,
                  )}
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
                  {renderSlashingIndicator(
                    avs.slashingConditions.failureToSettle,
                  )}
                  <span className="text-sm">Failure to Settle</span>
                  <InfoTooltip content="Penalty for failing to settle transaction batches or preconfirmations on Layer 1" />
                </div>
                <div className="flex items-center">
                  {renderSlashingIndicator(
                    avs.slashingConditions.falseNegative,
                  )}
                  <span className="text-sm">False Negative</span>
                  <InfoTooltip content="Penalty for incorrectly approving or signing something that violates objective rules or policies" />
                </div>
              </div>
            )}
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

      <div className="flex flex-wrap gap-3 mb-4 justify-between">
        <div className="flex items-center">
          <h4 className="text-sm font-semibold mr-2">Permission Model:</h4>
          <Button
            variant={permissionFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPermissionFilter('all')}
            className="text-xs"
          >
            All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPermissionFilter('Whitelisted')}
            className={`text-xs ${permissionFilter === 'Whitelisted' ? 'bg-purple-100 border-purple-300 hover:bg-purple-200' : ''}`}
          >
            Whitelisted
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPermissionFilter('Permissionless')}
            className={`text-xs ${permissionFilter === 'Permissionless' ? 'bg-green-100 border-green-300 hover:bg-green-200' : ''}`}
          >
            Permissionless
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPermissionFilter('Hybrid')}
            className={`text-xs ${permissionFilter === 'Hybrid' ? 'bg-blue-100 border-blue-300 hover:bg-blue-200' : ''}`}
          >
            Hybrid
          </Button>
          <InfoTooltip content="Determines whether an AVS allows any operator to secure it (Permissionless) or restricts operators through whitelisting (Whitelisted). This affects decentralization and accessibility." />
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <ExternalLink className="h-4 w-4 mr-1 text-purple-600" />
          <a
            href="https://signal.me/#eu/espejelomar.01"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-purple-700 transition-colors"
          >
            Need data export? Contact us on Signal
          </a>
        </div>
      </div>

      <div className="flex items-center">
        <h4 className="text-sm font-semibold mr-2">
          Slashing Implementation Status:
        </h4>
        <Button
          variant={implementationFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setImplementationFilter('all')}
          className="text-xs"
        >
          All
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setImplementationFilter('Mainnet Active')}
          className={`text-xs ${implementationFilter === 'Mainnet Active' ? 'bg-green-100 border-green-300 hover:bg-green-200' : ''}`}
        >
          Mainnet Active
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setImplementationFilter('Testnet Only')}
          className={`text-xs ${implementationFilter === 'Testnet Only' ? 'bg-blue-100 border-blue-300 hover:bg-blue-200' : ''}`}
        >
          Testnet Only
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setImplementationFilter('Planned')}
          className={`text-xs ${implementationFilter === 'Planned' ? 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200' : ''}`}
        >
          Planned
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setImplementationFilter('Not Implemented')}
          className={`text-xs ${implementationFilter === 'Not Implemented' ? 'bg-gray-100 border-gray-300 hover:bg-gray-200' : ''}`}
        >
          Not Implemented
        </Button>
        <InfoTooltip content="The current deployment stage of the slashing mechanism - Mainnet Active (live on Ethereum mainnet), Testnet Only (testing phase), Planned (in development), Not Implemented (early concept), or Inherited (using Ethereum's native mechanisms)" />
      </div>
    </div>
  );

  // Main component render
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg mt-8 shadow-md">
        <h2 className="text-xl font-semibold mb-2 text-gray-800 flex items-center">
          <div className="mr-3">
            <StyledIcon
              icon={<Layers className="h-4 w-4" />}
              gradientColors={['#8b5cf6', '#d946ef']}
              size="h-9 w-9"
            />
          </div>
          All AVSs
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Displaying all Actively Validated Services in the ecosystem with their
          operator permission models and slashing conditions
        </p>

        <div className="flex flex-col gap-4 mb-6">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="text-red-700 font-medium flex items-center mb-2">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Slashing Conditions
            </h3>
            <p className="text-red-700 mb-2">
              AVSs implement various slashing conditions that directly impact
              the security of your staked ETH
            </p>
            <p className="text-sm text-red-600">
              Different slashing conditions and implementation statuses affect
              the overall risk profile. Always research thoroughly before
              restaking to an AVS.
            </p>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h3 className="text-amber-700 font-medium flex items-center mb-2">
              <Info className="h-4 w-4 mr-2" />
              Permission Model
            </h3>
            <p className="text-amber-700 mb-2">
              The Permission Model indicates whether an AVS allows any operator
              to secure it (Permissionless) or restricts operators through
              whitelisting (Whitelisted)
            </p>
            <p className="text-sm text-amber-600">
              Different slashing implementation statuses and permission models
              directly affect an AVS's decentralization and accessibility.
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h3 className="text-purple-700 font-medium flex items-center mb-2">
              <Layers className="h-4 w-4 mr-2" />
              EigenLayer Ecosystem Security
            </h3>
            <p className="text-purple-700 mb-2">
              The EigenLayer ecosystem's security depends on both how operators
              are permitted to join (Permissioning) and what penalties they face
              for misconduct (Slashing)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              <div className="text-sm text-purple-600 bg-purple-100 p-2 rounded">
                <span className="font-medium">Permissioning models</span> range
                from fully permissionless (anyone can join) to strictly
                whitelisted (selected operators only), directly affecting
                decentralization
              </div>
              <div className="text-sm text-purple-600 bg-purple-100 p-2 rounded">
                <span className="font-medium">Slashing mechanisms</span> define
                what behaviors result in penalties for operators, with varying
                implementation status from active to planned deployment
              </div>
            </div>
          </div>
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
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('avsName')}
                        className="font-semibold"
                      >
                        AVS Name
                        <SortIcon column="avsName" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('category')}
                        className="font-semibold"
                      >
                        Category/Type
                        <SortIcon column="category" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('permissionModel')}
                        className="font-semibold"
                      >
                        Operator Permission Model
                        <SortIcon column="permissionModel" />
                      </Button>
                      <InfoTooltip content="Controls which operators can secure the AVS - Whitelisted means restricted access requiring approval, Permissionless means open to all operators meeting objective criteria, Hybrid combines both approaches" />
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('implementationStatus')}
                        className="font-semibold"
                      >
                        Slashing Implementation Status
                        <SortIcon column="implementationStatus" />
                      </Button>
                      <InfoTooltip content="The current deployment stage of the slashing mechanism - Mainnet Active (live on Ethereum mainnet), Testnet Only (testing phase), Planned (in development), Not Implemented (early concept), or Inherited (using Ethereum's native mechanisms)" />
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('amountManaged')}
                        className="font-semibold"
                      >
                        Amount Managed
                        <SortIcon column="amountManaged" />
                      </Button>
                      <InfoTooltip content="Total value of ETH (or equivalent) managed by this AVS, indicating its economic security and adoption" />
                    </TableHead>
                    <TableHead>
                      <span className="font-semibold">Slashing Conditions</span>
                      <InfoTooltip content="Conditions under which operator stakes can be penalized (slashed) for misconduct. Red dots indicate active slashing conditions." />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex flex-col items-center">
                          <p className="text-gray-500 mb-2">
                            No AVS data found matching your filters
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSearchTerm('');
                              setPermissionFilter('all');
                              setImplementationFilter('all');
                            }}
                          >
                            Clear All Filters
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((avs, index) => (
                      <React.Fragment key={avs.avsName}>
                        <TableRow
                          className={`hover:bg-gray-50 transition-colors
                            ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                            ${expandedRows[avs.avsName] ? 'border-b-0' : ''}`}
                        >
                          <TableCell className="font-semibold text-center">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRowExpansion(avs.avsName)}
                              className="p-1 h-8 w-8 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-700 hover:text-purple-800 transition-colors border border-purple-200"
                              title="Click for details"
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
                            {hasNoSlashingInfo(avs) ? (
                              <span className="text-xs italic text-gray-600 bg-gray-100 p-1 rounded">
                                No specific slashing information available
                              </span>
                            ) : (
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
                            )}
                          </TableCell>
                        </TableRow>
                        {expandedRows[avs.avsName] && (
                          <TableRow className="bg-purple-50 border-t-0">
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

            <div className="mt-4 flex items-center justify-between">
              <div>
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(
                  currentPage * itemsPerPage,
                  filteredAndSortedData.length,
                )}{' '}
                of {filteredAndSortedData.length} AVSs
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="text-sm px-3 py-1 bg-gray-100 rounded-md">
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
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="font-medium mb-2">AVS risk assessment guide:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Permissioning models:</strong> Whitelisted AVSs have
                  centralized control over which operators can participate,
                  while permissionless AVSs allow any operator meeting technical
                  requirements.
                </li>
                <li>
                  <strong>Slashing implementation status:</strong> Indicates
                  maturity level of slashing mechanisms. Mainnet active slashing
                  has undergone more testing but may have higher stakes at risk.
                </li>
                <li>
                  <strong>Slashing conditions:</strong> Define what behaviors
                  trigger penalties, impacting the AVS's security and
                  reliability.
                </li>
                <li>
                  <strong>Risk assessment:</strong> Consider all three factors
                  when evaluating an AVS's overall risk profile and suitability
                  for your restaking strategy.
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AVSOverview;
