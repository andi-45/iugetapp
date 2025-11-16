
// src/app/admin/users/details/page.tsx
'use client'

import { notFound, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Phone, Calendar, BookOpen, GraduationCap, Gem, Loader2 } from 'lucide-react';
import { getUserProfile, UserProfile } from '@/services/user-service';
import { useEffect, useState, Suspense } from 'react';

function UserDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
        getUserProfile(id).then(data => {
            if (!data) notFound();
            setProfile(data);
            setIsLoading(false);
        });
    } else {
        setIsLoading(false);
    }
  }, [id]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin" /></div>;
  }

  if (!id || !profile) {
    return notFound();
  }
  
  const { displayName, email, schoolClass, series, whatsapp, createdAt, isPremium, premiumExpiresAt } = profile;
  const photoURL = (profile as any).photoURL;

  return (
    <div className="flex-1 space-y-8">
      <header>
         <Button asChild variant="outline" size="sm" className="mb-4">
            <Link href="/admin/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la liste
            </Link>
        </Button>
        <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border">
                 <AvatarImage src={photoURL} alt={displayName} />
                 <AvatarFallback>{displayName[0]}</AvatarFallback>
            </Avatar>
            <div>
                 <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-headline font-bold">{displayName}</h1>
                    {isPremium && <Badge className="bg-purple-500 text-white gap-2"><Gem className="h-4 w-4" /> Premium</Badge>}
                 </div>
                 <p className="text-muted-foreground mt-1">Profil détaillé de l'utilisateur.</p>
            </div>
        </div>
      </header>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Informations Personnelles</CardTitle>
                    <CardDescription>Détails et informations de contact de l'utilisateur.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <span>{email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <GraduationCap className="h-5 w-5 text-muted-foreground" />
                        <span>Classe : <Badge variant="secondary">{schoolClass} {series?.toUpperCase()}</Badge></span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <span>{whatsapp}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <span>Inscrit le : {new Date(createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                     {isPremium && premiumExpiresAt && (
                        <div className="flex items-center gap-3 pt-2 border-t mt-4">
                            <Gem className="h-5 w-5 text-purple-500" />
                            <span>Statut Premium expire le : <span className="font-semibold">{new Date(premiumExpiresAt).toLocaleDateString('fr-FR')}</span></span>
                        </div>
                     )}
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Activité Récente</CardTitle>
                    <CardDescription>Dernières interactions de l'utilisateur sur la plateforme.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">L'historique des activités sera affiché ici.</p>
                </CardContent>
            </Card>
        </div>
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Gestion</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Les actions de gestion de l'utilisateur (bannir, etc.) seront disponibles ici.</p>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

export default function UserDetailPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="animate-spin" /></div>}>
            <UserDetailContent />
        </Suspense>
    )
}
