import React from 'react';

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
                            box-shadow: 0 0 0 0 rgba(255, 165, 0, 0.7);
                        }
                        70% {
                            transform: scale(1.05);
                            box-shadow: 0 0 0 10px rgba(255, 165, 0, 0);
                        }
                        100% {
                            transform: scale(1);
                            box-shadow: 0 0 0 0 rgba(255, 165, 0, 0);
                        }
                    }
                    
                    .step2-button {
                        background: linear-gradient(45deg, #ff6b35, #f7931e);
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
                        margin-top: 1.5rem;
                        position: relative;
                        overflow: hidden;
                    }
                    
                    .step2-button:hover {
                        transform: translateY(-3px);
                        box-shadow: 0 10px 25px rgba(255, 107, 53, 0.4);
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
                top: '80%',
                left: '50%',
                background: 'rgba(1, 6, 19, 0.01)',
                transform: 'translate(-50%, -50%)',
                borderRadius: '50px',
                padding: '2rem 3rem',
                zIndex: 9999,
                color: 'white',
                fontFamily: "monospace",
                alignItems: 'center',
                textAlign: 'center',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.02)',
            }}>
                {/* Ícone de meteoro */}
                <div style={{
                    fontSize: '5rem',
                    marginBottom: '1.2rem',
                    filter: 'drop-shadow(0 0 10px rgba(255, 166, 0, 1))'
                }}>
                    ☄️
                </div>

                {/* Texto principal */}
                <div style={{
                    fontSize: '1.5rem',
                    lineHeight: '1.5',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                    maxWidth: '400px',
                    color: '#ffffff',
                    marginBottom: '1rem'
                }}>
                    Learn with us how YOU can save the planet
                </div>

                {/* Botão Continue */}
                <button
                    className="step2-button"
                    onClick={handleContinue}
                >
                    🚀 Continue
                </button>
            </div>
        </>
    );
};