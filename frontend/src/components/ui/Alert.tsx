import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const alertVariants = cva(
    'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
    {
        variants: {
            variant: {
                default: 'bg-background text-foreground',
                destructive:
                    'border-red-500/50 text-red-600 dark:border-red-500 [&>svg]:text-red-600',
                success:
                    'border-green-500/50 text-green-600 dark:border-green-500 [&>svg]:text-green-600',
                warning:
                    'border-amber-500/50 text-amber-600 dark:border-amber-500 [&>svg]:text-amber-600',
                info:
                    'border-blue-500/50 text-blue-600 dark:border-blue-500 [&>svg]:text-blue-600',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

const Alert = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants> & {
        onClose?: () => void;
    }
>(({ className, variant, onClose, children, ...props }, ref) => (
    <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
    >
        {children}
        {onClose && (
            <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </button>
        )}
    </div>
));
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h5
        ref={ref}
        className={cn('mb-1 font-medium leading-none tracking-tight', className)}
        {...props}
    />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('text-sm [&_p]:leading-relaxed', className)}
        {...props}
    />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
