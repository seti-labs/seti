import { Skeleton } from "@/components/ui/skeleton"

export function MarketCardSkeleton() {
  return (
    <div className="market-card group p-3 sm:p-4 w-full max-w-sm mx-auto h-[400px] sm:h-[450px] flex flex-col bg-background/30 dark:bg-black/20 backdrop-blur-sm border border-border/40 dark:border-white/20 rounded-xl shadow-sm">
      {/* Header with Icon and Title */}
      <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
        <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <Skeleton className="h-4 sm:h-5 w-full mb-1 sm:mb-2" />
          <Skeleton className="h-4 sm:h-5 w-3/4 mb-1" />
          <Skeleton className="h-3 w-20 rounded-full" />
        </div>
      </div>

      {/* Live Score Skeleton */}
      <div className="mb-3">
        <Skeleton className="h-4 w-32 rounded" />
      </div>

      {/* Price Buttons */}
      <div className="flex gap-2 mb-3 flex-shrink-0">
        <Skeleton className="flex-1 h-8 rounded-lg" />
        <Skeleton className="flex-1 h-8 rounded-lg" />
      </div>

      {/* Bottom Section */}
      <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-border/50 mt-auto">
        <div className="flex items-center gap-1 sm:gap-2">
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="w-8 h-8 rounded-md" />
      </div>
    </div>
  )
}
