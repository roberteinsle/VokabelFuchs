import { Link } from '@inertiajs/react';
import { type ReactNode } from 'react';
import type React from 'react';
import { buttonVariants } from './button';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

interface LinkButtonProps extends VariantProps<typeof buttonVariants> {
    href: string;
    className?: string;
    children?: ReactNode;
    method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
    as?: React.ElementType;
    replace?: boolean;
    preserveState?: boolean;
    preserveScroll?: boolean;
}

export function LinkButton({ variant, size, className, href, children, ...props }: LinkButtonProps) {
    return (
        <Link
            href={href}
            {...props}
            className={cn(buttonVariants({ variant, size }), className)}
        >
            {children}
        </Link>
    );
}
