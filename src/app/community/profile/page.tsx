
// src/app/community/profile/page.tsx
'use client'

import { notFound, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Phone, Calendar, BookOpen, GraduationCap, Loader2 } from 'lucide-react';
import { getUserProfile, type UserProfile } from '@/services/user-service';
import { useEffect, useState, Suspense } from 'react';

function UserProfileContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
        getUserProfile(id).then(data => {
            if(!data) notFound();
            setUser(data);
            setIsLoading(false);
        })
    } else {
        setIsLoading(false);
    }
  }, [id]);

  if(isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin" /></div>;
  }

  if (!id || !user) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <header>
         <Button asChild variant="outline" size="sm" className="mb-4">
            <Link href="/community">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la communauté
            </Link>
        </Button>
        <div className="flex flex-col items-center text-center">
            <Avatar className="h-32 w-32 border-4 border-primary mb-4">
                 <AvatarImage src={(user as any).photoURL} alt={user.displayName} />
                 <AvatarFallback className="text-4xl">{user.displayName[0]}</AvatarFallback>
            </Avatar>
            <div>
                 <h1 className="text-4xl font-headline font-bold">{user.displayName}</h1>
                 <p className="text-muted-foreground mt-1">Profil public de l'étudiant.</p>
            </div>
        </div>
      </header>

      <Card className="max-w-md mx-auto">
        <CardHeader>
            <CardTitle>Informations</CardTitle>
            <CardDescription>Détails sur le parcours scolaire de {user.displayName.split(' ')[0]}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-muted-foreground" />
                <span>Classe de <Badge variant="secondary">{user.schoolClass}</Badge></span>
            </div>
             <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                <span>Série <Badge variant="secondary">{user.series?.toUpperCase()}</Badge></span>
            </div>
            <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span>Membre depuis le {new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
        </CardContent>
      </Card>
      
    </div>
  );
}

export default function UserProfilePage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="animate-spin" /></div>}>
            <UserProfileContent />
        </Suspense>
    )
}
