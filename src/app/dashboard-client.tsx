// src/app/dashboard-client.tsx
"use client"
import { Crown, Zap, ShieldCheck, Globe, BadgeCheck, Video as VideoIcon, CalendarCheck, BookOpen, Library, School, History, Trophy, Timer } from "lucide-react";
import { useEffect, useState, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { type Course, getCourses } from '@/services/course-service';
import { type Resource, getResources } from '@/services/resource-service';
import { type ScheduleEvent, getTodaysSchedule } from '@/services/planner-service';
import { type NewsArticle, getNews } from '@/services/news-service';
import { type HistoryItem, getHistory } from '@/services/history-service';
import { ArrowRight, Bell, Newspaper, Phone, Bookmark, FileText, CheckCircle, ExternalLink, Eye, Loader2, Video, ImageIcon as LucideImageIcon, PlayCircle, LifeBuoy, Copy, BookCopy, Facebook, Instagram, Youtube, FileSignature, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { getSubjectIcon } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { NotificationPanel } from '@/components/notification-panel';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { VideoResourceViewer } from '@/app/resources/video-resource-viewer';
import { useToast } from '@/hooks/use-toast';
import { MotivationalQuote } from '@/components/motivational-quote';
import { PageLoader } from '@/components/page-loader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CountrySelector } from "@/components/country-selector";
import { PromoCard } from "@/components/promo-card";
import { getWhatsAppGroupLink } from "@/services/whatsapp-group-service";

const getResourceIcon = (type: string) => {
    switch (type.toUpperCase()) {
        case 'VIDEO': return <Video className="h-8 w-8 text-secondary-foreground" />;
        case 'IMAGE': return <LucideImageIcon className="h-8 w-8 text-secondary-foreground" />;
        default: return <FileText className="h-8 w-8 text-secondary-foreground" />;
    }
}

// Fonction pour obtenir l'ID d'une vidéo YouTube à partir de l'URL
const getYoutubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

// Fonction pour obtenir l'URL de la miniature d'une vidéo YouTube
const getYoutubeThumbnail = (videoId: string): string => {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

const WhatsAppIcon = ({ className }: { className?: string }) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className}>
        <title>WhatsApp</title>
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.61 15.36 3.51 16.86L2.05 22L7.31 20.42C8.75 21.24 10.36 21.7 12.04 21.7C17.5 21.7 21.95 17.25 21.95 11.79C21.95 6.33 17.5 2 12.04 2M12.04 3.67C16.56 3.67 20.28 7.39 20.28 11.91C20.28 16.43 16.56 20.15 12.04 20.15C10.56 20.15 9.14 19.74 7.92 19L7.32 18.66L3.92 19.7L5.03 16.41L4.62 15.79C3.81 14.53 3.4 13.06 3.4 11.64C3.4 7.12 7.12 3.4 11.77 3.4L12.04 3.67ZM9.17 6.46C8.92 6.46 8.7 6.51 8.52 6.84C8.34 7.17 7.75 7.85 7.75 8.94C7.75 10.02 8.54 11.04 8.7 11.23C8.85 11.42 10.13 13.48 12.18 14.33C14.24 15.18 14.24 14.73 14.83 14.67C15.42 14.61 16.49 14 16.68 13.33C16.87 12.65 16.87 12.09 16.81 12C16.75 11.9 16.56 11.84 16.24 11.69C15.92 11.54 14.67 10.92 14.42 10.83C14.17 10.73 14 10.67 13.82 10.97C13.64 11.26 13.09 11.84 12.91 12.03C12.73 12.22 12.55 12.25 12.23 12.1C11.91 11.96 11.04 11.66 10.02 10.74C9.21 10.02 8.65 9.17 8.52 8.94C8.4 8.7 8.51 8.57 8.63 8.45C8.74 8.33 8.89 8.15 9.04 8C9.19 7.85 9.25 7.73 9.17 7.54C9.09 7.35 8.67 6.46 9.17 6.46Z" fill="currentColor"/>
    </svg>
);

const TikTokIcon = ({ className }: { className?: string }) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className}>
        <title>TikTok</title>
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.05-4.84-1.1-6.62-2.95-1.6-1.65-2.4-4.03-2.18-6.36.2-2.12 1.34-3.97 3.03-5.05.52-.34 1.08-.6 1.65-.79.03 2.8.01 5.6-.01 8.4.03.87.23 1.72.59 2.5.54 1.18 1.54 2.1 2.81 2.41.97.23 2.05.24 3.02-.04.83-.23 1.6-.66 2.23-1.25.64-.6 1.1-1.37 1.3-2.22.19-.85.23-1.75.21-2.67-.03-2.91-.01-5.82-.01-8.73-.04-1.57-.58-3.13-1.7-4.22-1.12-1.08-2.7-1.58-4.24-1.76V.02z" fill="currentColor"/>
    </svg>
);

