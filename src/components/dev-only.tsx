import React from 'react';
import { Card } from './card';
import { Muted } from './ui/typography';

/**
 * Renders children only in development mode (when import.meta.env.DEV is true).
 */
const DevOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!import.meta.env.DEV) return null;
  return (
    <Card>
      <Muted className="text-xs italic">Dev-mode only</Muted>
      {children}
    </Card>
  );
};

export default DevOnly;
