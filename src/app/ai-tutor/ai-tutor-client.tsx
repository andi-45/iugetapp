
"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Send, Sparkles, Plus, MessageSquare, PanelLeft, Image as ImageIcon, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { callAiTutor } from '@/ai/flows/ai-tutor-flow';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { addHistoryItem } from '@/services/history-service';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

const chatSchema = z.object({
  message: z.string().min(1, { message: "Le message ne peut pas être vide." }),
});

export type PlotData = {
    function: string;
    points: { x: number; y: number }[];
}

type Message = {
  id: string;
  role: 'user' | 'model';
  content: string;
  image?: string | null; // Image data URI for user messages
  plotData?: PlotData;
};

type Conversation = {
    id: string;
    title: string;
    messages: Message[];
};

const LOCAL_STORAGE_KEY = 'onbuch-ia-tutor-conversations';

const WelcomeScreen = ({ onNewConversation }: { onNewConversation: () => void }) => {
    const { user } = useAuth();
    const getFirstName = () => user?.displayName?.split(' ')[0] || 'Étudiant';

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="p-4 bg-primary/10 rounded-full">
                <Sparkles className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-3xl font-headline font-bold mt-4">Bonjour, {getFirstName()} !</h1>
            <p className="text-muted-foreground max-w-md mt-2">
                Je suis votre Professeur Virtuel IA. Posez-moi une question, envoyez-moi un exercice, ou demandez-moi de tracer un graphique. Comment puis-je vous aider ?
            </p>
             <Button onClick={onNewConversation} className="mt-6">
                <Plus className="mr-2 h-4 w-4" /> Démarrer une nouvelle discussion
            </Button>
        </div>
    );
};

