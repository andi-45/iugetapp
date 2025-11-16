// src/services/planner-service.ts
'use client';

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, getDoc } from 'firebase/firestore';
import { getSubjects } from './subject-service';

export interface ScheduleEvent {
  id: string;
  title: string;
  day: string; // 'Lundi', 'Mardi', etc.
  startTime: string; // 'HH:MM'
  endTime: string; // 'HH:MM'
  subjectId: string;
  subjectName?: string;
  type: 'revision' | 'quiz' | 'exercice' | 'lecture';
}

export type ScheduleEventFormData = Omit<ScheduleEvent, 'id' | 'subjectName'>;


export async function getSchedule(userId: string): Promise<ScheduleEvent[]> {
  try {
    const scheduleCollection = collection(db, 'users', userId, 'schedule');
    const scheduleSnapshot = await getDocs(scheduleCollection);

    const subjects = await getSubjects();
    const subjectsMap = new Map(subjects.map(doc => [doc.id, doc.name]));

    const events = scheduleSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            subjectName: subjectsMap.get(data.subjectId) || 'Non défini',
        } as ScheduleEvent
    });

    return events;
  } catch (error) {
    console.error("Erreur lors de la récupération du planning:", error);
    return [];
  }
}

export async function getTodaysSchedule(userId: string): Promise<ScheduleEvent[]> {
    const weekDays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const todayIndex = new Date().getDay();
    const todayName = weekDays[todayIndex];
    
    try {
        const scheduleCollection = collection(db, 'users', userId, 'schedule');
        const q = query(scheduleCollection, where("day", "==", todayName));
        const scheduleSnapshot = await getDocs(q);

        const subjects = await getSubjects();
        const subjectsMap = new Map(subjects.map(doc => [doc.id, doc.name]));

        const events = scheduleSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                subjectName: subjectsMap.get(data.subjectId) || 'Non défini',
            } as ScheduleEvent
        });
        
        // Trier les événements par heure de début après la récupération
        events.sort((a, b) => {
            return a.startTime.localeCompare(b.startTime, undefined, { numeric: true });
        });

        return events;

    } catch (error) {
        console.error("Erreur lors de la récupération du programme du jour:", error);
        return [];
    }
}

export async function addScheduleEvent(userId: string, eventData: ScheduleEventFormData): Promise<string> {
    const scheduleCollection = collection(db, 'users', userId, 'schedule');
    const newEventRef = await addDoc(scheduleCollection, eventData);
    return newEventRef.id;
}

export async function updateScheduleEvent(userId: string, eventId: string, eventData: ScheduleEventFormData): Promise<void> {
    const eventDoc = doc(db, 'users', userId, 'schedule', eventId);
    await updateDoc(eventDoc, eventData);
}

export async function deleteScheduleEvent(userId: string, eventId: string): Promise<void> {
    const eventDoc = doc(db, 'users', userId, 'schedule', eventId);
    await deleteDoc(eventDoc);
}
