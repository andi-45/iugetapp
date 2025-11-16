// src/app/pomodoro-session/pomodoro-client.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

const timeSettings: Record<TimerMode, number> = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export function PomodoroClient() {
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(timeSettings.work);
  const [isActive, setIsActive] = useState(false);
  const [task, setTask] = useState('');
  const [completedCycles, setCompletedCycles] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Only create audio context in the browser
    if (typeof window !== 'undefined') {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Simple beep sound
        const createBeep = () => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.01);
            oscillator.start(audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 1);
            oscillator.stop(audioContext.currentTime + 1);
        };

        const playSound = () => {
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            createBeep();
        };

        // Assign to a ref-like structure to be called later
        (audioRef as any).current = { play: playSound };
    }
  }, []);

  const switchMode = useCallback((newMode: TimerMode, fromReset = false) => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(timeSettings[newMode]);
    if (!fromReset) {
        (audioRef as any).current?.play();
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      if (mode === 'work') {
        const newCompletedCycles = completedCycles + 1;
        setCompletedCycles(newCompletedCycles);
        if (newCompletedCycles % 4 === 0) {
          switchMode('longBreak');
        } else {
          switchMode('shortBreak');
        }
      } else {
        switchMode('work');
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, completedCycles, switchMode]);

  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    switchMode(mode, true);
  };
  
  const progressPercentage = (1 - (timeLeft / timeSettings[mode])) * 100;

  return (
    <main className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Session de Révision</CardTitle>
          <CardDescription>Utilisez la méthode Pomodoro pour maximiser votre concentration.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center gap-2">
            <Button
              variant={mode === 'work' ? 'default' : 'outline'}
              onClick={() => switchMode('work', true)}
              className="gap-2"
            >
              <Brain className="h-4 w-4"/> Travail
            </Button>
            <Button
              variant={mode === 'shortBreak' ? 'default' : 'outline'}
              onClick={() => switchMode('shortBreak', true)}
               className="gap-2"
            >
              <Coffee className="h-4 w-4"/> Pause
            </Button>
          </div>
          
          <div className="relative flex items-center justify-center h-56 w-56 mx-auto">
            <svg className="absolute inset-0" viewBox="0 0 100 100">
                <circle className="stroke-current text-muted/20" strokeWidth="4" cx="50" cy="50" r="45" fill="transparent"></circle>
                <circle 
                    className="stroke-current text-primary" 
                    strokeWidth="4" 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="transparent" 
                    strokeDasharray="283"
                    strokeDashoffset={283 - (283 * progressPercentage) / 100}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                    style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                ></circle>
            </svg>
            <span className="text-6xl font-mono font-bold tracking-tighter">{formatTime(timeLeft)}</span>
          </div>

           <Input 
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Quelle est votre tâche principale ?"
                className="text-center"
            />
          
          <div className="flex justify-center gap-4">
            <Button size="lg" className="w-32 h-16 text-lg" onClick={handleStartPause}>
              {isActive ? <Pause className="mr-2 h-6 w-6"/> : <Play className="mr-2 h-6 w-6"/>}
              {isActive ? 'Pause' : 'Start'}
            </Button>
            <Button size="lg" variant="secondary" className="w-32 h-16 text-lg" onClick={handleReset}>
              <RotateCcw className="mr-2 h-6 w-6"/>
              Reset
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">Cycles de travail complétés : {completedCycles}</p>
        </CardContent>
      </Card>
    </main>
  );
}
