import React from 'react';

interface Thresholds {
  min: number;
  max: number;
  green: number;
  yellow: number;
}

const getStatusColor = (value: number, thresholds: Thresholds): string => {
  if (value <= thresholds.green) return 'bg-green-500';
  if (value <= thresholds.yellow) return 'bg-yellow-500';
  return 'bg-red-500';
};

interface MetricCardProps {
  title: string;
  value: number | null;
  thresholds: Thresholds;
  format?: (v: number | null) => string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  thresholds,
  format = (v) => v?.toString() ?? 'N/A',
}) => {
  const statusColor =
    value !== null ? getStatusColor(value, thresholds) : 'bg-gray-300';
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">{title}</h3>
      <div className="flex items-center justify-between">
        <span className="text-3xl font-bold text-gray-900">
          {format(value)}
        </span>
        <div className={`w-4 h-4 rounded-full ${statusColor}`}></div>
      </div>
    </div>
  );
};

export default MetricCard;
