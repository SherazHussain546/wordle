'use client';

import { useEffect } from 'react';
import { Card } from './ui/card';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    adsbygoogle: { [key: string]: unknown }[];
  }
}

const AdBanner = ({ className }: { className?: string }) => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error(err);
    }
  }, []);

  return (
    <Card className={cn("w-full h-full flex items-center justify-center text-muted-foreground", className)}>
       <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-7334468000130380"
        data-ad-slot="1234567890" // Replace with your ad slot ID
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </Card>
  );
};

export default AdBanner;
