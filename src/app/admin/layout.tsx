
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
    LayoutDashboard,
    Users,
    BookOpen,
    Library,
    Newspaper,
    Settings,
    LogOut,
    User,
    Shield,
    GraduationCap,
    Network,
    Folder,
    Gem,
    Bell,
    Phone,
    ChevronDown,
    Video,
    Megaphone,
    BookCopy,
    Layers,
    Bot,
    Trophy,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Sidebar,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarProvider,
    SidebarInset,
    SidebarFooter,
    SidebarTrigger,
    SidebarGroup,
} from "@/components/ui/sidebar"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { PageLoader } from "@/components/page-loader"

const menuItems = [
    { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
    { href: "/admin/users", label: "Utilisateurs", icon: Users },
    {
        label: "Fonctionnalités IA",
        icon: Bot,
        subItems: [
            { href: "/admin/agents", label: "Agents IA" },
        ]
    },
    { href: "/admin/premium", label: "Abonnements", icon: Gem },
    { href: "/admin/notifications", label: "Notifications", icon: Bell },
     {
        label: "Contenu Principal",
        icon: BookOpen,
        subItems: [
            { href: "/admin/courses", label: "Cours" },
            { href: "/admin/revisions", label: "Révisions" },
            { href: "/admin/flashcards", label: "Flashcards" },
            { href: "/admin/subjects", label: "Matières" },
            { href: "/admin/structure", label: "Structure" },
        ]
    },
    {
        label: "Ressources & Médias",
        icon: Library,
        subItems: [
            { href: "/admin/resources", label: "Ressources" },
            { href: "/admin/folders", label: "Dossiers" },
            { href: "/admin/videos/authors", label: "Auteurs Vidéos" },
            { href: "/admin/videos/playlists", label: "Playlists Vidéos" },
        ]
    },
    { href: "/admin/leaderboard", label: "Classement", icon: Trophy },
    { href: "/admin/promo", label: "Publicité", icon: Megaphone },
    { href: "/admin/whatsapp", label: "Groupes WhatsApp", icon: Phone },
    { href: "/admin/news", label: "Actualités", icon: Newspaper },
    { href: "/admin/settings", label: "Paramètres", icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter();
    const [isAuth, setIsAuth] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const secret = localStorage.getItem('admin-secret');
        if (secret === 'LuvviX') {
            setIsAuth(true);
        } else if (pathname !== '/admin/login') {
            router.replace('/admin/login');
        }
        setIsLoading(false);
    }, [pathname, router]);

    const handleLogout = () => {
        localStorage.removeItem('admin-secret');
        router.push('/admin/login');
    }

    if (pathname === '/admin/login') {
        return <>{children}</>
    }

    if (isLoading) {
        return <PageLoader />;
    }
    
    if (!isAuth) {
        // Redirection déjà gérée dans le useEffect, ceci est une sécurité
        return <PageLoader />;
    }

    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader>
                    <div className="flex items-center gap-2">
                        <Shield className="h-8 w-8 text-primary" />
                        <h1 className="text-xl font-headline font-semibold">Admin OnBuch</h1>
                    </div>
                </SidebarHeader>
                <SidebarMenu>
                    <SidebarGroup>
                        {menuItems.map((item, index) => (
                           item.subItems ? (
                                <Collapsible key={index} defaultOpen={item.subItems.some(sub => pathname.startsWith(sub.href))}>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton className="w-full justify-between" isActive={item.subItems.some(sub => pathname.startsWith(sub.href))}>
                                            <div className="flex items-center gap-2">
                                                <item.icon />
                                                <span>{item.label}</span>
                                            </div>
                                            <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <div className="pl-4 py-1 space-y-1 border-l-2 border-border ml-4">
                                            {item.subItems.map(subItem => (
                                                <Link key={subItem.href} href={subItem.href}>
                                                    <SidebarMenuButton variant="ghost" size="sm" isActive={pathname.startsWith(subItem.href)}>
                                                         <span>{subItem.label}</span>
                                                    </SidebarMenuButton>
                                                </Link>
                                            ))}
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                           ) : (
                             <SidebarMenuItem key={item.href}>
                                 <Link href={item.href}>
                                    <SidebarMenuButton isActive={pathname.startsWith(item.href) && (item.href === '/admin' ? pathname === '/admin' : true)} tooltip={item.label}>
                                        <item.icon />
                                        <span>{item.label}</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                           )
                        ))}
                    </SidebarGroup>
                </SidebarMenu>
                 <SidebarFooter>
                    <div className="flex items-center gap-2 p-2 rounded-lg w-full">
                        <Avatar className="h-10 w-10">
                            <AvatarFallback>{'A'}</AvatarFallback>
                        </Avatar>
                        <div className="overflow-hidden flex-1">
                            <p className="font-semibold truncate">Administrateur</p>
                            <p className="text-xs text-sidebar-foreground/70 truncate">Accès complet</p>
                        </div>
                        <Button variant="ghost" size="icon" className="shrink-0" onClick={handleLogout}>
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </SidebarFooter>
            </Sidebar>
             <SidebarInset>
                 <div className="md:hidden flex items-center justify-between p-2 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
                     <SidebarTrigger />
                     <Link href="/admin" className="flex items-center gap-2">
                        <Shield className="h-8 w-8 text-primary" />
                        <span className="font-headline font-semibold">Admin</span>
                     </Link>
                     <Avatar className="h-8 w-8">
                        <AvatarFallback>{'A'}</AvatarFallback>
                    </Avatar>
                </div>
                <div className="flex-1 p-4 md:p-8">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )

}
