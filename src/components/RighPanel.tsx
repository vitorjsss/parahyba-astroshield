import { useState } from "react";
import "../styles/RightPanel.css";

import { AsteroidList } from "./AsteroidList";
import { AsteroidControls } from "./AsteroidControls";
import { ImpactResults } from "./ImpactResults";
import { NASAAsteroid } from "../types/nasa";
import { Button } from "./ui/button";
import { ChevronsUpDown } from "lucide-react";
import { AsteroidParams } from '../types/AsteroidTypes';
import { ImpactApiResult } from '../utils/Api';

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
  const [activeTab, setActiveTab] = useState<"tracking" | "simulation">("tracking");
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className={`right-panel ${collapsed ? "collapsed" : ""}`}>
      {/* Botão de colapsar */}
      <div className="collapse-header">
        <Button
          variant="outline"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2"
        >
          {collapsed ? "Expand Panel" : "Collapse Panel"}
          <ChevronsUpDown className="w-4 h-4" />
        </Button>
      </div>

      {!collapsed && (
        <>
          {/* Tabs */}
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

          {/* Conteúdo das tabs */}
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
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
