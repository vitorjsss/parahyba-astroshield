import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { AlertTriangle, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface AsteroidLegendProps {
  totalAsteroids: number;
  hazardousCount: number;
  sentryCount: number;
}

export function AsteroidLegend({ totalAsteroids, hazardousCount, sentryCount }: AsteroidLegendProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="bg-card/90 backdrop-blur-sm border-border/50 p-3">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between p-0 h-auto hover:bg-transparent"
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              <h3>Asteroid Classification</h3>
            </div>
            {isOpen ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-2 pt-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#60a5fa] border border-[#60a5fa]/50" />
              <div className="flex-1 min-w-0">
                <p className="text-sm opacity-80">Safe Asteroids</p>
                <p className="text-xs opacity-60">{totalAsteroids - hazardousCount - sentryCount} objects</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#f97316] border border-[#f97316]/50" />
              <div className="flex-1 min-w-0">
                <p className="text-sm opacity-80">Sentry Objects</p>
                <p className="text-xs opacity-60">{sentryCount} objects</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ef4444] border border-[#ef4444]/50" />
              <div className="flex-1 flex items-center gap-1 min-w-0">
                <div>
                  <p className="text-sm opacity-80 flex items-center gap-1">
                    Potentially Hazardous
                    <AlertTriangle className="w-2.5 h-2.5" />
                  </p>
                  <p className="text-xs opacity-60">{hazardousCount} objects</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-border/30">
            <p className="text-xs opacity-60">
              Click any asteroid to view detailed information
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
