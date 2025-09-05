import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AttendanceListSkeleton() {
  return (
    <Card>
      <CardHeader className="pt-4 px-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between border-b">
        <Skeleton className="h-7 w-48" />
        <div className="flex flex-wrap items-center gap-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {Array(10)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2 sm:mt-0 sm:self-center">
                    <Skeleton className="h-7 w-24" />
                    <Skeleton className="h-7 w-24" />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
