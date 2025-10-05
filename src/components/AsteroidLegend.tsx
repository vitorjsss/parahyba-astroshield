import { useState } from 'react';
import { InfoTooltip } from './InfoTooltip';
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
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', verticalAlign: 'middle' }}>
              <InfoTooltip
                content="Asteroids that pose no immediate threat to Earth."
                size="md"
                position="right"
              />
              Safe Asteroids
            </label>
            <span className="safe">{totalAsteroids - hazardousCount - sentryCount}</span>
          </div>
          <div className="control-row">
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', verticalAlign: 'middle' }}>
              <InfoTooltip
                content="Asteroids under special monitoring due to potential future impact risk."
                size="md"
                position="right"
              />
              Sentry Objects
            </label>
            <span className="sentry">{sentryCount}</span>
          </div>
          <div className="control-row">
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', verticalAlign: 'middle' }}>
              <InfoTooltip
                content="Large asteroids (>140m) that come within 7.5 million km of Earth."
                size="md"
                position="right"
              />
              Potentially Hazardous
            </label>
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
