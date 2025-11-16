// src/components/motivational-quote.tsx
'use client'

import { useState, useEffect } from 'react';
import { Lightbulb } from 'lucide-react';
import { motivationalQuotes } from '@/lib/quotes';
import { cn } from '@/lib/utils';

export function MotivationalQuote() {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    // Pick a random quote index on mount
    setCurrentQuoteIndex(Math.floor(Math.random() * motivationalQuotes.length));
    
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % motivationalQuotes.length);
    }, 15000); // Change quote every 15 seconds to match animation duration

    return () => clearInterval(interval);
  }, []);

  const { quote, author } = motivationalQuotes[currentQuoteIndex];

  return (
    <div className="relative flex overflow-x-hidden text-sm text-muted-foreground py-2">
      <div className="animate-marquee whitespace-nowrap flex items-center">
        <Lightbulb className="h-4 w-4 mx-4 text-primary shrink-0" />
        <span className="italic">"{quote}"</span>
        <span className="font-semibold mx-1">— {author}</span>
      </div>

      <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex items-center py-2">
        <Lightbulb className="h-4 w-4 mx-4 text-primary shrink-0" />
        <span className="italic">"{quote}"</span>
        <span className="font-semibold mx-1">— {author}</span>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes marquee2 {
          0% { transform: translateX(100%); }
          100% { transform: translateX(0%); }
        }
        .animate-marquee {
          animation: marquee 15s linear infinite;
        }
        .animate-marquee2 {
          animation: marquee2 15s linear infinite;
        }
      `}</style>
    </div>
  );
}
