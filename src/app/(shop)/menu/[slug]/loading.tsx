export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2 mb-8">
          <div className="h-4 w-12 bg-muted rounded animate-pulse" />
          <div className="h-4 w-4 bg-muted rounded animate-pulse" />
          <div className="h-4 w-10 bg-muted rounded animate-pulse" />
          <div className="h-4 w-4 bg-muted rounded animate-pulse" />
          <div className="h-4 w-20 bg-muted rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-8 lg:gap-12">
          {/* Left column - Image gallery skeleton */}
          <div className="space-y-4">
            <div className="aspect-[4/3] bg-muted rounded-2xl animate-pulse" />
            <div className="flex gap-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 w-20 bg-muted rounded-xl animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Right column - Content skeleton */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="h-6 w-24 bg-muted rounded-full animate-pulse" />
              <div className="h-8 w-48 bg-muted rounded animate-pulse" />
              <div className="flex items-center gap-4">
                <div className="h-10 w-20 bg-muted rounded animate-pulse" />
                <div className="h-6 w-16 bg-muted rounded animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
            </div>

            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-20 bg-muted rounded-full animate-pulse"
                />
              ))}
            </div>

            <div className="space-y-3">
              <div className="h-5 w-32 bg-muted rounded animate-pulse" />
              <div className="grid grid-cols-3 gap-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-24 bg-muted rounded-xl animate-pulse"
                  />
                ))}
              </div>
            </div>

            <div className="h-12 w-full bg-muted rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
