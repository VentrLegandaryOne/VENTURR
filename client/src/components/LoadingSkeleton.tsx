/**
 * Loading Skeleton Components
 * Provides skeleton screens for better perceived performance during data loading
 */

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full space-y-3">
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-4 bg-gray-200 rounded animate-pulse flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {[1, 2, 3, 4].map((j) => (
            <div key={j} className="h-4 bg-gray-100 rounded animate-pulse flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-100 rounded animate-pulse" />
        <div className="h-4 bg-gray-100 rounded animate-pulse w-5/6" />
      </div>
      <div className="flex gap-2">
        <div className="h-9 bg-gray-200 rounded animate-pulse w-20" />
        <div className="h-9 bg-gray-200 rounded animate-pulse w-20" />
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
          <div className="h-10 bg-gray-100 rounded animate-pulse" />
        </div>
      ))}
      <div className="h-10 bg-gray-200 rounded animate-pulse w-32" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-1/4" />
        <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
      </div>
      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      {/* Table */}
      <TableSkeleton />
    </div>
  );
}

