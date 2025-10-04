import { useState } from 'react';
import '../styles/AsteroidPanel.css';

interface AsteroidLegendProps {
  totalAsteroids: number;
  hazardousCount: number;
  sentryCount: number;
}

export function AsteroidLegend({ totalAsteroids, hazardousCount, sentryCount }: AsteroidLegendProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="asteroid-card">
      <button className="card-toggle" onClick={() => setIsOpen(!isOpen)}>
        <span>Asteroid Classification</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="card-content">
          <div className="control-row">
            <span>Safe Asteroids</span>
            <span className="safe">{totalAsteroids - hazardousCount - sentryCount}</span>
          </div>
          <div className="control-row">
            <span>Sentry Objects</span>
            <span className="sentry">{sentryCount}</span>
          </div>
          <div className="control-row">
            <span>Potentially Hazardous</span>
            <span className="hazardous">{hazardousCount}</span>
          </div>
          <div>
            <p className="note-text">
              Click any asteroid to view detailed information
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
