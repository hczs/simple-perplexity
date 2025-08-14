import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface MessageSkeletonProps {
  isUser?: boolean;
  className?: string;
}

export function MessageSkeleton({
  isUser = false,
  className,
}: MessageSkeletonProps) {
  return (
    <div
      className={cn(
        "flex w-full mb-4",
        isUser ? "justify-end" : "justify-start",
        className
      )}
    >
      <div
        className={cn(
          "max-w-[80%] min-w-[200px]",
          isUser ? "ml-auto" : "mr-auto"
        )}
      >
        <Card
          className={cn(
            "transition-all duration-200",
            isUser
              ? "bg-primary/10 border-primary/20"
              : "bg-muted/50 border-border"
          )}
        >
          <CardContent className="p-4">
            {/* Message content skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
            </div>

            {/* Message metadata skeleton */}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-current/10">
              <Skeleton className="h-3 w-12" />
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-current/40 rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-current/40 rounded-full animate-bounce delay-100" />
                  <div className="w-1 h-1 bg-current/40 rounded-full animate-bounce delay-200" />
                </div>
                <Skeleton className="h-3 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
