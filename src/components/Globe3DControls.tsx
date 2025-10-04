import { Card } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { RotateCw, Pause, Play, Focus, Home } from 'lucide-react';

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
  isFocused
}: Globe3DControlsProps) {
  return (
    <Card className="bg-card/90 backdrop-blur-sm border-border/50 p-4">
      <div className="space-y-3">
        <h3>View Controls</h3>

        <div className="flex items-center justify-between">
          <Label htmlFor="auto-rotate" className="flex items-center gap-2 cursor-pointer">
            {autoRotate ? (
              <Play className="w-4 h-4 text-primary" />
            ) : (
              <Pause className="w-4 h-4" />
            )}
            Auto Rotate
          </Label>
          <Switch
            id="auto-rotate"
            checked={autoRotate}
            onCheckedChange={onAutoRotateChange}
          />
        </div>

        <div className="space-y-2">
          {selectedAsteroid && !isFocused && (
            <Button 
              variant="default" 
              size="sm" 
              className="w-full"
              onClick={onFocusAsteroid}
            >
              <Focus className="w-4 h-4 mr-2" />
              Focus on Asteroid
            </Button>
          )}

          {isFocused && (
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full"
              onClick={onReturnToEarth}
            >
              <Home className="w-4 h-4 mr-2" />
              Return to Earth
            </Button>
          )}

          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={onResetView}
          >
            <RotateCw className="w-4 h-4 mr-2" />
            Reset View
          </Button>
        </div>

        <div className="pt-3 border-t border-border/30">
          <p className="opacity-60">
            <span className="opacity-80">Mouse Controls:</span>
          </p>
          <ul className="opacity-60 mt-1 space-y-0.5">
            <li>• Drag: Rotate</li>
            <li>• Scroll: Zoom</li>
            <li>• Right-click: Pan</li>
            <li>• Click asteroid: Select</li>
          </ul>
          
          <p className="opacity-60 mt-2">
            <span className="opacity-80">Keyboard:</span>
          </p>
          <ul className="opacity-60 mt-1 space-y-0.5">
            <li>• F: Focus asteroid</li>
            <li>• H: Home (Earth)</li>
            <li>• R: Reset view</li>
            <li>• Esc: Deselect</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
