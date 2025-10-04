import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Card } from './ui/card';
import { Play, Pause, RotateCcw, FastForward, Rewind } from 'lucide-react';

interface TimeControlsProps {
    currentTime: Date;
    onTimeChange: (newTime: Date) => void;
    isPlaying?: boolean;
    onPlayToggle?: () => void;
    timeSpeed?: number; // velocidade em dias por segundo
    onSpeedChange?: (speed: number) => void;
}

export function TimeControls({
    currentTime,
    onTimeChange,
    isPlaying = false,
    onPlayToggle,
    timeSpeed = 1,
    onSpeedChange
}: TimeControlsProps) {
    const [baseTime] = useState(new Date()); // Tempo base (hoje)
    const [dayOffset, setDayOffset] = useState(0); // Offset em dias

    // Calcular offset baseado no tempo atual
    useEffect(() => {
        const diffMs = currentTime.getTime() - baseTime.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        setDayOffset(diffDays);
    }, [currentTime, baseTime]);

    // Animação automática quando está tocando
    useEffect(() => {
        if (!isPlaying || !onPlayToggle) return;

        const interval = setInterval(() => {
            const newTime = new Date(currentTime.getTime() + timeSpeed * 24 * 60 * 60 * 1000);
            onTimeChange(newTime);
        }, 100); // Atualiza a cada 100ms

        return () => clearInterval(interval);
    }, [isPlaying, currentTime, timeSpeed, onTimeChange]);

    const handleSliderChange = (value: number[]) => {
        const newOffset = value[0];
        setDayOffset(newOffset);
        const newTime = new Date(baseTime.getTime() + newOffset * 24 * 60 * 60 * 1000);
        onTimeChange(newTime);
    };

    const resetToNow = () => {
        onTimeChange(new Date());
    };

    const jumpDays = (days: number) => {
        const newTime = new Date(currentTime.getTime() + days * 24 * 60 * 60 * 1000);
        onTimeChange(newTime);
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDayOffset = (offset: number) => {
        if (Math.abs(offset) < 1) {
            const hours = Math.round(offset * 24);
            return `${hours > 0 ? '+' : ''}${hours}h`;
        }
        const days = Math.round(offset);
        return `${days > 0 ? '+' : ''}${days}d`;
    };

    return (
        <Card className="p-4 bg-card/95 backdrop-blur-sm border-border/50">
            <div className="space-y-4">
                {/* Display de data atual */}
                <div className="text-center">
                    <div className="text-sm font-medium">
                        {formatDate(currentTime)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                        {dayOffset === 0 ? 'Agora' : formatDayOffset(dayOffset)}
                    </div>
                </div>

                {/* Slider de tempo */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>-365d</span>
                        <span>Hoje</span>
                        <span>+365d</span>
                    </div>
                    <Slider
                        value={[dayOffset]}
                        onValueChange={handleSliderChange}
                        min={-365}
                        max={365}
                        step={0.1}
                        className="w-full"
                    />
                </div>

                {/* Controles de reprodução */}
                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => jumpDays(-30)}
                        title="Voltar 30 dias"
                    >
                        <Rewind className="w-4 h-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => jumpDays(-1)}
                        title="Voltar 1 dia"
                    >
                        -1d
                    </Button>

                    {onPlayToggle && (
                        <Button
                            variant={isPlaying ? "default" : "outline"}
                            size="sm"
                            onClick={onPlayToggle}
                            title={isPlaying ? "Pausar" : "Reproduzir"}
                        >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => jumpDays(1)}
                        title="Avançar 1 dia"
                    >
                        +1d
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => jumpDays(30)}
                        title="Avançar 30 dias"
                    >
                        <FastForward className="w-4 h-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={resetToNow}
                        title="Voltar para agora"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </Button>
                </div>

                {/* Controle de velocidade (se disponível) */}
                {onSpeedChange && (
                    <div className="space-y-2">
                        <div className="text-xs text-center text-muted-foreground">
                            Velocidade: {timeSpeed}x
                        </div>
                        <Slider
                            value={[timeSpeed]}
                            onValueChange={(value: number[]) => onSpeedChange(value[0])}
                            min={0.1}
                            max={10}
                            step={0.1}
                            className="w-full"
                        />
                    </div>
                )}

                {/* Atalhos rápidos */}
                <div className="grid grid-cols-3 gap-1 text-xs">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => jumpDays(-7)}
                        className="text-xs"
                    >
                        -1 sem
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetToNow}
                        className="text-xs"
                    >
                        Hoje
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => jumpDays(7)}
                        className="text-xs"
                    >
                        +1 sem
                    </Button>
                </div>
            </div>
        </Card>
    );
}