// src/components/country-selector.tsx
'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronsUpDown } from 'lucide-react';
import { francophoneCountries, type Country } from '@/lib/countries';
import { getTimezoneCountry } from '@/lib/timezones';
import Image from 'next/image';

const DEFAULT_COUNTRY: Country = { code: 'CM', name: 'Cameroun' };

export function CountrySelector() {
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(DEFAULT_COUNTRY);

  useEffect(() => {
    const detectedCountryCode = getTimezoneCountry();
    const country = francophoneCountries.find(c => c.code === detectedCountryCode);
    if (country) {
      setSelectedCountry(country);
    }
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-[80px] justify-between">
          <Image
            src={`https://flagcdn.com/${selectedCountry.code.toLowerCase()}.svg`}
            alt={`Drapeau ${selectedCountry.name}`}
            width={20}
            height={15}
            className="shrink-0"
          />
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Rechercher un pays..." />
          <CommandEmpty>Aucun pays trouvé.</CommandEmpty>
          <CommandGroup>
            {francophoneCountries.map((country) => (
              <CommandItem
                key={country.code}
                value={country.name}
                onSelect={(currentValue) => {
                  const newCountry = francophoneCountries.find(c => c.name.toLowerCase() === currentValue.toLowerCase());
                  if (newCountry) {
                      setSelectedCountry(newCountry);
                  }
                  setOpen(false);
                }}
              >
                 <Image
                    src={`https://flagcdn.com/${country.code.toLowerCase()}.svg`}
                    alt={country.name}
                    width={20}
                    height={15}
                    className="mr-2"
                />
                {country.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
