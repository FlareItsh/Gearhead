import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    user_id: number;
    first_name: string;
    middle_name?: string;
    last_name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    phone_number?: string;
    address?: string;
    role: string;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    // Legacy compatibility - will be provided by the name accessor in PHP
    name?: string;
}
