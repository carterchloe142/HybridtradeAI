import React from 'react';

const SkeletonCard = ({ className = "" }: { className?: string }) => (
  <div className={`glass p-4 rounded-xl animate-pulse ${className}`}>
    <div className="flex justify-between items-center mb-2">
      <div className="h-4 bg-muted/50 rounded w-1/3"></div>
      <div className="h-4 w-4 bg-muted/50 rounded-full"></div>
    </div>
    <div className="h-8 bg-muted/50 rounded w-2/3 mb-2"></div>
    <div className="h-3 bg-muted/30 rounded w-1/2"></div>
  </div>
);

const SkeletonChart = ({ className = "" }: { className?: string }) => (
  <div className={`glass p-4 rounded-xl animate-pulse ${className}`}>
    <div className="flex justify-between items-center mb-4">
      <div className="h-6 bg-muted/50 rounded w-1/4"></div>
      <div className="flex gap-2">
        <div className="h-6 w-16 bg-muted/30 rounded"></div>
        <div className="h-6 w-16 bg-muted/30 rounded"></div>
      </div>
    </div>
    <div className="h-64 bg-muted/20 rounded w-full"></div>
  </div>
);

const SkeletonList = ({ count = 5, className = "" }: { count?: number, className?: string }) => (
  <div className={`glass p-4 rounded-xl animate-pulse ${className}`}>
    <div className="h-6 bg-muted/50 rounded w-1/3 mb-4"></div>
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex justify-between items-center">
          <div className="h-4 bg-muted/30 rounded w-1/2"></div>
          <div className="h-4 bg-muted/30 rounded w-1/4"></div>
        </div>
      ))}
    </div>
  </div>
);

export default function DashboardSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Ticker Skeleton */}
      <div className="h-10 bg-muted/20 rounded-lg animate-pulse w-full mb-4"></div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Performance Chart Area */}
        <div className="lg:col-span-2">
          <SkeletonChart />
        </div>
        {/* Insights/Feed Area */}
        <div>
          <SkeletonList count={6} />
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SkeletonList count={4} />
        <SkeletonList count={4} />
      </div>
    </div>
  );
}
