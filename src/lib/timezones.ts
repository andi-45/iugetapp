// src/lib/timezones.ts

// This is a simplified map. A full mapping is very large.
// We'll map common timezones to country codes.
const timezoneToCountry: Record<string, string> = {
    // Africa
    'Africa/Algiers': 'DZ',
    'Africa/Ouagadougou': 'BF',
    'Africa/Bujumbura': 'BI',
    'Africa/Douala': 'CM',
    'Africa/Bangui': 'CF',
    'Africa/Ndjamena': 'TD',
    'Africa/Moroni': 'KM',
    'Africa/Brazzaville': 'CG',
    'Africa/Kinshasa': 'CD',
    'Africa/Abidjan': 'CI',
    'Africa/Djibouti': 'DJ',
    'Africa/Malabo': 'GQ',
    'Africa/Libreville': 'GA',
    'Africa/Conakry': 'GN',
    'Africa/Antananarivo': 'MG',
    'Africa/Bamako': 'ML',
    'Africa/Nouakchott': 'MR',
    'Africa/Casablanca': 'MA',
    'Africa/Niamey': 'NE',
    'Africa/Kigali': 'RW',
    'Africa/Dakar': 'SN',
    'Africa/Lome': 'TG',
    'Africa/Tunis': 'TN',
    'Indian/Comoro': 'KM',
    'Indian/Antananarivo': 'MG',
    'Indian/Mahe': 'SC',
    
    // Europe
    'Europe/Paris': 'FR',
    'Europe/Brussels': 'BE',
    'Europe/Luxembourg': 'LU',
    'Europe/Monaco': 'MC',
    'Europe/Zurich': 'CH',

    // Americas
    'America/Toronto': 'CA',
    'America/Montreal': 'CA',
    'America/Vancouver': 'CA',
    'America/Port-au-Prince': 'HT',

    // Asia
    'Asia/Beirut': 'LB',

    // Oceania
    'Pacific/Efate': 'VU'
  };
  
  export function getTimezoneCountry(): string | null {
    if (typeof Intl === 'undefined') {
      return null;
    }
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return timezoneToCountry[timeZone] || null;
    } catch (e) {
      console.error("Could not determine timezone country:", e);
      return null;
    }
  }
