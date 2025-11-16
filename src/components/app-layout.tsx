// src/components/app-layout.tsx

"use client"

import * as React from "react"
import {
    Home,
    BookOpen,
    BrainCircuit,
    CalendarCheck,
    HeartPulse,
    LayoutDashboard,
    Library,
    LogOut,
    Moon,
    Settings,
    Sun,
    Users,
    Newspaper,
    FolderHeart,
    UserPlus,
    Info,
    UserCircle,
    GraduationCap,
    FileSignature,
    ChevronDown,
    Video,
    BookCopy,
    Layers,
    Bot,
} from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"

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
  SidebarMenuBadge,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "./ui/button"
import { Logo } from "./logo"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { PageLoader } from "./page-loader"
import { Suspense } from "react"
import { OfflineIndicator } from "./offline-indicator"
import { NotificationPanel } from "./notification-panel"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CountrySelector } from "./country-selector"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"


const menuConfig = [
  {
    label: "Principal",
    items: [
      { href: "/", label: "Accueil", mobileLabel: "Accueil", icon: LayoutDashboard, mobileIcon: Home },
      { href: "/ai-tutor", label: "Tuteur IA", icon: BrainCircuit },
      { href: "/ia-tools", label: "Outils IA", icon: Bot },
      { href: "/planner", label: "Planning", icon: CalendarCheck },
    ]
  },
  {
    label: "Apprentissage",
    items: [
      {
        href: "/courses",
        label: "Cours",
        icon: BookOpen,
        subItems: [
          { href: "/courses", label: "Mes Cours" },
          { href: "/courses/saved", label: "Mes Favoris" },
        ],
      },
       {
        href: "/revisions",
        label: "Révisions",
        icon: BookCopy,
      },
       {
        href: "/flashcards",
        label: "Flashcards",
        icon: Layers,
      },
      {
        href: "/resources",
        label: "Ressources",
        icon: Library,
        subItems: [
          { href: "/resources", label: "Mes Ressources" },
          { href: "/resources/saved", label: "Mes Sauvegardes" },
        ],
      },
       { href: "/videos", label: "Vidéos", icon: Video },
    ],
  },
  {
    label: "Communauté & Plus",
    items: [
      { href: "/results", label: "Résultats Examens", icon: GraduationCap },
{ href: "/community", label: "Classement OnBuch", icon: Users },
      { href: "/news", label: "Actualités", icon: Newspaper },
      { href: "/about", label: "À propos", icon: Info },
    ]
  }
];

const mobileMenuItems = [
    { href: "/", label: "Accueil", icon: Home },
    { href: "/ai-tutor", label: "Tuteur IA", icon: BrainCircuit },
    { href: "/revisions", label: "Révisions", icon: BookCopy },
    { href: "/planner", label: "Planning", icon: CalendarCheck },
    { href: "/resources", label: "Ressources", icon: Library },
];


function NavigationEvents() {
    const pathname = usePathname()
    const [loading, setLoading] = React.useState(false);
    const [previousPath, setPreviousPath] = React.useState(pathname);

    React.useEffect(() => {
        if (pathname !== previousPath) {
            setLoading(true);
            const timer = setTimeout(() => {
                setLoading(false);
                setPreviousPath(pathname);
            }, 500); 
            return () => clearTimeout(timer);
        }
    }, [pathname, previousPath]);
    
    React.useEffect(() => {
      // Hide loader on initial load complete
      setLoading(false);
    }, []);

    return loading ? <PageLoader /> : null;
}


