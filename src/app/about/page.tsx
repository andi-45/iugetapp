// src/app/about/page.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { BrainCircuit, BookOpen, Users, Award, Code } from "lucide-react";

const features = [
    {
        icon: <BookOpen className="h-8 w-8 text-primary" />,
        title: "Resource academic",
        description: "Accédez à des cours et fiches de travaux dirige, des epreuves et aussi dautre documents academiques conformes au programme officiel du MINESEC pour un enseigement superieur ici a IUGET."
    },
    {
        icon: <BrainCircuit className="h-8 w-8 text-primary" />,
        title: "Professeur Virtuel IA",
        description: "Obtenez des explications de leçons, des corrections de devoirs et des questions pratiques grâce à notre IA pédagogique."
    },
    {
        icon: <Users className="h-8 w-8 text-primary" />,
        title: "Communauté d'Étudiants",
        description: "Connectez-vous avec des camarades de votre classe, collaborez et apprenez ensemble pour une meilleure motivation."
    }
];

export default function AboutPage() {
  return (
    <div className="flex-1 space-y-12 p-4 md:p-8">
      <header className="text-center space-y-4">
        <div className="inline-block bg-primary/10 p-4 rounded-2xl">
            <Logo className="h-16 w-16" />
        </div>
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-gray-800 dark:text-white">À Propos d'OnBuch</h1>
        <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
          Votre allié d'étude intelligent, conçu pour transformer la manière dont vous apprenez vous assurer une réussite.
        </p>
      </header>

      <section>
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-headline text-center">Notre Mission</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-center text-muted-foreground max-w-4xl mx-auto">
                    Chez OnBuch, notre mission est de rendre l'éducation de qualité accessible à chaque élève, où qu'il soit. Nous croyons au pouvoir de la technologie pour briser les barrières de l'apprentissage et pour fournir des outils personnalisés qui inspirent la curiosité, renforcent la confiance et garantissent la réussite scolaire.
                </p>
            </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-3xl font-headline font-semibold text-center mb-8">Fonctionnalités Clés</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                    <CardHeader className="items-center">
                        <div className="p-4 bg-secondary rounded-full">
                           {feature.icon}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <h3 className="text-xl font-semibold font-headline mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground text-sm">{feature.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
      </section>

      <footer className="text-center pt-8 border-t">
        <div className="flex justify-center items-center gap-2 text-muted-foreground">
            <Code className="h-5 w-5" />
            <p>Une création de</p>
        </div>
        <p className="text-xl font-bold text-primary mt-2">LuvviX Technologies</p>
      </footer>
    </div>
  );
}
