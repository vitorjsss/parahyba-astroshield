import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { NASAAsteroid } from '../types/nasa';
import { ExternalLink, AlertTriangle, TrendingUp, Zap, Globe2, Calendar, Focus } from 'lucide-react';

interface AsteroidDetailsProps {
  asteroid: NASAAsteroid;
  onSimulateImpact?: () => void;
  onFocusInView?: () => void;
}

export function AsteroidDetails({ asteroid, onSimulateImpact, onFocusInView }: AsteroidDetailsProps) {
  const closeApproach = asteroid.close_approach_data[0];
  const diameter = asteroid.estimated_diameter.meters.estimated_diameter_min;
  const diameterMax = asteroid.estimated_diameter.meters.estimated_diameter_max;
  const missDistanceKm = parseFloat(closeApproach.miss_distance.kilometers);
  const velocity = parseFloat(closeApproach.relative_velocity.kilometers_per_second);
  
  // Calculate potential impact energy (if it were to hit Earth)
  const volume = (4/3) * Math.PI * Math.pow(diameter/2, 3);
  const mass = volume * 3000; // Assume rocky density
  const energyJoules = 0.5 * mass * Math.pow(velocity * 1000, 2);
  const energyMegatons = energyJoules / (4.184 * Math.pow(10, 15));

  return (
    <Card className="p-6 bg-card/95 backdrop-blur-sm border-border/50">
      <div className="space-y-6">
        <div>
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <h2 className="mb-1">{asteroid.name}</h2>
              <p className="opacity-60">NEO Reference: {asteroid.neo_reference_id}</p>
            </div>
            {asteroid.is_potentially_hazardous_asteroid && (
              <Badge variant="destructive">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Hazardous
              </Badge>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(asteroid.nasa_jpl_url, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View on NASA JPL
          </Button>
        </div>

        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-chart-1" />
              <h3>Physical Properties</h3>
            </div>
            <div className="space-y-1">
              <p className="opacity-80">
                <span className="opacity-60">Diameter:</span> {diameter.toFixed(0)} - {diameterMax.toFixed(0)} meters
              </p>
              <p className="opacity-80">
                <span className="opacity-60">Absolute Magnitude:</span> {asteroid.absolute_magnitude_h.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-chart-2" />
              <h3>Close Approach</h3>
            </div>
            <div className="space-y-1">
              <p className="opacity-80">
                <span className="opacity-60">Date:</span> {closeApproach.close_approach_date_full}
              </p>
              <p className="opacity-80">
                <span className="opacity-60">Velocity:</span> {velocity.toFixed(2)} km/s
              </p>
              <p className="opacity-80">
                <span className="opacity-60">Miss Distance:</span> {(missDistanceKm).toLocaleString()} km
              </p>
              <p className="opacity-80">
                <span className="opacity-60">Lunar Distance:</span> {parseFloat(closeApproach.miss_distance.lunar).toFixed(2)} LD
              </p>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-chart-3" />
              <h3>Potential Impact Energy</h3>
            </div>
            <div className="space-y-1">
              <p className="text-chart-3">
                {energyMegatons.toFixed(2)} megatons TNT
              </p>
              <p className="opacity-60">
                If this asteroid were to impact Earth
              </p>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Globe2 className="w-4 h-4 text-blue-500" />
              <h3 className="text-blue-500">Safety Status</h3>
            </div>
            <p className="opacity-80">
              This asteroid will safely pass Earth at a distance of{' '}
              <span className="text-blue-500">{parseFloat(closeApproach.miss_distance.lunar).toFixed(2)}</span>{' '}
              times the Moon's distance.
            </p>
          </div>

          <div className="flex gap-2">
            {onFocusInView && (
              <Button onClick={onFocusInView} className="flex-1" variant="secondary">
                <Focus className="w-4 h-4 mr-2" />
                Focus in 3D View
              </Button>
            )}
            {onSimulateImpact && (
              <Button onClick={onSimulateImpact} className="flex-1" variant="outline">
                Simulate Impact
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
