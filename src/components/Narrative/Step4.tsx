import React from 'react';

interface Step4Props {
    setCurrStep?: (step: number) => void;
    onWhiteScreen?: (show: boolean) => void;
}

export const Step4: React.FC<Step4Props> = ({ setCurrStep, onWhiteScreen }) => {
    const [animationPhase, setAnimationPhase] = React.useState<'starting' | 'approaching' | 'white' | 'finished'>('starting');
    const hasStarted = React.useRef(false);

    React.useEffect(() => {
        // Prevenir múltiplas execuções
        if (hasStarted.current) return;
        hasStarted.current = true;

        console.log('🎬 Iniciando Step4 animation sequence');

        // Iniciar animação após 0.5 segundo (posicionamento rápido)
        const startTimer = setTimeout(() => {
            console.log('🚀 Step4: Starting approach');
            setAnimationPhase('approaching');
        }, 500);

        // Fase 1: Asteroide se aproximando (5 segundos - animação mais rápida e dramática)
        const approachTimer = setTimeout(() => {
            console.log('💥 Step4: Impact - showing white screen');
            setAnimationPhase('white');
            // Avisar o App.tsx para mostrar tela branca
            if (onWhiteScreen) {
                onWhiteScreen(true);
            }
        }, 5500); // 0.5 + 5 segundos de aproximação

        // Fase 2: Tela branca (2 segundos após impacto - mais longa)
        const whiteScreenTimer = setTimeout(() => {
            console.log('✨ Step4: Hiding white screen');
            setAnimationPhase('finished');
            // Avisar o App.tsx para esconder tela branca
            if (onWhiteScreen) {
                onWhiteScreen(false);
            }
        }, 7500); // 5.5 + 2 segundos de tela branca

        // Fase 3: Avançar para próximo step (2 segundos após tela branca)
        const nextStepTimer = setTimeout(() => {
            console.log('🎯 Step4: Advancing to Step5');
            if (setCurrStep) {
                setCurrStep(5);
            }
        }, 9500); // 7.5 + 2 segundos para transição natural

        return () => {
            console.log('🧹 Step4: Cleaning up timers');
            clearTimeout(startTimer);
            clearTimeout(approachTimer);
            clearTimeout(whiteScreenTimer);
            clearTimeout(nextStepTimer);

            // Reset do estado da tela branca quando o componente for desmontado
            if (onWhiteScreen) {
                onWhiteScreen(false);
            }
        };
    }, []); // Dependências vazias para executar apenas uma vez

    // Cleanup adicional quando o componente for desmontado
    React.useEffect(() => {
        return () => {
            console.log('🔄 Step4: Component unmounting');
            hasStarted.current = false;
            if (onWhiteScreen) {
                onWhiteScreen(false);
            }
        };
    }, [onWhiteScreen]);

    return null;
};