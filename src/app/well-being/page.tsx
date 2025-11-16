import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motivationalTips } from "@/lib/placeholder-data";
import { Lightbulb } from "lucide-react";

export default function WellBeingPage() {
  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <header className="text-center">
        <h1 className="text-4xl font-headline font-bold text-gray-800 dark:text-white">Motivation & Bien-être</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Améliorez vos habitudes d'étude avec des conseils pour la motivation et la gestion du stress.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {motivationalTips.map(tip => (
            <Card key={tip.id} className="hover:border-primary transition-colors">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="bg-accent p-3 rounded-lg">
                            <Lightbulb className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <CardTitle className="font-headline">{tip.title}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{tip.content}</p>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
}
