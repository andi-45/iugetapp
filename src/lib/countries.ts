// src/lib/countries.ts

export interface Country {
  code: string;
  name: string;
}

export const francophoneCountries: Country[] = [
  { code: 'FR', name: 'France' },
  { code: 'BE', name: 'Belgique' },
  { code: 'BJ', name: 'Bénin' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'BI', name: 'Burundi' },
  { code: 'CM', name: 'Cameroun' },
  { code: 'CA', name: 'Canada' },
  { code: 'CF', name: 'République centrafricaine' },
  { code: 'KM', name: 'Comores' },
  { code: 'CG', name: 'Congo-Brazzaville' },
  { code: 'CD', name: 'Congo-Kinshasa' },
  { code: 'CI', name: 'Côte d\'Ivoire' },
  { code: 'DJ', name: 'Djibouti' },
  { code: 'GA', name: 'Gabon' },
  { code: 'GN', name: 'Guinée' },
  { code: 'GQ', name: 'Guinée équatoriale' },
  { code: 'HT', name: 'Haïti' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MG', name: 'Madagascar' },
  { code: 'ML', name: 'Mali' },
  { code: 'MC', name: 'Monaco' },
  { code: 'NE', name: 'Niger' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'SN', name: 'Sénégal' },
  { code: 'SC', name: 'Seychelles' },
  { code: 'CH', name: 'Suisse' },
  { code: 'TD', name: 'Tchad' },
  { code: 'TG', name: 'Togo' },
  { code: 'VU', name: 'Vanuatu' },
  // Non-sovereign members and observers could be added here if needed
  { code: 'DZ', name: 'Algérie' },
  { code: 'MA', name: 'Maroc' },
  { code: 'TN', name: 'Tunisie' },
  { code: 'LB', name: 'Liban' },
  { code: 'MR', name: 'Mauritanie' },
];
