import { Satellite } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface WelcomeScreenProps {
    onSelectMode: (mode: 'narrative' | 'free') => void;
}

// Componente para gerar estrelas animadas
function StarField() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Configurar tamanho do canvas
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Gerar estrelas
        const stars: Array<{
            x: number;
            y: number;
            size: number;
            speed: number;
            opacity: number;
            color: string;
        }> = [];

        const starColors = ['#ffffff', '#cde6ff', '#ffebcd', '#ffe4e1', '#e6e6fa'];

        for (let i = 0; i < 200; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 0.5 + 0.1,
                opacity: Math.random() * 0.8 + 0.2,
                color: starColors[Math.floor(Math.random() * starColors.length)]
            });
        }

        // Animação das estrelas
        let animationId: number;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Desenhar galáxia de fundo
            const gradient = ctx.createRadialGradient(
                canvas.width / 2, canvas.height / 2, 0,
                canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height)
            );
            gradient.addColorStop(0, 'rgba(8, 15, 35, 0.95)'); // Azul muito escuro
            gradient.addColorStop(0.4, 'rgba(15, 23, 42, 0.8)'); // Slate escuro
            gradient.addColorStop(0.7, 'rgba(8, 15, 35, 0.6)'); // Azul muito escuro
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.98)'); // Quase preto

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Desenhar nebulosa azul sutil
            const nebulaGradient = ctx.createRadialGradient(
                canvas.width * 0.3, canvas.height * 0.3, 0,
                canvas.width * 0.3, canvas.height * 0.3, canvas.width * 0.4
            );
            nebulaGradient.addColorStop(0, 'rgba(30, 58, 138, 0.1)');
            nebulaGradient.addColorStop(0.5, 'rgba(15, 23, 42, 0.08)');
            nebulaGradient.addColorStop(1, 'rgba(8, 15, 35, 0.05)');

            ctx.fillStyle = nebulaGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Desenhar e animar estrelas
            stars.forEach((star, index) => {
                ctx.save();
                ctx.globalAlpha = star.opacity;
                ctx.fillStyle = star.color;
                ctx.shadowBlur = star.size * 2;
                ctx.shadowColor = star.color;

                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();

                // Efeito piscante
                star.opacity += (Math.random() - 0.5) * 0.02;
                star.opacity = Math.max(0.1, Math.min(1, star.opacity));

                // Movimento lento das estrelas
                star.x += star.speed * Math.cos(Date.now() * 0.0001 + index);
                star.y += star.speed * Math.sin(Date.now() * 0.0001 + index);

                // Reposicionar estrelas que saem da tela
                if (star.x > canvas.width) star.x = 0;
                if (star.x < 0) star.x = canvas.width;
                if (star.y > canvas.height) star.y = 0;
                if (star.y < 0) star.y = canvas.height;
            });

            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1
            }}
        />
    );
}

