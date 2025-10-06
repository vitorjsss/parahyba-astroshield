import { useState } from 'react';
import { InfoTooltip } from './InfoTooltip';
import '../styles/AsteroidPanel.css';

interface Globe3DControlsProps {
  autoRotate: boolean;
  onAutoRotateChange: (value: boolean) => void;
  onResetView: () => void;
  onFocusAsteroid?: () => void;
  onReturnToEarth?: () => void;
  selectedAsteroid?: any;
  isFocused?: boolean;
}

export function Globe3DControls({
  autoRotate,
  onAutoRotateChange,
  onResetView,
  onFocusAsteroid,
  onReturnToEarth,
  selectedAsteroid,
  isFocused,
}: Globe3DControlsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="asteroid-card asteroid-card-globe">
      <button className="card-toggle" onClick={() => setIsOpen(!isOpen)}>
        <span>View Controls</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="card-content">
          <div className="control-row">
            <label htmlFor="auto-rotate" className="control-label">
              {autoRotate ? '▶ Auto Rotate' : '⏸ Auto Rotate'}
            </label>
            <input
              type="checkbox"
              id="auto-rotate"
              checked={autoRotate}
              onChange={(e) => onAutoRotateChange(e.target.checked)}
            />
          </div>

          <div className="control-buttons">
            {selectedAsteroid && !isFocused && (
              <button className="btn" onClick={onFocusAsteroid}>
                Focus on Asteroid
              </button>
            )}
            {isFocused && (
              <button className="btn" onClick={onReturnToEarth}>
                Return to Earth
              </button>
            )}
            <button className="btn" onClick={onResetView}>
              Reset View
            </button>
          </div>

          <div className="control-info">
            <p><strong>Mouse Controls:</strong></p>
            <ul>
              <li>Drag: Rotate</li>
              <li>Scroll: Zoom</li>
              <li>Right-click: Pan</li>
              <li>Click asteroid: Select</li>
            </ul>

            <p><strong>Keyboard Shortcuts:</strong></p>
            <ul>
              <li>F: Focus asteroid</li>
              <li>H: Home (Earth)</li>
              <li>R: Reset view</li>
              <li>Esc: Deselect</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
