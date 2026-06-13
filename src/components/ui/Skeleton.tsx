import { cn } from "@/lib/utils";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function Skeleton({ width, height, className }: SkeletonProps) {
  return (
    <div
      className={cn("animate-[shimmer_1.4s_ease-in-out_infinite]", className)}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        background: "linear-gradient(90deg, #e8ece9 25%, #f0f3f1 50%, #e8ece9 75%)",
        backgroundSize: "200% 100%",
      }}
    />
  );
}
