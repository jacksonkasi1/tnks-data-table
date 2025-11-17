/**
 * Reusable badge components for common table cell patterns
 */

import { Badge, badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

/**
 * Priority badge color mappings
 */
export const PRIORITY_COLORS = {
  low: "bg-blue-500",
  medium: "bg-yellow-500",
  high: "bg-orange-500",
  urgent: "bg-red-500",
} as const;

/**
 * Status badge color mappings
 */
export const STATUS_COLORS = {
  open: "bg-blue-500",
  "in-progress": "bg-purple-500",
  resolved: "bg-green-500",
  closed: "bg-gray-500",
} as const;

/**
 * Order status badge variant mappings
 */
export const ORDER_STATUS_VARIANTS: Record<string, BadgeVariant> = {
  delivered: "default",
  shipped: "secondary",
  processing: "outline",
  cancelled: "destructive",
} as const;

/**
 * Role badge color mappings
 */
export const ROLE_COLORS = {
  admin: "bg-red-500",
  agent: "bg-blue-500",
  customer: "bg-green-500",
} as const;

type PriorityBadgeProps = {
  priority: string;
  className?: string;
};

/**
 * Priority Badge Component
 * Displays priority with appropriate color coding
 */
export function PriorityBadge({ priority, className = "" }: PriorityBadgeProps) {
  const normalizedPriority = priority.toLowerCase();
  const color = PRIORITY_COLORS[normalizedPriority as keyof typeof PRIORITY_COLORS] || "bg-gray-500";
  
  return (
    <Badge className={`${color} text-white ${className}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  );
}

type StatusBadgeProps = {
  status: string;
  className?: string;
};

/**
 * Status Badge Component
 * Displays status with appropriate color coding
 */
export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();
  const color = STATUS_COLORS[normalizedStatus as keyof typeof STATUS_COLORS] || "bg-gray-500";
  const displayText = status
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  
  return (
    <Badge className={`${color} text-white ${className}`}>
      {displayText}
    </Badge>
  );
}

type OrderStatusBadgeProps = {
  status: string;
  className?: string;
};

/**
 * Order Status Badge Component
 * Displays order status with appropriate variant
 */
export function OrderStatusBadge({ status, className = "" }: OrderStatusBadgeProps) {
  const variant = ORDER_STATUS_VARIANTS[status.toLowerCase()] || "outline";
  
  return (
    <Badge variant={variant} className={`truncate capitalize ${className}`}>
      {status}
    </Badge>
  );
}

type RoleBadgeProps = {
  role: string;
  className?: string;
};

/**
 * Role Badge Component
 * Displays user role with appropriate color coding
 */
export function RoleBadge({ role, className = "" }: RoleBadgeProps) {
  const normalizedRole = role.toLowerCase();
  const color = ROLE_COLORS[normalizedRole as keyof typeof ROLE_COLORS] || "bg-gray-500";
  
  return (
    <Badge className={`${color} text-white ${className}`}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </Badge>
  );
}

type CountBadgeProps = {
  count: number | string;
  className?: string;
};

/**
 * Count Badge Component
 * Simple outline badge for displaying counts
 */
export function CountBadge({ count, className = "" }: CountBadgeProps) {
  return (
    <Badge variant="outline" className={`truncate ${className}`}>
      {count}
    </Badge>
  );
}
