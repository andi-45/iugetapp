// src/app/ia-tools/chat/agent-chat-client.tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, notFound } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Send, Sparkles, Plus, X, PanelLeft, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { IconByName } from '@/lib/icon-by-name';
import { type AIAgent, getAgentById } from '@/services/agent-service';
import { callAIAgent, type AgentFlowInput } from '@/ai/flows/agent-flow';
import ReactMarkdown from 'react-markdown';
import { PageLoader } from '@/components/page-loader';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { addHistoryItem } from '@/services/history-service';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

const chatSchema = z.object({
  message: z.string().min(1, { message: "Le message ne peut pas être vide." }),
});

type Message = {
  id: string;
  role: 'user' | 'model';
  content: string;
  image?: string | null; // Image data URI for user messages
};

const LOCAL_STORAGE_KEY_PREFIX = 'onbuch-agent-chat-';

export function AgentChatClient() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const agentId = searchParams.get('id');

  const [agent, setAgent] = useState<AIAgent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const form = useForm<z.infer<typeof chatSchema>>({
    resolver: zodResolver(chatSchema),
    defaultValues: { message: "" },
  });

  const messageValue = form.watch('message');

  // Load agent data and conversation history
  useEffect(() => {
    if (agentId) {
        getAgentById(agentId).then(agentData => {
            if (!agentData) notFound();
            setAgent(agentData);
            
            const savedHistory = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${agentId}`);
            if (savedHistory) {
                setMessages(JSON.parse(savedHistory));
            } else {
                setMessages([{
                    id: 'initial',
                    role: 'model',
                    content: `Bonjour ! Je suis ${agentData.name}. Comment puis-je vous aider aujourd'hui ?`
                }]);
            }
        });
    } else {
        notFound();
    }
  }, [agentId]);

  // Save history to local storage
  useEffect(() => {
    if (agentId && messages.length > 1) { // Don't save initial message only
        localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${agentId}`, JSON.stringify(messages));
    }
  }, [messages, agentId]);
  
  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages, isLoading]);

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
    if (!agent || !user) return;
    
    const imageToSend = imagePreview;
    const userMessage: Message = { 
        id: `user-${Date.now()}`, 
        content: values.message, 
        role: 'user',
        image: imageToSend,
    };
    
    // If it's the first real message, replace the initial welcome message
    const initialMessage = messages.length === 1 && messages[0].id === 'initial' 
        ? [] 
        : messages;

    const updatedMessages = [...initialMessage, userMessage];
    setMessages(updatedMessages);

    addHistoryItem(user.uid, {
        type: 'ai',
        title: `Question à: ${agent.name}`,
        link: `/ia-tools/chat?id=${agent.id}`
    });

    form.reset();
    setIsLoading(true);
    
    setImagePreview(null); // Clear preview after sending

    try {
      const historyForAPI = updatedMessages.map(m => ({ role: m.role, content: m.content }));

      const input: AgentFlowInput = {
        agentId: agent.id,
        prompt: values.message,
        history: historyForAPI,
      };

      if (imageToSend) {
        input.image = imageToSend;
      }
      
      const result = await callAIAgent(input);
      
      const aiMessage: Message = { id: `ai-${Date.now()}`, content: result.response, role: 'model' };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error("Erreur lors de l'appel de l'agent IA:", error);
      const errorMessageText = error instanceof Error ? error.message : "Désolé, une erreur s'est produite. Veuillez réessayer.";
      const errorMessage: Message = { id: `err-${Date.now()}`, content: errorMessageText, role: 'model' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).MathJax) {
      (window as any).MathJax.typeset();
    }
  }, [messages]);

  if (!agent) {
    return <PageLoader />;
  }

  const AgentIcon = IconByName[agent.icon] || Sparkles;

  return (
    <div className="flex h-full flex-col bg-background">
        <header className="p-4 border-b font-semibold text-lg flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push('/ia-tools')} className="mr-2"><ArrowLeft className="h-5 w-5" /></Button>
            <div className="p-2 rounded-lg mr-2" style={{backgroundColor: agent.color}}><AgentIcon className="h-6 w-6 text-white"/></div>
            {agent.name}
        </header>
        <div className='flex-1 overflow-hidden'>
            <ScrollArea className="h-full" ref={scrollAreaRef}>
                 <div className="space-y-6 max-w-4xl mx-auto p-4">
                    {messages.map((message) => (
                        <div key={message.id} className={cn("flex items-start gap-3", message.role === 'user' && "justify-end")}>
                            {message.role === 'model' && (
                                <Avatar className="h-8 w-8 border">
                                    <div className='flex items-center justify-center h-full w-full' style={{backgroundColor: agent.color}}>
                                        <AgentIcon className="h-5 w-5 text-white" />
                                    </div>
                                </Avatar>
                            )}
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
                            </div>
                             {message.role === 'user' && (<Avatar className="h-8 w-8"><AvatarImage src={user?.photoURL || undefined} /><AvatarFallback>{user?.displayName?.[0] || 'U'}</AvatarFallback></Avatar>)}
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-start gap-3">
                            <Avatar className="h-8 w-8 border"><div className='flex items-center justify-center h-full w-full' style={{backgroundColor: agent.color}}><AgentIcon className="h-5 w-5 text-white" /></div></Avatar>
                            <div className="bg-muted rounded-lg p-3 flex items-center space-x-2"><Loader2 className="h-4 w-4 animate-spin" /><span className='text-sm text-muted-foreground'>Réflexion...</span></div>
                        </div>
                    )}
                 </div>
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
                        <div className="relative flex items-center">
                             <Button type="button" size="icon" variant="ghost" className="absolute left-1" onClick={() => fileInputRef.current?.click()}>
                                <ImageIcon className="h-5 w-5" />
                            </Button>
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden"/>

                            <Textarea placeholder="Envoyer un message..." {...form.register('message')} rows={1} className="min-h-[48px] max-h-48 resize-y rounded-full py-3 pl-12 pr-12"/>
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
    </div>
  );
}
