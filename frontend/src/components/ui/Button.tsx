import * as React from "react"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Loader2 } from "lucide-react"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "outline" | "destructive"
    size?: "sm" | "md" | "lg" | "icon"
    isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {

        const variants = {
            primary: "bg-brand-primary text-white hover:bg-blue-700 shadow-lg shadow-brand-primary/25 rounded-lg border border-transparent",
            secondary: "bg-zinc-800 text-white hover:bg-zinc-700 rounded-lg border border-zinc-700",
            outline: "border border-zinc-700 bg-transparent hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg",
            ghost: "bg-transparent hover:bg-zinc-800 text-zinc-300 hover:text-white shadow-none hover:shadow-none rounded-lg",
            destructive: "bg-red-600 text-white hover:bg-red-700 rounded-lg shadow-lg shadow-red-600/20",
        }

        const sizes = {
            sm: "h-8 px-3 text-xs",
            md: "h-10 px-4 py-2",
            lg: "h-12 px-8 text-lg",
            icon: "h-10 w-10",
        }

        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap font-bold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 font-display tracking-wide",
                    variants[variant],
                    sizes[size],
                    className
                )}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        )
    }
)
Button.displayName = "Button"

export { Button }
