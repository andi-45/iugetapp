
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Library, Newspaper, BarChart3 } from "lucide-react";

const stats = [
    { title: "Utilisateurs Inscrits", value: "1,250", icon: Users },
    { title: "Cours Disponibles", value: "48", icon: BookOpen },
    { title: "Ressources Partagées", value: "120", icon: Library },
    { title: "Articles Publiés", value: "32", icon: Newspaper },
]

export default function AdminDashboardPage() {
  return (
    <div className="flex-1 space-y-8">
      <header>
        <h1 className="text-4xl font-headline font-bold">Tableau de Bord Administrateur</h1>
        <p className="text-muted-foreground mt-2">Vue d'ensemble de l'activité de la plateforme OnBuch.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
            <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <stat.icon className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">+20.1% depuis le mois dernier</p>
                </CardContent>
            </Card>
        ))}
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center gap-2">
                    <BarChart3 className="h-6 w-6" />
                    Activité des Utilisateurs
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Le graphique de l'activité des utilisateurs sera affiché ici.</p>
                <div className="h-64 bg-secondary mt-4 rounded-md flex items-center justify-center">
                    (Graphique à venir)
                </div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
                <CardTitle className="font-headline text-xl">Contenu Récent</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-3">
                    <li className="text-sm">Nouveau cours : "Philosophie pour tous"</li>
                    <li className="text-sm">Nouvel article : "Comment bien préparer ses examens"</li>
                    <li className="text-sm">Nouvelle ressource : "Annales de Maths 2024"</li>
                    <li className="text-sm">Nouvel utilisateur : "Jeanne Dupont"</li>
                </ul>
            </CardContent>
          </Card>
       </div>
    </div>
  );
}
