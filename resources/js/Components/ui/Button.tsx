import Spinner from '@/Components/ui/Spinner';
import { cx } from '@/lib/cx';
import { focusRing } from '@/lib/ui';
import { Link } from '@inertiajs/react';
import type {
    AnchorHTMLAttributes,
    ButtonHTMLAttributes,
    ComponentProps,
    ReactNode,
} from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface Common {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    /** Ikon di kanan teks; bergeser 3px saat hover. */
    icon?: ReactNode;
    iconLeft?: ReactNode;
    className?: string;
    children?: ReactNode;
}

type AsButton = Common &
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof Common> & {
        href?: undefined;
    };
type AsLink = Common &
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof Common> & {
        href: string;
    };

export type ButtonProps = AsButton | AsLink;

const base =
    'group inline-flex shrink-0 flex-nowrap select-none items-center justify-center gap-2 whitespace-nowrap leading-none font-semibold transition-all duration-150 active:scale-[0.99] disabled:cursor-not-allowed';

const variants: Record<ButtonVariant, string> = {
    primary:
        'rounded-control bg-navy text-white shadow-soft hover:bg-ocean disabled:bg-navy/50 disabled:shadow-none',
    secondary:
        'rounded-control border-[1.5px] border-navy bg-white text-navy hover:bg-mist disabled:border-line disabled:text-slate disabled:hover:bg-white',
    ghost: 'rounded-control bg-transparent text-ocean underline-offset-4 hover:underline disabled:text-slate disabled:no-underline',
    danger: 'rounded-control bg-danger text-white shadow-soft hover:bg-danger/90 disabled:bg-danger/50 disabled:shadow-none',
};

const sizes: Record<ButtonSize, string> = {
    sm: 'h-10 px-3.5 text-sm',
    md: 'h-11 px-5 text-sm',
    lg: 'h-12 px-6 text-base',
};

function split<T extends Common>(props: T) {
    const {
        variant = 'primary',
        size = 'md',
        loading = false,
        disabled = false,
        fullWidth = false,
        icon,
        iconLeft,
        className,
        children,
        ...rest
    } = props;

    const unavailable = loading || disabled;
    const classes = cx(
        base,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        focusRing,
        unavailable && 'pointer-events-none opacity-90',
        className
    );
    const content = (
        <>
            {loading ? (
                <Spinner />
            ) : iconLeft ? (
                <span
                    aria-hidden="true"
                    className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center [&>svg]:h-[18px] [&>svg]:w-[18px]"
                >
                    {iconLeft}
                </span>
            ) : null}
            <span className="inline-flex flex-nowrap items-center gap-2 whitespace-nowrap leading-none [&>svg]:h-[18px] [&>svg]:w-[18px] [&>svg]:shrink-0">
                {children}
            </span>
            {!loading && icon ? (
                <span
                    aria-hidden="true"
                    className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center transition-transform duration-150 group-hover:translate-x-[3px] [&>svg]:h-[18px] [&>svg]:w-[18px]"
                >
                    {icon}
                </span>
            ) : null}
        </>
    );

    return { rest, classes, content, unavailable };
}

export default function Button(props: ButtonProps) {
    if (props.href !== undefined) {
        const { rest, classes, content, unavailable } = split(props);
        return (
            <Link
                {...(rest as unknown as Omit<
                    ComponentProps<typeof Link>,
                    'className' | 'href'
                >)}
                href={rest.href}
                className={classes}
                aria-disabled={unavailable || undefined}
                tabIndex={unavailable ? -1 : undefined}
            >
                {content}
            </Link>
        );
    }

    const { rest, classes, content, unavailable } = split(props);
    return (
        <button
            type="button"
            {...rest}
            className={classes}
            disabled={unavailable}
            aria-busy={props.loading || undefined}
        >
            {content}
        </button>
    );
}
