'use client';

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { FileText, Calendar, ExternalLink } from 'lucide-react';
import Link from 'next/link';

// Styled icon component for consistent styling
const StyledIcon: React.FC<{
  icon: React.ReactNode;
  gradientColors: string[];
  size?: string;
}> = ({ icon, gradientColors, size = 'h-6 w-6' }) => {
  return (
    <div
      className={`flex items-center justify-center rounded-full p-2 ${size} shrink-0`}
      style={{
        background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
        boxShadow: `0 2px 4px rgba(0, 0, 0, 0.1)`,
      }}
    >
      <div className="text-white">{icon}</div>
    </div>
  );
};

// Publication item component for displaying each publication
const PublicationItem: React.FC<{
  title: string;
  authors: string;
  date: string;
  url: string;
}> = ({ title, authors, date, url }) => (
  <div className="p-4 border border-purple-100 rounded-md hover:bg-purple-50 transition-all duration-300 transform hover:-translate-y-1 hover:border-purple-300 hover:shadow-md">
    <a href={url} target="_blank" rel="noopener noreferrer" className="block">
      <h4 className="text-md font-semibold text-[#1a202c] flex items-center">
        {title}
        <ExternalLink className="ml-2 h-3 w-3 text-gray-400" />
      </h4>
      <div className="flex items-center mt-2 text-xs text-gray-500">
        <Calendar className="h-3 w-3 mr-1" />
        <span>{date}</span>
        <span className="mx-2">•</span>
        <span>By {authors}</span>
      </div>
    </a>
  </div>
);

export default function Publications() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl mb-2">
          Publications
        </h1>
        <p className="text-gray-600">
          Research papers and publications by the Restake Watch team
        </p>
      </div>
      
      <Card className="overflow-hidden border-none shadow-lg mb-8">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 pb-6">
          <div className="flex items-center">
            <StyledIcon
              icon={<FileText className="h-3 w-3" />}
              gradientColors={['#3b82f6', '#06b6d4']}
              size="h-7 w-7"
            />
            <h2 className="text-xl font-semibold text-[#1a202c] ml-2">
              Team Publications
            </h2>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            In-depth research and analysis on the restaking ecosystem
          </p>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-4">
            <PublicationItem
              title="Fortify or Falter: A Comprehensive Restaking Risk Assessment"
              authors="Omar Espejel"
              date="February 2025"
              url="https://hackmd.io/@espejelomar/H14XiPt51g"
            />
            <PublicationItem
              title="Mirroring Risks: Lessons from Mainstream Finance in the Restaking Framework"
              authors="Fabricio Mendoza, Omar Espejel"
              date="November 2024"
              url="https://drive.proton.me/urls/58SJCC8N3C#luXJeS5zVfAM"
            />
            <PublicationItem
              title="A Hitchhiker's Guide to Restaking and Its Risks"
              authors="Omar Espejel"
              date="July 2024"
              url="https://hackmd.io/@espejelomar/BkgcuG4MR"
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-center mt-8">
        <Link 
          href="/"
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-md hover:from-purple-600 hover:to-purple-700 shadow-sm hover:shadow-md transition-all duration-200"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
} 