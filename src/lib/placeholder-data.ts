import { BookOpen, FlaskConical, Languages, GraduationCap } from "lucide-react";
import React from "react";

const defaultImageUrl = "https://img.freepik.com/vecteurs-premium/dessin-cahier-crayon-dessus_410516-86749.jpg";

export const courses = [
  {
    id: 1,
    title: "Mathématiques - Algèbre et Analyse",
    description: "Fondamentaux d'algèbre, de géométrie et de trigonométrie.",
    imageUrl: defaultImageUrl,
    imageHint: "abstract math",
    status: "published",
    classes: ["Première", "Terminale"],
    series: ["C", "D"],
    pdfUrl: "/path/to/math-algebre-analyse.pdf",
    lessons: 12
  },
  {
    id: 2,
    title: "Physique - Mécanique et Électricité",
    description: "Mécanique, thermodynamique et électromagnétisme.",
    imageUrl: defaultImageUrl,
    imageHint: "physics atoms",
    status: "published",
    classes: ["Terminale"],
    series: ["C", "D"],
    pdfUrl: "/path/to/physique-mecanique.pdf",
    lessons: 15
  },
  {
    id: 3,
    title: "Littérature - Le Roman et ses Enjeux",
    description: "Analyse des grandes œuvres littéraires et des théories critiques.",
    imageUrl: defaultImageUrl,
    imageHint: "books library",
    status: "published",
    classes: ["Première", "Terminale"],
    series: ["A"],
    pdfUrl: "/path/to/litterature-roman.pdf",
    lessons: 8
  },
   {
    id: 4,
    title: "Chimie - Chimie Organique",
    description: "Principes de chimie organique et inorganique.",
    imageUrl: defaultImageUrl,
    imageHint: "chemistry beakers",
    status: "draft",
    classes: ["Terminale"],
    series: ["C", "D"],
    pdfUrl: "/path/to/chimie-organique.pdf",
    lessons: 10
  },
   {
    id: 5,
    title: "Histoire - Le Cameroun et la Décolonisation",
    description: "Histoire du monde, des civilisations anciennes aux temps modernes.",
    imageUrl: defaultImageUrl,
    imageHint: "historical map",
    status: "published",
    classes: ["Première", "Terminale"],
    series: ["A", "C", "D"],
    pdfUrl: "/path/to/histoire-cameroun.pdf",
    lessons: 11
  },
   {
    id: 6,
    title: "Biologie - Génétique et Hérédité",
    description: "Biologie cellulaire, génétique et anatomie humaine.",
    imageUrl: defaultImageUrl,
    imageHint: "biology dna",
    status: "published",
    classes: ["Terminale"],
    series: ["D"],
    pdfUrl: "/path/to/biologie-genetique.pdf",
    lessons: 14
  },
];

export const scheduleItems = [
    {
        id: 1,
        title: "Quiz de Mathématiques",
        time: "10:00 - 11:00",
        icon: React.createElement(BookOpen),
    },
    {
        id: 2,
        title: "Révision de Physique",
        time: "14:00 - 15:30",
        icon: React.createElement(FlaskConical),
    },
    {
        id: 3,
        title: "Lecture de Littérature Française",
        time: "17:00 - 17:45",
        icon: React.createElement(Languages),
    }
]

