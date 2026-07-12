import {
  BookOpen,
  Heart,
  LayoutDashboard,
  PlusCircle,
  Settings,
  Shield,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/applications/new", label: "New Application", icon: PlusCircle },
  { href: "/guide", label: "Guide", icon: BookOpen },
  { href: "/manifesto", label: "Manifesto", icon: Heart },
  { href: "/settings", label: "Settings", icon: Settings },
];

export const ADMIN_NAV_ITEM: NavItem = {
  href: "/admin",
  label: "Admin",
  icon: Shield,
};
