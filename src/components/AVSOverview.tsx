import React from 'react';
import { Card, CardContent } from './ui/card';

const AVSOverview: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="bg-white p-6 rounded-lg shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h2 className="text-2xl font-bold mb-4 text-purple-600">
              AVS Overview Coming Soon
            </h2>
            <p className="text-gray-600 max-w-md">
              We're currently working on implementing the AVS Overview feature.
              Check back soon for detailed information about Actively Validated
              Services in the EigenLayer ecosystem.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AVSOverview;
