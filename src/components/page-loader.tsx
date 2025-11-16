
'use client';
import { Logo } from './logo';
import { Rocket } from 'lucide-react';

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm">
      <div className="relative flex flex-col items-center justify-center text-center">
        
        <div className="flex items-center justify-center mb-4">
           <Logo className="h-16 w-16 animate-pulse" />
        </div>
        
        <h1 className="text-4xl font-headline font-bold text-primary tracking-wider animate-fade-in-down">
          OnBuch
        </h1>
        
        <p className="mt-4 text-lg font-semibold text-foreground animate-fade-in-up animation-delay-500">
          for IUGET
        </p>

      </div>

      <footer className="absolute bottom-6 text-center text-sm text-muted-foreground animate-fade-in animation-delay-1000">
        <p>Une production de <span className="font-semibold">LuvviX Technologies</span></p>
         <Rocket className="h-6 w-6 mx-auto mt-4 text-primary animate-rocket-up" />
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes rocket-up {
            0% { transform: translateY(20px); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateY(-20px); opacity: 0; }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.8s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        .animate-rocket-up {
            animation: rocket-up 2s ease-in-out infinite;
            animation-delay: 1.2s;
            opacity: 0;
        }

        .animation-delay-500 {
            animation-delay: 0.5s;
            opacity: 0; /* Start hidden */
        }
        .animation-delay-1000 {
            animation-delay: 1s;
            opacity: 0; /* Start hidden */
        }
      `}</style>
    </div>
  );
}
