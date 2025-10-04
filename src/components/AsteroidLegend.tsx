import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { AlertTriangle, Info } from 'lucide-react';

interface AsteroidLegendProps {
  totalAsteroids: number;
  hazardousCount: number;
  sentryCount: number;
}

export function AsteroidLegend({ totalAsteroids, hazardousCount, sentryCount }: AsteroidLegendProps) {
  return (
    <Card className="bg-card/90 backdrop-blur-sm border-border/50 p-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" />
          <h3>Asteroid Classification</h3>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-[#60a5fa] border-2 border-[#60a5fa]/50 shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
            <div className="flex-1">
              <p className="opacity-80">Safe Asteroids</p>
              <p className="opacity-60">{totalAsteroids - hazardousCount - sentryCount} objects</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-[#f97316] border-2 border-[#f97316]/50 shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
            <div className="flex-1">
              <p className="opacity-80">Sentry Objects</p>
              <p className="opacity-60">{sentryCount} objects</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-[#ef4444] border-2 border-[#ef4444]/50 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
            <div className="flex-1 flex items-center gap-2">
              <div>
                <p className="opacity-80 flex items-center gap-1">
                  Potentially Hazardous
                  <AlertTriangle className="w-3 h-3" />
                </p>
                <p className="opacity-60">{hazardousCount} objects</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-border/30">
          <p className="opacity-60">
            Click any asteroid to view detailed information
          </p>
        </div>
      </div>
    </Card>
  );
}
