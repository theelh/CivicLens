import { Link, usePage } from '@inertiajs/react';
import { BellRingIcon, ChartColumnBigIcon, ChartSplineIcon, FlagIcon,  LayoutGrid, MapIcon, SquareUserRoundIcon } from 'lucide-react';
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
                    href: dashboard().url,
                    icon: LayoutGrid,
                },
            ]
            : isStaff
                ? [
                    {
                        title: 'Staff Dashboard',
                        href: dashboard().url,
                        icon: LayoutGrid,
                    },
                    {
                        title: 'Analytics',
                        href: '/analytics',
                        icon: ChartSplineIcon,
                    },
                    {
                        title: 'Notifcations',
                        href: '/notifications',
                        icon: BellRingIcon,
                    },
                    {
                        title: 'Report status',
                        href: '/reportStatus',
                        icon: FlagIcon,
                    },
                    {
                        title: 'Map View',
                        href: '/mapView',
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
                            href: '/receivedNotifications',
                            icon: BellRingIcon,
                        },
                        {
                            title: 'Your Reports',
                            href: '/userReports',
                            icon: FlagIcon,
                        },
                        {
                            title: 'Report Status',
                            href: '/userReportsStatus',
                            icon: ChartColumnBigIcon,
                        },
                        {
                            title: 'Explore Map',
                            href: '/mapView',
                            icon: MapIcon,
                        },
                    ]
                    : []
    );

const footerNavItems: NavItem[] = [
    {
        title: 'Contact Support',
        href: '/contactSupport',
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
