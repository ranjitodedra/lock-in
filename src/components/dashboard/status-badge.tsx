import type { ApplicationStatus } from "@/types/application";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  Wishlist: "bg-muted text-muted-foreground",
  Preparing: "bg-amber-500/15 text-amber-800 dark:text-amber-200",
  Applied: "bg-brand-muted text-brand",
  OA: "bg-blue-500/15 text-blue-800 dark:text-blue-200",
  Interview: "bg-violet-500/15 text-violet-800 dark:text-violet-200",
  Offer: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200",
  Rejected: "bg-red-500/15 text-red-800 dark:text-red-200",
  Accepted: "bg-emerald-600/15 text-emerald-900 dark:text-emerald-100",
};

type StatusBadgeProps = {
  status: ApplicationStatus | string;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const className =
    STATUS_STYLES[status as ApplicationStatus] ??
    "bg-muted text-muted-foreground";

  return (
    <Badge variant="outline" className={cn("border-transparent", className)}>
      {status}
    </Badge>
  );
}
