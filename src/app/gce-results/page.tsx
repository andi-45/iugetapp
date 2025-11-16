// src/app/gce-results/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, FileWarning, Download, Search, FileText, PanelLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import * as pdfjsLib from 'pdfjs-dist';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Configure the worker source
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`;
}

interface SearchResult {
  pageIndex: number;
  line: string;
  rect: { top: number; left: number; width: number; height: number }; 
}

function GceResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const level = searchParams.get('level');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const pdfTitle = level === 'a' ? 'GCE Advanced Level' : 'GCE Ordinary Level';

  const fetchPdfUrl = useCallback(async () => {
    if (!level) {
      setError("Niveau d'examen non spécifié.");
      setIsLoading(false);
      return;
    }
    const settingsDocRef = doc(db, 'settings', 'examResults');
    const settingsDoc = await getDoc(settingsDocRef);
    if (settingsDoc.exists()) {
      const data = settingsDoc.data();
      const url = level === 'a' ? data.gceALevelPdfUrl : data.gceOLevelPdfUrl;
      if (url) {
        setPdfUrl(url);
      } else {
        setError(`Le lien pour les résultats du ${pdfTitle} n'est pas configuré.`);
        setIsLoading(false);
      }
    } else {
      setError("La configuration des résultats d'examen est manquante.");
      setIsLoading(false);
    }
  }, [level, pdfTitle]);

  useEffect(() => {
    fetchPdfUrl();
  }, [fetchPdfUrl]);

  const renderPage = useCallback(async (pageNumber: number) => {
    if (!pdfDocRef.current || !canvasRef.current) return;
    const page = await pdfDocRef.current.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (context) {
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport }).promise;
    }
  }, []);

  const loadPdf = useCallback(async () => {
    if (!pdfUrl) return;
    setIsLoading(true);
    setError(null);
    try {
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      pdfDocRef.current = pdf;
      await renderPage(1);
    } catch (e) {
      console.error('Erreur de chargement PDF:', e);
      setError('Impossible de charger le document PDF. Le lien est peut-être invalide ou le document est corrompu.');
    } finally {
      setIsLoading(false);
    }
  }, [pdfUrl, renderPage]);

  useEffect(() => {
    if (pdfUrl) {
      loadPdf();
    }
  }, [pdfUrl, loadPdf]);

  const handleSearch = async () => {
    if (!searchTerm.trim() || !pdfDocRef.current) return;
    setIsSearching(true);
    setSearchResults([]);
    setError(null);

    const term = searchTerm.toLowerCase();
    const foundResults: SearchResult[] = [];

    try {
        for (let i = 1; i <= pdfDocRef.current.numPages; i++) {
            const page = await pdfDocRef.current.getPage(i);
            const textContent = await page.getTextContent();
            
            let lines: { text: string; items: any[] }[] = [];
            let currentLine: { text: string; items: any[] } = { text: '', items: [] };
            
            textContent.items.forEach((item: any) => {
                if (currentLine.items.length > 0) {
                    const prevItem = currentLine.items[currentLine.items.length - 1];
                    if (Math.abs(item.transform[5] - prevItem.transform[5]) > 5) {
                        lines.push(currentLine);
                        currentLine = { text: '', items: [] };
                    }
                }
                currentLine.text += item.str;
                currentLine.items.push(item);
            });
            lines.push(currentLine);

            lines.forEach(line => {
                if (line.text.toLowerCase().includes(term) && line.items.length > 0) {
                    const firstItem = line.items[0];
                    const viewport = page.getViewport({ scale: 1.5 });
                    const tx = pdfjsLib.Util.transform(viewport.transform, firstItem.transform);
                    const rect = { top: tx[5] - firstItem.height, left: tx[4], width: line.items.reduce((w, i) => w + i.width, 0), height: firstItem.height };
                    
                    foundResults.push({
                        pageIndex: i,
                        line: line.text.trim(),
                        rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
                    });
                }
            });
        }
        setSearchResults(foundResults);
    } catch (e) {
      console.error("Erreur de recherche:", e);
      setError("Une erreur est survenue lors de la recherche.");
    } finally {
      setIsSearching(false);
    }
  };

  const goToResult = async (result: SearchResult) => {
    await renderPage(result.pageIndex);
    if(highlightRef.current && canvasRef.current) {
        const parent = canvasRef.current.parentElement;
        if(parent) {
            highlightRef.current.style.top = `${result.rect.top}px`;
            highlightRef.current.style.left = `${result.rect.left}px`;
            highlightRef.current.style.width = `${result.rect.width}px`;
            highlightRef.current.style.height = `${result.rect.height}px`;
            highlightRef.current.style.display = 'block';
            parent.scrollTo({ top: result.rect.top - 50, behavior: 'smooth' });
            setTimeout(() => { if(highlightRef.current) { highlightRef.current.style.display = 'none'; } }, 2000);
        }
    }
    if (window.innerWidth < 768) { setIsSidebarOpen(false); }
  };
  
  const handleDownload = useCallback(() => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `Resultats-GCE-${level?.toUpperCase() || 'UNKNOWN'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [pdfUrl, level]);

  return (
    <div className="h-screen flex flex-col bg-muted/40">
      <header className="p-2 border-b bg-background shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push('/results')} className="p-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 md:hidden">
              <PanelLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">{pdfTitle}</h1>
              <p className="text-xs text-muted-foreground">Entrez un nom ou un numéro pour chercher</p>
            </div>
          </div>
          <Button onClick={handleDownload} variant="outline" size="sm" disabled={!pdfUrl}>
              <Download className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Télécharger</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <aside className={cn("absolute md:relative z-20 h-full flex-shrink-0 flex flex-col bg-background border-r transition-all duration-300", isSidebarOpen ? "w-72" : "w-0 border-0 p-0")}>
          <div className={cn("p-4 border-b", !isSidebarOpen && "hidden")}>
            <div className="relative">
              <Input placeholder="Rechercher un nom..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }} disabled={isSearching || !pdfUrl} />
              <Button onClick={handleSearch} size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" disabled={isSearching || !searchTerm.trim() || !pdfUrl}><Search className="h-4 w-4" /></Button>
            </div>
          </div>
          <ScrollArea className={cn("flex-1", !isSidebarOpen && "hidden")}>
            {isSearching ? <div className="p-4 text-center text-sm text-muted-foreground">Recherche en cours...</div> : searchResults.length > 0 ? (
                 <div className="p-2 space-y-1">{searchResults.map((result, index) => (<button key={index} onClick={() => goToResult(result)} className="w-full text-left p-2 rounded-md hover:bg-accent text-sm"><p className="truncate font-semibold">{result.line}</p><Badge variant="outline">Page {result.pageIndex}</Badge></button>))}</div>
            ) : <div className="p-4 text-center text-sm text-muted-foreground">{searchTerm ? "Aucun résultat trouvé." : "Entrez un terme de recherche."}</div>}
           </ScrollArea>
        </aside>
        
        <div className="flex-1 overflow-auto bg-gray-300 dark:bg-gray-700 p-4 flex justify-center">
            {isLoading ? <div className="flex flex-col items-center justify-center gap-4 text-foreground"><Loader2 className="h-10 w-10 animate-spin" /><p>Chargement des résultats...</p></div> : error ? <div className="flex flex-col items-center justify-center h-full gap-4 text-destructive"><FileWarning className="h-12 w-12" /><h2 className="text-2xl font-semibold">Erreur</h2><p className="text-center max-w-md">{error}</p><Button onClick={fetchPdfUrl} variant="outline"><FileText className="mr-2 h-4 w-4" /> Réessayer</Button></div> : (
                <div className="relative w-fit h-fit"><canvas ref={canvasRef} className="shadow-lg" /><div ref={highlightRef} className="absolute bg-yellow-400 bg-opacity-50" style={{ display: 'none', pointerEvents: 'none' }}/></div>
            )}
        </div>
      </main>
    </div>
  );
}

export default function GceResultsPage() {
  return (
    <div className="h-screen"><Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="h-10 w-10 animate-spin" /> Chargement...</div>}><GceResultsContent /></Suspense></div>
  );
}
