// src/components/promo-card.tsx
'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getPromos, type PromoContent } from '@/services/promo-service';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay";

export function PromoCard() {
    const [promos, setPromos] = useState<PromoContent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadPromos() {
            const promoData = await getPromos();
            const activePromos = promoData.filter(p => p.isActive);
            setPromos(activePromos);
            setIsLoading(false);
        }
        loadPromos();
    }, []);

    if (isLoading) {
        return (
            <Card className="h-48 flex items-center justify-center">
                <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
            </Card>
        )
    }

    if (promos.length === 0) {
        return null; // Don't render anything if no active promos
    }
    
    if (promos.length === 1) {
        const promo = promos[0];
        return (
            <Card className="relative overflow-hidden group h-48">
                <div className="absolute inset-0">
                    <Image src={promo.imageUrl} alt={promo.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                </div>
                <CardContent className="relative text-white p-6 flex flex-col justify-end h-full">
                    <h3 className="text-2xl font-headline font-bold">{promo.title}</h3>
                    <p className="text-sm text-white/90 mt-1 mb-4">{promo.description}</p>
                    <Button asChild variant="secondary" className="w-fit">
                        <Link href={promo.ctaLink}>
                            {promo.ctaText}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Carousel
            plugins={[Autoplay({ delay: 3000, stopOnInteraction: true })]}
            opts={{ loop: true }}
            className="w-full"
        >
            <CarouselContent>
                {promos.map((promo) => (
                    <CarouselItem key={promo.id}>
                        <Card className="relative overflow-hidden group h-48">
                            <div className="absolute inset-0">
                                <Image src={promo.imageUrl} alt={promo.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                            </div>
                             <CardContent className="relative text-white p-6 flex flex-col justify-end h-full">
                                <h3 className="text-2xl font-headline font-bold">{promo.title}</h3>
                                <p className="text-sm text-white/90 mt-1 mb-4">{promo.description}</p>
                                <Button asChild variant="secondary" className="w-fit">
                                    <Link href={promo.ctaLink}>
                                        {promo.ctaText}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 hidden sm:flex" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex" />
        </Carousel>
    )
}
