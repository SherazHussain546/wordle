'use client';

import { Card } from './ui/card';
import { cn } from '@/lib/utils';

/**
 * A container for displaying ads.
 * The ad script loaded in the main layout will target this area.
 */
const AdBanner = ({ className }: { className?: string }) => {
  return (
    <Card className={cn("w-full h-full flex items-center justify-center text-muted-foreground bg-muted/50 border-dashed", className)}>
      {/* The ad network script will populate this area. 
          If it fails or an ad is not served, this text may be visible. */}
      <span className="text-xs">Advertisement</span>
    </Card>
  );
};

export default AdBanner;
