import React, { ReactNode } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import './TutorialModal.css';

interface TutorialStep {
    id: number;
    title: string;
    content: ReactNode; // Permite qualquer componente React
    image?: string;
}

interface TutorialModalProps {
    isVisible: boolean;
    onClose: () => void;
    steps: TutorialStep[];
    currentStep: number;
    onNextStep: () => void;
    onPrevStep: () => void;
    onFinish: () => void;
    showNavigation?: boolean; // Permite esconder navegação se necessário
    showSkip?: boolean; // Permite esconder botão de pular
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
    isVisible,
    onClose,
    steps,
    currentStep,
    onNextStep,
    onPrevStep,
    onFinish,
    showNavigation = true,
    showSkip = true
}) => {
    if (!isVisible) return null;

    const current = steps[currentStep];
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === steps.length - 1;

    const handleOverlayClick = (e: React.MouseEvent) => {
        // Prevent closing when clicking on the modal content
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="tutorial-modal-overlay" onClick={handleOverlayClick}>
            <div className="tutorial-modal-container">
                {/* Header */}
                <div className="tutorial-modal-header">
                    <h2 className="tutorial-modal-title">{current?.title}</h2>
                    <button
                        className="tutorial-modal-close-btn"
                        onClick={onClose}
                        aria-label="Fechar tutorial"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="tutorial-modal-content">
                    {current?.image && (
                        <div className="tutorial-modal-image">
                            <img src={current.image} alt={current.title} />
                        </div>
                    )}
                    <div className="tutorial-modal-text">
                        {/* Renderizar conteúdo como componente React */}
                        {typeof current?.content === 'string' ? (
                            <p>{current.content}</p>
                        ) : (
                            current?.content
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="tutorial-modal-footer">
                    {/* Step indicators - só mostra se há navegação e múltiplos steps */}
                    {showNavigation && steps.length > 1 && (
                        <div className="tutorial-modal-indicators">
                            {steps.map((_, index) => (
                                <div
                                    key={index}
                                    className={`tutorial-modal-indicator ${index === currentStep ? 'active' : ''
                                        } ${index < currentStep ? 'completed' : ''}`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Navigation buttons */}
                    {showNavigation && steps.length > 1 && (
                        <div className="tutorial-modal-navigation">
                            <button
                                className="tutorial-modal-btn tutorial-modal-btn-secondary"
                                onClick={onPrevStep}
                                disabled={isFirstStep}
                            >
                                <ChevronLeft size={20} />
                                Anterior
                            </button>

                            {isLastStep ? (
                                <button
                                    className="tutorial-modal-btn tutorial-modal-btn-primary"
                                    onClick={onFinish}
                                >
                                    Finalizar
                                </button>
                            ) : (
                                <button
                                    className="tutorial-modal-btn tutorial-modal-btn-primary"
                                    onClick={onNextStep}
                                >
                                    Próximo
                                    <ChevronRight size={20} />
                                </button>
                            )}
                        </div>
                    )}

                    {/* Se não há navegação, mostrar apenas botão de fechar */}
                    {(!showNavigation || steps.length === 1) && (
                        <div className="tutorial-modal-navigation">
                            <button
                                className="tutorial-modal-btn tutorial-modal-btn-primary"
                                onClick={onClose}
                            >
                                Fechar
                            </button>
                        </div>
                    )}

                    {/* Skip tutorial */}
                    {showSkip && showNavigation && steps.length > 1 && (
                        <div className="tutorial-modal-skip">
                            <button
                                className="tutorial-modal-skip-btn"
                                onClick={onClose}
                            >
                                Pular tutorial
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TutorialModal;