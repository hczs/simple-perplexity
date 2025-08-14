import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ToolCallSkeletonProps {
  toolType?: "search" | "time" | "generic";
}

export function ToolCallSkeleton({
  toolType = "generic",
}: ToolCallSkeletonProps) {
  const getIcon = () => {
    switch (toolType) {
      case "search":
        return "🔍";
      case "time":
        return "🕐";
      default:
        return "⚙️";
    }
  };

  return (
    <div className="flex justify-start w-full mb-3">
      <div className="max-w-[80%] mr-auto">
        <Card className="bg-accent/50 border-accent">
          <CardContent className="p-3">
            <div className="flex items-center space-x-3">
              {/* Tool icon */}
              <div className="flex-shrink-0">
                <span className="text-lg opacity-60">{getIcon()}</span>
              </div>

              {/* Tool status content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-32" />

                  {/* Enhanced loading indicator */}
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-75" />
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-150" />
                    </div>
                    <div className="w-8 h-2 bg-accent-foreground/20 rounded-full overflow-hidden">
                      <div className="w-full h-full bg-blue-500 rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Parameter skeleton */}
                <div className="mt-1">
                  <Skeleton className="h-3 w-24" />
                </div>

                {/* Result preview skeleton */}
                <div className="mt-2 space-y-1">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>

              {/* Status indicator */}
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              </div>
            </div>

            {/* Timestamp skeleton */}
            <div className="mt-2 pt-2 border-t border-accent/20">
              <Skeleton className="h-3 w-16" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
