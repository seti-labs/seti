import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MarketBadgeProps {
  variant?: "gold" | "success" | "danger" | "purple";
  children: React.ReactNode;
  className?: string;
}

export function MarketBadge({ variant = "gold", children, className }: MarketBadgeProps) {
  const variants = {
    gold: "bg-gradient-gold text-primary-foreground border-primary/20 shadow-glow-gold",
    success: "bg-gradient-neon text-success-foreground border-success/20 shadow-glow-success", 
    danger: "bg-gradient-to-r from-danger to-red-400 text-danger-foreground border-danger/20 shadow-glow-danger",
    purple: "bg-gradient-purple text-accent-foreground border-accent/20"
  };

  return (
    <Badge 
      className={cn(
        "px-3 py-1 text-xs font-bold border rounded-lg backdrop-blur-sm",
        variants[variant],
        className
      )}
    >
      {children}
    </Badge>
  );
}
