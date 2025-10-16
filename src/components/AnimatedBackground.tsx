'use client';

import React from 'react';

const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none bg-white" style={{ zIndex: -1 }}>
      {/* Line 1 */}
      <div 
        className="absolute top-0 left-0 rounded-full"
        style={{
          width: '600px',
          height: '2px',
          background: 'linear-gradient(90deg, #ab3bd2, #d946ef)',
          opacity: 0.25,
          animation: 'float1 20s ease-in-out infinite'
        }}
      />
      
      {/* Line 2 */}
      <div 
        className="absolute top-1/4 right-0 rounded-full"
        style={{
          width: '1px',
          height: '600px',
          background: 'linear-gradient(180deg, #c77de8, #8b5cf6)',
          opacity: 0.25,
          animation: 'float2 25s ease-in-out infinite'
        }}
      />
      
      {/* Line 3 */}
      <div 
        className="absolute bottom-1/4 left-1/4 rounded-full"
        style={{
          width: '500px',
          height: '1px',
          background: 'linear-gradient(90deg, #ec4899, #ab3bd2)',
          opacity: 0.25,
          animation: 'float3 18s ease-in-out infinite'
        }}
      />
      
      {/* Line 4 - Nueva línea diagonal */}
      <div 
        className="absolute top-1/3 left-1/2 rounded-full"
        style={{
          width: '600px',
          height: '1px',
          background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
          opacity: 0.2,
          animation: 'float1 22s ease-in-out infinite',
          transform: 'rotate(-45deg)'
        }}
      />
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 via-transparent to-pink-100/20" />
    </div>
  );
};

export default AnimatedBackground;

