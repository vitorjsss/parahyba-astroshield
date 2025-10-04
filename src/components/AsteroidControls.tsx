import { useState } from 'react';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Target, Zap, Globe2, Info } from 'lucide-react';

interface AsteroidControlsProps {
  onSimulate: (params: AsteroidParams) => void;
  impactPoint: [number, number] | null;
}

export interface AsteroidParams {
  diameter: number; // meters
  velocity: number; // km/s
  angle: number; // degrees
  density: number; // kg/m³
}

export function AsteroidControls({ onSimulate, impactPoint }: AsteroidControlsProps) {
  const [diameter, setDiameter] = useState([100]);
  const [velocity, setVelocity] = useState([20]);
  const [angle, setAngle] = useState([45]);
  const [density, setDensity] = useState([3000]);

  const handleSimulate = () => {
    onSimulate({
      diameter: diameter[0],
      velocity: velocity[0],
      angle: angle[0],
      density: density[0],
    });
  };

  // Calculate impact energy (simplified)
  const mass = (4/3) * Math.PI * Math.pow(diameter[0]/2, 3) * density[0];
  const energyJoules = 0.5 * mass * Math.pow(velocity[0] * 1000, 2);
  const energyMegatons = energyJoules / (4.184 * Math.pow(10, 15));

  return (
    <Card className="p-6 bg-card/95 backdrop-blur-sm border-border/50">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h2>Asteroid Impact Simulator</h2>
        </div>

        <Tabs defaultValue="asteroid" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="asteroid">Asteroid</TabsTrigger>
            <TabsTrigger value="impact">Impact</TabsTrigger>
            <TabsTrigger value="mitigation">Mitigation</TabsTrigger>
          </TabsList>

          <TabsContent value="asteroid" className="space-y-6 mt-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="flex items-center gap-2">
                  Diameter (m)
                  <Badge variant="secondary">{diameter[0]}m</Badge>
                </Label>
              </div>
              <Slider
                value={diameter}
                onValueChange={setDiameter}
                min={10}
                max={1000}
                step={10}
                className="w-full"
              />
              <p className="opacity-60">Size of the asteroid</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="flex items-center gap-2">
                  Velocity (km/s)
                  <Badge variant="secondary">{velocity[0]} km/s</Badge>
                </Label>
              </div>
              <Slider
                value={velocity}
                onValueChange={setVelocity}
                min={5}
                max={70}
                step={1}
                className="w-full"
              />
              <p className="opacity-60">Impact speed relative to Earth</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="flex items-center gap-2">
                  Impact Angle (°)
                  <Badge variant="secondary">{angle[0]}°</Badge>
                </Label>
              </div>
              <Slider
                value={angle}
                onValueChange={setAngle}
                min={15}
                max={90}
                step={5}
                className="w-full"
              />
              <p className="opacity-60">Angle from horizontal surface</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="flex items-center gap-2">
                  Density (kg/m³)
                  <Badge variant="secondary">{density[0]}</Badge>
                </Label>
              </div>
              <Slider
                value={density}
                onValueChange={setDensity}
                min={1000}
                max={8000}
                step={100}
                className="w-full"
              />
              <p className="opacity-60">Material density (3000 = rocky)</p>
            </div>
          </TabsContent>

          <TabsContent value="impact" className="space-y-4 mt-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-chart-1" />
                <h3>Impact Energy</h3>
              </div>
              <div className="space-y-2">
                <p className="opacity-80">
                  <span className="opacity-60">Estimated:</span> <span className="text-chart-1">{energyMegatons.toFixed(2)} megatons TNT</span>
                </p>
                <p className="opacity-60">
                  {energyMegatons < 1 
                    ? 'Small local impact' 
                    : energyMegatons < 100 
                    ? 'Regional devastation' 
                    : 'Global catastrophe'}
                </p>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-chart-2" />
                <h3>Impact Location</h3>
              </div>
              {impactPoint ? (
                <div className="space-y-1">
                  <p className="opacity-80">
                    <span className="opacity-60">Latitude:</span> {impactPoint[1].toFixed(4)}°
                  </p>
                  <p className="opacity-80">
                    <span className="opacity-60">Longitude:</span> {impactPoint[0].toFixed(4)}°
                  </p>
                </div>
              ) : (
                <p className="opacity-60">Click on the map to set impact location</p>
              )}
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="opacity-80">
                  Crater diameter and seismic effects will be calculated based on impact parameters and geological data.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="mitigation" className="space-y-4 mt-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <h3>Deflection Strategies</h3>
              <p className="opacity-60">
                Simulate various methods to alter the asteroid's trajectory and prevent impact.
              </p>
            </div>

            <Button variant="outline" className="w-full" disabled>
              Kinetic Impactor
              <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
            </Button>

            <Button variant="outline" className="w-full" disabled>
              Gravity Tractor
              <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
            </Button>

            <Button variant="outline" className="w-full" disabled>
              Nuclear Deflection
              <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
            </Button>
          </TabsContent>
        </Tabs>

        <Button 
          onClick={handleSimulate}
          className="w-full"
          disabled={!impactPoint}
        >
          <Target className="w-4 h-4 mr-2" />
          {impactPoint ? 'Calculate Impact Effects' : 'Select Impact Location on Map'}
        </Button>
      </div>
    </Card>
  );
}
