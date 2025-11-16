import React from 'react';
import { cn } from '@/v0/lib/utils';

export interface V0CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const V0Card: React.FC<V0CardProps> = ({ className, children, ...props }) => {
  return (
    <div className={cn('v0-card', className)} {...props}>
      {children}
    </div>
  );
};

export interface V0CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const V0CardHeader: React.FC<V0CardHeaderProps> = ({ className, children, ...props }) => {
  return (
    <div className={cn('v0-card-header', className)} {...props}>
      {children}
    </div>
  );
};

export interface V0CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export const V0CardTitle: React.FC<V0CardTitleProps> = ({ className, children, ...props }) => {
  return (
    <h3 className={cn('v0-card-title', className)} {...props}>
      {children}
    </h3>
  );
};

export interface V0CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export const V0CardDescription: React.FC<V0CardDescriptionProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <p className={cn('v0-card-description', className)} {...props}>
      {children}
    </p>
  );
};

export interface V0CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const V0CardContent: React.FC<V0CardContentProps> = ({ className, children, ...props }) => {
  return (
    <div className={cn('v0-card-content', className)} {...props}>
      {children}
    </div>
  );
};

export interface V0CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const V0CardFooter: React.FC<V0CardFooterProps> = ({ className, children, ...props }) => {
  return (
    <div className={cn('v0-card-footer', className)} {...props}>
      {children}
    </div>
  );
};
