interface MultiImpactLegendProps {
    isVisible: boolean;
}

export function MultiImpactLegend({ isVisible }: MultiImpactLegendProps) {
    if (!isVisible) return null;

    return (
        <div className="absolute bottom-4 left-4 bg-black/95 text-white p-4 rounded-lg text-sm z-20 border border-gray-600 max-w-sm">
            <h3 className="font-bold mb-3 text-yellow-400">🔬 Zonas Científicas de Impacto</h3>

            <div className="space-y-2 text-xs">
                {/* Onda de choque atmosférica */}
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full border-2 border-yellow-400 border-dashed flex-shrink-0"></div>
                    <div>
                        <div className="font-semibold text-yellow-300">Onda de Choque (1 PSI)</div>
                        <div className="text-gray-300">R = 0.73 × (energia)^0.4 km</div>
                        <div className="text-gray-400 text-[10px]">Collins et al. (2005)</div>
                    </div>
                </div>

                {/* Zona térmica */}
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-orange-600/30 border border-orange-600 flex-shrink-0"></div>
                    <div>
                        <div className="font-semibold text-orange-300">Zona Térmica (3º grau)</div>
                        <div className="text-gray-300">R = 1.2 × (energia)^0.4 km</div>
                        <div className="text-gray-400 text-[10px]">Glasstone & Dolan</div>
                    </div>
                </div>

                {/* Zona sísmica */}
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-700/30 border border-amber-700 flex-shrink-0"></div>
                    <div>
                        <div className="font-semibold text-amber-300">Zona Sísmica (Mag 4+)</div>
                        <div className="text-gray-300">R = 2.5 × (energia)^0.25 km</div>
                        <div className="text-gray-400 text-[10px]">NASA Impact Assessment</div>
                    </div>
                </div>

                {/* Zona de ejecta */}
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-600/50 border border-red-600 flex-shrink-0"></div>
                    <div>
                        <div className="font-semibold text-red-300">Zona de Ejecta</div>
                        <div className="text-gray-300">3.5× raio da cratera</div>
                        <div className="text-gray-400 text-[10px]">Melosh (1989)</div>
                    </div>
                </div>

                {/* Cratera física */}
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-900/80 border-2 border-red-950 flex-shrink-0"></div>
                    <div>
                        <div className="font-semibold text-red-200">Cratera Física</div>
                        <div className="text-gray-300">Backend: crater_diameter_km</div>
                        <div className="text-gray-400 text-[10px]">Dados diretos (precisos)</div>
                    </div>
                </div>

                {/* Ponto central */}
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-100 border border-red-900 flex-shrink-0"></div>
                    <div>
                        <div className="font-semibold text-red-200">Ponto de Impacto</div>
                        <div className="text-gray-300">Local exato</div>
                    </div>
                </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-600">
                <div className="text-xs text-gray-400">
                    � <strong>Fontes Científicas:</strong><br />
                    • Nuclear Weapon Effects (1977)<br />
                    • Crater Scaling Laws (1989)<br />
                    • Earth Impact Effects (2005)<br />
                    • NASA Risk Assessment
                </div>
            </div>
        </div>
    );
}