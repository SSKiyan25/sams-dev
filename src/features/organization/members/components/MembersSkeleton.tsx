import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MembersSkeleton() {
  // Create an array of 9 items for the grid
  const items = Array.from({ length: 9 }, (_, i) => i);

  return (
    <div className="space-y-6">
      {/* Premium header skeleton */}
      <div className="bg-gradient-to-br from-gray-100 via-blue-100 to-indigo-100 dark:from-gray-800 dark:via-blue-900/30 dark:to-indigo-900/30 rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
          <div className="space-y-3">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-80" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-11 w-32" />
            <Skeleton className="h-11 w-32" />
            <Skeleton className="h-11 w-32" />
          </div>
        </div>
      </div>

      {/* Premium search and filter skeleton */}
      <div className="bg-gradient-to-r from-gray-100/80 via-blue-100/80 to-indigo-100/80 dark:from-gray-800/50 dark:via-blue-900/30 dark:to-indigo-900/30 rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg space-y-5">
        <div className="space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-11 w-full" />
        </div>
        <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-11 w-44" />
            <Skeleton className="h-11 w-32" />
          </div>
          <Skeleton className="h-11 w-44" />
        </div>
      </div>

      {/* Results section skeleton */}
      <div className="space-y-4">
        {/* Results count skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Premium card grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card key={item} className="border-blue-200/60 dark:border-blue-700/60 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-blue-950/20 dark:to-indigo-950/20 overflow-hidden h-full flex flex-col shadow-lg">
              <CardContent className="p-0 flex flex-col flex-grow">
                {/* Member header skeleton */}
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-14 w-14 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-5 w-20" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Member details skeleton */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-lg" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-lg" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-lg" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Spacer */}
                <div className="flex-grow min-h-[10px]"></div>

                {/* Action buttons skeleton */}
                <div className="flex border-t border-blue-200/50 dark:border-blue-700/50 mt-auto">
                  <Skeleton className="h-12 w-1/2 rounded-none" />
                  <Skeleton className="h-12 w-1/2 rounded-none" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Premium pagination skeleton */}
        <div className="flex justify-center mt-8">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg p-2">
            <div className="flex items-center gap-1">
              <Skeleton className="h-10 w-10 rounded" />
              <Skeleton className="h-10 w-10 rounded" />
              <Skeleton className="h-10 w-10 rounded" />
              <Skeleton className="h-10 w-10 rounded" />
              <Skeleton className="h-10 w-10 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
