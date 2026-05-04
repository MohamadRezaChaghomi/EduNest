"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Rating({ value, onChange, size = "default", readOnly = false }) {
  const stars = [1, 2, 3, 4, 5];
  const sizeClass = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5";

  return (
    <div className="flex gap-1 items-center" dir="ltr">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readOnly && onChange?.(star)}
          className={cn(
            "transition-all focus:outline-none",
            !readOnly && "hover:scale-110 cursor-pointer",
            readOnly && "cursor-default"
          )}
          disabled={readOnly}
        >
          <Star
            className={cn(
              sizeClass,
              star <= value
                ? "fill-yellow-500 text-yellow-500"
                : "fill-muted text-muted-foreground"
            )}
          />
        </button>
      ))}
      {!readOnly && value && <span className="text-sm text-muted-foreground mr-2">({value} ستاره)</span>}
    </div>
  );
}