import React, { useState, useEffect } from 'react';
import { WorldMapNarrative } from '../WorldMapNarrative';
import { DANGEROUS_ASTEROID, DANGEROUS_ASTEROID_IMPACT_DATA } from '../DangerousAsteroid';

interface Step5Props {
    onNext: () => void;
}

export const Step5: React.FC<Step5Props> = ({ onNext }) => {
    const [showContinueButton, setShowContinueButton] = useState(false);
    const [showImpactData, setShowImpactData] = useState(false);

    // Coordenadas de São Francisco
    const sanFranciscoCoords = {
        lat: 37.7749,
        lng: -122.4194
    };

    // Dados do impacto
    const impactData = DANGEROUS_ASTEROID_IMPACT_DATA;
    const asteroid = DANGEROUS_ASTEROID;
    const approach = asteroid.close_approach_data[0];

    useEffect(() => {
        // Mostrar dados de impacto após 2 segundos
        const impactTimer = setTimeout(() => {
            setShowImpactData(true);
        }, 2000);

        // Mostrar botão de continuar após 5 segundos
        const continueTimer = setTimeout(() => {
            setShowContinueButton(true);
        }, 5000);

        return () => {
            clearTimeout(impactTimer);
            clearTimeout(continueTimer);
        };
    }, []);

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

            {/* Título da simulação */}
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
                    marginBottom: '12px',
                    color: '#f87171',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                    Asteroid Impact: San Francisco
                </h1>
                <p style={{
                    fontSize: '1.25rem',
                    color: '#d1d5db',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                    fontWeight: '500'
                }}>
                    {asteroid.name} • {approach.close_approach_date}
                </p>
            </div>

            {/* Painéis de informações de impacto - Duas tabelas */}
            {showImpactData && (
                <>
                    {/* Painel Esquerdo */}
                    <div style={{
                        position: 'absolute',
                        top: '120px',
                        left: '24px',
                        width: '360px',
                        background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.15) 0%, rgba(15, 23, 42, 0.25) 100%)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        borderRadius: '16px',
                        padding: '24px',
                        color: 'white',
                        zIndex: 50,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                        animation: 'slideInFromLeft 0.8s ease-out'
                    }}>
                        <style>{`
                            @keyframes slideInFromLeft {
                                from {
                                    opacity: 0;
                                    transform: translateX(-100px);
                                }
                                to {
                                    opacity: 1;
                                    transform: translateX(0);
                                }
                            }
                            
                            @keyframes slideInFromRight {
                                from {
                                    opacity: 0;
                                    transform: translateX(100px);
                                }
                                to {
                                    opacity: 1;
                                    transform: translateX(0);
                                }
                            }
                            
                            @keyframes fadeInUp {
                                from {
                                    opacity: 0;
                                    transform: translateY(20px);
                                }
                                to {
                                    opacity: 1;
                                    transform: translateY(0);
                                }
                            }
                        `}</style>

                        <div style={{ marginBottom: '24px' }}>
                            <h2 style={{
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: '#60a5fa',
                                margin: 0,
                                fontFamily: 'system-ui, -apple-system, sans-serif'
                            }}>Asteroid Data</h2>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* Asteroide Info */}
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(127, 29, 29, 0.05) 100%)',
                                padding: '16px',
                                borderRadius: '10px',
                                border: '1px solid rgba(239, 68, 68, 0.15)',
                                animation: 'fadeInUp 0.6s ease-out 0.2s both'
                            }}>
                                <div style={{ marginBottom: '12px' }}>
                                    <h3 style={{
                                        fontWeight: '600',
                                        color: '#fca5a5',
                                        margin: 0,
                                        fontSize: '1.1rem'
                                    }}>Object Properties</h3>
                                </div>
                                <div style={{ fontSize: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <p style={{ margin: 0 }}><span style={{ color: '#9ca3af', fontWeight: '500' }}>Diameter:</span> <span style={{ color: '#ffffff', fontWeight: '600' }}>{asteroid.estimated_diameter.meters.estimated_diameter_max.toFixed(0)}m</span></p>
                                    <p style={{ margin: 0 }}><span style={{ color: '#9ca3af', fontWeight: '500' }}>Velocity:</span> <span style={{ color: '#ffffff', fontWeight: '600' }}>{parseFloat(approach.relative_velocity.kilometers_per_second).toFixed(1)} km/s</span></p>
                                    <p style={{ margin: 0 }}><span style={{ color: '#9ca3af', fontWeight: '500' }}>Energy:</span> <span style={{ color: '#ffffff', fontWeight: '600' }}>{impactData.energy_megatons_tnt.toLocaleString()} MT TNT</span></p>
                                </div>
                            </div>

                            {/* Impacto Físico */}
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(154, 52, 18, 0.05) 100%)',
                                padding: '16px',
                                borderRadius: '10px',
                                border: '1px solid rgba(249, 115, 22, 0.15)',
                                animation: 'fadeInUp 0.6s ease-out 0.4s both'
                            }}>
                                <div style={{ marginBottom: '12px' }}>
                                    <h3 style={{
                                        fontWeight: '600',
                                        color: '#fdba74',
                                        margin: 0,
                                        fontSize: '1.1rem'
                                    }}>Physical Impact</h3>
                                </div>
                                <div style={{ fontSize: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <p style={{ margin: 0 }}><span style={{ color: '#9ca3af', fontWeight: '500' }}>Crater Diameter:</span> <span style={{ color: '#ffffff', fontWeight: '600' }}>{impactData.crater_diameter_km.toFixed(1)} km</span></p>
                                    <p style={{ margin: 0 }}><span style={{ color: '#9ca3af', fontWeight: '500' }}>Crater Depth:</span> <span style={{ color: '#ffffff', fontWeight: '600' }}>{impactData.crater_depth_km.toFixed(1)} km</span></p>
                                    <p style={{ margin: 0 }}><span style={{ color: '#9ca3af', fontWeight: '500' }}>Devastation Radius:</span> <span style={{ color: '#ffffff', fontWeight: '600' }}>{impactData.felt_radius_km_est} km</span></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Painel Direito */}
                    <div style={{
                        position: 'absolute',
                        top: '120px',
                        right: '24px',
                        width: '360px',
                        background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.15) 0%, rgba(15, 23, 42, 0.25) 100%)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        borderRadius: '16px',
                        padding: '24px',
                        color: 'white',
                        zIndex: 50,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                        animation: 'slideInFromRight 0.8s ease-out'
                    }}>
                        <div style={{ marginBottom: '24px' }}>
                            <h2 style={{
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: '#fbbf24',
                                margin: 0,
                                fontFamily: 'system-ui, -apple-system, sans-serif'
                            }}>Impact Effects</h2>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* Impacto Humano */}
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(146, 64, 14, 0.05) 100%)',
                                padding: '16px',
                                borderRadius: '10px',
                                border: '1px solid rgba(245, 158, 11, 0.15)',
                                animation: 'fadeInUp 0.6s ease-out 0.6s both'
                            }}>
                                <div style={{ marginBottom: '12px' }}>
                                    <h3 style={{
                                        fontWeight: '600',
                                        color: '#fbbf24',
                                        margin: 0,
                                        fontSize: '1.1rem'
                                    }}>Human Impact</h3>
                                </div>
                                <div style={{ fontSize: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <p style={{ margin: 0 }}><span style={{ color: '#9ca3af', fontWeight: '500' }}>Population Affected:</span> <span style={{ color: '#ffffff', fontWeight: '600' }}>{impactData.context.population_estimated_affected.toLocaleString()}</span></p>
                                    <p style={{ margin: 0 }}><span style={{ color: '#9ca3af', fontWeight: '500' }}>Buildings Destroyed:</span> <span style={{ color: '#ffffff', fontWeight: '600' }}>{impactData.context.buildings_count.toLocaleString()}</span></p>
                                    <p style={{ margin: 0 }}><span style={{ color: '#9ca3af', fontWeight: '500' }}>Seismic Magnitude:</span> <span style={{ color: '#ffffff', fontWeight: '600' }}>{impactData.magnitude_estimate_range[1].toFixed(1)}</span></p>
                                </div>
                            </div>

                            {/* Efeitos Secundários */}
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(30, 58, 138, 0.05) 100%)',
                                padding: '16px',
                                borderRadius: '10px',
                                border: '1px solid rgba(59, 130, 246, 0.15)',
                                animation: 'fadeInUp 0.6s ease-out 0.8s both'
                            }}>
                                <div style={{ marginBottom: '12px' }}>
                                    <h3 style={{
                                        fontWeight: '600',
                                        color: '#93c5fd',
                                        margin: 0,
                                        fontSize: '1.1rem'
                                    }}>Secondary Effects</h3>
                                </div>
                                <div style={{ fontSize: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <p style={{ margin: 0, color: '#d1d5db', fontWeight: '500' }}>• Massive fires throughout SF</p>
                                    <p style={{ margin: 0, color: '#d1d5db', fontWeight: '500' }}>• Infrastructure collapse</p>
                                    <p style={{ margin: 0, color: '#d1d5db', fontWeight: '500' }}>• Regional power outages</p>
                                    <p style={{ margin: 0, color: '#d1d5db', fontWeight: '500' }}>• Debris fallout zone</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Botão de continuar */}
            {showContinueButton && (
                <div style={{
                    position: 'absolute',
                    bottom: '40px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 50
                }}>
                    <style>{`
                        .continue-btn {
                            background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(30, 58, 138, 0.3) 100%);
                            backdrop-filter: blur(16px);
                            -webkit-backdrop-filter: blur(16px);
                            border: 1px solid rgba(59, 130, 246, 0.3);
                            border-radius: 50px;
                            padding: 20px 48px;
                            color: white;
                            font-size: 1.3rem;
                            font-weight: 600;
                            font-family: system-ui, -apple-system, sans-serif;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                            animation: fadeInUp 0.6s ease-out 1s both;
                            position: relative;
                            overflow: hidden;
                            min-width: 280px;
                        }
                        
                        .continue-btn::before {
                            content: '';
                            position: absolute;
                            top: 0;
                            left: -100%;
                            width: 100%;
                            height: 100%;
                            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
                            transition: left 0.5s ease;
                        }
                        
                        .continue-btn:hover {
                            transform: translateY(-3px);
                            box-shadow: 0 16px 48px rgba(59, 130, 246, 0.25);
                            border-color: rgba(59, 130, 246, 0.5);
                            padding: 22px 52px;
                        }
                        
                        .continue-btn:hover::before {
                            left: 100%;
                        }
                        
                        .continue-btn:active {
                            transform: translateY(-1px);
                            box-shadow: 0 8px 32px rgba(59, 130, 246, 0.2);
                        }
                    `}</style>
                    <button
                        onClick={onNext}
                        className="continue-btn"
                    >
                        Continue
                    </button>
                </div>
            )}
        </div>
    );
};