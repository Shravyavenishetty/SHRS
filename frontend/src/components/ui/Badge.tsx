import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    {
        variants: {
            variant: {
                default:
                    'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
                secondary:
                    'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
                destructive:
                    'border-transparent bg-red-600 text-white hover:bg-red-700',
                success:
                    'border-transparent bg-green-600 text-white hover:bg-green-700',
                warning:
                    'border-transparent bg-amber-500 text-white hover:bg-amber-600',
                outline: 'text-foreground',
                // Healthcare status variants
                pending:
                    'border-transparent bg-amber-100 text-amber-800 hover:bg-amber-200',
                confirmed:
                    'border-transparent bg-teal-100 text-teal-800 hover:bg-teal-200',
                completed:
                    'border-transparent bg-green-100 text-green-800 hover:bg-green-200',
                canceled:
                    'border-transparent bg-red-100 text-red-800 hover:bg-red-200',
                // Role variants
                doctor:
                    'border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200',
                patient:
                    'border-transparent bg-purple-100 text-purple-800 hover:bg-purple-200',
                admin:
                    'border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
