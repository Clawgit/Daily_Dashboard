import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', glow = false }) => {
  return (
    <div
      className={`glass-panel rounded-2xl transition-all duration-300 relative overflow-hidden ${
        glow ? 'glass-panel-glow shadow-cyan-950/20' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

