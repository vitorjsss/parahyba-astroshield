import React from 'react';
import { DANGEROUS_ASTEROID } from '../DangerousAsteroid';

interface Step3Props {
    setCurrStep?: (step: number) => void;
}

export const Step3: React.FC<Step3Props> = ({ setCurrStep }) => {
    const handleContinue = () => {
        if (setCurrStep) {
            setCurrStep(4);
        }
    };

    // Usando dados reais do DANGEROUS_ASTEROID
    const asteroid = DANGEROUS_ASTEROID;
    const approach = asteroid.close_approach_data[0];

    // Calculando dados derivados
    const diameterKm = asteroid.estimated_diameter.kilometers.estimated_diameter_max;
    const diameterMeters = asteroid.estimated_diameter.meters.estimated_diameter_max;
    const velocityKmH = approach.relative_velocity.kilometers_per_hour;
    const velocityKmS = approach.relative_velocity.kilometers_per_second;
    const massKg = (4 / 3) * Math.PI * Math.pow(diameterMeters / 2, 3) * 3000; // densidade 3g/cm³
    const massTons = massKg / 1000;
    const kineticEnergyJoules = 0.5 * massKg * Math.pow(parseFloat(velocityKmS) * 1000, 2);
    const energyMegatons = kineticEnergyJoules / (4.184 * Math.pow(10, 15));
    const hiroshimaComparison = Math.round(energyMegatons / 0.015); // Hiroshima ~15 kilotons

    const asteroidData = {
        name: asteroid.name,
        mass: `${(massTons / 1e9).toFixed(1)} billion tons`,
        diameter: `${diameterKm.toFixed(1)} km`,
        diameterMeters: `${diameterMeters.toLocaleString()} meters`,
        velocity: velocityKmH,
        velocityKmPerSec: `${velocityKmS} km/s`,
        impactZone: "Pacific Ocean (Near California)",
        missDistance: `${parseInt(approach.miss_distance.kilometers).toLocaleString()} km`,
        closeApproachDate: approach.close_approach_date,
        energyMT: `${energyMegatons.toExponential(2)} MT TNT`,
        comparisonHiroshima: `${hiroshimaComparison.toLocaleString()}x bomba de Hiroshima`,
        absoluteMagnitude: asteroid.absolute_magnitude_h
    };

    // Countdown baseado na data real de aproximação do asteroide
    const [timeToImpact, setTimeToImpact] = React.useState({
        days: 0, // Asteroide já passou próximo em 6 de outubro
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    React.useEffect(() => {
        const interval = setInterval(() => {
            setTimeToImpact(prev => {
                if (prev.seconds > 0) {
                    return { ...prev, seconds: prev.seconds - 1 };
                } else if (prev.minutes > 0) {
                    return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                } else if (prev.hours > 0) {
                    return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
                } else if (prev.days > 0) {
                    return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
                }
                return prev;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes dataGlow {
                        0% { box-shadow: 0 0 5px rgba(255, 0, 0, 0.3); }
                        50% { box-shadow: 0 0 20px rgba(255, 0, 0, 0.6); }
                        100% { box-shadow: 0 0 5px rgba(255, 0, 0, 0.3); }
                    }
                    
                    @keyframes countdownPulse {
                        0% { color: #ff0000; transform: scale(1); }
                        50% { color: #ff6666; transform: scale(1.05); }
                        100% { color: #ff0000; transform: scale(1); }
                    }
                    
                    .step3-continue-button {
                        background: linear-gradient(45deg, #dc2626, #991b1b);
                        border: none;
                        color: white;
                        padding: 12px 30px;
                        font-size: 1.1rem;
                        font-weight: bold;
                        border-radius: 25px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        font-family: 'Ubuntu Mono', monospace;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        position: relative;
                        overflow: hidden;
                    }
                    
                    .step3-continue-button:hover {
                        transform: translateY(-3px);
                        box-shadow: 0 10px 25px rgba(220, 38, 38, 0.4);
                        background: linear-gradient(45deg, #ef4444, #dc2626);
                    }
                    
                    .step3-continue-button:active {
                        transform: translateY(-1px);
                    }
                `
            }} />

            {/* Título principal - Canto Superior Esquerdo */}
            <div style={{
                position: 'fixed',
                top: '40px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(1, 6, 19, 0.9)',
                borderRadius: '15px',
                padding: '20px 30px',
                zIndex: 9999,
                color: 'white',
                fontFamily: "'Ubuntu Mono', monospace",
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(220, 38, 38, 0.5)',
                animation: 'dataGlow 2s infinite'
            }}>
                <div style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#fca5a5',
                    marginBottom: '10px',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                }}>
                    UNDERSTANDING THE THREAT
                </div>
            </div>

            {/* Dados Físicos - Canto Superior Esquerdo (abaixo do título) */}
            <div style={{
                position: 'fixed',
                top: '180px',
                left: '40px',
                background: 'rgba(1, 6, 19, 0.9)',
                borderRadius: '15px',
                padding: '20px',
                zIndex: 9999,
                color: 'white',
                fontFamily: "'Ubuntu Mono', monospace",
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                minWidth: '300px'
            }}>
                <div style={{
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    color: '#fbbf24',
                    marginBottom: '15px',
                    borderBottom: '1px solid rgba(251, 191, 36, 0.3)',
                    paddingBottom: '5px'
                }}>
                    PHYSICAL DATA
                </div>
                <div style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                    <div style={{ marginBottom: '8px' }}>
                        <span style={{ color: '#fca5a5' }}>Mass:</span> <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{asteroidData.mass}</span>
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                        <span style={{ color: '#fca5a5' }}>Diameter:</span> <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{asteroidData.diameter}</span>
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                        <span style={{ color: '#fca5a5' }}>Size:</span> <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{asteroidData.diameterMeters}</span>
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                        <span style={{ color: '#fca5a5' }}>Velocity:</span> <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{asteroidData.velocityKmPerSec}</span>
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                        <span style={{ color: '#fca5a5' }}>Speed:</span> <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{parseInt(asteroidData.velocity).toLocaleString()} km/h</span>
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                        <span style={{ color: '#fca5a5' }}>Magnitude:</span> <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{asteroidData.absoluteMagnitude}</span>
                    </div>
                    <div>
                        <span style={{ color: '#fca5a5' }}>Energy:</span> <span style={{ color: '#dc2626', fontWeight: 'bold' }}>{asteroidData.energyMT}</span>
                    </div>
                </div>
            </div>

            {/* Dados de Impacto - Canto Superior Direito */}
            <div style={{
                position: 'fixed',
                top: '180px',
                right: '40px',
                background: 'rgba(1, 6, 19, 0.9)',
                borderRadius: '15px',
                padding: '20px',
                zIndex: 9999,
                color: 'white',
                fontFamily: "'Ubuntu Mono', monospace",
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                minWidth: '300px'
            }}>
                <div style={{
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    color: '#dc2626',
                    marginBottom: '15px',
                    borderBottom: '1px solid rgba(220, 38, 38, 0.3)',
                    paddingBottom: '5px'
                }}>
                    IMPACT PREDICTION
                </div>
                <div style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                    <div style={{ marginBottom: '8px' }}>
                        <span style={{ color: '#fca5a5' }}>Target Zone:</span>
                    </div>
                    <div style={{ marginBottom: '12px', color: '#ffffff', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        {asteroidData.impactZone}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                        <span style={{ color: '#fca5a5' }}>Miss Distance:</span> <span style={{ color: '#ffffff' }}>{asteroidData.missDistance}</span>
                    </div>
                </div>
            </div>

            {/* Mensagem de Alerta - Centro Inferior */}
            <div style={{
                position: 'fixed',
                bottom: '150px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(1, 6, 19, 0.9)',
                borderRadius: '15px',
                padding: '25px 40px',
                zIndex: 9999,
                color: 'white',
                fontFamily: "'Ubuntu Mono', monospace",
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(220, 38, 38, 0.5)',
                textAlign: 'center',
                maxWidth: '600px'
            }}>
                <div style={{
                    fontSize: '1.4rem',
                    fontWeight: 'bold',
                    color: '#dc2626',
                    marginBottom: '10px'
                }}>
                    ! HYPOTHETICAL IMPACT SCENARIO
                </div>
                <div style={{
                    fontSize: '1.1rem',
                    lineHeight: '1.5',
                    color: '#fca5a5'
                }}>
                    "This asteroid passed safely by Earth on October 6, 2025. But what if it hadn't missed?"
                </div>
            </div>

            {/* Botão Continue - Canto Inferior */}
            <div style={{
                position: 'fixed',
                bottom: '40px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 9999
            }}>
                <button
                    className="step3-continue-button"
                    onClick={handleContinue}
                >
                    Continue
                </button>
            </div>
        </>
    );
};