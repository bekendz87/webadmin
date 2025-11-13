import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import React from "react";
import { AlertErrorIcon, AlertSuccessIcon, AlertWarningIcon } from "./icons";

const alertVariants = cva(
  "macos26-alert relative flex gap-4 w-full transition-all duration-400",
  {
    variants: {
      variant: {
        success: "macos26-alert-success",
        warning: "macos26-alert-warning", 
        error: "macos26-alert-error",
      },
    },
    defaultVariants: {
      variant: "error",
    },
  },
);

const icons = {
  error: AlertErrorIcon,
  success: AlertSuccessIcon,
  warning: AlertWarningIcon,
};

type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  variant: "error" | "success" | "warning";
  title: string;
  description: string;
};

const Alert = ({
  className,
  variant,
  title,
  description,
  ...props
}: AlertProps) => {
  const IconComponent = icons[variant];

  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {/* macOS26 Liquid Glass overlay */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden">
        {/* Gradient background layer */}
        <div className={cn("absolute inset-0 opacity-30", {
          "bg-gradient-to-br from-green-400/10 via-green-500/5 to-emerald-600/10": variant === "success",
          "bg-gradient-to-br from-orange-400/10 via-amber-500/5 to-yellow-600/10": variant === "warning",
          "bg-gradient-to-br from-red-400/10 via-rose-500/5 to-pink-600/10": variant === "error",
        })}></div>

        {/* Shimmer effect */}
        <div className={cn("absolute inset-0 opacity-20", {
          "bg-[radial-gradient(circle_at_50%_50%,rgba(52,199,89,0.1),transparent_70%)]": variant === "success",
          "bg-[radial-gradient(circle_at_50%_50%,rgba(255,159,10,0.1),transparent_70%)]": variant === "warning",
          "bg-[radial-gradient(circle_at_50%_50%,rgba(255,59,48,0.1),transparent_70%)]": variant === "error",
        })}></div>

        {/* Top highlight */}
        <div className={cn("absolute top-0 left-4 right-4 h-px opacity-50", {
          "bg-gradient-to-r from-transparent via-green-400/60 to-transparent": variant === "success",
          "bg-gradient-to-r from-transparent via-orange-400/60 to-transparent": variant === "warning",
          "bg-gradient-to-r from-transparent via-red-400/60 to-transparent": variant === "error",
        })}></div>
      </div>

      <div className="flex-shrink-0 mt-0.5 relative z-10">
        <IconComponent />
      </div>

      <div className="w-full min-w-0 relative z-10">
        <h5
          className={cn("mb-2 font-semibold text-sm leading-5 font-['SF_Pro_Display']", {
            "text-green-800 dark:text-green-100": variant === "success",
            "text-orange-800 dark:text-orange-100": variant === "warning",
            "text-red-800 dark:text-red-100": variant === "error",
          })}
        >
          {title}
        </h5>

        <div
          className={cn("text-sm leading-5 font-['SF_Pro_Display'] opacity-90", {
            "text-green-700 dark:text-green-200": variant === "success",
            "text-orange-700 dark:text-orange-200": variant === "warning",
            "text-red-700 dark:text-red-200": variant === "error",
          })}
        >
          {description}
        </div>
      </div>
    </div>
  );
};

export { Alert, type AlertProps };
