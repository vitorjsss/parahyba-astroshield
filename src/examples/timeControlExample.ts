// Exemplo de como usar o controle de tempo no App.tsx

import { useState } from 'react';
import { RealOrbit } from './components/RealOrbit';
import { TimeControls } from './components/TimeControls';

// No seu componente App, adicione estes estados:
const [simulationTime, setSimulationTime] = useState(new Date());
const [isTimeAnimating, setIsTimeAnimating] = useState(false);
const [timeSpeed, setTimeSpeed] = useState(1);

// Exemplo de como usar no render:
/*
<div className="absolute top-6 right-6 w-80">
  <TimeControls
    currentTime={simulationTime}
    onTimeChange={setSimulationTime}
    isPlaying={isTimeAnimating}
    onPlayToggle={() => setIsTimeAnimating(!isTimeAnimating)}
    timeSpeed={timeSpeed}
    onSpeedChange={setTimeSpeed}
  />
</div>

// No Globe3D, use o simulationTime:
<Globe3D
  asteroids={asteroids}
  currentTime={simulationTime} // Passa o tempo atual
  // ... outras props
/>

// Dentro do Globe3D, renderize órbitas reais:
{asteroids.map((asteroid) => (
  asteroid.orbital_elements && (
    <RealOrbit
      key={asteroid.id}
      asteroid={asteroid}
      currentTime={currentTime} // Recebido como prop
      showFullOrbit={true}
      orbitColor={
        asteroid.is_potentially_hazardous_asteroid 
          ? "#ef4444" 
          : asteroid.is_sentry_object 
            ? "#f97316" 
            : "#60a5fa"
      }
      opacity={0.6}
    />
  )
))}
*/

// O que acontece quando você muda o tempo:

// 1. MUDANÇA MANUAL (slider/botões)
// ✅ simulationTime muda instantaneamente
// ✅ RealOrbit.currentPosition recalcula automaticamente
// ✅ Asteroide "pula" para nova posição orbital
// ✅ Trajetórias passadas/futuras são recalculadas

// 2. ANIMAÇÃO AUTOMÁTICA (play button)
// ✅ Timer atualiza simulationTime a cada 100ms
// ✅ Asteroide se move suavemente pela órbita
// ✅ Velocidade controlada por timeSpeed (dias por segundo)
// ✅ Pode acelerar/desacelerar em tempo real

// 3. CASOS DE USO PRÁTICOS:

// Ver onde o asteroide estava no passado:
// setSimulationTime(new Date('2024-01-01'));

// Ver onde estará no futuro:
// setSimulationTime(new Date('2026-12-31')); 

// Simular aproximação ao vivo:
// setIsTimeAnimating(true);
// setTimeSpeed(365); // 1 ano por segundo

// Ver movimento durante um close approach:
// const approachDate = new Date(asteroid.close_approach_data[0].close_approach_date);
// setSimulationTime(new Date(approachDate.getTime() - 7 * 24 * 60 * 60 * 1000)); // 7 dias antes
// setIsTimeAnimating(true);
// setTimeSpeed(7); // 1 semana por segundo

export { };