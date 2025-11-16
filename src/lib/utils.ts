import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { BookOpen, FlaskConical, Languages, Microscope, Globe, PenTool, Brain, Sigma, LucideIcon, GraduationCap } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


const subjectIconMap: Record<string, LucideIcon> = {
  'Mathématiques': Sigma,
  'Physique': FlaskConical,
  'Chimie': FlaskConical,
  'SVT': Microscope,
  'Biologie': Microscope,
  'Histoire': Globe,
  'Géographie': Globe,
  'Littérature': PenTool,
  'Philosophie': Brain,
  'Anglais': Languages,
  'Français': Languages,
};

export function getSubjectIcon(subjectName?: string): LucideIcon {
    if (!subjectName) return GraduationCap;
    
    // Find a key in the map that is a substring of the subjectName
    const matchingKey = Object.keys(subjectIconMap).find(key => 
        subjectName.toLowerCase().includes(key.toLowerCase())
    );

    return matchingKey ? subjectIconMap[matchingKey] : GraduationCap;
}


// --- YouTube Video Helpers ---

/**
 * Extracts the YouTube video ID from various URL formats.
 * @param url The YouTube URL.
 * @returns The video ID or null if not found.
 */
export const getYoutubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  // A YouTube ID is 11 characters long
  return (match && match[2].length === 11) ? match[2] : 'dQw4w9WgXcQ'; // Fallback to a default video
};

/**
 * Extracts the YouTube playlist ID from a URL.
 * @param url The YouTube playlist URL.
 * @returns The playlist ID or null if not found.
 */
export const getYoutubePlaylistId = (url: string): string | null => {
    if (!url) return null;
    const regExp = /[?&]list=([^#&?]+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
};

/**
 * Generates a high-quality thumbnail URL from a YouTube video ID.
 * @param videoId The YouTube video ID.
 * @returns The thumbnail URL.
 */
export const getYoutubeThumbnailById = (videoId: string | null): string => {
  if (!videoId) return "https://placehold.co/480x360.png"; // Default placeholder
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
};
