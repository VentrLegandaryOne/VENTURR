/**
 * Lightweight loading skeleton shown during initial app load
 * This renders immediately while JS bundles are loading
 */
export function AppLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100">
      {/* Header skeleton */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo skeleton */}
          <div className="h-8 w-32 animate-pulse rounded bg-gray-200"></div>
          
          {/* Nav skeleton */}
          <div className="hidden gap-6 md:flex">
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
          </div>
          
          {/* Button skeleton */}
          <div className="h-10 w-32 animate-pulse rounded-lg bg-blue-200"></div>
        </div>
      </div>
      
      {/* Content skeleton */}
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Hero text skeleton */}
          <div className="space-y-4 text-center">
            <div className="mx-auto h-12 w-3/4 animate-pulse rounded bg-gray-200"></div>
            <div className="mx-auto h-8 w-2/3 animate-pulse rounded bg-gray-200"></div>
            <div className="mx-auto h-6 w-1/2 animate-pulse rounded bg-gray-200"></div>
          </div>
          
          {/* Cards skeleton */}
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="space-y-4">
                  <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200"></div>
                  <div className="h-6 w-32 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
