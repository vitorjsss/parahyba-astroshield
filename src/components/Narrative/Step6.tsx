import React, { useState, useEffect } from 'react';
import { WorldMapNarrative } from '../WorldMapNarrative';
import { DANGEROUS_ASTEROID } from '../DangerousAsteroid';

interface Step6Props {
    setCurrStep?: (step: number) => void;
}

interface MitigationResult {
    success: boolean;
    method: string;
    leadTime: number;
    message: string;
    details: any;
}

export const Step6: React.FC<Step6Props> = ({ setCurrStep }) => {
    const [showControls, setShowControls] = useState(false);
    const [leadTime, setLeadTime] = useState(2); // anos
    const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [mitigationResult, setMitigationResult] = useState<MitigationResult | null>(null);
    const [showResult, setShowResult] = useState(false);

    // Coordenadas de São Francisco
    const sanFranciscoCoords = {
        lat: 37.7749,
        lng: -122.4194
    };

    // Dados do asteroide
    const asteroid = DANGEROUS_ASTEROID;

    useEffect(() => {
        // Mostrar controles após 2 segundos
        const timer = setTimeout(() => {
            setShowControls(true);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    const fetchMitigationData = async (strategy: string) => {
        setLoading(true);
        setSelectedStrategy(strategy);
        setShowResult(false);

        try {
            // Converter anos para meses para a API
            const leadTimeMonths = leadTime * 12;

            const response = await fetch(
                `https://backend-challenge-nasa-space-apps-2025-dark-tree-2941.fly.dev/impact/${leadTimeMonths}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        diameter_m: asteroid.estimated_diameter.meters.estimated_diameter_max,
                        velocity_kms: parseFloat(asteroid.close_approach_data[0].relative_velocity.kilometers_per_second),
                        density_kg_m3: 3000, // densidade padrão para asteroides rochosos
                        lat: sanFranciscoCoords.lat,
                        lon: sanFranciscoCoords.lng,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`Request failed: ${response.status}`);
            }

            const data = await response.json();

            // Processar resultado baseado na estratégia e leadTime
            const result = processMitigationResult(strategy, leadTime, data);
            setMitigationResult(result);

            // Mostrar resultado após um delay
            setTimeout(() => {
                setShowResult(true);
            }, 1000);

        } catch (err) {
            console.error("Error fetching mitigation data:", err);
            setMitigationResult({
                success: false,
                method: strategy,
                leadTime,
                message: "Failed to calculate mitigation strategy. Please try again.",
                details: null
            });
            setShowResult(true);
        } finally {
            setLoading(false);
        }
    };

    const processMitigationResult = (strategy: string, leadTimeYears: number, data: any): MitigationResult => {
        let success = false;
        let message = "";
        const leadTimeMonths = leadTimeYears * 12;

        switch (strategy) {
            case "kinetic":
                const kineticData = data.kinetic;
                success = leadTimeMonths >= 6 && kineticData.impactors_needed_for_req <= 10;
                if (success) {
                    message = `🎯 SUCCESS! Kinetic impactor mission deployed with ${leadTimeYears} years lead time. ${kineticData.impactors_needed_for_req} impactors successfully altered the asteroid's trajectory. Earth is safe!`;
                } else if (leadTimeMonths < 6) {
                    message = `⚠️ INSUFFICIENT TIME! With only ${leadTimeYears} year${leadTimeYears !== 1 ? 's' : ''} (${leadTimeMonths} months), there's not enough time to build and deploy the required ${kineticData.impactors_needed_for_req} kinetic impactors. Minimum 6 months needed.`;
                } else {
                    message = `❌ MISSION FAILED! The asteroid is too large and requires ${kineticData.impactors_needed_for_req} impactors - beyond our current manufacturing capability.`;
                }
                break;

            case "gravity_tractor":
                const gravityData = data.gravity_tractor;
                success = leadTimeMonths >= 24 && gravityData.meets_requirement;
                if (success) {
                    message = `🛰️ SUCCESS! Gravity tractor deployed with ${leadTimeYears} years lead time. The spacecraft successfully nudged the asteroid off course using gravitational pull. Humanity prevails!`;
                } else if (leadTimeMonths < 24) {
                    message = `⏰ INSUFFICIENT TIME! Gravity tractor requires at least 2 years to be effective. With ${leadTimeYears} year${leadTimeYears !== 1 ? 's' : ''}, the gentle gravitational pull won't be enough to deflect the asteroid.`;
                } else {
                    message = `💫 PARTIAL SUCCESS! The gravity tractor altered the trajectory but not enough to completely avoid impact. Consider combining with other methods.`;
                }
                break;

            case "nuclear":
                const nuclearData = data.nuclear;
                success = leadTimeMonths >= 3 && nuclearData.yield_required_megatons <= 100;
                if (success) {
                    message = `☢️ SUCCESS! Nuclear deflection executed with ${leadTimeYears} years preparation. A precisely controlled ${nuclearData.yield_required_megatons.toFixed(1)} megaton explosion successfully diverted the asteroid. Crisis averted!`;
                } else if (leadTimeMonths < 3) {
                    message = `🚨 CRITICAL FAILURE! Only ${leadTimeYears} year${leadTimeYears !== 1 ? 's' : ''} is insufficient to safely design, test, and deploy a nuclear deflection system. Minimum 3 months required for emergency protocol.`;
                } else {
                    message = `💥 MISSION FAILED! The required nuclear yield of ${nuclearData.yield_required_megatons.toFixed(1)} megatons exceeds our safety protocols and available warheads.`;
                }
                break;

            default:
                message = "Unknown mitigation strategy selected.";
        }

        return {
            success,
            method: strategy,
            leadTime: leadTimeYears,
            message,
            details: data
        };
    }; const getStrategyDescription = (strategy: string) => {
        switch (strategy) {
            case "kinetic":
                return "Direct collision of spacecraft against the asteroid to transfer momentum and nudge it off course.";
            case "gravity_tractor":
                return "A spacecraft hovers near the asteroid, slowly pulling it using gravity alone over an extended period.";
            case "nuclear":
                return "A controlled nuclear explosion near the asteroid's surface to vaporize material and generate thrust.";
            default:
                return "";
        }
    };

    const getStrategyIcon = (strategy: string) => {
        switch (strategy) {
            case "kinetic":
                return "🛰️";
            case "gravity_tractor":
                return "🚀";
            case "nuclear":
                return "☢️";
            default:
                return "🛡️";
        }
    };

    const handleFinish = () => {
        // Finalizar narrativa - avançar além do step 6 para sair da narrativa
        if (setCurrStep) {
            setCurrStep(7); // Qualquer número > 6 vai finalizar a narrativa
        }
    };

    return (
        <div style={{
            position: 'relative',
            width: '100vw',
            height: '100vh',
            background: '#000000',
            overflow: 'hidden'
        }}>
            <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                <WorldMapNarrative
                    impactPoint={[sanFranciscoCoords.lng, sanFranciscoCoords.lat]}
                    selectedAsteroid={DANGEROUS_ASTEROID}
                />
            </div>

            {/* Título da missão */}
            <div style={{
                position: 'absolute',
                top: '24px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'white',
                zIndex: 50,
                textAlign: 'center'
            }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    marginBottom: '10px',
                    color: '#4ade80',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                    🛡️ Planetary Defense Mission
                </h1>
                <p style={{
                    fontSize: '1.25rem',
                    color: '#d1d5db',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                    fontWeight: '500',
                    marginBottom: '16px'
                }}>
                    "The choice is yours, scientist. Save our planet."
                </p>
            </div>

            {/* Controles de Mitigação */}
            {showControls && (
                <div style={{
                    position: 'absolute',
                    top: '140px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '800px',
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(15, 23, 42, 0.25) 100%)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                    borderRadius: '16px',
                    padding: '24px',
                    color: 'white',
                    zIndex: 50,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                    animation: 'fadeInUp 0.8s ease-out'
                }}>
                    <style>{`
                        @keyframes fadeInUp {
                            from {
                                opacity: 0;
                                transform: translateX(-50%) translateY(20px);
                            }
                            to {
                                opacity: 1;
                                transform: translateX(-50%) translateY(0);
                            }
                        }
                        
                        .strategy-btn {
                            background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(30, 58, 138, 0.3) 100%);
                            backdrop-filter: blur(8px);
                            border: 1px solid rgba(59, 130, 246, 0.3);
                            border-radius: 12px;
                            padding: 16px 20px;
                            color: white;
                            font-size: 1rem;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            min-height: 120px;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            text-align: center;
                            gap: 8px;
                        }
                        
                        .strategy-btn:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2);
                            border-color: rgba(59, 130, 246, 0.5);
                        }
                        
                        .strategy-btn:disabled {
                            opacity: 0.5;
                            cursor: not-allowed;
                            transform: none;
                        }
                        
                        .strategy-btn.selected {
                            border-color: rgba(34, 197, 94, 0.5);
                            background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(15, 23, 42, 0.3) 100%);
                        }
                        
                        .lead-time-slider {
                            width: 100%;
                            height: 8px;
                            border-radius: 4px;
                            background: rgba(59, 130, 246, 0.2);
                            outline: none;
                            cursor: pointer;
                        }
                        
                        .lead-time-slider::-webkit-slider-thumb {
                            appearance: none;
                            width: 20px;
                            height: 20px;
                            border-radius: 50%;
                            background: #4ade80;
                            cursor: pointer;
                            box-shadow: 0 2px 8px rgba(74, 222, 128, 0.4);
                        }
                    `}</style>

                    <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: '#4ade80',
                            margin: '0 0 8px 0',
                            fontFamily: 'system-ui, -apple-system, sans-serif'
                        }}>Deflection Strategy Selection</h2>
                        <p style={{ margin: 0, color: '#d1d5db', fontSize: '1rem' }}>
                            Humanity has developed three methods to defend against asteroids
                        </p>
                    </div>

                    {/* Explicação sobre Lead Time */}
                    <div style={{
                        marginBottom: '28px',
                        padding: '20px',
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(30, 58, 138, 0.05) 100%)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        borderRadius: '12px'
                    }}>
                        <h3 style={{
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            color: '#60a5fa',
                            margin: '0 0 12px 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            What is Lead Time?
                        </h3>
                        <p style={{
                            margin: '0 0 8px 0',
                            color: '#e5e7eb',
                            lineHeight: '1.5',
                            fontSize: '0.95rem'
                        }}>
                            <strong>Lead Time</strong> is the crucial window between when we first detect the asteroid threat and when it would impact Earth.
                        </p>
                    </div>

                    {/* Lead Time Selector */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            color: '#4ade80',
                            marginBottom: '12px'
                        }}>
                            Detection Lead Time: {leadTime} year{leadTime !== 1 ? 's' : ''}
                        </label>
                        <input
                            type="range"
                            min={0.5}
                            max={5}
                            step={0.5}
                            value={leadTime}
                            onChange={(e) => setLeadTime(Number(e.target.value))}
                            className="lead-time-slider"
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#9ca3af', marginTop: '4px' }}>
                            <span>6 months</span>
                            <span>5 years</span>
                        </div>
                    </div>

                    {/* Strategy Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                        {[
                            { key: 'kinetic', name: 'Kinetic Impactor', icon: '🛰️' },
                            { key: 'gravity_tractor', name: 'Gravity Tractor', icon: '🚀' },
                            { key: 'nuclear', name: 'Nuclear Deflection', icon: '☢️' }
                        ].map((strategy) => (
                            <button
                                key={strategy.key}
                                onClick={() => fetchMitigationData(strategy.key)}
                                disabled={loading}
                                className={`strategy-btn ${selectedStrategy === strategy.key ? 'selected' : ''}`}
                            >
                                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{strategy.icon}</div>
                                <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{strategy.name}</div>
                                <div style={{ fontSize: '0.85rem', opacity: 0.8, lineHeight: '1.3' }}>
                                    {getStrategyDescription(strategy.key)}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <div style={{ fontSize: '1.1rem', color: '#4ade80' }}>
                                🔄 Calculating mission parameters...
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Resultado da Missão */}
            {showResult && mitigationResult && (
                <div style={{
                    position: 'absolute',
                    bottom: '40px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '700px',
                    background: mitigationResult.success
                        ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(15, 23, 42, 0.25) 100%)'
                        : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(15, 23, 42, 0.25) 100%)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: `1px solid ${mitigationResult.success ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    borderRadius: '16px',
                    padding: '24px',
                    color: 'white',
                    zIndex: 50,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                    animation: 'slideInFromBottom 0.8s ease-out',
                    textAlign: 'center'
                }}>
                    <style>{`
                        @keyframes slideInFromBottom {
                            from {
                                opacity: 0;
                                transform: translateX(-50%) translateY(100px);
                            }
                            to {
                                opacity: 1;
                                transform: translateX(-50%) translateY(0);
                            }
                        }
                    `}</style>

                    <div style={{ marginBottom: '16px' }}>
                        <h3 style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: mitigationResult.success ? '#4ade80' : '#f87171',
                            margin: '0 0 8px 0'
                        }}>
                            {mitigationResult.success ? '🎉 Mission Success!' : '💥 Mission Result'}
                        </h3>
                        <div style={{
                            fontSize: '2rem',
                            marginBottom: '12px'
                        }}>
                            {getStrategyIcon(mitigationResult.method)}
                        </div>
                    </div>

                    <p style={{
                        fontSize: '1.1rem',
                        lineHeight: '1.6',
                        margin: '0 0 20px 0',
                        color: '#e5e7eb'
                    }}>
                        {mitigationResult.message}
                    </p>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <button
                            onClick={() => {
                                setShowResult(false);
                                setMitigationResult(null);
                                setSelectedStrategy(null);
                            }}
                            style={{
                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(30, 58, 138, 0.3) 100%)',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                borderRadius: '25px',
                                padding: '12px 24px',
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Try Again
                        </button>

                        <button
                            onClick={handleFinish}
                            style={{
                                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(15, 23, 42, 0.3) 100%)',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(34, 197, 94, 0.3)',
                                borderRadius: '25px',
                                padding: '12px 24px',
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Complete Mission →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};