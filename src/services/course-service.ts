// src/services/course-service.ts
'use client';

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { getSchoolStructure } from './school-structure-service';
import { getSubjects } from './subject-service';

export interface Course {
  id: string;
  title: string;
  description: string;
  pdfUrl: string;
  imageUrl: string;
  imageHint: string;
  status: 'published' | 'draft';
  classes: string[];
  series: string[];
  subjectId: string;
  subjectName?: string; // Optionnel, pour l'affichage
  createdAt: string;
  updatedAt: string;
}

export type CourseFormData = Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'imageUrl' | 'imageHint' | 'subjectName'>;

const coursesCollection = collection(db, 'courses');
const defaultImageUrl = "https://img.freepik.com/vecteurs-premium/dessin-cahier-crayon-dessus_410516-86749.jpg?w=740";

export async function getCourses(): Promise<Course[]> {
  try {
    const coursesSnapshot = await getDocs(coursesCollection);
    const subjects = await getSubjects();
    const subjectsMap = new Map(subjects.map(doc => [doc.id, doc.name]));

    const courses = coursesSnapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString();
        const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString();

        return {
            id: doc.id,
            title: data.title,
            description: data.description,
            pdfUrl: data.pdfUrl,
            imageUrl: defaultImageUrl, // On force l'utilisation de l'URL par défaut
            imageHint: data.imageHint || "education book",
            status: data.status,
            classes: data.classes || [],
            series: data.series || [],
            subjectId: data.subjectId,
            subjectName: subjectsMap.get(data.subjectId) || 'Non défini',
            createdAt,
            updatedAt,
        } as Course;
    });
    return courses;
  } catch (error) {
    console.error("Erreur lors de la récupération des cours:", error);
    return [];
  }
}

export async function getCourseById(id: string): Promise<Course | null> {
    try {
        const courseDoc = await getDoc(doc(db, "courses", id));
        if (!courseDoc.exists()) {
            return null;
        }

        const courseData = courseDoc.data();
        let subjectName = 'Non défini';
        if (courseData.subjectId) {
            const subjects = await getSubjects();
            const subject = subjects.find(s => s.id === courseData.subjectId);
            if (subject) {
                subjectName = subject.name;
            }
        }
        
        const createdAt = courseData.createdAt?.toDate ? courseData.createdAt.toDate().toISOString() : new Date().toISOString();
        const updatedAt = courseData.updatedAt?.toDate ? courseData.updatedAt.toDate().toISOString() : new Date().toISOString();

        return {
            id: courseDoc.id,
            ...courseData,
            subjectName,
            imageUrl: defaultImageUrl, // On force l'utilisation de l'URL par défaut
            imageHint: courseData.imageHint || "education book",
            createdAt,
            updatedAt,
        } as Course;
    } catch(e) {
        console.error("Erreur pour obtenir le cours par ID", e)
        return null;
    }
}

export async function createCourse(data: CourseFormData): Promise<string> {
    const courseRef = await addDoc(coursesCollection, {
        ...data,
        imageUrl: defaultImageUrl,
        imageHint: "education brand image",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return courseRef.id;
}

export async function updateCourse(id: string, data: CourseFormData): Promise<void> {
    const courseDoc = doc(db, "courses", id);
    await updateDoc(courseDoc, {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteCourse(id: string): Promise<void> {
    await deleteDoc(doc(db, "courses", id));
}

// Fonction pour récupérer les données de configuration (classes, séries, matières)
export async function getCourseConfiguration() {
    const structure = await getSchoolStructure();
    const subjects = await getSubjects();

    const allSeries = structure
        .flatMap(c => c.series)
        .reduce((acc, current) => {
            if (!acc.find(item => item.value === current.value)) {
                acc.push(current);
            }
            return acc;
        }, [] as {value: string, label: string}[]);

    return {
        classes: structure.map(s => ({ value: s.name, label: s.name })),
        allSeries: allSeries,
        subjects: subjects.map(s => ({ value: s.id, label: s.name }))
    };
}
