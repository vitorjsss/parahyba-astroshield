import React from 'react';

interface Step1Props {
    setCurrStep?: (step: number) => void;
}

export const Step1: React.FC<Step1Props> = ({ setCurrStep }) => {
    const [currentScene, setCurrentScene] = React.useState(0);

    React.useEffect(() => {
        // Primeira cena: "In 2025" aparece por 5 segundos
        const timer1 = setTimeout(() => {
            setCurrentScene(1); // Fade out da primeira cena
        }, 5000);

        // Segunda cena: "the asteroid..." aparece após fade
        const timer2 = setTimeout(() => {
            setCurrentScene(2);
        }, 6000);

        // Terceira cena: após 4 segundos na segunda cena, avança para step 2
        const timer3 = setTimeout(() => {
            if (setCurrStep) {
                setCurrStep(2);
            }
        }, 10000); // Total de 10 segundos

        // Limpar timers se componente for desmontado
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [setCurrStep]);

    const fadeInStyle: React.CSSProperties = {
        animation: 'fadeIn 1s ease-in-out',
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `
            }} />
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(1, 6, 19, 0.86)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                color: 'white',
                fontFamily: "'Fira Code', 'JetBrains Mono', 'SF Mono', 'Monaco', 'Consolas', 'Ubuntu Mono', monospace"
            }}>
                {/* Primeira cena: "In 2025" */}
                {currentScene === 0 && (
                    <div style={{
                        textAlign: 'center',
                        opacity: 1,
                        transition: 'opacity 1s ease-in-out',
                        ...fadeInStyle
                    }}>
                        <div style={{
                            fontSize: '8rem',
                            fontWeight: 'bold',
                            lineHeight: '1.2',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                        }}>
                            <div>In</div>
                            <div>2025</div>
                        </div>
                    </div>
                )}

                {/* Fade out da primeira cena */}
                {currentScene === 1 && (
                    <div style={{
                        textAlign: 'center',
                        opacity: 0,
                        transition: 'opacity 1s ease-in-out'
                    }}>
                        <div style={{
                            fontSize: '8rem',
                            fontWeight: 'bold',
                            lineHeight: '1.2',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                        }}>
                            <div>In</div>
                            <div>2025</div>
                        </div>
                    </div>
                )}

                {/* Segunda cena: "the asteroid..." */}
                {currentScene === 2 && (
                    <div style={{
                        textAlign: 'center',
                        opacity: 1,
                        transition: 'opacity 1s ease-in-out',
                        ...fadeInStyle
                    }}>
                        <div style={{
                            fontSize: '3rem',
                            fontWeight: 'normal',
                            lineHeight: '1.4',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                            maxWidth: '80vw'
                        }}>
                            the asteroid "Impactor-2025" will hit our planet…
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};