function HelpDialog() {
    const { toast } = useToast();
    const whatsappNumber = "+237696191611";
    const whatsappMessage = "Je suis étudiant sur OnBuch j'ai besoin d'aide";
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(whatsappMessage)}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(whatsappNumber);
        toast({
            title: "Numéro copié !",
            description: "Le numéro WhatsApp a été copié dans le presse-papiers.",
        });
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <LifeBuoy className="mr-2 h-4 w-4"/>
                    Besoin d'aide ?
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md text-center">
                <DialogHeader>
                    <DialogTitle className="text-3xl font-headline text-center">Besoin d'aide ?</DialogTitle>
                    <DialogDescription className="text-center pt-2">
                        Contactez notre support directement sur WhatsApp pour une assistance rapide.
                    </DialogDescription>
                </DialogHeader>
                <div className="text-7xl my-4 animate-bounce">😢</div>
                <div className="space-y-4">
                     <div className="flex items-center justify-center p-3 bg-muted rounded-lg">
                        <span className="font-mono text-lg font-semibold">{whatsappNumber}</span>
                        <Button variant="ghost" size="icon" onClick={handleCopy} className="ml-2">
                            <Copy className="h-5 w-5"/>
                        </Button>
                    </div>
                    <Button asChild size="lg" className="w-full">
                        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                            Contacter via WhatsApp
                        </a>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
