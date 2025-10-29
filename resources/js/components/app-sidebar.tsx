import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid } from 'lucide-react';
import AppLogo from './app-logo';

interface AppSidebarProps {
    /** Current user's role (e.g. 'admin', 'customer'). If omitted, defaults to admin/mainNavItems. */
    userRole?: string;
    /** Optional map of role -> NavItem[] to override navigation per role. */
    roleNavItems?: Record<string, NavItem[]>;
}

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

// Nav items for customer users. Exported so you can import and pass into
// AppSidebar via the `roleNavItems` prop, e.g. { customer: customerNavItems }
export const customerNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar({ userRole, roleNavItems }: AppSidebarProps) {
    // Resolve the current role. Priority:
    // 1. `userRole` prop if provided by parent
    // 2. `page.props.auth.user.role` from Inertia (if available)
    // 3. default to 'admin'
    const page = usePage();
    const inertiaRole = (page.props as { auth?: { user?: { role?: string } } })
        ?.auth?.user?.role;
    const currentRole = userRole ?? inertiaRole ?? 'admin';

    // Determine which nav items to render. Priority:
    // 1. If roleNavItems is provided and contains the current role, use that.
    // 2. If role is 'customer' use exported customerNavItems.
    // 3. Otherwise use the default mainNavItems (admin view).
    const itemsToRender: NavItem[] =
        roleNavItems && roleNavItems[currentRole]
            ? roleNavItems[currentRole]
            : currentRole === 'customer'
              ? customerNavItems
              : mainNavItems;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={itemsToRender} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
