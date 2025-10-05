// AsteroidList.tsx
import React from 'react';
import { NASAAsteroid } from '../types/nasa';
import { InfoTooltip } from './InfoTooltip';
import '../styles/AsteroidList.css';

interface AsteroidListProps {
  asteroids: NASAAsteroid[];
  onAsteroidSelect?: (asteroid: NASAAsteroid) => void;
  selectedAsteroid?: NASAAsteroid | null;
  maxHeight?: number; // altura máxima da lista
  viewMode?: '2d' | '3d' | 'animation'; // modo de visualização
  onSimulate?: (asteroid: NASAAsteroid) => void; // mudança: agora recebe asteroide
  impactPoint?: [number, number] | null; // ponto de impacto
}

export function AsteroidList({
  asteroids,
  onAsteroidSelect,
  selectedAsteroid,
  maxHeight = 400,
  viewMode,
  onSimulate,
  impactPoint,
}: AsteroidListProps) {
  const sortedAsteroids = [...asteroids].sort((a, b) => {
    const distA = parseFloat(a.close_approach_data[0].miss_distance.kilometers);
    const distB = parseFloat(b.close_approach_data[0].miss_distance.kilometers);
    return distA - distB;
  });

  return (
    <div className="asteroid-list-container">
      <div className="asteroid-list-header">
        <h3>
          Near-Earth Objects
          <InfoTooltip
            content="Asteroids or comets that pass close to Earth."
            size="lg"
            position="bottom"
          />
        </h3>
        <span>{asteroids.length} asteroids</span>
        <p>Tracking close approaches</p>
      </div>

      <div className="asteroid-list" style={{ maxHeight }}>
        {sortedAsteroids.map((asteroid) => {
          const closeApproach = asteroid.close_approach_data[0];
          const diameter = asteroid.estimated_diameter.meters.estimated_diameter_min;
          const missDistanceKm = parseFloat(closeApproach.miss_distance.kilometers);
          const velocity = parseFloat(closeApproach.relative_velocity.kilometers_per_second);
          const isSelected = selectedAsteroid?.id === asteroid.id;

          return (
            <div
              key={asteroid.id}
              className={`asteroid-item ${isSelected ? 'selected' : ''}`}
              onClick={() => onAsteroidSelect?.(asteroid)}
            >
              <div className="asteroid-main">
                <p className="asteroid-name">{asteroid.name}</p>
              </div>
              <div className="asteroid-info">
                <p>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', verticalAlign: 'middle' }}>
                    <InfoTooltip
                      content="Asteroid's diameter in meters — larger means more impact energy."
                      size="md"
                      position="right"
                    />
                    Diameter: {diameter.toFixed(0)} m
                  </label>
                </p>
                <p>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', verticalAlign: 'middle' }}>
                    <InfoTooltip
                      content="Asteroid's speed as it approaches Earth (km/s)."
                      size="md"
                      position="right"
                    />
                    Velocity: {velocity.toFixed(2)} km/s
                  </label>
                </p>
                <p>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', verticalAlign: 'middle' }}>
                    <InfoTooltip
                      content="Date of the asteroid's closest approach to Earth."
                      size="md"
                      position="right"
                    />
                    Approach: {closeApproach.close_approach_date}
                  </label>
                </p>
                <p>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', verticalAlign: 'middle' }}>
                    <InfoTooltip
                      content="Predicted minimum distance between the asteroid and Earth."
                      size="md"
                      position="right"
                    />
                    Miss Distance: {(missDistanceKm / 1000).toFixed(0)}k km /{' '}
                    {parseFloat(closeApproach.miss_distance.lunar).toFixed(2)} LD
                  </label>
                </p>
                {asteroid.is_potentially_hazardous_asteroid && (
                  <p className="hazardous">
                    ⚠ Potentially Hazardous
                    <InfoTooltip
                      content="Large asteroids passing within 7.5 million km of Earth."
                      size="lg"
                      position="right"
                    />
                  </p>
                )}
                {asteroid.is_sentry_object && (
                  <p className="sentry">
                    🎯 Sentry Objects
                    <InfoTooltip
                      content="Objects closely watched due to possible future risk."
                      size="lg"
                      position="right"
                    />
                  </p>
                )}

                {/* Botão de simular impacto - só aparece se está selecionado e no modo 2D */}
                {isSelected && viewMode === '2d' && (
                  <div className="simulate-button-container">
                    <button
                      className="simulate-impact-btn"
                      onClick={(e) => {
                        e.stopPropagation(); // Evita que dispare onAsteroidSelect
                        onSimulate?.(asteroid);
                      }}
                      disabled={!impactPoint}
                    >
                      {impactPoint ? 'Simulate Impact' : 'Choose a point in the map'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {asteroids.length === 0 && (
          <div className="no-asteroids">
            <p>No asteroids data available</p>
            <p>Load NASA NEO data to see asteroids</p>
          </div>
        )}
      </div>
    </div>
  );
}