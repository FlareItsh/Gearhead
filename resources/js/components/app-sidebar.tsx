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
import {
    Banknote,
    BanknoteArrowUp,
    BookOpen,
    CalendarCog,
    ChartColumnBig,
    Computer,
    Folder,
    LayoutDashboard,
    Package,
    PackageOpen,
    TableCellsMerge,
    UserCheck,
    UsersRound,
    Wrench,
} from 'lucide-react';
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
        icon: LayoutDashboard,
    },
    {
        title: 'Registry',
        href: '/registry',
        icon: Computer,
    },
    {
        title: 'Bookings',
        href: '/bookings',
        icon: CalendarCog,
    },
    {
        title: 'Bays',
        href: '/bays',
        icon: TableCellsMerge,
    },
    {
        title: 'Services',
        href: '/services',
        icon: Wrench,
    },
    {
        title: 'Inventory',
        href: '/inventory',
        icon: Package,
    },
    {
        title: 'Pullout Requests',
        href: '/pullout-requests-page',
        icon: PackageOpen,
    },
    {
        title: 'Customers',
        href: '/customers',
        icon: UsersRound,
    },
    {
        title: 'Staffs',
        href: '/staffs',
        icon: UserCheck,
    },
    {
        title: 'Transactions',
        href: '/transactions',
        icon: BanknoteArrowUp,
    },
    {
        title: 'Reports',
        href: '/reports',
        icon: ChartColumnBig,
    },
];

// Nav items for customer users. Exported so you can import and pass into
// AppSidebar via the `roleNavItems` prop, e.g. { customer: customerNavItems }
export const customerNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutDashboard,
    },
    {
        title: 'My Bookings',
        href: '/bookings',
        icon: CalendarCog,
    },
    {
        title: 'Services',
        href: '/services',
        icon: Wrench,
    },
    {
        title: 'Payment History',
        href: '/payments',
        icon: Banknote,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/FlareItsh/Gearhead',
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
                        <SidebarMenuButton
                            size="lg"
                            className="h-fit hover:bg-transparent focus-visible:bg-transparent active:bg-transparent data-[active=true]:bg-transparent"
                            asChild
                        >
                            <Link href="/" prefetch>
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
