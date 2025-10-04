import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { RotateCw, Pause, Play, Focus, Home, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="bg-card/90 backdrop-blur-sm border-border/50 p-3">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between p-0 h-auto hover:bg-transparent"
          >
            <h3>View Controls</h3>
            {isOpen ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-rotate" className="flex items-center gap-2 cursor-pointer text-sm">
              {autoRotate ? (
                <Play className="w-3 h-3 text-primary" />
              ) : (
                <Pause className="w-3 h-3" />
              )}
              Auto Rotate
            </Label>
            <Switch
              id="auto-rotate"
              checked={autoRotate}
              onCheckedChange={onAutoRotateChange}
            />
          </div>

          <div className="space-y-1.5">
            {selectedAsteroid && !isFocused && (
              <Button 
                variant="default" 
                size="sm" 
                className="w-full h-8 text-xs"
                onClick={onFocusAsteroid}
              >
                <Focus className="w-3 h-3 mr-1" />
                Focus on Asteroid
              </Button>
            )}

            {isFocused && (
              <Button 
                variant="secondary" 
                size="sm" 
                className="w-full h-8 text-xs"
                onClick={onReturnToEarth}
              >
                <Home className="w-3 h-3 mr-1" />
                Return to Earth
              </Button>
            )}

            <Button 
              variant="outline" 
              size="sm" 
              className="w-full h-8 text-xs"
              onClick={onResetView}
            >
              <RotateCw className="w-3 h-3 mr-1" />
              Reset View
            </Button>
          </div>

          <div className="pt-2 border-t border-border/30">
            <p className="text-xs opacity-60 mb-1">
              <span className="opacity-80">Mouse:</span>
            </p>
            <ul className="text-xs opacity-60 space-y-0.5">
              <li>• Drag: Rotate</li>
              <li>• Scroll: Zoom</li>
              <li>• Right-click: Pan</li>
              <li>• Click asteroid: Select</li>
            </ul>
            
            <p className="text-xs opacity-60 mt-1.5 mb-1">
              <span className="opacity-80">Keyboard:</span>
            </p>
            <ul className="text-xs opacity-60 space-y-0.5">
              <li>• F: Focus asteroid</li>
              <li>• H: Home (Earth)</li>
              <li>• R: Reset view</li>
              <li>• Esc: Deselect</li>
            </ul>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
