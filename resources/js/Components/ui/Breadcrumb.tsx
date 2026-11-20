import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { Fragment } from 'react';

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
    return (
        <nav aria-label="Jejak halaman">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <Fragment key={`${item.label}-${index}`}>
                            <li className="min-w-0">
                                {item.href && !isLast ? (
                                    <Link
                                        href={item.href}
                                        className="rounded font-medium text-ocean underline-offset-4 hover:underline"
                                    >
                                        {item.label}
                                    </Link>
                                ) : (
                                    <span
                                        aria-current={
                                            isLast ? 'page' : undefined
                                        }
                                        className="block max-w-[200px] truncate font-semibold text-ink sm:max-w-none"
                                    >
                                        {item.label}
                                    </span>
                                )}
                            </li>
                            {!isLast ? (
                                <li aria-hidden="true">
                                    <ChevronRight
                                        className="h-4 w-4 text-slate"
                                        strokeWidth={1.75}
                                    />
                                </li>
                            ) : null}
                        </Fragment>
                    );
                })}
            </ol>
        </nav>
    );
}
