import * as React from "react"
import { cn } from "./Button"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
    const variants = {
        default: "border-transparent bg-slate-900 text-slate-50",
        secondary: "border-transparent bg-slate-100 text-slate-900",
        destructive: "border-transparent bg-red-50 text-red-700 font-bold",
        outline: "text-slate-950 border-slate-200",
        success: "border-transparent bg-emerald-50 text-emerald-700 font-bold",
        warning: "border-transparent bg-orange-50 text-orange-700 font-bold"
    }

    return (
        <div className={cn(
            "inline-flex items-center rounded-sm border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 font-display uppercase tracking-wider",
            variants[variant],
            className
        )} {...props} />
    )
}

export { Badge }