export function WelcomeScreen({ onSelectMode }: WelcomeScreenProps) {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'radial-gradient(ellipse at center, rgba(8, 15, 35, 0.98) 0%, rgba(0, 0, 0, 0.99) 70%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            overflow: 'hidden'
        }}>
            {/* Campo de estrelas animado */}
            <StarField />

            <div style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.08) 0%, rgba(8, 15, 35, 0.05) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(30, 58, 138, 0.15)',
                borderRadius: '16px',
                padding: '48px',
                maxWidth: '600px',
                width: '90%',
                textAlign: 'center',
                boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.8)',
                position: 'relative',
                zIndex: 1
            }}>
                {/* Header */}
                <div style={{ marginBottom: '48px' }}>
                    <h1 style={{
                        fontSize: '2.2rem',
                        fontWeight: '600',
                        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        margin: '0 0 16px 0',
                        letterSpacing: '-0.02em'
                    }}>
                        Asteroid Impact Simulator
                    </h1>
                    <p style={{
                        fontSize: '1rem',
                        color: '#64748b',
                        margin: 0,
                        lineHeight: '1.5',
                        fontWeight: '400'
                    }}>
                        Explore planetary defense scenarios and asteroid impact simulations
                    </p>
                </div>

                {/* Mode Selection */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '24px',
                    marginBottom: '32px'
                }}>
                    {/* Narrative Mode */}
                    <div
                        onClick={() => onSelectMode('narrative')}
                        style={{
                            background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.06) 0%, rgba(15, 23, 42, 0.04) 100%)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(30, 58, 138, 0.2)',
                            borderRadius: '12px',
                            padding: '32px 24px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            textAlign: 'center',
                            position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.borderColor = 'rgba(30, 58, 138, 0.3)';
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(30, 58, 138, 0.1) 0%, rgba(15, 23, 42, 0.08) 100%)';
                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = 'rgba(30, 58, 138, 0.2)';
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(30, 58, 138, 0.06) 0%, rgba(15, 23, 42, 0.04) 100%)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <h2 style={{
                            fontSize: '1.3rem',
                            fontWeight: '600',
                            color: '#3b82f6',
                            margin: '0 0 12px 0',
                            letterSpacing: '-0.01em'
                        }}>
                            Guided Narrative
                        </h2>
                        <p style={{
                            color: '#64748b',
                            margin: '0 0 16px 0',
                            lineHeight: '1.5',
                            fontSize: '0.9rem'
                        }}>
                            Experience a step-by-step story of asteroid detection, impact analysis, and planetary defense strategies
                        </p>
                        <div style={{
                            padding: '6px 12px',
                            background: 'rgba(30, 58, 138, 0.08)',
                            border: '1px solid rgba(30, 58, 138, 0.15)',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            color: '#475569',
                            fontWeight: '500'
                        }}>
                            Educational • Structured • Story-driven
                        </div>
                    </div>

                    {/* Free Exploration Mode */}
                    <div
                        onClick={() => onSelectMode('free')}
                        style={{
                            background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.06) 0%, rgba(15, 23, 42, 0.04) 100%)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(30, 58, 138, 0.2)',
                            borderRadius: '12px',
                            padding: '32px 24px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            textAlign: 'center',
                            position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.borderColor = 'rgba(30, 58, 138, 0.3)';
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(30, 58, 138, 0.1) 0%, rgba(15, 23, 42, 0.08) 100%)';
                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = 'rgba(30, 58, 138, 0.2)';
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(30, 58, 138, 0.06) 0%, rgba(15, 23, 42, 0.04) 100%)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <h2 style={{
                            fontSize: '1.3rem',
                            fontWeight: '600',
                            color: '#3b82f6',
                            margin: '0 0 12px 0',
                            letterSpacing: '-0.01em'
                        }}>
                            Free Exploration
                        </h2>
                        <p style={{
                            color: '#64748b',
                            margin: '0 0 16px 0',
                            lineHeight: '1.5',
                            fontSize: '0.9rem'
                        }}>
                            Freely explore asteroid data, create custom impact scenarios, and test different simulation parameters
                        </p>
                        <div style={{
                            padding: '6px 12px',
                            background: 'rgba(30, 58, 138, 0.08)',
                            border: '1px solid rgba(30, 58, 138, 0.15)',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            color: '#475569',
                            fontWeight: '500'
                        }}>
                            Interactive • Customizable • Sandbox
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    color: '#475569',
                    fontSize: '0.8rem',
                    marginTop: '8px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Satellite size={14} style={{ color: '#64748b' }} />
                        <span>Real NASA Data</span>
                    </div>
                    <div style={{ width: '2px', height: '2px', background: '#64748b', borderRadius: '50%' }} />
                    <span>Scientific Accuracy</span>
                    <div style={{ width: '2px', height: '2px', background: '#64748b', borderRadius: '50%' }} />
                    <span>3D Visualization</span>
                </div>
            </div>
        </div>
    );
}