import { useState } from "react";
import "../styles/RightPanel.css";

import { AsteroidList } from "./AsteroidList";
import { AsteroidControls } from "./AsteroidControls";
import { ImpactResults } from "./ImpactResults";
import { NASAAsteroid } from "../types/nasa";
import { Button } from "./ui/button";
import { ChevronsLeftRightIcon } from "lucide-react";
import { AsteroidParams } from "../types/AsteroidTypes";
import { ImpactApiResult } from "../utils/Api";

interface RightPanelProps {
  asteroids: NASAAsteroid[];
  selectedAsteroid?: NASAAsteroid | null;
  onAsteroidSelect?: (asteroid: NASAAsteroid) => void;
  impactPoint: any;
  handleSimulate: (params: AsteroidParams) => void;
  simulationResults?: {
    params: AsteroidParams;
    impactPoint: [number, number];
    api?: ImpactApiResult;
  };
  onClearSelection?: () => void;
  viewMode: '2d' | '3d' | 'animation';
  onSimulateImpact?: (asteroid: NASAAsteroid) => void;
}

export function RightPanel({
  asteroids,
  selectedAsteroid,
  onAsteroidSelect,
  impactPoint,
  handleSimulate,
  simulationResults,
  onClearSelection,
  viewMode,
  onSimulateImpact,
}: RightPanelProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"tracking" | "simulation">(
    "tracking"
  );
  const [hovered, setHovered] = useState(false);

  // Função para converter asteroide em AsteroidParams e chamar onSimulate
  const handleAsteroidSimulate = (asteroid: NASAAsteroid) => {
    if (!impactPoint) return;

    const closeApproach = asteroid.close_approach_data[0];
    const asteroidParams: AsteroidParams = {
      diameter: asteroid.estimated_diameter.meters.estimated_diameter_min,
      velocity: parseFloat(closeApproach.relative_velocity.kilometers_per_second),
      density: 3000, // Densidade padrão para asteroides rochosos
    };

    // Chama a função de simulação com os parâmetros do asteroide
    handleSimulate(asteroidParams);

    // Também chama a função específica para asteroides se existir
    onSimulateImpact?.(asteroid);

    // Muda para a aba de simulação
    setActiveTab("simulation");
  };

  return (
    <div className="right-panel-container">
      {/* Botão flutuante fixo no topo direito */}
      <div
        className="floating-top-btn"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Button
          variant="outline"
          onClick={() => setOpen(!open)}
          className="panel-toggle-btn"
        >
          <ChevronsLeftRightIcon className="w-6 h-6 ml-2" />
          <span className={`panel-toggle-text ${hovered ? "show" : ""}`}>
            {open ? "Close Panel" : "Open Panel"}
          </span>
        </Button>
      </div>

      {/* Painel que aparece abaixo do botão */}
      <div className={`slide-panel ${open ? "open" : ""}`}>
        <div className="tab-header">
          <button
            className={`tab-btn ${activeTab === "tracking" ? "active" : ""}`}
            onClick={() => setActiveTab("tracking")}
          >
            Tracking
          </button>
          <button
            className={`tab-btn ${activeTab === "simulation" ? "active" : ""}`}
            onClick={() => setActiveTab("simulation")}
          >
            Simulation
          </button>
        </div>

        <div className="tab-content flex-1 flex flex-col overflow-hidden">
          {activeTab === "tracking" && (
            <div className="tracking-scroll p-4 overflow-y-auto h-full">
              <AsteroidList
                asteroids={asteroids}
                onAsteroidSelect={onAsteroidSelect}
                selectedAsteroid={selectedAsteroid}
                maxHeight={9999}
                viewMode={viewMode}
                onSimulate={handleAsteroidSimulate}
                impactPoint={impactPoint}
              />
            </div>
          )}

          {activeTab === "simulation" && (
            <div className="simulation-scroll p-4 overflow-y-auto h-full">
              <AsteroidControls
                onSimulate={handleSimulate}
                impactPoint={impactPoint}
              />

              {simulationResults?.api && (
                <ImpactResults
                  impactPoint={simulationResults.impactPoint}
                  results={simulationResults.api}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}