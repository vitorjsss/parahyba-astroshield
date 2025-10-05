import { useState } from 'react';
import { AsteroidParams } from '../types/AsteroidTypes';
import { Target, Zap, Globe2, Info } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';
import '../styles/AsteroidControls.css';

interface AsteroidControlsProps {
  onSimulate: (params: AsteroidParams) => void;
  impactPoint: [number, number] | null;
}

export function AsteroidControls({ onSimulate, impactPoint }: AsteroidControlsProps) {
  const [diameter, setDiameter] = useState([100]);
  const [velocity, setVelocity] = useState([20]);
  const [density, setDensity] = useState([3000]);
  const [activeTab, setActiveTab] = useState<'asteroid' | 'impact' | 'mitigation'>('asteroid');

  const handleSimulate = () => {
    const params = {
      diameter: diameter[0],
      velocity: velocity[0],
      density: density[0],
    } as const;
    onSimulate(params);
  };

  // Calculate impact energy (simplified)
  const mass = (4 / 3) * Math.PI * Math.pow(diameter[0] / 2, 3) * density[0];
  const energyJoules = 0.5 * mass * Math.pow(velocity[0] * 1000, 2);
  const energyMegatons = energyJoules / (4.184 * Math.pow(10, 15));

  const tabs = [
    { key: 'asteroid', label: 'Asteroid', icon: Globe2 },
    { key: 'impact', label: 'Impact', icon: Zap },
    { key: 'mitigation', label: 'Mitigation', icon: Target },
  ];

  return (
    <div className="ac-card">
      <h2 className="ac-title">Asteroid Impact Simulator</h2>

      {/* Tabs */}
      <div className="ac-tabs">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`ac-tab ${activeTab === tab.key ? 'active' : ''}`}
            >
              <Icon className="ac-tab-icon" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="ac-content" style={{paddingTop:'10px'}}>
        {activeTab === 'asteroid' && (
          <div className="ac-section">
            {[
              { 
                label: 'Diameter (m)', 
                value: diameter, 
                setter: setDiameter, 
                min: 10, 
                max: 1000, 
                step: 10,
                tooltip: "Asteroid's diameter in meters — larger means more impact energy."
              },
              { 
                label: 'Velocity (km/s)', 
                value: velocity, 
                setter: setVelocity, 
                min: 5, 
                max: 70, 
                step: 1,
                tooltip: "Entry speed of the asteroid in Earth's atmosphere."
              },
              { 
                label: 'Density (kg/m³)', 
                value: density, 
                setter: setDensity, 
                min: 1000, 
                max: 8000, 
                step: 100,
                tooltip: "Material density (rock, iron, ice, etc.)."
              },
            ].map((item, idx) => (
              <div className="ac-slider-group" key={idx}>
<label style={{ display: 'flex', alignItems: 'center', gap: '4px', verticalAlign: 'middle' }}>
  <InfoTooltip
    content={item.tooltip}
    size="md"
    position="right"
  />
  {item.label}: {item.value}
</label>
                <input
                  type="range"
                  min={item.min}
                  max={item.max}
                  step={item.step}
                  value={item.value[0]}
                  onChange={e => item.setter([Number(e.target.value)])}
                  className="ac-slider"
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'impact' && (
          <div className="ac-section">
            <div className="ac-box">
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', verticalAlign: 'middle' }}>
                <InfoTooltip
                  content="Energy released upon collision, expressed in megatons of TNT."
                  size="md"
                  position="right"
                />
                Impact Energy
              </label>
              <p>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', verticalAlign: 'middle' }}>
                  <InfoTooltip
                    content="Converts released energy into megatons of TNT for easier understanding."
                    size="md"
                    position="right"
                  />
                  {energyMegatons.toFixed(2)} megatons TNT
                </label>
              </p>
              <p>{energyMegatons < 1 ? 'Small local impact' : energyMegatons < 100 ? 'Regional devastation' : 'Global catastrophe'}</p>
            </div>

            <div className="ac-box">
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', verticalAlign: 'middle' }}>
                <InfoTooltip
                  content="Latitude and longitude of the impact center."
                  size="md"
                  position="right"
                />
                Impact Location
              </label>
              {impactPoint ? (
                <p>Lat: {impactPoint[1].toFixed(4)}, Lon: {impactPoint[0].toFixed(4)}</p>
              ) : (
                <p>Click on the map to set impact location</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'mitigation' && (
          <div className="ac-section">
            <h3>
              Deflection Strategies
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', verticalAlign: 'middle' }}>
                <InfoTooltip
                  content="Techniques to deflect the asteroid and prevent impact."
                  size="lg"
                  position="right"
                />
              </label>
            </h3>
            <p>Simulate methods to alter trajectory and prevent impact.</p>
            <div className="ac-button-group">
              <button disabled>
                Kinetic Impactor
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', verticalAlign: 'middle' }}>
                  <InfoTooltip
                    content="A spacecraft collides with the asteroid to change its trajectory."
                    size="lg"
                    position="right"
                  />
                </label>
              </button>
              <button disabled>
                Gravity Tractor
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', verticalAlign: 'middle' }}>
                  <InfoTooltip
                    content="A spacecraft uses its gravity to slowly pull the asteroid."
                    size="lg"
                    position="right"
                  />
                </label>
              </button>
              <button disabled>
                Nuclear Deflection
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', verticalAlign: 'middle' }}>
                  <InfoTooltip
                    content="Using nuclear explosions to alter the asteroid's course."
                    size="lg"
                    position="right"
                  />
                </label>
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleSimulate}
        disabled={!impactPoint}
        className={`ac-simulate-btn ${!impactPoint ? 'disabled' : ''}`}
      >
        {impactPoint ? 'Calculate Impact Effects' : 'Select Impact Location'}
      </button>
    </div>
  );
}

export type { AsteroidParams };