import { useState } from 'react';
import { Info } from 'lucide-react';
import '../styles/InfoTooltip.css';

interface InfoTooltipProps {
    content: React.ReactNode; // Aceita texto ou elementos JSX
    size?: 'sm' | 'md' | 'lg'; // Tamanho do círculo
    position?: 'top' | 'bottom' | 'left' | 'right'; // Posição do tooltip
    className?: string;
}

export function InfoTooltip({
    content,
    size = 'md',
    position = 'top',
    className = ''
}: InfoTooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    const sizeClasses = {
        sm: 'w-4 h-4 flex items-center justify-center',
        md: 'w-5 h-5 flex items-center justify-center',
        lg: 'w-6 h-6 flex items-center justify-center'
    };

    const iconSizes = {
        sm: 12,
        md: 14,
        lg: 16
    };

    return (
        <div className={`info-tooltip-wrapper ${className}`}>
            {/* Círculo com ícone "i" */}
            <div
                className={`info-tooltip-trigger ${sizeClasses[size]}`}
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                onFocus={() => setIsVisible(true)}
                onBlur={() => setIsVisible(false)}
                tabIndex={0}
                role="button"
                aria-label="More information"
            >
                <Info size={iconSizes[size]} />
            </div>

            {/* Tooltip branco que aparece ao passar o mouse */}
            {isVisible && (
                <div className={`info-tooltip-content tooltip-${position}`}>
                    <div className="tooltip-arrow" />
                    <div className="tooltip-text">
                        {content}
                    </div>
                </div>
            )}
        </div>
    );
}

export default InfoTooltip;