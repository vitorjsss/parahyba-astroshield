import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { TrendingUp, Calendar, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { NASAAsteroid } from '../types/nasa';

interface AsteroidStatsProps {
  asteroids: NASAAsteroid[];
}

export function AsteroidStats({ asteroids }: AsteroidStatsProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Calculate statistics
  const totalCount = asteroids.length;
  const hazardousCount = asteroids.filter(a => a.is_potentially_hazardous_asteroid).length;
  
  // Find closest approach
  const closestAsteroid = asteroids.reduce((closest, current) => {
    const currentDistance = parseFloat(current.close_approach_data[0].miss_distance.lunar);
    const closestDistance = parseFloat(closest.close_approach_data[0].miss_distance.lunar);
    return currentDistance < closestDistance ? current : closest;
  }, asteroids[0]);
  
  // Find largest asteroid
  const largestAsteroid = asteroids.reduce((largest, current) => {
    const currentSize = current.estimated_diameter.meters.estimated_diameter_min;
    const largestSize = largest.estimated_diameter.meters.estimated_diameter_min;
    return currentSize > largestSize ? current : largest;
  }, asteroids[0]);
  
  // Average size
  const avgSize = asteroids.reduce((sum, a) => sum + a.estimated_diameter.meters.estimated_diameter_min, 0) / totalCount;

  return (
    <Card className="bg-card/90 backdrop-blur-sm border-border/50 p-3">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between p-0 h-auto hover:bg-transparent"
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <h3>Live Statistics</h3>
            </div>
            {isOpen ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-2 pt-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted/30 rounded-md p-2">
              <p className="text-xs opacity-60 mb-1">Total Tracked</p>
              <p className="text-sm text-primary font-medium">{totalCount}</p>
            </div>

            <div className="bg-muted/30 rounded-md p-2">
              <p className="text-xs opacity-60 mb-1">Hazardous</p>
              <p className="text-sm text-destructive font-medium">{hazardousCount}</p>
            </div>
          </div>

          {closestAsteroid && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-2">
              <div className="flex items-center gap-1 mb-1">
                <TrendingUp className="w-3 h-3 text-blue-500" />
                <p className="text-xs opacity-80">Closest Approach</p>
              </div>
              <p className="text-sm font-medium truncate">{closestAsteroid.name}</p>
              <p className="text-xs opacity-60">
                {parseFloat(closestAsteroid.close_approach_data[0].miss_distance.lunar).toFixed(2)} LD
              </p>
            </div>
          )}

          {largestAsteroid && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-md p-2">
              <div className="flex items-center gap-1 mb-1">
                <Calendar className="w-3 h-3 text-amber-500" />
                <p className="text-xs opacity-80">Largest Object</p>
              </div>
              <p className="text-sm font-medium truncate">{largestAsteroid.name}</p>
              <p className="text-xs opacity-60">
                {largestAsteroid.estimated_diameter.meters.estimated_diameter_min.toFixed(0)}m diameter
              </p>
            </div>
          )}

          <div className="pt-2 border-t border-border/30">
            <p className="text-xs opacity-60">
              Average size: {avgSize.toFixed(0)}m
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
