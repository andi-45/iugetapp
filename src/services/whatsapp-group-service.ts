// src/services/whatsapp-group-service.ts
'use client';

import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { getSchoolStructure } from './school-structure-service';

export interface WhatsAppGroup {
    id: string; // e.g., 'terminale-c'
    class: string; // e.g., 'Terminale'
    series: string; // e.g., 'Série C'
    link: string; // WhatsApp link
}

const groupsCollection = collection(db, 'whatsappGroups');

/**
 * Récupère tous les liens de groupes WhatsApp enregistrés.
 */
export async function getWhatsAppGroups(): Promise<WhatsAppGroup[]> {
    try {
        const snapshot = await getDocs(groupsCollection);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WhatsAppGroup));
    } catch (error) {
        console.error("Error fetching WhatsApp groups:", error);
        return [];
    }
}

/**
 * Récupère le lien d'un groupe spécifique basé sur la classe et la série.
 * @param className Le nom de la classe (ex: "Terminale")
 * @param seriesValue La valeur de la série (ex: "c")
 */
export async function getWhatsAppGroupLink(className: string, seriesValue: string): Promise<string | null> {
    if (!className || !seriesValue) return null;
    try {
        const groupId = `${className.toLowerCase()}-${seriesValue.toLowerCase()}`;
        const docRef = doc(db, 'whatsappGroups', groupId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data().link : null;
    } catch (error) {
        console.error("Error fetching single WhatsApp group link:", error);
        return null;
    }
}


/**
 * Crée ou met à jour le lien pour un groupe spécifique.
 */
export async function setWhatsAppGroupLink(className: string, seriesValue: string, seriesLabel: string, link: string): Promise<void> {
    const groupId = `${className.toLowerCase()}-${seriesValue.toLowerCase()}`;
    const docRef = doc(db, 'whatsappGroups', groupId);
    
    const data = {
        class: className,
        series: seriesLabel,
        link: link
    };

    await setDoc(docRef, data, { merge: true });
}

/**
 * Récupère la structure scolaire et les liens existants pour le formulaire d'administration.
 */
export async function getWhatsAppAdminConfig() {
    const [structure, links] = await Promise.all([
        getSchoolStructure(),
        getWhatsAppGroups()
    ]);
    
    const linksMap = new Map(links.map(l => [l.id, l.link]));

    const config = structure.map(sClass => ({
        ...sClass,
        series: sClass.series.map(s => ({
            ...s,
            link: linksMap.get(`${sClass.name.toLowerCase()}-${s.value.toLowerCase()}`) || ''
        }))
    }));

    return config;
}
