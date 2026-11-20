import type { ReactNode } from 'react';

interface EmptyStateProps {
    title: string;
    description?: string;
    action?: ReactNode;
    icon?: unknown;
}

/** Keadaan kosong dengan ilustrasi garis sederhana (ikan + ombak). */
export default function EmptyState({
    title,
    description,
    action,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center rounded-card border border-dashed border-line bg-white px-6 py-12 text-center">
            <svg
                viewBox="0 0 160 120"
                className="h-28 w-36 text-sky"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path
                    className="text-line"
                    d="M8 92c9-6 18-6 27 0s18 6 27 0 18-6 27 0 18 6 27 0 12-4 24-4"
                />
                <path
                    className="text-line"
                    d="M20 106c9-6 18-6 27 0s18 6 27 0 18-6 27 0 18 6 27 0"
                />
                <path d="M46 52c14-18 44-18 60 0-16 18-46 18-60 0Z" />
                <path d="M106 52l18-14v28Z" />
                <circle
                    cx="64"
                    cy="49"
                    r="1.8"
                    fill="currentColor"
                    stroke="none"
                />
            </svg>
            <h3 className="t-h3 mt-5">{title}</h3>
            {description ? (
                <p className="mt-2 max-w-sm text-sm text-slate">
                    {description}
                </p>
            ) : null}
            {action ? <div className="mt-6">{action}</div> : null}
        </div>
    );
}
