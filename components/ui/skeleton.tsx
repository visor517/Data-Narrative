import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-[var(--text-muted)]/20", className)}
            {...props}
        />
    );
}

export function NarrativeSkeleton() {
    return (
        <div className="space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
        </div>
    );
}

export function ChartSkeleton() {
    return (
        <div className="space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-48 w-full rounded-xl" />
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <NarrativeSkeleton />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ChartSkeleton />
                <ChartSkeleton />
            </div>
        </div>
    );
}