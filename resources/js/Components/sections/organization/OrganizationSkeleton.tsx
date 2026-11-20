export default function OrganizationSkeleton() {
    return (
        <div
            role="status"
            aria-label="Memuat data kepengurusan"
            className="space-y-8 animate-pulse"
        >
            {/* Sekretariat Bar Skeleton */}
            <div className="rounded-card border border-line bg-white p-6 md:p-8">
                <div className="flex flex-col justify-between gap-4 md:flex-row">
                    <div className="space-y-3 flex-1">
                        <div className="h-3 w-28 rounded bg-mist" />
                        <div className="h-7 w-64 rounded bg-mist" />
                        <div className="h-4 w-full max-w-md rounded bg-mist" />
                    </div>
                    <div className="flex gap-2">
                        <div className="h-10 w-32 rounded-control bg-mist" />
                        <div className="h-10 w-32 rounded-control bg-mist" />
                    </div>
                </div>
            </div>

            {/* Featured Leader Arch Skeleton */}
            <div className="grid gap-8 rounded-card border border-line bg-white p-6 md:grid-cols-12 md:p-8">
                <div className="md:col-span-4">
                    <div className="aspect-[4/5] w-full max-w-[240px] mx-auto rounded-t-[999px] rounded-b-card bg-mist" />
                </div>
                <div className="flex flex-col justify-center space-y-3 md:col-span-8">
                    <div className="h-3 w-36 rounded bg-mist" />
                    <div className="h-8 w-56 rounded bg-mist" />
                    <div className="h-4 w-40 rounded bg-mist" />
                    <div className="h-16 w-full max-w-lg rounded bg-mist" />
                </div>
            </div>

            {/* Row List Skeleton */}
            <div className="rounded-card border border-line bg-white divide-y divide-line">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 sm:p-5">
                        <div className="h-12 w-12 shrink-0 rounded-full bg-mist" />
                        <div className="space-y-2 flex-1">
                            <div className="h-4 w-44 rounded bg-mist" />
                            <div className="h-3 w-32 rounded bg-mist" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
