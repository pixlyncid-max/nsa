import React from 'react';

interface FormCardProps {
    title: string;
    subtitle?: string;
    badge?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

export default function FormCard({
    title,
    subtitle,
    badge,
    children,
    className = '',
}: FormCardProps) {
    return (
        <div className={`bg-white border border-line rounded-2xl p-5 md:p-6 shadow-soft transition-all duration-200 hover:border-ocean/30 ${className.includes('mb-') ? '' : 'mb-6'} ${className}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-5 border-b border-line">
                <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-navy font-display">
                        {title}
                    </h3>
                    {subtitle && (
                        <span className="text-[11px] font-bold uppercase tracking-wide text-ocean bg-ocean/10 px-2 py-0.5 rounded-full">
                            {subtitle}
                        </span>
                    )}
                </div>
                {badge && <div>{badge}</div>}
            </div>

            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
}
