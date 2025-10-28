import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  className?: string;
  iconClassName?: string;
  children?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title = "No data found",
  description,
  className,
  iconClassName,
  children,
}) => {
  return (
    <div className={cn("text-center py-8", className)}>
      {Icon && (
        <Icon className={cn("h-8 w-8 mx-auto mb-3 opacity-50", iconClassName)} />
      )}
      <p className="text-sm font-medium mb-1">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {children}
    </div>
  );
};

export const TableEmptyState: React.FC<{ colSpan: number; message?: string }> = ({
  colSpan,
  message = "No data found"
}) => {
  return (
    <tr>
      <td colSpan={colSpan} className="text-center py-8 text-muted-foreground">
        {message}
      </td>
    </tr>
  );
};

export const CardEmptyState: React.FC<EmptyStateProps> = (props) => {
  return (
    <div className="p-6">
      <EmptyState {...props} />
    </div>
  );
};