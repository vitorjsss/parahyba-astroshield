import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { AlertTriangle, Activity, Waves, Wind } from 'lucide-react';
import { ImpactApiResult } from '../utils/Api';

interface ImpactResultsProps {
  impactPoint: [number, number];
  results: ImpactApiResult;
}

export function ImpactResults({ impactPoint, results }: ImpactResultsProps) {
  // Use only the passed results, no local calculations
  const energyMegatons = results.energy_megatons_tnt;
  const craterDiameterKm = results.crater_diameter_km;
  const seismicMagnitude = results.seismic_magnitude;

  // Determine if ocean or land impact (simplified - check if near coastal areas)
  const isOceanImpact = Math.abs(impactPoint[1]) < 60; // Simplified ocean check

  // Tsunami height estimation based on energy from results
  const tsunamiHeight = isOceanImpact ? Math.min(50, energyMegatons * 0.1) : 0;

  const getSeverityColor = (megatons: number) => {
    if (megatons < 1) return 'text-yellow-500';
    if (megatons < 20) return 'text-orange-500';
    if (megatons < 200) return 'text-red-500';
    return 'text-red-600';
  };

  const getSeverityBadge = (megatons: number) => {
    if (megatons < 1) return { variant: 'secondary' as const, text: 'Minor' };
    if (megatons < 20) return { variant: 'default' as const, text: 'Moderate' };
    if (megatons < 200) return { variant: 'destructive' as const, text: 'Severe' };
    return { variant: 'destructive' as const, text: 'Catastrophic' };
  };

  const severity = getSeverityBadge(energyMegatons);

  return (
    <Card className="p-6 bg-card/95 backdrop-blur-sm border-border/50">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h2>Impact Analysis</h2>
          </div>
          <Badge variant={severity.variant}>{severity.text}</Badge>
        </div>

        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-chart-1" />
              <h3>Energy Release</h3>
            </div>
            <p className={getSeverityColor(energyMegatons)}>
              {energyMegatons.toFixed(2)} megatons TNT
            </p>
            <p className="opacity-60">
              Equivalent to {(energyMegatons / 15).toFixed(1)}x the Hiroshima bomb
            </p>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-chart-2" />
              <h3>Crater Formation</h3>
            </div>
            <p className="text-chart-2">
              {(craterDiameterKm * 1000).toFixed(0)} meters diameter
            </p>
            {results.context && (
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <h3>Estimated Exposure</h3>
                </div>
                <p className="opacity-80">Population affected: {results.context.population_estimated_affected.toLocaleString()}</p>
                <p className="opacity-80">Buildings within impact: ~{results.context.buildings_within_m.toFixed(0)} m</p>
                <p className="opacity-80">Buildings count: {results.context.buildings_count.toLocaleString()}</p>
              </div>
            )}
            <p className="opacity-60">
              Approximately {craterDiameterKm.toFixed(2)} km wide
            </p>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-500" />
              <h3>Impact Radius</h3>
            </div>
            <p className="opacity-80">Crater diameter: {craterDiameterKm.toFixed(1)} km</p>
            <p className="opacity-60 text-sm">Based on calculated impact energy and physics models</p>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-chart-3" />
              <h3>Seismic Activity</h3>
            </div>
            <p className="text-chart-3">
              Magnitude {seismicMagnitude.toFixed(1)} earthquake
            </p>
            <p className="opacity-60">
              {seismicMagnitude < 5
                ? 'Detectable by instruments'
                : seismicMagnitude < 6
                  ? 'Minor damage near impact'
                  : seismicMagnitude < 7
                    ? 'Serious damage in nearby areas'
                    : 'Major devastation across region'}
            </p>
          </div>

          {isOceanImpact && tsunamiHeight > 0 && (
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Waves className="w-4 h-4 text-blue-500" />
                <h3>Tsunami Risk</h3>
              </div>
              <p className="text-blue-500">
                Wave height: ~{tsunamiHeight.toFixed(1)} meters
              </p>
              <p className="opacity-60">
                Coastal areas within {(tsunamiHeight * 10).toFixed(0)} km at risk
              </p>
            </div>
          )}

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-chart-4" />
              <h3>Atmospheric Effects</h3>
            </div>
            <p className="opacity-80">
              {energyMegatons < 1
                ? 'Minimal atmospheric disturbance'
                : energyMegatons < 100
                  ? 'Dust and debris in local atmosphere'
                  : 'Global atmospheric dust, potential climate effects'}
            </p>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg">
            <p className="opacity-80">
              <span className="opacity-60">Impact Zone:</span> {impactPoint[1].toFixed(2)}°N, {impactPoint[0].toFixed(2)}°E
            </p>
            <p className="opacity-60 mt-1">
              Impact radius (map): ~{craterDiameterKm.toFixed(1)} km
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function Target({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="10" strokeWidth={2} />
      <circle cx="12" cy="12" r="6" strokeWidth={2} />
      <circle cx="12" cy="12" r="2" strokeWidth={2} />
    </svg>
  );
}