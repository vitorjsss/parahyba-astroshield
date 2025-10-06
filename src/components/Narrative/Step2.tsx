import React from 'react';
import { DANGEROUS_ASTEROID } from '../DangerousAsteroid';

interface Step2Props {
    setCurrStep?: (step: number) => void;
}

export const Step2: React.FC<Step2Props> = ({ setCurrStep }) => {
    const handleContinue = () => {
        if (setCurrStep) {
            setCurrStep(3);
        }
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes buttonPulse {
                        0% {
                            transform: scale(1);
                            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
                        }
                        70% {
                            transform: scale(1.05);
                            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
                        }
                        100% {
                            transform: scale(1);
                            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
                        }
                    }
                    
                    .step2-button {
                        background: linear-gradient(45deg, #3b82f6, #1d4ed8);
                        border: none;
                        color: white;
                        padding: 12px 30px;
                        font-size: 1.1rem;
                        font-weight: 600;
                        border-radius: 12px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        font-family: 'system-ui', sans-serif;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        margin-top: 1.5rem;
                        position: relative;
                        overflow: hidden;
                    }
                    
                    .step2-button:hover {
                        transform: translateY(-3px);
                        box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4);
                        animation: buttonPulse 2s infinite;
                    }
                    
                    .step2-button:active {
                        transform: translateY(-1px);
                    }
                    
                    .step2-button::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: -100%;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                        transition: left 0.5s;
                    }
                    
                    .step2-button:hover::before {
                        left: 100%;
                    }
                `
            }} />
            <div style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                background: 'rgba(15, 23, 42, 0.95)',
                transform: 'translate(-50%, -50%)',
                borderRadius: '20px',
                padding: '2.5rem 3rem',
                zIndex: 9999,
                color: 'white',
                fontFamily: "system-ui, -apple-system, sans-serif",
                alignItems: 'center',
                textAlign: 'center',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
                maxWidth: '500px',
                width: '90%'
            }}>
                {/* Dados do asteroide real */}
                <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '1.5rem'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        marginBottom: '12px'
                    }}>
                        <span style={{ fontSize: '2rem' }}>⚠️</span>
                        <h2 style={{
                            color: '#ef4444',
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            margin: 0
                        }}>
                            ASTEROID DETECTED
                        </h2>
                    </div>

                    <div style={{
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        color: '#fbbf24',
                        marginBottom: '8px'
                    }}>
                        {DANGEROUS_ASTEROID.name}
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px',
                        fontSize: '0.9rem',
                        color: '#d1d5db'
                    }}>
                        <div>
                            <strong>Diameter:</strong><br />
                            {Math.round(DANGEROUS_ASTEROID.estimated_diameter.meters.estimated_diameter_min)} - {Math.round(DANGEROUS_ASTEROID.estimated_diameter.meters.estimated_diameter_max)}m
                        </div>
                        <div>
                            <strong>Velocity:</strong><br />
                            {parseFloat(DANGEROUS_ASTEROID.close_approach_data[0].relative_velocity.kilometers_per_second).toFixed(1)} km/s
                        </div>
                        <div>
                            <strong>Approach Date:</strong><br />
                            {DANGEROUS_ASTEROID.close_approach_data[0].close_approach_date}
                        </div>
                        <div>
                            <strong>Miss Distance:</strong><br />
                            {parseFloat(DANGEROUS_ASTEROID.close_approach_data[0].miss_distance.lunar).toFixed(1)} lunar distances
                        </div>
                    </div>
                </div>

                {/* Texto principal */}
                <div style={{
                    fontSize: '1.3rem',
                    lineHeight: '1.4',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                    color: '#ffffff',
                    marginBottom: '1.5rem',
                    fontWeight: '500'
                }}>
                    This is a <span style={{ color: '#ef4444', fontWeight: 'bold' }}>real asteroid</span> approaching Earth.
                    <br />
                    Learn how we can protect our planet.
                </div>

                {/* Botão Continue */}
                <button
                    className="step2-button"
                    onClick={handleContinue}
                >
                    Continue
                </button>
            </div>
        </>
    );
};