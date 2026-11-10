import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './Card';

export const ChartCard = ({
  title,
  subtitle,
  actions,
  children,
  className = '',
  height = 'h-64',
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          {subtitle && <CardDescription>{subtitle}</CardDescription>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </CardHeader>
      <CardContent className="pt-4">
        <div className={`w-full ${height} flex items-center justify-center`}>
          {children}
        </div>
      </CardContent>
    </Card>
  );
};
