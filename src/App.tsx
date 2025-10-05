import { useState, useEffect, useRef } from "react";
import { WorldMap } from "./components/WorldMap";
import { Globe3D } from "./components/Globe3D";
import { ImpactAnimationScreen } from "./components/ImpactAnimationScreen";
import { InfoTooltip } from "./components/InfoTooltip";
import { AsteroidParams } from "./types/AsteroidTypes";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import {
  Globe2,
  Map,
  Satellite,
  Download,
  Focus,
  PanelRightOpen,
  PanelRightClose,
} from "lucide-react";
import { NASAAsteroid } from "./types/nasa";
import {
  fetchRealNASAData,
  getAllAsteroidsFromRealData,
} from "./utils/realNasaApi";
import { AsteroidPanel } from "./components/LeftPanel";
import { cn } from "./components/ui/utils";
import { RightPanel } from "./components/RightPanel";
import { computeDamageRadiusBasicKm } from "./utils/impact";
import {
  simulateCustomImpact,
  simulateAsteroidImpact,
  ImpactApiResult,
} from "./utils/api";
import { calculateBestImpactPoint } from "./utils/asteroidTrajectory";

type ViewMode = "2d" | "3d" | "animation";

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>("3d");
  const [impactPoint, setImpactPoint] = useState<[number, number] | null>(null);
  const [simulationResults, setSimulationResults] = useState<{
    params: AsteroidParams;
    impactPoint: [number, number];
    api?: ImpactApiResult;
  } | null>(null);

  // NASA NEO data
  const [asteroids, setAsteroids] = useState<NASAAsteroid[]>([]);
  const [selectedAsteroid, setSelectedAsteroid] = useState<NASAAsteroid | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string>(
    "fkVbPDt9JuPttB2wUmOCx6y2NqtdfiLrgWRECXCu"
  ); // Para API key opcional
  const [apiInfo, setApiInfo] = useState<{
    message: string;
    remaining?: number;
  } | null>(null);

  // 3D controls
  const [autoRotate, setAutoRotate] = useState(false);
  const [focusedAsteroid, setFocusedAsteroid] = useState<NASAAsteroid | null>(
    null
  );
  const controlsRef = useRef<any>(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Impact animation state - simplified to just the asteroid
  const [showImpactAnimation, setShowImpactAnimation] =
    useState<NASAAsteroid | null>(null);

  // Load mock NASA data on mount
  useEffect(() => {
    loadNASAData();
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F") {
        if (selectedAsteroid && !focusedAsteroid) handleFocusAsteroid();
      }
      if (e.key === "h" || e.key === "H") {
        if (focusedAsteroid) handleReturnToEarth();
      }
      if (e.key === "r" || e.key === "R") handleResetView();
      if (e.key === "Escape") {
        setSelectedAsteroid(null);
        setFocusedAsteroid(null);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [selectedAsteroid, focusedAsteroid]);

  const loadNASAData = async () => {
    setLoading(true);
    setApiInfo(null);
    try {
      console.log("🚀 Carregando dados reais da NASA...");
      const realData = await fetchRealNASAData(apiKey || undefined);
      const realAsteroids = getAllAsteroidsFromRealData(realData);
      setAsteroids(realAsteroids);
      setApiInfo({
        message: `✅ ${realAsteroids.length} asteroides reais carregados para hoje!`,
        remaining: undefined,
      });
      console.log(`✅ ${realAsteroids.length} asteroides reais carregados!`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      console.error("❌ Erro ao carregar dados reais:", error);
      setApiInfo({
        message: `❌ Erro: ${errorMessage}`,
      });

      // Se for rate limit, sugere usar API key
      if (errorMessage.includes("Rate limit") || errorMessage.includes("429")) {
        alert(
          `⚠️ Rate limit da NASA API excedido!\n\nPara mais requisições, obtenha uma API key gratuita em:\nhttps://api.nasa.gov/\n\nCom a DEMO_KEY você tem até 1000 requisições por hora.`
        );
      } else {
        alert(
          `Erro ao carregar dados da NASA: ${errorMessage}\n\nVerifique sua conexão com a internet e tente novamente.`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const hazardousCount = asteroids.filter(
    (a) => a.is_potentially_hazardous_asteroid
  ).length;
  const sentryCount = asteroids.filter((a) => a.is_sentry_object).length;

  const handleMapClick = (coordinates: [number, number]) => {
    setImpactPoint(coordinates);
    setSimulationResults(null);
  };

  const handleSimulate = async (params: AsteroidParams) => {
    if (!impactPoint) return;
    // Optimistic local result first
    setSimulationResults({ params, impactPoint });
    try {
      let api: ImpactApiResult | undefined = undefined;
      // If there is a selected asteroid with an ID, prefer the asteroid endpoint; otherwise use custom
      if (selectedAsteroid && selectedAsteroid.id) {
        api = await simulateAsteroidImpact({
          asteroidId: selectedAsteroid.id,
          lat: impactPoint[1],
          lon: impactPoint[0],
        });
      } else {
        api = await simulateCustomImpact({
          diameter_m: params.diameter,
          velocity_kms: params.velocity,
          density_kg_m3: params.density,
          lat: impactPoint[1],
          lon: impactPoint[0],
        });
      }
      setSimulationResults({ params, impactPoint, api });
    } catch (e: any) {
      console.error("❌ Erro ao simular impacto:", e);
    }
  };

  const handleAsteroidSelect = (asteroid: NASAAsteroid) => {
    setSelectedAsteroid(asteroid);
    setFocusedAsteroid(asteroid);
  };

  const handleFocusAsteroid = () => {
    if (selectedAsteroid) setFocusedAsteroid(selectedAsteroid);
  };

  const handleReturnToEarth = () => setFocusedAsteroid(null);

  const handleSimulateAsteroidImpact = () => {
    if (selectedAsteroid) {
      const closeApproach = selectedAsteroid.close_approach_data[0];
      const diameter =
        selectedAsteroid.estimated_diameter.meters.estimated_diameter_min;
      const velocity = parseFloat(
        closeApproach.relative_velocity.kilometers_per_second
      );

      // ✅ Usa posição realística baseada na trajetória
      const realisticImpactPoint = calculateBestImpactPoint(selectedAsteroid);
      setImpactPoint(realisticImpactPoint);

      // Simulate impact with asteroid parameters
      setSimulationResults({
        params: {
          diameter,
          velocity,
          density: 3000,
        },
        impactPoint: realisticImpactPoint,
      });

      // Switch to 2D view to show impact
      setViewMode("2d");
    }
  };

  // Allow simulation to be triggered for a specific asteroid (from 3D view)
  const handleSimulateAsteroidImpactFor = (asteroid?: NASAAsteroid) => {
    const target = asteroid || selectedAsteroid;
    if (target) {
      // Switch to animation page and store the asteroid
      setShowImpactAnimation(target);
      setViewMode("animation");
    }
  };

  // Handle animation completion
  const handleAnimationComplete = () => {
    if (showImpactAnimation) {
      // After animation completes, switch to 2D view with results
      const closeApproach = showImpactAnimation.close_approach_data[0];
      const diameter =
        showImpactAnimation.estimated_diameter.meters.estimated_diameter_min;
      const velocity = parseFloat(
        closeApproach.relative_velocity.kilometers_per_second
      );

      // ✅ Calcula posição realística baseada na trajetória do asteroide
      const realisticImpactPoint = calculateBestImpactPoint(showImpactAnimation);
      setImpactPoint(realisticImpactPoint);

      setSimulationResults({
        params: {
          diameter,
          velocity,
          density: 3000,
        },
        impactPoint: realisticImpactPoint,
      });

      // Keep the asteroid selected for the 2D view
      setSelectedAsteroid(showImpactAnimation);

      // Clean up animation state
      setShowImpactAnimation(null);

      // Switch to 2D view to show detailed results
      setViewMode("2d");
    }
  };
  const handleResetView = () => {
    setFocusedAsteroid(null);
    if (controlsRef.current) controlsRef.current.reset();
  };

  return (
    <div className="size-full flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe2 className="w-6 h-6 text-primary" />
            <h1>Asteroid Impact Simulator</h1>
            <Badge variant="secondary">Impactor-2025</Badge>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="gap-2">
              <Satellite className="w-3 h-3" />
              {asteroids.length} NEOs tracked
            </Badge>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "2d" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("2d")}
              >
                <Map className="w-4 h-4 mr-2" />
                2D Map
              </Button>
              <Button
                variant={viewMode === "3d" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("3d")}
              >
                <Globe2 className="w-4 h-4 mr-2" />
                3D Globe
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadNASAData}
              disabled={loading}
            >
              <Satellite className="w-4 h-4 mr-2" />
              {loading ? "Loading..." : "NASA Real Data"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Visualization Area */}
        <div className="flex-1 relative">
          {viewMode === "animation" ? (
            // Impact Animation Page
            showImpactAnimation && (
              <ImpactAnimationScreen
                asteroid={showImpactAnimation}
                onComplete={handleAnimationComplete}
              />
            )
          ) : viewMode === "2d" ? (
            <>
              <WorldMap
                onMapClick={handleMapClick}
                impactPoint={impactPoint}
                selectedAsteroid={selectedAsteroid}
                impactResults={simulationResults?.api}
              />
              {!impactPoint && !selectedAsteroid && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg px-6 py-3 shadow-lg">
                  <p className="opacity-80">
                    Click anywhere on the map to set the asteroid impact
                    location
                  </p>
                </div>
              )}
              {!impactPoint && selectedAsteroid && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg px-6 py-3 shadow-lg">
                  <p className="opacity-80">
                    <span className="text-primary font-medium">{selectedAsteroid.name}</span> impact simulation completed!
                    Click anywhere on the map to change the impact location
                  </p>
                </div>
              )}
              {impactPoint && (
                <div className="absolute bottom-6 left-6 bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg px-4 py-2">
                  {selectedAsteroid && (
                    <div className="mb-2 pb-2 border-b border-border/30">
                      <p className="opacity-60">Simulated Asteroid:</p>
                      <p className="font-medium text-primary">{selectedAsteroid.name}</p>
                      <p className="text-xs opacity-80">
                        {selectedAsteroid.estimated_diameter.meters.estimated_diameter_min.toFixed(0)}m diameter •
                        {parseFloat(selectedAsteroid.close_approach_data[0].relative_velocity.kilometers_per_second).toFixed(1)} km/s
                      </p>
                    </div>
                  )}
                  <p className="opacity-60">Impact Coordinates:</p>
                  <p className="font-mono">
                    {impactPoint[1].toFixed(4)}°, {impactPoint[0].toFixed(4)}°
                  </p>
                  {simulationResults ? (
                    <>
                      <p className="opacity-80 mt-1">
                        Impact radius ~{" "}
                        {computeDamageRadiusBasicKm(
                          simulationResults.params
                        ).toFixed(1)}{" "}
                        km
                      </p>
                      <p className="opacity-60 text-xs">
                        Concentric rings show severe/moderate/light/thermal
                        zones
                      </p>
                    </>
                  ) : (
                    <p className="opacity-60 mt-1">
                      Press "Calculate Impact Effects" to compute radius
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <Globe3D
                asteroids={asteroids}
                onAsteroidClick={handleAsteroidSelect}
                selectedAsteroid={selectedAsteroid}
                autoRotate={autoRotate}
                controlsRef={controlsRef}
                focusedAsteroid={focusedAsteroid}
                onSimulateImpact={handleSimulateAsteroidImpactFor}
              />

              <div
                className={cn(
                  "absolute bottom-6 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg px-6 py-3 shadow-lg",
                  focusedAsteroid && "top-6 bottom-0"
                )}
              >
                {focusedAsteroid ? (
                  <div className="flex items-center gap-2">
                    <Focus className="w-4 h-4 text-primary" />
                    <p className="opacity-80">
                      Focused on{" "}
                      <span className="font-medium text-primary">
                        {focusedAsteroid.name}
                      </span>
                    </p>
                  </div>
                ) : (
                  <p className="opacity-80 ">
                    Drag to rotate • Scroll to zoom • Click asteroids to view
                    details
                  </p>
                )}
              </div>

              {/*chamar asteroid panel*/}
              <AsteroidPanel
                asteroids={asteroids}
                hazardousCount={hazardousCount}
                sentryCount={sentryCount}
                autoRotate={autoRotate}
                setAutoRotate={setAutoRotate}
                handleResetView={handleResetView}
                handleFocusAsteroid={handleFocusAsteroid}
                handleReturnToEarth={handleReturnToEarth}
                selectedAsteroid={selectedAsteroid}
                focusedAsteroid={focusedAsteroid}
              />
            </>
          )}
        </div>

        {/* Side Panel - hidden during animation */}
        {viewMode !== "animation" && (
          <RightPanel
            asteroids={asteroids}
            selectedAsteroid={selectedAsteroid}
            onAsteroidSelect={handleAsteroidSelect}
            impactPoint={impactPoint}
            handleSimulate={handleSimulate}
            simulationResults={simulationResults || undefined}
            onClearSelection={() => {
              setSelectedAsteroid(null);
              setFocusedAsteroid(null);
            }}
            viewMode={viewMode}
            onSimulateImpact={(asteroid) => {
              // Se estiver no modo 2D e houver um ponto de impacto, simula o impacto
              if (viewMode === "2d" && impactPoint) {
                const closeApproach = asteroid.close_approach_data[0];
                const diameter = asteroid.estimated_diameter.meters.estimated_diameter_min;
                const velocity = parseFloat(closeApproach.relative_velocity.kilometers_per_second);

                handleSimulate({
                  diameter,
                  velocity,
                  density: 3000
                });
              }
              // Se não houver ponto de impacto, apenas seleciona o asteroide
              // O usuário precisará clicar no mapa para escolher um ponto
            }}
          />
        )}
      </div>
    </div>
  );
}
