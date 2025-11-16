// src/components/offline-indicator.tsx
'use client'

import { useState } from 'react'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { WifiOff, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'

export function OfflineIndicator() {
  const isOnline = useOnlineStatus()
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed bottom-0 left-1/2 z-[9999] -translate-x-1/2 transform-gpu transition-transform duration-300',
        isOnline ? 'translate-y-[150%]' : 'translate-y-0'
      )}
    >
      <div className="mb-4 flex items-center gap-3 rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-lg dark:bg-neutral-800">
        <WifiOff className="h-5 w-5" />
        Vous êtes actuellement hors ligne.
        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full text-white/70 hover:bg-white/20 hover:text-white" onClick={() => setIsVisible(false)}>
            <X className="h-4 w-4" />
            <span className="sr-only">Fermer</span>
        </Button>
      </div>
    </div>
  )
}
