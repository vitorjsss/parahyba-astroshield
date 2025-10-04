import '../styles/AsteroidPanel.css';
import { AsteroidLegend } from './AsteroidLegend';
import { AsteroidStats } from './AsteroidStats';
import { Globe3DControls } from './Globe3DControls';
import { NASAAsteroid } from '../types/nasa';

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
    return (
        <div className="asteroid-panel">
            <AsteroidLegend
                totalAsteroids={asteroids.length}
                hazardousCount={hazardousCount}
                sentryCount={sentryCount}
            />

            {asteroids.length > 0 && (
                <AsteroidStats asteroids={asteroids} />
            )}

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
    );
}
