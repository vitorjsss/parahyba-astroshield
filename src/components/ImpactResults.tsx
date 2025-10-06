import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { AlertTriangle, Activity, Waves, Wind } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';
import { ImpactApiResult } from '../utils/api';

interface ImpactResultsProps {
  impactPoint: [number, number];
  results: ImpactApiResult;
}

export function ImpactResults({ impactPoint, results }: ImpactResultsProps) {
  const energyMegatons = results.energy_megatons_tnt;
  const craterDiameterKm = results.crater_diameter_km;
  const seismicMagnitude = results.seismic_magnitude;

  const isOceanImpact = Math.abs(impactPoint[1]) < 60;
  const tsunamiHeight = isOceanImpact ? Math.min(50, energyMegatons * 0.1) : 0;

  const getSeverityBadge = (megatons: number) => {
    if (megatons < 1) return { variant: 'secondary' as const, text: 'Minor' };
    if (megatons < 20) return { variant: 'default' as const, text: 'Moderate' };
    if (megatons < 200) return { variant: 'destructive' as const, text: 'Severe' };
    return { variant: 'destructive' as const, text: 'Catastrophic' };
  };

  const severity = getSeverityBadge(energyMegatons);

  return (
    <Card
      style={{
        maxHeight: '70vh',
        padding: '1.5rem',
        backgroundColor: 'rgba(255,255,255,0.95)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        borderRadius: '1rem',
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'left',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle style={{ color: '#e53e3e' }} />
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Impact Analysis</h2>
        </div>
        <Badge variant={severity.variant}>
          {severity.text}
        </Badge>
      </div>

      {/* Content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        overflowY: 'scroll', // Sempre visível
        flex: 1,
        paddingRight: '0.5rem'
      }} className="impact-results-scroll">
        {/* Energy Release */}
        <Section icon={<Activity />} title="Energy Release">
          <p style={{ fontWeight: 600, fontSize: '1rem', textAlign: 'left' }}>
            <InfoTooltip
              content="Energy released upon collision, expressed in megatons of TNT."
              size="lg"
              position="right"
            />
            {energyMegatons.toFixed(2)} megatons TNT
          </p>
          <p style={{ color: '#666', fontSize: '0.875rem', textAlign: 'left' }}>
            <InfoTooltip
              content="Shows the force compared to historical nuclear bombs."
              size="lg"
              position="right"
            />
            Equivalent to {(energyMegatons / 15).toFixed(1)}x the Hiroshima bomb
          </p>
        </Section>

        {/* Crater Formation */}
        <Section icon={<Target />} title="Crater Formation">
          <p style={{ fontWeight: 600, textAlign: 'left' }}>
            <InfoTooltip
              content="Estimated diameter of the crater created by the impact."
              size="lg"
              position="right"
            />
            {craterDiameterKm.toFixed(2)} km diameter ({(craterDiameterKm * 1000).toFixed(0)} meters)
          </p>
          {results.context && (
            <div style={{ paddingTop: '0.5rem', borderTop: '1px solid #eee' }}>
              <p style={{ fontSize: '0.875rem', textAlign: 'left' }}>
                <InfoTooltip
                  content="Estimated number of people within the impact area."
                  size="lg"
                  position="right"
                />
                Population affected: {typeof results.context.population_estimated_affected === 'number' ? results.context.population_estimated_affected.toLocaleString() : 'N/A'}
              </p>
              <p style={{ fontSize: '0.875rem', textAlign: 'left' }}>
                <InfoTooltip
                  content="Estimated number of buildings or structures within the hit zone."
                  size="lg"
                  position="right"
                />
                Buildings within impact: ~{typeof results.context.buildings_within_m === 'number' ? results.context.buildings_within_m.toFixed(0) : 'N/A'} m
              </p>
              <p style={{ fontSize: '0.875rem', textAlign: 'left' }}>
                <InfoTooltip
                  content="Total number of buildings identified in the impact area."
                  size="lg"
                  position="right"
                />
                Buildings count: {typeof results.context.buildings_count === 'number' ? results.context.buildings_count.toLocaleString() : 'N/A'}
              </p>
            </div>
          )}
        </Section>

        {/* Seismic Activity */}
        <Section icon={<Activity />} title="Seismic Activity">
          <p style={{ textAlign: 'left' }}>
            <InfoTooltip
              content="Earthquake magnitude generated by the impact on the Richter scale."
              size="lg"
              position="right"
            />
            Magnitude {seismicMagnitude.toFixed(1)} earthquake
          </p>
        </Section>

        {/* Tsunami Risk */}
        {isOceanImpact && tsunamiHeight > 0 && (
          <Section icon={<Waves />} title="Tsunami Risk">
            <p style={{ textAlign: 'left' }}>
              <InfoTooltip
                content="Estimated tsunami wave height generated by ocean impact."
                size="lg"
                position="right"
              />
              Wave height: ~{tsunamiHeight.toFixed(1)} meters
            </p>
            <p style={{ color: '#666', fontSize: '0.875rem', textAlign: 'left' }}>
              <InfoTooltip
                content="Approximate coastal distance that could be affected by the tsunami."
                size="lg"
                position="right"
              />
              Coastal areas within {(tsunamiHeight * 10).toFixed(0)} km at risk
            </p>
          </Section>
        )}

        {/* Atmospheric Effects */}
        <Section icon={<Wind />} title="Atmospheric Effects">
          <p style={{ textAlign: 'left' }}>
            <InfoTooltip
              content="Describes the atmospheric impact and dust dispersion based on impact energy."
              size="lg"
              position="right"
            />
            {energyMegatons < 1
              ? 'Minimal atmospheric disturbance'
              : energyMegatons < 100
                ? 'Dust and debris in local atmosphere'
                : 'Global atmospheric dust, potential climate effects'}
          </p>
        </Section>

        {/* Impact Zone */}
        <Section title="Impact Zone">
          <p style={{ textAlign: 'left' }}>
            <InfoTooltip
              content="Latitude and longitude of the impact center."
              size="lg"
              position="right"
            />
            Coordinates: {impactPoint[1].toFixed(2)}°N, {impactPoint[0].toFixed(2)}°E
          </p>
          <p style={{ color: '#666', fontSize: '0.875rem', textAlign: 'left' }}>
            Impact radius (map): ~{craterDiameterKm.toFixed(1)} km
          </p>
        </Section>
      </div>
    </Card>
  );
}

// Reusable minimal section component
function Section({ icon, title, children }: { icon?: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
        {icon}
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 500 }}>{title}</h3>
      </div>
      <div style={{ paddingLeft: icon ? '1.5rem' : 0 }}>{children}</div>
    </div>
  );
}

// Minimal target icon
function Target() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="10" strokeWidth={2} stroke="#555" />
      <circle cx="12" cy="12" r="6" strokeWidth={2} stroke="#555" />
      <circle cx="12" cy="12" r="2" strokeWidth={2} stroke="#555" />
    </svg>
  );
}
