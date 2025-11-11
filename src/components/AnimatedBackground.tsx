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
        className="absolute top-[15%] right-[5%] rounded-full"
        style={{
          width: '2px',
          height: '600px',
          background: 'linear-gradient(180deg, #c77de8, #8b5cf6)',
          opacity: 0.25,
          animation: 'float2 25s ease-in-out infinite'
        }}
      />
      
      {/* Line 3 */}
      <div 
        className="absolute bottom-[20%] left-[10%] rounded-full"
        style={{
          width: '500px',
          height: '2px',
          background: 'linear-gradient(90deg, #ec4899, #ab3bd2)',
          opacity: 0.25,
          animation: 'float3 18s ease-in-out infinite'
        }}
      />
      
      {/* Line 4 - Nueva línea diagonal */}
      <div 
        className="absolute top-[40%] left-[60%] rounded-full"
        style={{
          width: '600px',
          height: '2px',
          background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
          opacity: 0.2,
          animation: 'float1 22s ease-in-out infinite',
          transform: 'rotate(-45deg)'
        }}
      />
      
      {/* Line 5 - Horizontal en el centro */}
      <div 
        className="absolute top-[55%] left-0 rounded-full"
        style={{
          width: '700px',
          height: '2px',
          background: 'linear-gradient(90deg, #ab3bd2, #c77de8)',
          opacity: 0.3,
          animation: 'float2 28s ease-in-out infinite'
        }}
      />
      
      {/* Line 6 - Vertical en la izquierda */}
      <div 
        className="absolute top-0 left-[25%] rounded-full"
        style={{
          width: '2px',
          height: '500px',
          background: 'linear-gradient(180deg, #d946ef, #ab3bd2)',
          opacity: 0.25,
          animation: 'float3 24s ease-in-out infinite'
        }}
      />
      
      {/* Line 7 - Diagonal invertida */}
      <div 
        className="absolute bottom-[35%] right-[40%] rounded-full"
        style={{
          width: '550px',
          height: '2px',
          background: 'linear-gradient(90deg, #ec4899, #8b5cf6)',
          opacity: 0.25,
          animation: 'float1 26s ease-in-out infinite',
          transform: 'rotate(45deg)'
        }}
      />
      
      {/* Line 8 - Horizontal inferior */}
      <div 
        className="absolute bottom-[18%] right-0 rounded-full"
        style={{
          width: '650px',
          height: '2px',
          background: 'linear-gradient(270deg, #c77de8, #ec4899)',
          opacity: 0.3,
          animation: 'float3 30s ease-in-out infinite'
        }}
      />
      
      {/* Line 9 - Diagonal con azul (secundario) */}
      <div 
        className="absolute top-[28%] left-[45%] rounded-full"
        style={{
          width: '550px',
          height: '2px',
          background: 'linear-gradient(120deg, #3b82f6, #8b5cf6)',
          opacity: 0.25,
          animation: 'float2 27s ease-in-out infinite',
          transform: 'rotate(-30deg)'
        }}
      />
      
      {/* Line 10 - Horizontal con cyan (acento) */}
      <div 
        className="absolute top-[70%] left-[15%] rounded-full"
        style={{
          width: '600px',
          height: '2px',
          background: 'linear-gradient(90deg, #06b6d4, #3b82f6)',
          opacity: 0.25,
          animation: 'float1 23s ease-in-out infinite'
        }}
      />
      
      {/* Line 11 - Vertical derecha */}
      <div 
        className="absolute top-[30%] right-[20%] rounded-full"
        style={{
          width: '2px',
          height: '550px',
          background: 'linear-gradient(180deg, #ab3bd2, #06b6d4)',
          opacity: 0.25,
          animation: 'float3 29s ease-in-out infinite'
        }}
      />
      
      {/* Line 12 - Diagonal con transición completa de colores */}
      <div 
        className="absolute bottom-[45%] left-[55%] rounded-full"
        style={{
          width: '700px',
          height: '2px',
          background: 'linear-gradient(135deg, #ec4899, #ab3bd2, #3b82f6)',
          opacity: 0.3,
          animation: 'float2 32s ease-in-out infinite',
          transform: 'rotate(60deg)'
        }}
      />
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 via-transparent to-pink-100/20" />
    </div>
  );
};

export default AnimatedBackground;

