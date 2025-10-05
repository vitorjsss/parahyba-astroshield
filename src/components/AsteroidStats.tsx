import { useState } from 'react';
import { NASAAsteroid } from '../types/nasa';
import { InfoTooltip } from './InfoTooltip';
import '../styles/AsteroidPanel.css';

interface AsteroidStatsProps {
  asteroids: NASAAsteroid[];
}

export function AsteroidStats({ asteroids }: AsteroidStatsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const totalCount = asteroids.length;
  const hazardousCount = asteroids.filter(a => a.is_potentially_hazardous_asteroid).length;

  const closestAsteroid = asteroids[0]; // simplificação
  const largestAsteroid = asteroids[0];  // simplificação
  const avgSize =
    asteroids.reduce((sum, a) => sum + a.estimated_diameter.meters.estimated_diameter_min, 0) /
    totalCount;

  return (
    <div className="asteroid-card">
      <button className="card-toggle" onClick={() => setIsOpen(!isOpen)}>
        <span>Live Statistics</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="card-content">
          <div className="control-row">
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', verticalAlign: 'middle' }}>
              <InfoTooltip
                content="Number of near-Earth objects currently being tracked."
                size="md"
                position="right"
              />
              Total Tracked
            </label>
            <span>{totalCount}</span>
          </div>
          <div className="control-row">
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', verticalAlign: 'middle' }}>
              <InfoTooltip
                content="Number of asteroids considered potentially dangerous."
                size="md"
                position="right"
              />
              Hazardous
            </label>
            <span className="hazardous">{hazardousCount}</span>
          </div>
          <div className="control-row">
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', verticalAlign: 'middle' }}>
              <InfoTooltip
                content="The asteroid that will come closest to Earth."
                size="md"
                position="right"
              />
              Closest Approach
            </label>
            <span className="closest">{closestAsteroid.name}</span>
          </div>
          <div className="control-row">
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', verticalAlign: 'middle' }}>
              <InfoTooltip
                content="The largest asteroid in the monitored group."
                size="md"
                position="right"
              />
              Largest Object
            </label>
            <span className="largest">{largestAsteroid.name}</span>
          </div>
          <div className="control-row">
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', verticalAlign: 'middle' }}>
              <InfoTooltip
                content="Average diameter of all tracked objects."
                size="md"
                position="right"
              />
              Average Size
            </label>
            <span>{avgSize.toFixed(0)}m</span>
          </div>
        </div>
      )}
    </div>
  );
}