export const newsItems = [
    {
        id: 1,
        slug: "dates-examens-2024",
        title: "Le MINESEC annonce les dates officielles des examens pour 2024",
        summary: "Le Ministère des Enseignements Secondaires a publié le calendrier officiel des examens de fin d'année. Préparez-vous !",
        date: "1 juin 2024",
        category: "Annonce Officielle",
        status: "published",
        imageUrl: defaultImageUrl,
        imageHint: "calendar exam",
        content: `
<p>Le Ministère des Enseignements Secondaires (MINESEC) a officiellement dévoilé le calendrier des examens nationaux pour la session 2024. Les élèves des classes de Terminale, Première, et autres niveaux concernés sont invités à prendre connaissance des dates clés pour une préparation optimale.</p>
<p>Les épreuves écrites du Baccalauréat de l'Enseignement Général débuteront le <strong>lundi 15 juillet 2024</strong> et s'étaleront sur une semaine. Les épreuves pratiques, quant à elles, sont programmées du 1er au 10 juillet.</p>
<h3 class="font-bold my-2">Points importants à retenir :</h3>
<ul class="list-disc pl-5 space-y-2">
  <li><strong>Retrait des convocations :</strong> À partir du 20 juin 2024 dans vos établissements respectifs.</li>
  <li><strong>Début des épreuves écrites :</strong> 15 juillet 2024.</li>
  <li><strong>Publication des résultats :</strong> Prévue autour du 15 août 2024.</li>
</ul>
<p>Le Ministre a insisté sur l'importance d'une préparation sérieuse et a rappelé les sanctions encourues en cas de fraude. Nous encourageons tous les candidats à utiliser les ressources disponibles sur OnBuch pour leurs révisions.</p>
        `
    },
    {
        id: 2,
        slug: "modifications-programme-serie-a",
        title: "Nouvelles modifications du programme pour la Série A",
        summary: "Des ajustements ont été apportés au programme de littérature et de philosophie pour les classes de Première et Terminale A.",
        date: "28 mai 2024",
        category: "Programme Scolaire",
        status: "published",
        imageUrl: defaultImageUrl,
        imageHint: "books pen",
        content: `
<p>Dans une note récente, l'Inspection Générale des Enseignements a annoncé des modifications dans le programme de plusieurs matières pour la série A. Ces changements concernent principalement la littérature française et la philosophie.</p>
<p>En littérature, de nouvelles œuvres ont été ajoutées à la liste des textes à étudier, avec un accent particulier sur les auteurs francophones contemporains. En philosophie, le thème de la "Citoyenneté numérique" a été introduit pour les classes de Terminale.</p>
<p>Ces ajustements visent à moderniser le curriculum et à mieux préparer les élèves aux enjeux du monde actuel. Les enseignants recevront prochainement des fiches pédagogiques pour accompagner la mise en œuvre de ces nouveautés.</p>
        `
    },
    {
        id: 3,
        slug: "bourses-etude-terminale",
        title: "Opportunités de bourses pour les élèves de Terminale",
        summary: "Plusieurs programmes de bourses nationaux et internationaux sont désormais ouverts aux candidatures pour les bacheliers.",
        date: "25 mai 2024",
        category: "Opportunités",
        status: "draft",
        imageUrl: defaultImageUrl,
        imageHint: "graduation cap",
        content: `
<p>L'excellence académique ouvre des portes ! Plusieurs organisations et gouvernements partenaires offrent des bourses d'études pour les élèves camerounais les plus méritants qui obtiendront leur Baccalauréat cette année.</p>
<p>Parmi les opportunités notables, on retrouve le programme de bourses de la Coopération Allemande, les bourses "Mastercard Foundation" pour des études en Afrique, et les bourses d'excellence du gouvernement canadien.</p>
<p>Les critères de sélection varient, mais incluent généralement l'excellence des résultats scolaires, le projet d'études et l'engagement communautaire. Les dossiers de candidature sont à soumettre en ligne, pour la plupart avant la fin du mois de septembre. C'est une chance unique de poursuivre des études supérieures dans des conditions optimales.</p>
        `
    }
]

export const resources = [
  {
    id: 1,
    title: "Manuel complet de mathématiques (Première)",
    type: "PDF",
    size: "15.2 MB",
    dateAdded: "2024-05-28",
  },
  {
    id: 2,
    title: "Annales de Physique (2018-2023)",
    type: "ZIP",
    size: "34.5 MB",
    dateAdded: "2024-05-25",
  },
  {
    id: 3,
    title: "Guide d'analyse littéraire",
    type: "PDF",
    size: "2.1 MB",
    dateAdded: "2024-05-22",
  },
  {
    id: 4,
    title: "Tableau périodique des éléments",
    type: "PNG",
    size: "0.8 MB",
    dateAdded: "2024-05-20",
  },
];

export const communityMembers = [
  {
    id: 1,
    name: "Elara Vance",
    class: "Terminale, Série C",
    avatar: "https://placehold.co/100x100.png",
  },
  {
    id: 2,
    name: "Leo Dubois",
    class: "Terminale, Série A",
    avatar: "https://placehold.co/100x100.png",
  },
  {
    id: 3,
    name: "Amina Keita",
    class: "Première, Série D",
    avatar: "https://placehold.co/100x100.png",
  },
  {
    id: 4,
    name: "Jean-Pierre N'jie",
    class: "Terminale, Série D",
    avatar: "https://placehold.co/100x100.png",
  },
    {
    id: 5,
    name: "Fatima Bello",
    class: "Seconde",
    avatar: "https://placehold.co/100x100.png",
  },
  {
    id: 6,
    name: "Samuel Eto'o Fils",
    class: "Première, Série C",
    avatar: "https://placehold.co/100x100.png",
  },
];

