
'use client'

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2, Loader2, Clock, CalendarCheck, Sigma } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import type { ScheduleEvent } from '@/services/planner-service';
import { getSchedule, deleteScheduleEvent } from '@/services/planner-service';
import { PlannerForm } from './planner-form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { getSubjectIcon } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

// Définition des couleurs par matière pour améliorer la lisibilité
const subjectColors: Record<string, string> = {
  Mathématiques: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Français: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Histoire: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  // Ajoutez d'autres matières ici
};

const getSubjectColor = (subjectName: string) => {
  return subjectColors[subjectName] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
};

const weekDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const weeklyGoalHours = 20; // Objectif hebdomadaire en heures

type FormState = {
  mode: 'add' | 'edit';
  isOpen: boolean;
  event?: ScheduleEvent | null;
  day?: string;
}

function DayColumn({ day, events, onEdit, onDelete }: { day: string, events: ScheduleEvent[], onEdit: (day: string, event: ScheduleEvent) => void, onDelete: (eventId: string, eventTitle: string) => void }) {
  // Calcul de la durée d'un événement
  const calculateDuration = (startTime: string, endTime: string) => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const duration = (endH * 60 + endM) - (startH * 60 + startM);
    return duration / 60;
  };

  return (
    <div className="space-y-3">
      {events.length > 0 ? (
        events.map((item) => {
          const Icon = getSubjectIcon(item.subjectName);
          return (
            <Card key={item.id} className="group transition-shadow hover:shadow-md bg-background dark:bg-gray-800">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary rounded-lg">
                    <Icon className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{item.title}</p>
                    <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className={getSubjectColor(item.subjectName)}>
                        {item.subjectName}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {item.startTime} - {item.endTime}
                        <span className="ml-1">({calculateDuration(item.startTime, item.endTime).toFixed(1)}h)</span>
                      </span>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onEdit(day, item)}
                      aria-label={`Éditer l'événement ${item.title}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          aria-label={`Supprimer l'événement ${item.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer l'événement ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible. Voulez-vous vraiment supprimer "{item.title}" ?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(item.id, item.title)}>Confirmer</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      ) : (
        <div className="text-center text-sm text-muted-foreground py-8 px-4 h-full flex items-center justify-center border-dashed border-2 rounded-lg">
          Aucun événement pour {day.toLowerCase()}.
        </div>
      )}
    </div>
  );
}

export default function PlannerPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formState, setFormState] = useState<FormState>({ mode: 'add', isOpen: false });
  const [filterSubject, setFilterSubject] = useState<string>('all');

  const fetchSchedule = async () => {
    if (!user) return;
    setIsLoading(true);
    const userEvents = await getSchedule(user.uid);
    setEvents(userEvents);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSchedule();
  }, [user]);

  const handleOpenForm = (mode: FormState['mode'], day?: string, event?: ScheduleEvent) => {
    setFormState({ mode, day, event, isOpen: true });
  };

  const handleCloseForm = (refresh: boolean) => {
    setFormState({ ...formState, isOpen: false });
    if (refresh) {
      fetchSchedule();
    }
  };

  const handleDelete = async (eventId: string, eventTitle: string) => {
    if (!user) return;
    try {
      await deleteScheduleEvent(user.uid, eventId);
      toast({ title: "Événement supprimé", description: `"${eventTitle}" a été retiré de votre planning.` });
      fetchSchedule();
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de supprimer l'événement.", variant: "destructive" });
    }
  };

  const filteredEvents = filterSubject === 'all' ? events : events.filter(e => e.subjectName === filterSubject);

  const eventsByDay = weekDays.reduce((acc, day) => {
    acc[day] = filteredEvents
      .filter(e => e.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {} as Record<string, ScheduleEvent[]>);

  const getTodayName = () => {
    const today = new Date();
    // getDay() returns 0 for Sunday, 1 for Monday, etc. We want Monday to be the start of the week.
    const dayIndex = (today.getDay() + 6) % 7;
    return weekDays[dayIndex];
  };


  const todayName = getTodayName();
  const todaysEvents = eventsByDay[todayName] || [];

  const totalWeeklyHours = filteredEvents.reduce((total, event) => {
    const [startH, startM] = event.startTime.split(':').map(Number);
    const [endH, endM] = event.endTime.split(':').map(Number);
    const duration = (endH * 60 + endM) - (startH * 60 + startM);
    return total + duration;
  }, 0) / 60;

  return (
    <div className="flex-1 flex flex-col h-full bg-background dark:bg-gray-900 text-foreground dark:text-white">
      <header className="p-4 md:p-6 border-b shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold">Planning de Révision</h1>
            <p className="text-muted-foreground mt-1 text-sm">Votre emploi du temps personnalisé pour rester sur la bonne voie.</p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-3">
             <div className="flex items-center gap-2 text-base font-semibold text-primary">
              <Sigma className="h-5 w-5" />
              <span>{totalWeeklyHours.toFixed(1)}h / {weeklyGoalHours}h prévues</span>
            </div>
            <Progress value={(totalWeeklyHours / weeklyGoalHours) * 100} className="w-full sm:w-48" />
          </div>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <Select onValueChange={setFilterSubject} defaultValue="all">
                <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filtrer par matière" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Toutes les matières</SelectItem>
                    {Object.keys(subjectColors).map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button onClick={() => handleOpenForm('add')} className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter au planning
            </Button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex justify-center items-center flex-1">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <section className="mb-6">
            <h2 className="text-xl font-headline font-semibold flex items-center gap-2 mb-4">
                <CalendarCheck className="h-6 w-6 text-primary" />
                Aujourd'hui ({todayName})
            </h2>
            <DayColumn day={todayName} events={todaysEvents} onEdit={handleOpenForm} onDelete={handleDelete} />
          </section>

          <section>
            <h2 className="text-xl font-headline font-semibold mb-4">Vue de la semaine</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {weekDays.map(day => (
                <Card key={day} id={`day-${day}`} className="bg-background dark:bg-gray-800">
                  <CardContent className="p-3 sm:p-4">
                    <h3 className="font-bold text-base mb-3 text-center">{day}</h3>
                    <DayColumn
                      day={day}
                      events={eventsByDay[day]}
                      onEdit={handleOpenForm}
                      onDelete={handleDelete}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => handleOpenForm('add', day)}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> Ajouter
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      )}

      {formState.isOpen && (
        <PlannerForm
          isOpen={formState.isOpen}
          onClose={handleCloseForm}
          mode={formState.mode}
          event={formState.event}
          defaultDay={formState.day}
        />
      )}
    </div>
  );
}