export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter();
    const { user, loading } = useAuth();
    const [theme, setTheme] = React.useState('light');
    
    const publicRoutes = ['/login', '/signup', '/admin/login', '/viewer', '/gce-results', '/forgot-password', '/revisions/chapter', '/flashcards/review'];
    const isAdminRoute = pathname.startsWith('/admin');
    const isPublicRoute = publicRoutes.some(path => pathname.startsWith(path));
    
    const receivedRequestsCount = user?.profile?.receivedConnectionRequests?.filter(req => !req.read).length || 0;
    
    React.useEffect(() => {
        if (!loading && !user && !isPublicRoute && !isAdminRoute) {
            router.push('/login');
        }
    }, [user, loading, isPublicRoute, isAdminRoute, router, pathname]);

    React.useEffect(() => {
        const storedTheme = localStorage.getItem('theme') || 'light';
        setTheme(storedTheme);
        document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    }, [])

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
    
    if (isPublicRoute) {
        return <main>{children}</main>;
    }
    
    if (loading) {
        return <PageLoader />
    }

    if (!user && !isAdminRoute) {
        return <PageLoader />;
    }

    return (
        <>
            <SidebarProvider>
                <Sidebar>
                    <SidebarHeader>
                        <div className="flex items-center gap-2">
                            <Logo />
                            <h1 className="text-xl font-headline font-semibold">OnBuch</h1>
                        </div>
                    </SidebarHeader>
                    <SidebarMenu className="flex-1 overflow-y-auto">
                        {menuConfig.map((group, index) => (
                          <SidebarGroup key={group.label} className="pt-4">
                            {index > 0 && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
                            {group.items.map(item =>
                              item.subItems ? (
                                <Collapsible key={item.href} defaultOpen={pathname.startsWith(item.href)}>
                                  <SidebarMenuItem className="relative">
                                    <CollapsibleTrigger asChild>
                                      <SidebarMenuButton
                                        isActive={pathname.startsWith(item.href)}
                                        tooltip={item.label}
                                        className="w-full"
                                      >
                                        <item.icon />
                                        <span>{item.label}</span>
                                         <ChevronDown className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                                      </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                  </SidebarMenuItem>
                                  <CollapsibleContent>
                                    <SidebarMenuSub>
                                      {item.subItems.map(subItem => (
                                        <SidebarMenuSubItem key={subItem.href}>
                                          <Link href={subItem.href}>
                                            <SidebarMenuSubButton isActive={pathname === subItem.href}>
                                              {subItem.label}
                                              {subItem.badgeKey === 'connectionRequests' && receivedRequestsCount > 0 && (
                                                <SidebarMenuBadge className="ml-auto">{receivedRequestsCount}</SidebarMenuBadge>
                                              )}
                                            </SidebarMenuSubButton>
                                          </Link>
                                        </SidebarMenuSubItem>
                                      ))}
                                    </SidebarMenuSub>
                                  </CollapsibleContent>
                                </Collapsible>
                              ) : (
                                <SidebarMenuItem key={item.href}>
                                  <Link href={item.href}>
                                    <SidebarMenuButton
                                      isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
                                      tooltip={item.label}
                                    >
                                      <item.icon />
                                      <span>{item.label}</span>
                                    </SidebarMenuButton>
                                  </Link>
                                </SidebarMenuItem>
                              )
                            )}
                          </SidebarGroup>
                        ))}
                    </SidebarMenu>
                    <SidebarFooter>
                        <SidebarMenu>
                             <SidebarMenuItem>
                                <Button variant="ghost" onClick={toggleTheme} className="w-full justify-start gap-2 px-2">
                                   {theme === 'light' ? <Sun /> : <Moon />}
                                   <span>{theme === 'light' ? 'Mode Clair' : 'Mode Sombre'}</span>
                                </Button>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                 <UserMenu />
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarFooter>
                </Sidebar>
                <SidebarInset>
                     <Suspense fallback={null}>
                        <NavigationEvents />
                     </Suspense>
                    <div className="md:hidden flex items-center justify-between p-2 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
                         <SidebarTrigger />
                         <Link href="/" className="flex items-center gap-2">
                            <Logo className="h-8 w-8" />
                            <span className="font-headline font-semibold">OnBuch</span>
                         </Link>
                         <CountrySelector />
                    </div>
                    <div className="flex-1 pb-20 md:pb-0 h-full">
                        {children}
                    </div>
                    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t p-2 z-50">
                        <nav className="flex justify-around items-center">
                            {mobileMenuItems.map((item) => {
                                const Icon = item.icon;
                                const label = item.label;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex flex-col items-center justify-center text-xs gap-1 w-16 p-1 rounded-md transition-colors",
                                            (pathname === item.href || (item.href === "/revisions" && pathname.startsWith("/revisions")))
                                                ? "text-primary bg-primary/10"
                                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span className="truncate">{label}</span>
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>
                </SidebarInset>
            </SidebarProvider>
            <OfflineIndicator />
        </>
    )
}

function UserMenu() {
    const { user, logout } = useAuth();
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-sidebar-accent w-full cursor-pointer">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || "User"} />
                        <AvatarFallback>{user?.email?.[0].toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden flex-1">
                        <p className="font-semibold truncate">{user?.displayName || 'Étudiant'}</p>
                        <p className="text-xs text-sidebar-foreground/70 truncate">{user?.email}</p>
                    </div>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mb-2" side="top" align="start">
                <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/account"><UserCircle className="mr-2 h-4 w-4" />Profil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/settings"><Settings className="mr-2 h-4 w-4" />Paramètres</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