export const motivationalTips = [
    {
        id: 1,
        title: "Divisez les tâches",
        content: "Divisez les grandes tâches en petits morceaux gérables. Cela les rend moins intimidantes et plus faciles à commencer."
    },
    {
        id: 2,
        title: "Fixez des objectifs clairs",
        content: "Définissez ce que vous voulez accomplir. Des objectifs clairs vous donnent une direction et un but."
    },
    {
        id: 3,
        title: "Célébrez les petites victoires",
        content: "Reconnaissez et célébrez vos progrès, aussi petits soient-ils. Cela aide à maintenir l'élan."
    },
    {
        id: 4,
        title: "Restez organisé",
        content: "Utilisez votre planning pour organiser votre programme d'étude. Un plan clair réduit le stress et améliore la concentration."
    },
    {
        id: 5,
        title: "Prenez des pauses régulières",
        content: "De courtes pauses pendant les sessions d'étude peuvent améliorer la concentration et prévenir l'épuisement. Essayez la technique Pomodoro."
    },
    {
        id: 6,
        title: "Visualisez le succès",
        content: "Imaginez-vous en train d'atteindre vos objectifs. La visualisation peut être un puissant facteur de motivation."
    }
];


export const schoolInfo = {
  classes: [
    { value: 'seconde', label: 'Seconde' },
    { value: 'premiere', label: 'Première' },
    { value: 'terminale', label: 'Terminale' },
  ],
  series: {
    seconde: [
        { value: 'general', label: 'Enseignement Général' },
    ],
    premiere: [
      { value: 'a', label: 'Série A' },
      { value: 'c', label: 'Série C' },
      { value: 'd', label: 'Série D' },
      { value: 'ti', label: 'Série TI' },
    ],
    terminale: [
        { value: 'a', label: 'Série A' },
        { value: 'c', label: 'Série C' },
        { value: 'd', label: 'Série D' },
        { value: 'ti', label: 'Série TI' },
    ]
  },
  genders: [
      { value: 'male', label: 'Masculin' },
      { value: 'female', label: 'Féminin' },
  ]
};

export const subjects = [
    {
        id: 'subj-math',
        name: 'Mathématiques',
        icon: GraduationCap,
        courseCount: 5,
    },
    {
        id: 'subj-phys',
        name: 'Physique',
        icon: GraduationCap,
        courseCount: 3,
    },
    {
        id: 'subj-chim',
        name: 'Chimie',
        icon: GraduationCap,
        courseCount: 2,
    },
    {
        id: 'subj-svt',
        name: 'SVT',
        icon: GraduationCap,
        courseCount: 4,
    },
    {
        id: 'subj-hist',
        name: 'Histoire',
        icon: GraduationCap,
        courseCount: 2,
    },
    {
        id: 'subj-geo',
        name: 'Géographie',
        icon: GraduationCap,
        courseCount: 2,
    },
    {
        id: 'subj-litt',
        name: 'Littérature',
        icon: GraduationCap,
        courseCount: 1,
    },
    {
        id: 'subj-philo',
        name: 'Philosophie',
        icon: GraduationCap,
        courseCount: 1,
    },
];

// Renommé de adminUsers à firebaseUsers pour mieux refléter la source de données simulée.
export const firebaseUsers = [
  {
    uid: "firebase-uid-001",
    displayName: "Jeanne Dupont",
    email: "jeanne.d@example.com",
    photoURL: defaultImageUrl,
    // Les informations supplémentaires seraient stockées dans Firestore
    class: "Terminale",
    series: "D",
    creationTime: "2024-05-10",
    lastSignInTime: "2024-06-01"
  },
  {
    uid: "firebase-uid-002",
    displayName: "Pierre Martin",
    email: "pierre.m@example.com",
    photoURL: defaultImageUrl,
    class: "Première",
    series: "C",
    creationTime: "2024-05-12",
    lastSignInTime: "2024-06-02"
  },
  {
    uid: "firebase-uid-003",
    displayName: "Awa N'Diaye",
    email: "awa.n@example.com",
    photoURL: defaultImageUrl,
    class: "Seconde",
    series: "A",
    creationTime: "2024-05-15",
    lastSignInTime: "2024-05-20"
  },
];

    
