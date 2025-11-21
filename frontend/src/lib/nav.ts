import { 
  LayoutDashboard,
  Users,
  FileText,
  Briefcase,
  UserCheck,
  Calendar,
  DollarSign,
  Clock,
  Settings,
  UserCog,
  FileSpreadsheet,
  Building2
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: string[];
}

export const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "Profile", icon: Users },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/timesheets", label: "Timesheets", icon: Clock },
  { href: "/leave", label: "Leave", icon: Calendar },
  { href: "/payslips", label: "Payslips", icon: DollarSign },
  { href: "/jobs", label: "Jobs", icon: Briefcase, roles: ['candidate', 'eor', 'admin', 'account_manager'] },
  { href: "/hr/onboarding", label: "Onboarding", icon: UserCheck, roles: ['admin', 'hr'] },
  { href: "/invitations", label: "Invitations", icon: UserCog, roles: ['admin', 'hr'] },
  { href: "/users", label: "Users", icon: Users, roles: ['admin', 'hr'] },
  { href: "/employment-records", label: "Employment", icon: Building2, roles: ['admin', 'hr', 'hr_manager_client', 'account_manager'] },
  { href: "/salary-history", label: "Salary History", icon: FileSpreadsheet, roles: ['admin', 'hr'] },
  { href: "/payroll-configuration", label: "Payroll Config", icon: Settings, roles: ['admin', 'hr', 'account_manager'] },
  { href: "/payroll-administration", label: "Payroll Admin", icon: Settings, roles: ['admin', 'hr'] },
];

