import { Link, usePage } from '@inertiajs/react';
import { BadgePlusIcon, BellRingIcon, ChartColumnBigIcon, ChartSplineIcon, FlagIcon,  LayoutGrid, MapIcon, SquareUserRoundIcon, UserRoundCogIcon } from 'lucide-react';
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
import type { NavItem } from '@/types';
import AppLogo from './app-logo';


export function AppSidebar() {
    const { props } = usePage<{ auth: { user: { role: string } } }>();
    const isAdmin = props.auth.user.role === 'admin';
    const isStaff = props.auth.user.role === 'staff';
    const isUser = props.auth.user.role === 'user';
    const mainNavItems: NavItem[] = (
        isAdmin            ? [
                {
                    title: 'Admin Dashboard',
                    href: '/admin/dashboard',
                    icon: LayoutGrid,
                },
                {
                        title: 'Report issue',
                        href: '/admin/reports/submit',
                        icon: BadgePlusIcon,
                    },
                    {
                        title: 'Analytics',
                        href: '/admin/analytics',
                        icon: ChartSplineIcon,
                    },
                    {
                        title: 'Notifcations',
                        href: '/admin/notifications',
                        icon: BellRingIcon,
                    },
                    {
                        title: 'Manage Report',
                        href: '/admin/reports/all',
                        icon: FlagIcon,
                    },
                    {
                        title: 'Manage Users',
                        href: '/admin/users',
                        icon: UserRoundCogIcon,
                    },
                    {
                        title: 'Map View',
                        href: '/admin/map',
                        icon: MapIcon,
                    },
            ]
            : isStaff
                ? [
                    {
                        title: 'Staff Dashboard',
                        href: '/staff/dashboard',
                        icon: LayoutGrid,
                    },
                    {
                        title: 'Report issue',
                        href: '/staff/reports/submit',
                        icon: BadgePlusIcon,
                    },
                    {
                        title: 'Analytics',
                        href: '/staff/analytics',
                        icon: ChartSplineIcon,
                    },
                    {
                        title: 'Notifcations',
                        href: '/staff/notifications',
                        icon: BellRingIcon,
                    },
                    {
                        title: 'Manage Report',
                        href: '/staff/reports/all',
                        icon: FlagIcon,
                    },
                    {
                        title: 'Map View',
                        href: '/staff/map',
                        icon: MapIcon,
                    },
                ]
                : isUser
                    ? [
                        {
                            title: 'Home',
                            href: dashboard().url,
                            icon: LayoutGrid,
                        },
                        {
                            title: 'Your Notifications',
                            href: '/notifications',
                            icon: BellRingIcon,
                        },
                        {
                            title: 'Your Reports',
                            href: '/reports/all',
                            icon: FlagIcon,
                        },
                        {
                            title: 'Report Status',
                            href: '/analytics',
                            icon: ChartColumnBigIcon,
                        },
                        {
                            title: 'Explore Map',
                            href: '/map',
                            icon: MapIcon,
                        },
                    ]
                    : []
    );

const footerNavItems: NavItem[] = [
    {
        title: 'Contact Support',
        href: '/contact',
        icon: SquareUserRoundIcon,
    },
];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            {
                                isUser ? (
                                <Link href={dashboard()} prefetch>
                                    <AppLogo />
                                </Link> ) : 
                                isAdmin ? (
                                <Link href="/admin/dashboard" prefetch>
                                    <AppLogo />
                                </Link>
                                 ) : isStaff ? (
                                    <Link href="/staff/dashboard" prefetch>
                                        <AppLogo />
                                    </Link>
                                ) : null
                            }
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
