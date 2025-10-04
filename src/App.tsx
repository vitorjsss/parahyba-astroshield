import { useState, useEffect, useRef } from 'react';
import { WorldMap } from './components/WorldMap';
import { Globe3D } from './components/Globe3D';
import { ImpactAnimationScreen } from './components/ImpactAnimationScreen';
import { AsteroidControls, AsteroidParams } from './components/AsteroidControls';
import { ImpactResults } from './components/ImpactResults';
import { AsteroidList } from './components/AsteroidList';
import { AsteroidDetails } from './components/AsteroidDetails';
import { AsteroidLegend } from './components/AsteroidLegend';
import { AsteroidStats } from './components/AsteroidStats';
import { Globe3DControls } from './components/Globe3DControls';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Globe2, Map, Satellite, Download, Focus } from 'lucide-react';
import { NASAAsteroid } from './types/nasa';
import { generateMockNASAData, flattenNASAData } from './utils/mockNasaData';

type ViewMode = '2d' | '3d' | 'animation';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('3d');
  const [impactPoint, setImpactPoint] = useState<[number, number] | null>(null);
  const [simulationResults, setSimulationResults] = useState<{
    params: AsteroidParams;
    impactPoint: [number, number];
  } | null>(null);

  // NASA NEO data
  const [asteroids, setAsteroids] = useState<NASAAsteroid[]>([]);
  const [selectedAsteroid, setSelectedAsteroid] = useState<NASAAsteroid | null>(null);
  const [loading, setLoading] = useState(false);

  // 3D controls
  const [autoRotate, setAutoRotate] = useState(false);
  const [focusedAsteroid, setFocusedAsteroid] = useState<NASAAsteroid | null>(null);
  const controlsRef = useRef<any>(null);

  // Impact animation state - simplified to just the asteroid
  const [showImpactAnimation, setShowImpactAnimation] = useState<NASAAsteroid | null>(null);

  // Load mock NASA data on mount
  useEffect(() => {
    loadNASAData();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // F key to focus on selected asteroid
      if (e.key === 'f' || e.key === 'F') {
        if (selectedAsteroid && !focusedAsteroid) {
          handleFocusAsteroid();
        }
      }
      // H key to return to Earth (Home)
      if (e.key === 'h' || e.key === 'H') {
        if (focusedAsteroid) {
          handleReturnToEarth();
        }
      }
      // R key to reset view
      if (e.key === 'r' || e.key === 'R') {
        handleResetView();
      }
      // Escape to deselect
      if (e.key === 'Escape') {
        setSelectedAsteroid(null);
        setFocusedAsteroid(null);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedAsteroid, focusedAsteroid]);

  const loadNASAData = () => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      const mockData = generateMockNASAData();
      const flattenedAsteroids = flattenNASAData(mockData);
      setAsteroids(flattenedAsteroids);
      setLoading(false);
    }, 500);
  };

  // Calculate statistics
  const hazardousCount = asteroids.filter(a => a.is_potentially_hazardous_asteroid).length;
  const sentryCount = asteroids.filter(a => a.is_sentry_object).length;

  const handleMapClick = (coordinates: [number, number]) => {
    setImpactPoint(coordinates);
    setSimulationResults(null);
  };

  const handleSimulate = (params: AsteroidParams) => {
    if (impactPoint) {
      setSimulationResults({
        params,
        impactPoint,
      });
    }
  };

  const handleAsteroidSelect = (asteroid: NASAAsteroid) => {
    setSelectedAsteroid(asteroid);
    // Auto-focus on selected asteroid
    setFocusedAsteroid(asteroid);
  };

  const handleFocusAsteroid = () => {
    if (selectedAsteroid) {
      setFocusedAsteroid(selectedAsteroid);
    }
  };

  const handleReturnToEarth = () => {
    setFocusedAsteroid(null);
  };

  const handleSimulateAsteroidImpact = () => {
    if (selectedAsteroid) {
      const closeApproach = selectedAsteroid.close_approach_data[0];
      const diameter = selectedAsteroid.estimated_diameter.meters.estimated_diameter_min;
      const velocity = parseFloat(closeApproach.relative_velocity.kilometers_per_second);

      // Set random impact point
      const randomLat = (Math.random() - 0.5) * 160;
      const randomLng = (Math.random() - 0.5) * 360;
      setImpactPoint([randomLng, randomLat]);

      // Simulate impact with asteroid parameters
      setSimulationResults({
        params: {
          diameter,
          velocity,
          angle: 45,
          density: 3000,
        },
        impactPoint: [randomLng, randomLat],
      });

      // Switch to 2D view to show impact
      setViewMode('2d');
    }
  };

  // Allow simulation to be triggered for a specific asteroid (from 3D view)
  const handleSimulateAsteroidImpactFor = (asteroid?: NASAAsteroid) => {
    const target = asteroid || selectedAsteroid;
    if (target) {
      // Switch to animation page and store the asteroid
      setShowImpactAnimation(target);
      setViewMode('animation');
    }
  };

  // Handle animation completion
  const handleAnimationComplete = () => {
    if (showImpactAnimation) {
      // After animation completes, switch to 2D view with results
      const closeApproach = showImpactAnimation.close_approach_data[0];
      const diameter = showImpactAnimation.estimated_diameter.meters.estimated_diameter_min;
      const velocity = parseFloat(closeApproach.relative_velocity.kilometers_per_second);

      const randomLat = (Math.random() - 0.5) * 160;
      const randomLng = (Math.random() - 0.5) * 360;
      setImpactPoint([randomLng, randomLat]);

      setSimulationResults({
        params: {
          diameter,
          velocity,
          angle: 45,
          density: 3000,
        },
        impactPoint: [randomLng, randomLat],
      });

      // Clean up animation state
      setShowImpactAnimation(null);

      // Switch to 2D view to show detailed results
      setViewMode('2d');
    }
  }; const handleResetView = () => {
    setFocusedAsteroid(null);
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
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
            {viewMode === 'animation' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('3d')}
              >
                ← Voltar ao Globo 3D
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant={viewMode === '2d' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('2d')}
                >
                  <Map className="w-4 h-4 mr-2" />
                  2D Map
                </Button>
                <Button
                  variant={viewMode === '3d' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('3d')}
                >
                  <Globe2 className="w-4 h-4 mr-2" />
                  3D Globe
                </Button>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={loadNASAData} disabled={loading}>
              <Download className="w-4 h-4 mr-2" />
              {loading ? 'Loading...' : 'Load NEO Data'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Visualization Area */}
        <div className="flex-1 relative">
          {viewMode === 'animation' ? (
            // Impact Animation Page
            showImpactAnimation && (
              <ImpactAnimationScreen
                asteroid={showImpactAnimation}
                onComplete={handleAnimationComplete}
              />
            )
          ) : viewMode === '2d' ? (
            <>
              <WorldMap
                onMapClick={handleMapClick}
                impactPoint={impactPoint}
              />

              {!impactPoint && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg px-6 py-3 shadow-lg">
                  <p className="opacity-80">
                    Click anywhere on the map to set the asteroid impact location
                  </p>
                </div>
              )}

              {impactPoint && (
                <div className="absolute bottom-6 left-6 bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg px-4 py-2">
                  <p className="opacity-60">Impact Coordinates:</p>
                  <p className="font-mono">
                    {impactPoint[1].toFixed(4)}°, {impactPoint[0].toFixed(4)}°
                  </p>
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

              <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg px-6 py-3 shadow-lg">
                {focusedAsteroid ? (
                  <div className="flex items-center gap-2">
                    <Focus className="w-4 h-4 text-primary" />
                    <p className="opacity-80">
                      Focused on <span className="font-medium text-primary">{focusedAsteroid.name}</span>
                    </p>
                  </div>
                ) : (
                  <p className="opacity-80">
                    Drag to rotate • Scroll to zoom • Click asteroids to view details
                  </p>
                )}
              </div>

              {/* Legend and Stats */}
              <div className="absolute top-6 left-6 space-y-3 max-w-xs">
                <AsteroidLegend
                  totalAsteroids={asteroids.length}
                  hazardousCount={hazardousCount}
                  sentryCount={sentryCount}
                />
                {asteroids.length > 0 && (
                  <AsteroidStats asteroids={asteroids} />
                )}
              </div>

              {/* 3D Controls */}
              <div className="absolute bottom-6 left-6 max-w-xs">
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
            </>
          )}
        </div>

        {/* Side Panel - hidden during animation */}
        {viewMode !== 'animation' && (
          <div className="w-96 border-l border-border/50 bg-muted/20 overflow-hidden flex flex-col">
            <Tabs defaultValue="tracking" className="flex-1 flex flex-col">
              <div className="border-b border-border/50 px-4 pt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="tracking">
                    <Satellite className="w-4 h-4 mr-2" />
                    Tracking
                  </TabsTrigger>
                  <TabsTrigger value="simulation">
                    <Globe2 className="w-4 h-4 mr-2" />
                    Simulation
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="tracking" className="flex-1 overflow-hidden mt-0">
                <div className="h-full flex flex-col">
                  {selectedAsteroid ? (
                    <div className="flex-1 overflow-y-auto p-4">
                      <AsteroidDetails
                        asteroid={selectedAsteroid}
                        onSimulateImpact={handleSimulateAsteroidImpact}
                        onFocusInView={handleFocusAsteroid}
                      />
                      <Button
                        variant="outline"
                        className="w-full mt-4"
                        onClick={() => {
                          setSelectedAsteroid(null);
                          setFocusedAsteroid(null);
                        }}
                      >
                        Back to List
                      </Button>
                    </div>
                  ) : (
                    <AsteroidList
                      asteroids={asteroids}
                      onAsteroidSelect={handleAsteroidSelect}
                      selectedAsteroid={selectedAsteroid}
                    />
                  )}
                </div>
              </TabsContent>

              <TabsContent value="simulation" className="flex-1 overflow-y-auto mt-0">
                <div className="p-4 space-y-4">
                  <AsteroidControls
                    onSimulate={handleSimulate}
                    impactPoint={impactPoint}
                  />

                  {simulationResults && (
                    <ImpactResults
                      params={simulationResults.params}
                      impactPoint={simulationResults.impactPoint}
                    />
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
