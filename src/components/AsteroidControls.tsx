import { useState } from 'react';
import { AsteroidParams } from '../types/AsteroidTypes';
import { Target, Zap, Globe2, Info } from 'lucide-react';
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
      <div className="ac-content">
        {activeTab === 'asteroid' && (
          <div className="ac-section">
            {[
              { label: 'Diameter (m)', value: diameter, setter: setDiameter, min: 10, max: 1000, step: 10 },
              { label: 'Velocity (km/s)', value: velocity, setter: setVelocity, min: 5, max: 70, step: 1 },
              { label: 'Density (kg/m³)', value: density, setter: setDensity, min: 1000, max: 8000, step: 100 },
            ].map((item, idx) => (
              <div className="ac-slider-group" key={idx}>
                <label>{item.label}: {item.value}</label>
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
              <h3>Impact Energy</h3>
              <p>{energyMegatons.toFixed(2)} megatons TNT</p>
              <p>{energyMegatons < 1 ? 'Small local impact' : energyMegatons < 100 ? 'Regional devastation' : 'Global catastrophe'}</p>
            </div>

            <div className="ac-box">
              <h3>Impact Location</h3>
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
            <h3>Deflection Strategies</h3>
            <p>Simulate methods to alter trajectory and prevent impact.</p>
            <div className="ac-button-group">
              <button disabled>Kinetic Impactor</button>
              <button disabled>Gravity Tractor</button>
              <button disabled>Nuclear Deflection</button>
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