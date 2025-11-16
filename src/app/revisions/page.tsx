// src/app/revisions/page.tsx
'use client'

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { getRevisions, type Revision } from "@/services/revision-service";
import { Loader2, Search } from "lucide-react";
import Link from "next/link";
import { useAuth } from '@/hooks/use-auth';
import { getSubjectIcon } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function RevisionsPage() {
  const { user } = useAuth();
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchRevisions = async () => {
      if (!user?.profile) return;
      setIsLoading(true);
      const allRevisions = await getRevisions();
      
      const userClass = user.profile.schoolClass;
      const userSeries = user.profile.series;
      
      const userRevisions = allRevisions.filter(rev => 
        rev.classes.includes(userClass) && rev.series.includes(userSeries)
      );

      setRevisions(userRevisions);
      setIsLoading(false);
    };

    fetchRevisions();
  }, [user]);

  const filteredRevisions = useMemo(() => {
    if (!searchTerm) return revisions;
    return revisions.filter(r => r.subjectName?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [revisions, searchTerm]);


  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <header>
        <h1 className="text-4xl font-headline font-bold text-gray-800 dark:text-white">Fiches de Révision</h1>
        <p className="text-muted-foreground mt-2">
          Consultez les chapitres, cours et ressources pour chaque matière de votre programme.
        </p>
      </header>
       <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
              placeholder="Rechercher une matière..." 
              className="pl-10"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
          />
      </div>

      {filteredRevisions.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {filteredRevisions.map(revision => {
            const Icon = getSubjectIcon(revision.subjectName);
            return (
              <Link key={revision.id} href={`/revisions/subject?id=${revision.id}`} legacyBehavior>
                <a className="block h-full">
                  <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                    <CardContent className="p-4 md:p-6 flex flex-col items-center justify-center text-center gap-4">
                      <div className="p-4 bg-primary/10 rounded-full">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg md:text-xl font-headline font-semibold">{revision.subjectName}</h3>
                      <Badge variant="secondary">{revision.chapters.length} chapitre{revision.chapters.length > 1 ? 's' : ''}</Badge>
                    </CardContent>
                  </Card>
                </a>
              </Link>
            )
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center text-muted-foreground">
            <h3 className="text-lg font-semibold">Aucune fiche de révision</h3>
            <p className="mt-1">Il n'y a pas encore de fiches de révision disponibles pour votre classe ou votre recherche.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
