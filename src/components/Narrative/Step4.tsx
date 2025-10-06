import React from 'react';

interface Step4Props {
    setCurrStep?: (step: number) => void;
    onWhiteScreen?: (show: boolean) => void;
}

export const Step4: React.FC<Step4Props> = ({ setCurrStep, onWhiteScreen }) => {
    const [animationPhase, setAnimationPhase] = React.useState<'starting' | 'approaching' | 'white' | 'finished'>('starting');

    React.useEffect(() => {
        // Iniciar animação após 2 segundos (tempo para camera se posicionar)
        const startTimer = setTimeout(() => {
            setAnimationPhase('approaching');
        }, 2000);

        // Fase 1: Asteroide se aproximando (8 segundos após o início)
        const approachTimer = setTimeout(() => {
            setAnimationPhase('white');
            // Avisar o App.tsx para mostrar tela branca
            if (onWhiteScreen) {
                onWhiteScreen(true);
            }
        }, 6000); // 2 + 8 segundos

        // Fase 2: Tela branca (3 segundos após os 7 iniciais para dar tempo da animação)
        const whiteScreenTimer = setTimeout(() => {
            setAnimationPhase('finished');
            // Avisar o App.tsx para esconder tela branca
            if (onWhiteScreen) {
                onWhiteScreen(false);
            }
            // Avançar para próximo step
            if (setCurrStep) {
                setCurrStep(5);
            }
        }, 9000); // 7 + 3 segundos

        return () => {
            clearTimeout(startTimer);
            clearTimeout(approachTimer);
            clearTimeout(whiteScreenTimer);
        };
    }, [setCurrStep, onWhiteScreen]);

    return null;
};