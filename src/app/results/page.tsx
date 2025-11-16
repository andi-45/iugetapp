// src/app/results/page.tsx
'use client'

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';

const examOptions = [
  {
    title: "Résultats OBC",
    href: "/results/obc",
    description: "Consultez les résultats du BEPC, Probatoire et Baccalauréat.",
  },
  {
    title: "GCE Advanced Level",
    href: "/gce-results?level=a",
    description: "Consultez les résultats du GCE A-Level.",
  },
  {
    title: "GCE Ordinary Level",
    href: "/gce-results?level=o",
    description: "Consultez les résultats du GCE O-Level.",
  },
];

export default function ResultsPage() {
  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <header className="text-center">
        <h1 className="text-4xl font-headline font-bold text-gray-800 dark:text-white">Résultats des Examens</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Sélectionnez le type d'examen pour consulter les résultats.
        </p>
      </header>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {examOptions.map((option) => (
          <Link key={option.href} href={option.href} passHref>
            <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer">
              <CardHeader className="items-center text-center">
                <div className="p-3 bg-primary/10 rounded-full mb-2">
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-headline">{option.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
