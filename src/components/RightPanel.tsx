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
}

export function RightPanel({
  asteroids,
  selectedAsteroid,
  onAsteroidSelect,
  impactPoint,
  handleSimulate,
  simulationResults,
  onClearSelection,
}: RightPanelProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"tracking" | "simulation">(
    "tracking"
  );
  const [hovered, setHovered] = useState(false);

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

        <div className="tab-content flex-1 flex flex-col">
          {activeTab === "tracking" && (
            <div className="tracking-tab flex-1 flex flex-col">
              <div className="tracking-scroll flex-1 overflow-y-auto">
                {selectedAsteroid ? (
                  <>
                    <AsteroidList
                      asteroids={asteroids}
                      onAsteroidSelect={onAsteroidSelect}
                      selectedAsteroid={selectedAsteroid}
                    />
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={onClearSelection}
                    >
                      Back to List
                    </Button>
                  </>
                ) : (
                  <AsteroidList
                    asteroids={asteroids}
                    onAsteroidSelect={onAsteroidSelect}
                    selectedAsteroid={selectedAsteroid}
                  />
                )}
              </div>
            </div>
          )}

          {activeTab === "simulation" && (
            <div>
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
