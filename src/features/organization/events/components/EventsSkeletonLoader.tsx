import { Skeleton } from "@/components/ui/skeleton";

export function EventsSkeletonLoader() {
  return (
    <div className="space-y-4">
      {Array(3)
        .fill(0)
        .map((_, index) => (
          <div key={index} className="rounded-lg border shadow-sm">
            <div className="p-4">
              <div className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                  <Skeleton className="h-6 w-40 mb-2" />
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-4 mr-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
              <div className="pt-4 grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <Skeleton className="h-4 w-4 mr-2" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                    <div className="flex items-start">
                      <Skeleton className="h-4 w-4 mr-2" />
                      <div className="flex flex-col space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-36" />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center">
                      <Skeleton className="h-4 w-4 mr-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Skeleton className="h-9 w-32 rounded-md" />
                      <Skeleton className="h-9 w-32 rounded-md" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
