import { useState } from 'react';
import { NASAAsteroid } from '../types/nasa';
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
            <span>Total Tracked</span>
            <span>{totalCount}</span>
          </div>
          <div className="control-row">
            <span>Hazardous</span>
            <span className="hazardous">{hazardousCount}</span>
          </div>
          <div className="control-row">
            <span>Closest Approach</span>
            <span className="closest">{closestAsteroid.name}</span>
          </div>
          <div className="control-row">
            <span>Largest Object</span>
            <span className="largest">{largestAsteroid.name}</span>
          </div>
          <div className="control-row">
            <span>Average Size</span>
            <span>{avgSize.toFixed(0)}m</span>
          </div>
        </div>
      )}
    </div>
  );
}