function PremiumDialog({ isIcon }: { isIcon?: boolean }) {
  const whatsappBase = "https://wa.me/237696191611?text=";

  const whatsappLink = (plan: string) =>
    `${whatsappBase}${encodeURIComponent(
      `Je suis étudiant sur OnBuch, je veux l'abonnement suivant : ${plan}`
    )}`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {isIcon ? (
            <Button variant="gold" size="icon" className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white hover:from-yellow-500 hover:to-yellow-700">
                <Crown className="h-5 w-5" />
            </Button>
        ) : (
            <Button variant="gold" className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white hover:from-yellow-500 hover:to-yellow-700">
                <Crown className="mr-2 h-4 w-4" />
                Premium
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-full sm:max-w-3xl max-h-[90vh] overflow-y-auto px-4">
        <DialogHeader>
          <DialogTitle className="text-3xl font-headline text-center flex items-center justify-center gap-2">
            <Crown className="h-8 w-8 text-yellow-500" />
            Passez à premium 
            <Crown className="h-8 w-8 text-yellow-500" />
          </DialogTitle>
          <DialogDescription className="text-center">
            Débloquez tous les avantages exclusifs et accélérez votre apprentissage
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Avantages */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Avantages Premium
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <BadgeCheck className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span>Accès illimité à tous les cours premium</span>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span>Téléchargement des ressources sans restriction</span>
              </li>
              <li className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span>Support prioritaire 24/7</span>
              </li>
              <li className="flex items-start gap-3">
                <BookCopy className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span>Ressources d'apprentissage exclusives</span>
              </li>
              <li className="flex items-start gap-3">
                <Trophy className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span>Suivi personnalisé</span>
              </li>
            </ul>
          </div>

          {/* Tarifs */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Nos Offres
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 text-center hover:border-yellow-400 transition-colors">
                <h4 className="font-medium">1 Semaine</h4>
                <p className="text-2xl font-bold mt-2">1 000 FCFA</p>
                <a href={whatsappLink("1 Semaine")} target="_blank" rel="noopener noreferrer">
                  <Button className="mt-3 w-full bg-green-500 hover:bg-green-600 text-white">
                    Payer par WhatsApp
                  </Button>
                </a>
              </div>

              <div className="border rounded-lg p-4 text-center hover:border-yellow-400 transition-colors bg-yellow-50 border-yellow-200">
                <h4 className="font-medium">1 Mois</h4>
                <p className="text-2xl font-bold mt-2">2 500 FCFA</p>
                <a href={whatsappLink("1 Mois")} target="_blank" rel="noopener noreferrer">
                  <Button className="mt-3 w-full bg-yellow-500 hover:bg-yellow-600 text-white">
                    Payer par WhatsApp
                  </Button>
                </a>
              </div>

              <div className="border rounded-lg p-4 text-center hover:border-yellow-400 transition-colors">
                <h4 className="font-medium">1 Année</h4>
                <p className="text-2xl font-bold mt-2">5 000 FCFA</p>
                <a href={whatsappLink("1 Année")} target="_blank" rel="noopener noreferrer">
                  <Button className="mt-3 w-full bg-green-500 hover:bg-green-600 text-white">
                    Payer par WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Contact WhatsApp */}
        <div className="text-center mt-4 text-sm text-gray-600">
          Paiement via WhatsApp :{" "}
          <a
            href="https://wa.me/237696191611"
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-600 font-medium underline"
          >
            696 191 611
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function JoinClassGroup() {
    const { user } = useAuth();
    const [groupLink, setGroupLink] = useState<string | null>(null);

    useEffect(() => {
        if (user?.profile?.schoolClass && user.profile.series) {
            getWhatsAppGroupLink(user.profile.schoolClass, user.profile.series).then(link => {
                setGroupLink(link);
            });
        }
    }, [user]);

    if (!groupLink) {
        return null; // Don't render anything if no link is configured
    }

    return (
        <Card className="bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800">
            <CardContent className="p-6 flex flex-col md:flex-row items-center text-center md:text-left gap-4">
                <WhatsAppIcon className="h-16 w-16 text-green-500 shrink-0" />
                <div className="flex-1">
                    <h3 className="text-xl font-bold font-headline">Rejoignez votre classe !</h3>
                    <p className="text-muted-foreground">
                        Connectez-vous avec vos camarades de {user?.profile?.schoolClass} ({user?.profile?.series?.toUpperCase()}) sur WhatsApp pour partager, discuter et vous entraider.
                    </p>
                </div>
                <Button asChild size="lg" className="bg-green-500 hover:bg-green-600 text-white mt-4 md:mt-0 shrink-0">
                    <a href={groupLink} target="_blank" rel="noopener noreferrer">Rejoindre le groupe</a>
                </Button>
            </CardContent>
        </Card>
    );
}


interface DashboardData {
    savedCourses: Course[];
    recentResources: Resource[];
    todaysSchedule: ScheduleEvent[];
    recentNews: NewsArticle[];
    historyItems: HistoryItem[];
}

const quickActions = [
  { 
    title: "Organiser", 
    href: "/planner", 
    icon: CalendarCheck,
    color: "bg-blue-100 dark:bg-blue-900/30",
    textColor: "text-blue-600 dark:text-blue-300"
  },
  { 
    title: "Réviser", 
    href: "/courses", 
    icon: BookOpen,
    color: "bg-orange-100 dark:bg-orange-900/30",
    textColor: "text-orange-600 dark:text-orange-300"
  },
];


export function DashboardClient() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Resource | null>(null);
  
  const fetchData = useCallback(async () => {
    if (!user?.profile) {
      setIsLoading(false);
      return;
    }
    // Only fetch if data is not already loaded
    if (data) {
        setIsLoading(false);
        return;
    }

    setIsLoading(true);

    try {
        const [allCourses, allResources, scheduleData, newsData, historyData] = await Promise.all([
          getCourses(),
          getResources(),
          getTodaysSchedule(user.uid),
          getNews(),
          getHistory(user.uid, 5) // fetch last 5 history items
        ]);
        
        const userSavedCourseIds = user.profile?.savedCourses || [];
        const savedCourses = allCourses.filter(course => userSavedCourseIds.includes(course.id));

        const userClass = user.profile?.schoolClass || '';
        const userSeries = user.profile?.series || '';
        const recentResources = allResources
          .filter(resource => 
            resource.classes.includes(userClass) && 
            resource.series.includes(userSeries)
          )
          .slice(0, 5);
        
        const publishedNews = newsData
          .filter(item => item.status === 'published')
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 3);
        
        setData({
          savedCourses,
          recentResources,
          todaysSchedule: scheduleData,
          recentNews: publishedNews,
          historyItems: historyData,
        });
    } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
    } finally {
        setIsLoading(false);
    }
  }, [user, data]);


  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleOpenVideo = (resource: Resource) => {
    setSelectedVideo(resource);
    setIsVideoOpen(true);
  };

  const getFirstName = () => {
    if (user?.displayName) {
      return user.displayName.split(' ')[0];
    }
    return 'Étudiant';
  };

  if (isLoading || !data) {
    return <PageLoader />;
  }

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-4xl font-headline font-bold text-gray-800 dark:text-white flex items-center gap-3">
            Bon retour, {getFirstName()} !
            {user?.profile?.points != null && (
              <Badge variant="secondary" className="text-base font-bold bg-amber-100 text-amber-800 border-amber-300">
                <Trophy className="h-4 w-4 mr-2 text-amber-600"/> {user.profile.points} pts
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-2">Faisons de cette journée une journée d'étude productive.</p>
        </div>
        <div className="flex items-center gap-2">
            <HelpDialog />
            <PremiumDialog isIcon />
            <Button asChild variant="outline" size="icon">
                <Link href="/account">
                    <School className="h-5 w-5" />
                </Link>
            </Button>
            <NotificationPanel />
        </div>
      </header>
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          <MotivationalQuote />

          <Button asChild variant="outline" className="w-full h-16 text-lg">
            <Link href="/pomodoro-session">
              <Timer className="mr-3 h-6 w-6" />
              Lancer une session de révision
            </Link>
          </Button>

          <PromoCard />

          <section>
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-headline font-semibold flex items-center gap-2"><History /> Historique Récent</h2>
            </div>
            {data.historyItems.length > 0 ? (
                <Carousel opts={{ align: "start" }} className="w-full">
                    <CarouselContent>
                        {data.historyItems.map((item, index) => (
                            <CarouselItem key={index} className="sm:basis-1/2 lg:basis-1/3">
                                <Card className="h-full">
                                    <CardContent className="p-4 flex items-center gap-3">
                                        <div className="bg-secondary p-3 rounded-lg"><History className="h-5 w-5 text-secondary-foreground" /></div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm line-clamp-2">{item.title}</p>
                                            <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
                                        </div>
                                        <Button asChild variant="ghost" size="sm">
                                            <Link href={item.link}>Reprendre</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="-left-4 hidden sm:flex"/>
                    <CarouselNext className="-right-4 hidden sm:flex" />
                </Carousel>
             ) : (
                <Card className="border-dashed">
                    <CardContent className="p-6 text-center text-muted-foreground">
                        <p>Aucune activité récente. Commencez à étudier pour voir votre historique ici !</p>
                    </CardContent>
                </Card>
             )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-headline font-semibold flex items-center gap-2"><CalendarCheck /> Programme du Jour</h2>
              <Button asChild variant="secondary">
                <Link href="/planner">Voir tout</Link>
              </Button>
            </div>
            {data.todaysSchedule.length > 0 ? (
                <div className="space-y-3">
                    {data.todaysSchedule.map((event, index) => {
                        const Icon = getSubjectIcon(event.subjectName);
                        return (
                            <Card key={event.id} className="group hover:border-primary/50 transition-all duration-200">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="bg-primary/10 text-primary p-3 rounded-lg"><Icon className="h-5 w-5" /></div>
                                    <div className="flex-1">
                                      <p className="font-semibold">{event.title}</p>
                                      <p className="text-sm text-muted-foreground">{event.subjectName}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{event.startTime} - {event.endTime}</p>
                                        <Badge variant="outline" className="mt-1">{event.type}</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                <Card className="border-dashed">
                    <CardContent className="p-6 text-center text-muted-foreground">
                        <p>Aucun programme pour aujourd'hui. Profitez-en pour planifier !</p>
                        <Button asChild variant="link" className="mt-2">
                           <Link href="/planner">Aller au planning</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-headline font-semibold flex items-center gap-2"><Bookmark /> Vos Cours Sauvegardés</h2>
              {data.savedCourses.length > 3 && (
                <Button asChild variant="secondary">
                  <Link href="/courses/saved">Voir tout</Link>
                </Button>
              )}
            </div>
            {data.savedCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {data.savedCourses.slice(0, 3).map((course) => (
                    <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="p-0">
                        <Image src={course.imageUrl} alt={course.title} width={400} height={200} className="w-full h-32 object-cover" data-ai-hint={course.imageHint} />
                    </CardHeader>
                    <CardContent className="p-4">
                        <CardTitle className="font-headline text-lg mb-2">{course.title}</CardTitle>
                        <Button asChild variant="link" className="px-0 mt-2 font-semibold">
                          <Link href={`/viewer?url=${encodeURIComponent(course.pdfUrl)}&title=${encodeURIComponent(course.title)}`}>
                              Ouvrir le cours <Eye className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                    </CardContent>
                    </Card>
                ))}
                </div>
            ) : (
                <Card className="border-dashed">
                    <CardContent className="p-6 text-center text-muted-foreground">
                        <p>Vous n'avez pas encore de cours sauvegardés.</p>
                        <Button asChild variant="link" className="mt-2">
                           <Link href="/courses">Explorer les cours</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
          </section>

        </div>

        <aside className="space-y-8">
           <section>
             <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-headline font-semibold">Ressources Récentes</h2>
             </div>
             {data.recentResources.length > 0 ? (
                <Carousel opts={{ align: "start", loop: true }} className="w-full">
                  <CarouselContent>
                    {data.recentResources.map((resource) => {
                      const youtubeId = resource.type === 'VIDEO' ? getYoutubeId(resource.url) : null;
                      const viewerUrl = `/viewer?url=${encodeURIComponent(resource.url)}&title=${encodeURIComponent(resource.title)}`;
                      return (
                        <CarouselItem key={resource.id}>
                          <Card className="overflow-hidden">
                             {youtubeId ? (
                                <div className="p-0 border-b relative h-40">
                                    <Image src={getYoutubeThumbnail(youtubeId)} alt={resource.title} layout="fill" objectFit="cover" />
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                        <PlayCircle className="h-12 w-12 text-white/70" />
                                    </div>
                                </div>
                            ) : resource.type === 'IMAGE' ? (
                                 <div className="p-0 border-b relative h-40">
                                    <Image src={resource.url} alt={resource.title} layout="fill" objectFit="cover" />
                                </div>
                            ) : (
                                <div className="flex-row items-center gap-4 p-4 border-b h-40 flex justify-center bg-muted">
                                    {getResourceIcon(resource.type)}
                                </div>
                            )}
                            <CardContent className="flex flex-col items-center justify-center p-4 gap-2">
                                <p className="font-semibold text-center leading-tight text-sm h-10 overflow-hidden">{resource.title}</p>
                                {resource.type === 'VIDEO' ? (
                                     <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => handleOpenVideo(resource)}>
                                        <PlayCircle className="mr-2 h-4 w-4" /> Voir
                                    </Button>
                                ) : (
                                     <Button asChild variant="outline" size="sm" className="w-full mt-2">
                                        <Link href={viewerUrl}>
                                            Ouvrir
                                        </Link>
                                    </Button>
                                )}
                            </CardContent>
                          </Card>
                        </CarouselItem>
                      )
                    })}
                  </CarouselContent>
                  <CarouselPrevious className="-left-4" />
                  <CarouselNext className="-right-4" />
                </Carousel>
             ) : (
                <Card className="border-dashed">
                    <CardContent className="p-6 text-center text-muted-foreground">
                        <p>Aucune ressource récente pour votre classe.</p>
                    </CardContent>
                </Card>
             )}
          </section>

          <section>
              <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-headline font-semibold flex items-center gap-2">
                      <Newspaper className="h-6 w-6 text-primary" />
                      Blog & Actualités
                  </h2>
                  <Button asChild variant="secondary">
                      <Link href="/news">Tout voir</Link>
                  </Button>
              </div>
              {data.recentNews.length > 0 ? (
                  <Carousel opts={{ align: "start" }} className="w-full">
                      <CarouselContent>
                          {data.recentNews.map((item) => (
                              <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-full">
                                  <Card className="overflow-hidden h-full flex flex-col">
                                      <CardHeader className="p-0">
                                          <Link href={`/news/article?slug=${item.slug}`}>
                                              <Image src={item.imageUrl} alt={item.title} width={400} height={200} className="w-full h-40 object-cover" data-ai-hint={item.imageHint} />
                                          </Link>
                                      </CardHeader>
                                      <CardContent className="p-4 flex-grow">
                                          <Badge variant="secondary">{item.category}</Badge>
                                          <CardTitle className="font-headline text-lg mt-2 mb-1">{item.title}</CardTitle>
                                          <CardDescription className="text-xs">{item.date}</CardDescription>
                                      </CardContent>
                                      <CardFooter className="p-4 pt-0">
                                          <Button asChild variant="link" className="p-0">
                                              <Link href={`/news/article?slug=${item.slug}`}>Lire la suite <ArrowRight className="ml-2 h-4 w-4" /></Link>
                                          </Button>
                                      </CardFooter>
                                  </Card>
                              </CarouselItem>
                          ))}
                      </CarouselContent>
                      <CarouselPrevious className="left-2" />
                      <CarouselNext className="right-2" />
                  </Carousel>
              ) : (
                  <p className="text-muted-foreground text-sm text-center py-4">Aucune actualité pour le moment.</p>
              )}
          </section>
        </aside>
      </main>

      {selectedVideo && (
        <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
          <VideoResourceViewer resource={selectedVideo} defaultOpen={isVideoOpen}/>
        </Dialog>
      )}

      <div className='py-8'>
          <JoinClassGroup />
      </div>

      <footer className="text-center pt-8 border-t">
        <h3 className="text-lg font-semibold text-muted-foreground">Rejoins-nous</h3>
        <div className="flex justify-center gap-3 mt-4">
            <Button asChild size="icon" variant="outline" className="rounded-full h-12 w-12 border-2 hover:bg-[#1877F2] hover:text-white">
                <a href="https://www.facebook.com/profile.php?id=61578933748212"><Facebook /></a>
            </Button>
            <Button asChild size="icon" variant="outline" className="rounded-full h-12 w-12 border-2 hover:bg-[#25D366] hover:text-white">
                <a href="https://whatsapp.com/channel/0029Vb6Aj7E0wajtpC81Yr16"><WhatsAppIcon className="h-6 w-6" /></a>
            </Button>
            <Button asChild size="icon" variant="outline" className="rounded-full h-12 w-12 border-2 hover:bg-[#FF0000] hover:text-white">
                <a href="https://youtube.com/@onbuch?si=SjWOhXb6c4D3iOzM"><Youtube /></a>
            </Button>
             <Button asChild size="icon" variant="outline" className="rounded-full h-12 w-12 border-2 hover:bg-[#E4405F] hover:text-white">
                <a href="#"><Instagram /></a>
            </Button>
            <Button asChild size="icon" variant="outline" className="rounded-full h-12 w-12 border-2 hover:bg-black hover:text-white">
                <a href="https://tiktok.com/@onbuch"><TikTokIcon className="h-6 w-6" /></a>
            </Button>
        </div>
      </footer>

      <Button 
  asChild 
  className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-40 
             h-14 w-14 rounded-full shadow-xl bg-orange-500 
             hover:bg-orange-600 text-white transition-all duration-300 hover:scale-110">
  <Link href="/videos" className="flex items-center justify-center">
    <VideoIcon className="h-6 w-6" />
  </Link>
</Button>
    </div>
  );
}
