import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { NASAAsteroid } from '../types/nasa';
import { AlertTriangle, TrendingUp, Calendar, Gauge } from 'lucide-react';

interface AsteroidListProps {
  asteroids: NASAAsteroid[];
  onAsteroidSelect?: (asteroid: NASAAsteroid) => void;
  selectedAsteroid?: NASAAsteroid | null;
}

export function AsteroidList({ asteroids, onAsteroidSelect, selectedAsteroid }: AsteroidListProps) {
  const sortedAsteroids = [...asteroids].sort((a, b) => {
    // Sort by miss distance (closer first)
    const distA = parseFloat(a.close_approach_data[0].miss_distance.kilometers);
    const distB = parseFloat(b.close_approach_data[0].miss_distance.kilometers);
    return distA - distB;
  });

  return (
    <Card className="h-full bg-card/95 backdrop-blur-sm border-border/50">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <h3>Near-Earth Objects</h3>
          <Badge variant="secondary">{asteroids.length} asteroids</Badge>
        </div>
        <p className="opacity-60 mt-1">
          Tracking close approaches
        </p>
      </div>

      <ScrollArea className="h-[calc(100%-80px)]">
        <div className="p-4 space-y-3">
          {sortedAsteroids.map((asteroid) => {
            const closeApproach = asteroid.close_approach_data[0];
            const diameter = asteroid.estimated_diameter.meters.estimated_diameter_min;
            const missDistanceKm = parseFloat(closeApproach.miss_distance.kilometers);
            const velocity = parseFloat(closeApproach.relative_velocity.kilometers_per_second);
            const isSelected = selectedAsteroid?.id === asteroid.id;

            return (
              <div
                key={asteroid.id}
                onClick={() => onAsteroidSelect?.(asteroid)}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary/10 border-primary'
                    : 'bg-muted/30 border-border/30 hover:bg-muted/50 hover:border-border/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{asteroid.name}</p>
                    <p className="opacity-60 mt-0.5">
                      ID: {asteroid.id}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {asteroid.is_potentially_hazardous_asteroid && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Hazardous
                      </Badge>
                    )}
                    {asteroid.is_sentry_object && (
                      <Badge variant="default" className="text-xs">
                        Sentry
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 opacity-80">
                    <TrendingUp className="w-3 h-3 opacity-60" />
                    <span className="opacity-60">Diameter:</span>
                    <span>{diameter.toFixed(0)}m</span>
                  </div>

                  <div className="flex items-center gap-2 opacity-80">
                    <Gauge className="w-3 h-3 opacity-60" />
                    <span className="opacity-60">Velocity:</span>
                    <span>{velocity.toFixed(2)} km/s</span>
                  </div>

                  <div className="flex items-center gap-2 opacity-80">
                    <Calendar className="w-3 h-3 opacity-60" />
                    <span className="opacity-60">Approach:</span>
                    <span>{closeApproach.close_approach_date}</span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-border/30">
                    <div className="flex items-center justify-between">
                      <span className="opacity-60">Miss Distance:</span>
                      <div className="text-right">
                        <p>{(missDistanceKm / 1000).toFixed(0)}k km</p>
                        <p className="opacity-60">
                          {parseFloat(closeApproach.miss_distance.lunar).toFixed(2)} LD
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {asteroids.length === 0 && (
            <div className="text-center py-8 opacity-60">
              <p>No asteroids data available</p>
              <p className="mt-2">Load NASA NEO data to see asteroids</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
