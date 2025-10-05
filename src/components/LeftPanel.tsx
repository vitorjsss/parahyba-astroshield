import { useState } from "react";
import "../styles/AsteroidPanel.css";
import { AsteroidLegend } from "./AsteroidLegend";
import { AsteroidStats } from "./AsteroidStats";
import { Globe3DControls } from "./Globe3DControls";
import { NASAAsteroid } from "../types/nasa";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface AsteroidPanelProps {
  asteroids: NASAAsteroid[];
  hazardousCount: number;
  sentryCount: number;
  autoRotate: boolean;
  setAutoRotate: (value: boolean) => void;
  handleResetView: () => void;
  handleFocusAsteroid: () => void;
  handleReturnToEarth: () => void;
  selectedAsteroid: any;
  focusedAsteroid: any;
}

export function AsteroidPanel({
  asteroids,
  hazardousCount,
  sentryCount,
  autoRotate,
  setAutoRotate,
  handleResetView,
  handleFocusAsteroid,
  handleReturnToEarth,
  selectedAsteroid,
  focusedAsteroid,
}: AsteroidPanelProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    // Wrapper fixed to the left that will slide in/out; the toggle button is inside
    <div className={`left-panel-wrapper ${expanded ? "expanded" : ""}`}>
      {/* Painel lateral */}
      <div className={`asteroid-panel`}>
        <AsteroidLegend
          totalAsteroids={asteroids.length}
          hazardousCount={hazardousCount}
          sentryCount={sentryCount}
        />

        {asteroids.length > 0 && <AsteroidStats asteroids={asteroids} />}

        <Globe3DControls
          autoRotate={autoRotate}
          onAutoRotateChange={setAutoRotate}
          onResetView={handleResetView}
          onFocusAsteroid={handleFocusAsteroid}
          onReturnToEarth={handleReturnToEarth}
          selectedAsteroid={selectedAsteroid}
          isFocused={focusedAsteroid !== null}
        />
      </div>

      {/* Botão acoplado à lateral do painel (fica dentro do wrapper para acompanhar o movimento) */}
      <button
        className="left-toggle-btn"
        onClick={() => setExpanded(!expanded)}
        title={expanded ? "Fechar painel" : "Abrir painel"}
        aria-expanded={expanded}
      >
        {expanded ? (
          <ChevronLeft className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
