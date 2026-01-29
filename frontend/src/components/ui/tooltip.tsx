import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string | null | undefined;
  children: React.ReactNode;
  className?: string;
  position?: "top" | "bottom" | "left" | "right";
}

/**
 * Simple CSS-only Tooltip component
 * Shows tooltip on hover if content is provided
 */
export function Tooltip({
  content,
  children,
  className,
  position = "top",
}: TooltipProps) {
  // If no content, just render children without tooltip
  if (!content) {
    return <>{children}</>;
  }

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-gray-800 border-x-transparent border-b-transparent",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-gray-800 border-x-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 border-l-gray-800 border-y-transparent border-r-transparent",
    right: "right-full top-1/2 -translate-y-1/2 border-r-gray-800 border-y-transparent border-l-transparent",
  };

  return (
    <div className={cn("relative inline-block group", className)}>
      {children}
      <div
        className={cn(
          "absolute z-50 px-4 py-3 text-sm text-white bg-gray-800 rounded-lg shadow-lg",
          "opacity-0 invisible group-hover:opacity-100 group-hover:visible",
          "transition-all duration-200 ease-in-out",
          "whitespace-normal min-w-[280px] max-w-md text-left leading-relaxed",
          "pointer-events-none",
          positionClasses[position]
        )}
      >
        {content}
        {/* Arrow */}
        <div
          className={cn(
            "absolute w-0 h-0 border-4",
            arrowClasses[position]
          )}
        />
      </div>
    </div>
  );
}
