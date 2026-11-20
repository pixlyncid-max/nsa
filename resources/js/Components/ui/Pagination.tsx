import { cx } from '@/lib/cx';
import { focusRing } from '@/lib/ui';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationLinkItem {
    url: string | null;
    label: string;
    active: boolean;
}

type PaginationProps =
    | {
          page: number;
          lastPage: number;
          onChange: (page: number) => void;
          links?: undefined;
          className?: string;
      }
    | {
          links: PaginationLinkItem[];
          page?: undefined;
          lastPage?: undefined;
          onChange?: undefined;
          className?: string;
      };

type PageToken = number | 'gap-start' | 'gap-end';

function buildTokens(page: number, lastPage: number): PageToken[] {
    const wanted = new Set([1, lastPage, page - 1, page, page + 1]);
    const pages = [...wanted]
        .filter((n) => n >= 1 && n <= lastPage)
        .sort((a, b) => a - b);
    const tokens: PageToken[] = [];

    pages.forEach((n, index) => {
        const previous = pages[index - 1];
        if (previous !== undefined && n - previous > 1) {
            tokens.push(previous < page ? 'gap-start' : 'gap-end');
        }
        tokens.push(n);
    });

    return tokens;
}

function cleanLabel(raw: string): string {
    return raw
        .replace(/&laquo;|&raquo;|«|»/g, '')
        .replace(/Previous/i, 'Sebelumnya')
        .replace(/Next/i, 'Berikutnya')
        .trim();
}

const item =
    'inline-flex h-11 min-w-11 items-center justify-center rounded-control border px-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50';

export default function Pagination(props: PaginationProps) {
    if (props.links !== undefined) {
        if (props.links.length <= 3) return null;

        return (
            <nav aria-label="Halaman" className={props.className}>
                <ul className="flex flex-wrap items-center gap-1.5">
                    {props.links.map((link, idx) => {
                        const isPrev = idx === 0;
                        const isNext = idx === props.links.length - 1;
                        const text = cleanLabel(link.label);

                        if (!link.url) {
                            return (
                                <li key={idx}>
                                    <span
                                        aria-disabled="true"
                                        className={cx(
                                            item,
                                            'cursor-not-allowed border-line bg-mist/60 text-slate opacity-60'
                                        )}
                                    >
                                        {isPrev ? (
                                            <ChevronLeft className="h-[18px] w-[18px]" />
                                        ) : isNext ? (
                                            <ChevronRight className="h-[18px] w-[18px]" />
                                        ) : (
                                            text
                                        )}
                                    </span>
                                </li>
                            );
                        }

                        return (
                            <li key={idx}>
                                <Link
                                    href={link.url}
                                    preserveScroll
                                    aria-current={link.active ? 'page' : undefined}
                                    aria-label={
                                        isPrev
                                            ? 'Halaman sebelumnya'
                                            : isNext
                                              ? 'Halaman berikutnya'
                                              : `Halaman ${text}`
                                    }
                                    className={cx(
                                        item,
                                        focusRing,
                                        link.active
                                            ? 'border-navy bg-navy text-white'
                                            : 'border-line bg-white text-navy hover:bg-mist'
                                    )}
                                >
                                    {isPrev ? (
                                        <ChevronLeft className="h-[18px] w-[18px]" />
                                    ) : isNext ? (
                                        <ChevronRight className="h-[18px] w-[18px]" />
                                    ) : (
                                        text
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        );
    }

    const { page, lastPage, onChange, className } = props;

    if (lastPage <= 1) {
        return null;
    }

    return (
        <nav aria-label="Halaman" className={className}>
            <ul className="flex flex-wrap items-center gap-1.5">
                <li>
                    <button
                        type="button"
                        aria-label="Halaman sebelumnya"
                        disabled={page <= 1}
                        onClick={() => onChange(page - 1)}
                        className={cx(
                            item,
                            focusRing,
                            'border-line bg-white text-navy hover:bg-mist'
                        )}
                    >
                        <ChevronLeft className="h-[18px] w-[18px]" />
                    </button>
                </li>
                {buildTokens(page, lastPage).map((token) =>
                    typeof token === 'number' ? (
                        <li key={token}>
                            <button
                                type="button"
                                aria-label={`Halaman ${token}`}
                                aria-current={
                                    token === page ? 'page' : undefined
                                }
                                onClick={() => onChange(token)}
                                className={cx(
                                    item,
                                    focusRing,
                                    token === page
                                        ? 'border-navy bg-navy text-white'
                                        : 'border-line bg-white text-navy hover:bg-mist'
                                )}
                            >
                                {token}
                            </button>
                        </li>
                    ) : (
                        <li
                            key={token}
                            aria-hidden="true"
                            className="px-1 text-slate"
                        >
                            …
                        </li>
                    )
                )}
                <li>
                    <button
                        type="button"
                        aria-label="Halaman berikutnya"
                        disabled={page >= lastPage}
                        onClick={() => onChange(page + 1)}
                        className={cx(
                            item,
                            focusRing,
                            'border-line bg-white text-navy hover:bg-mist'
                        )}
                    >
                        <ChevronRight className="h-[18px] w-[18px]" />
                    </button>
                </li>
            </ul>
        </nav>
    );
}