export function AiTutorClient() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const getFirstName = () => user?.displayName?.split(' ')[0] || 'Étudiant';
  
  const getInitialConversations = (): Conversation[] => [{
      id: `conv-${Date.now()}`,
      title: 'Nouvelle Discussion',
      messages: []
  }];

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedConversations = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedConversations) {
        const parsed = JSON.parse(savedConversations);
        if (parsed.length > 0) {
          setConversations(parsed);
          setActiveConversationId(parsed[0].id);
          return;
        }
      }
    } catch (error) {
      console.error("Failed to load conversations from local storage", error);
    }
    const initial = getInitialConversations();
    setConversations(initial);
    setActiveConversationId(initial[0].id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (conversations.length > 0) {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(conversations));
        } catch (error) {
            console.error("Failed to save conversations to local storage", error);
        }
    }
  }, [conversations]);

  const activeConversation = useMemo(() => conversations.find(c => c.id === activeConversationId), [conversations, activeConversationId]);
  
  const form = useForm<z.infer<typeof chatSchema>>({
    resolver: zodResolver(chatSchema),
    defaultValues: { message: "" },
  });

  const messageValue = form.watch('message');

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }
  }, [activeConversation?.messages]);

  const handleNewConversation = () => {
    const newConvId = `conv-${Date.now()}`;
    const newConversation: Conversation = {
        id: newConvId,
        title: 'Nouvelle Discussion',
        messages: []
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConvId);
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: z.infer<typeof chatSchema>) {
    if (!activeConversation || !user) return;

    const imageToSend = imagePreview;
    const userMessage: Message = { 
        id: `user-${Date.now()}`, 
        content: values.message, 
        role: 'user',
        image: imageToSend,
    };

    const updatedMessages = [...activeConversation.messages, userMessage];
    updateConversationMessages(activeConversation.id, updatedMessages);
    
    addHistoryItem(user.uid, {
        type: 'ai',
        title: 'Question au Tuteur IA',
        link: '/ai-tutor'
    });

    form.reset();
    setIsLoading(true);
    setImagePreview(null);

    try {
      const historyForAPI = activeConversation.messages
        .filter(m => m.content && m.content.trim() !== '')
        .map(m => ({ role: m.role, parts: [{ text: m.content }] }));

      const result = await callAiTutor({
        message: values.message,
        image: imageToSend || undefined,
        history: historyForAPI,
      });

      if (!result) {
        throw new Error("La réponse de l'IA est vide.");
      }
      
      const aiMessage: Message = { 
          id: `ai-${Date.now()}`, 
          content: result.response, 
          role: 'model', 
          plotData: result.plotData 
      };
      updateConversationMessages(activeConversation.id, [...updatedMessages, aiMessage]);
      
    } catch (error) {
      console.error("Erreur lors de l'appel du chat IA:", error);
      const errorMessageText = error instanceof Error ? error.message : "Désolé, une erreur s'est produite. Veuillez réessayer.";
      const errorMessage: Message = { id: `err-${Date.now()}`, content: errorMessageText, role: 'model' };
      updateConversationMessages(activeConversation.id, [...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  const updateConversationMessages = (convId: string, messages: Message[]) => {
     setConversations(prev => prev.map(c => {
        if (c.id === convId) {
            const userMessages = messages.filter(m => m.role === 'user');
            let newTitle = c.title;
            if (userMessages.length > 0 && c.title === 'Nouvelle Discussion') {
                const firstUserMessage = userMessages[0].content;
                newTitle = firstUserMessage.length > 30 ? firstUserMessage.substring(0, 30) + '...' : firstUserMessage;
            }
            return {...c, messages, title: newTitle};
        }
        return c;
     }));
  }

  return (
    <div className="flex h-full bg-background">
        <aside className={cn("flex-shrink-0 border-r bg-secondary/50 flex flex-col transition-all duration-300", isSidebarOpen ? "w-72" : "w-0 p-0 border-0")}>
             <div className={cn("p-4 border-b flex justify-between items-center", !isSidebarOpen && "hidden")}>
                <div className='flex items-center gap-2'><Logo /><h1 className="text-xl font-headline font-semibold">Tuteur IA</h1></div>
                <Button variant="ghost" size="icon" onClick={handleNewConversation} title="Nouvelle discussion"><Plus className="h-5 w-5" /></Button>
            </div>
            <ScrollArea className={cn("flex-1", !isSidebarOpen && "hidden")}>
                <nav className="p-2 space-y-1">
                    {conversations.map(conv => (
                        <Button key={conv.id} variant={activeConversationId === conv.id ? 'secondary' : 'ghost'} className="w-full justify-start gap-2" onClick={() => setActiveConversationId(conv.id)}>
                            <MessageSquare className="h-4 w-4" /><span className="truncate">{conv.title}</span>
                        </Button>
                    ))}
                </nav>
            </ScrollArea>
             <div className={cn("p-2 border-t", !isSidebarOpen && "hidden")}>
                <div className="flex items-center gap-3 p-2 rounded-lg">
                    <Avatar className="h-10 w-10"><AvatarImage src={user?.photoURL || undefined} /><AvatarFallback>{user?.displayName?.[0] || 'U'}</AvatarFallback></Avatar>
                    <div className="flex-1 overflow-hidden"><p className="font-semibold truncate">{user?.displayName}</p><p className="text-xs text-muted-foreground truncate">{user?.email}</p></div>
                </div>
            </div>
        </aside>

        <main className="flex-1 flex flex-col">
            <header className="p-4 border-b font-semibold text-lg flex items-center gap-2">
                 <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(prev => !prev)} className="mr-2"><PanelLeft className="h-5 w-5" /></Button>
                {activeConversation?.title || 'Tuteur IA'}
            </header>
            <div className='flex-1 overflow-hidden'>
                <ScrollArea className="h-full" ref={scrollAreaRef}>
                    {activeConversation && activeConversation.messages.length > 0 ? (
                        <div className="space-y-6 max-w-4xl mx-auto p-4">
                            {activeConversation.messages.map((message) => (
                                <div key={message.id} className={cn("flex items-start gap-3", message.role === 'user' && "justify-end")}>
                                    {message.role === 'model' && (<Avatar className="h-8 w-8 border"><div className='flex items-center justify-center h-full w-full bg-primary'><Sparkles className="h-5 w-5 text-primary-foreground" /></div></Avatar>)}
                                    <div className={cn("rounded-lg p-3 max-w-[90%] overflow-x-auto", message.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted")}>
                                        {message.image && (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <div className="mb-2 cursor-pointer">
                                                        <Image src={message.image} alt="Image envoyée" width={80} height={80} className="rounded-md object-cover" />
                                                    </div>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-3xl">
                                                    <Image src={message.image} alt="Image envoyée en grand" width={800} height={600} className="rounded-md object-contain max-h-[80vh] w-full"/>
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                        <ReactMarkdown
                                        remarkPlugins={[remarkMath]}
                                        rehypePlugins={[rehypeKatex]}
                                        className="prose dark:prose-invert prose-sm max-w-none"
                                        >
                                        {message.content}
                                        </ReactMarkdown>
                                        {message.plotData && (
                                            <div className="mt-4 bg-white p-4 rounded-md">
                                                <ResponsiveContainer width="100%" height={300}>
                                                    <LineChart data={message.plotData.points}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="x" label={{ value: 'x', position: 'insideBottomRight', offset: -5 }} />
                                                        <YAxis label={{ value: 'f(x)', angle: -90, position: 'insideLeft' }} />
                                                        <Tooltip />
                                                        <Legend />
                                                        <Line type="monotone" dataKey="y" stroke="#ff6f00" strokeWidth={2} dot={false} name={message.plotData.function} />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        )}
                                    </div>
                                    {message.role === 'user' && (<Avatar className="h-8 w-8"><AvatarImage src={user?.photoURL || undefined} /><AvatarFallback>{user?.displayName?.[0] || 'U'}</AvatarFallback></Avatar>)}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-start gap-3">
                                    <Avatar className="h-8 w-8 border"><div className='flex items-center justify-center h-full w-full bg-primary'><Sparkles className="h-5 w-5 text-primary-foreground" /></div></Avatar>
                                    <div className="bg-muted rounded-lg p-3 flex items-center space-x-2"><Loader2 className="h-4 w-4 animate-spin" /><span className='text-sm text-muted-foreground'>Réflexion...</span></div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <WelcomeScreen onNewConversation={handleNewConversation} />
                    )}
                </ScrollArea>
            </div>
            <div className="p-4 border-t bg-secondary/50">
                 <div className="max-w-4xl mx-auto">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                           {imagePreview && (
                                <div className="relative w-24 h-24 border rounded-md p-1">
                                    <Image src={imagePreview} alt="Aperçu" className="w-full h-full object-cover rounded-md" />
                                    <Button size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => setImagePreview(null)}>
                                        <X className="h-4 w-4"/>
                                    </Button>
                                </div>
                            )}
                            <div className="relative">
                                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden"/>
                                <Textarea placeholder="Demandez quelque chose au Professeur IA..." {...form.register('message')} rows={1} className="min-h-[48px] max-h-48 resize-y rounded-full py-3 pl-12 pr-12"/>
                                 <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                    <Button type="button" size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()}>
                                        <ImageIcon className="h-5 w-5" />
                                    </Button>
                                 </div>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                     <Button type="submit" disabled={isLoading || !messageValue} size="icon" className='h-8 w-8 rounded-full'>
                                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}<span className="sr-only">Envoyer</span>
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </Form>
                 </div>
            </div>
        </main>
    </div>
  );
}
