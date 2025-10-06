import React from 'react';
import { AlertTriangle, Skull, Zap, Globe, Calendar, Ruler, Gauge } from 'lucide-react';
import { NASAAsteroid } from '../types/nasa';

// Dados do asteroide real perigoso (2021 ED5)
export const DANGEROUS_ASTEROID: NASAAsteroid = {
    links: {
        self: "https://api.nasa.gov/neo/rest/v1/neo/54131736"
    },
    id: "54131736",
    neo_reference_id: "54131736",
    name: "(2021 ED5)",
    nasa_jpl_url: "https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=54131736",
    absolute_magnitude_h: 20.16,
    estimated_diameter: {
        kilometers: {
            estimated_diameter_min: 0.2469192656,
            estimated_diameter_max: 0.5521282628
        },
        meters: {
            estimated_diameter_min: 246.9192656061,
            estimated_diameter_max: 552.1282628496
        },
        miles: {
            estimated_diameter_min: 0.153, // Convertido de metros
            estimated_diameter_max: 0.343
        },
        feet: {
            estimated_diameter_min: 810.1, // Convertido de metros
            estimated_diameter_max: 1811.4
        }
    },
    is_potentially_hazardous_asteroid: true,
    is_sentry_object: false, // Não especificado nos dados reais
    close_approach_data: [{
        close_approach_date: "2025-10-06",
        close_approach_date_full: "2025-Oct-06 06:08 UT",
        epoch_date_close_approach: 1728192480000, // Convertido para timestamp
        relative_velocity: {
            kilometers_per_second: "22.1815270319",
            kilometers_per_hour: "79853.4973147324",
            miles_per_hour: "49617.8578175902"
        },
        miss_distance: {
            astronomical: "0.0728452984",
            lunar: "28.3368210776",
            kilometers: "10897501.480154408",
            miles: "6771393.4260825104"
        },
        orbiting_body: "Earth"
    }]
};

// Dados adicionais de impacto calculados para o asteroide real
export const DANGEROUS_ASTEROID_IMPACT_DATA = {
    velocity_kms: 17.11,
    mass_kg: 100172318941.3426,
    energy_megatons_tnt: 3503.5,
    crater_diameter_km: 14.91,
    crater_depth_km: 1.4895116984567887,
    crater_radius_km: 0.57,
    energy_joules: 760586662931782.9,
    magnitude_estimate_range: [2.72, 3.39, 4.05],
    felt_radius_km_est: 50,
    context: {
        elevation_m: "9.859071732",
        population_estimated_affected: 12429,
        buildings_within_m: 7454.91,
        buildings_count: 153541
    }
};

// Componente para exibir informações do asteroide perigoso
export const DangerousAsteroidProfile: React.FC = () => {
    const asteroid = DANGEROUS_ASTEROID;
    const approach = asteroid.close_approach_data[0];

    // Cálculos de impacto usando dados reais
    const diameter = asteroid.estimated_diameter.meters.estimated_diameter_max;
    const velocity = parseFloat(approach.relative_velocity.kilometers_per_second);

    // Usar dados reais de impacto quando disponíveis
    const realImpactData = DANGEROUS_ASTEROID_IMPACT_DATA;
    const megatonsTNT = realImpactData.energy_megatons_tnt;
    const craterDiameterKm = realImpactData.crater_diameter_km;
    const feltRadiusKm = realImpactData.felt_radius_km_est;

    const impactData = {
        craterDiameter: craterDiameterKm * 1000, // Converter para metros para compatibilidade
        devastationRadius: feltRadiusKm, // Usar raio real calculado
        globalEffects: megatonsTNT > 1000, // Ajustar threshold para dados reais
        extinctionLevel: false, // Este asteroide não causaria extinção
        buildingsAffected: realImpactData.context.buildings_count,
        populationAffected: realImpactData.context.population_estimated_affected
    };

    return (
        <div style={{
            background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #450a0a 100%)',
            padding: '24px',
            borderRadius: '16px',
            border: '2px solid #dc2626',
            boxShadow: '0 0 30px rgba(220, 38, 38, 0.5)',
            color: '#fef2f2'
        }}>
            {/* Header de Alerta */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px',
                background: 'rgba(220, 38, 38, 0.2)',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #dc2626'
            }}>
                <AlertTriangle size={32} color="#fca5a5" />
                <div>
                    <h2 style={{ margin: '0 0 4px 0', color: '#fca5a5', fontSize: '24px' }}>
                        ⚠️ ALERTA DE IMPACTO - ASTEROIDE REAL
                    </h2>
                    <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
                        Asteroide Potencialmente Perigoso (2021 ED5) Detectado
                    </p>
                </div>
                <Skull size={32} color="#dc2626" />
            </div>

            {/* Informações Básicas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(220, 38, 38, 0.3)'
                }}>
                    <h3 style={{ color: '#fca5a5', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Globe size={20} />
                        Identificação
                    </h3>
                    <p><strong>Nome:</strong> {asteroid.name}</p>
                    <p><strong>Código:</strong> {asteroid.id}</p>
                    <p><strong>Status:</strong> <span style={{ color: '#dc2626' }}>POTENCIALMENTE PERIGOSO</span></p>
                    <p><strong>Magnitude:</strong> <span style={{ color: '#fbbf24' }}>{asteroid.absolute_magnitude_h}</span></p>
                </div>

                <div style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(220, 38, 38, 0.3)'
                }}>
                    <h3 style={{ color: '#fca5a5', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Ruler size={20} />
                        Dimensões
                    </h3>
                    <p><strong>Diâmetro:</strong> {diameter.toFixed(1)} metros</p>
                    <p><strong>Faixa:</strong> {asteroid.estimated_diameter.meters.estimated_diameter_min.toFixed(1)} - {asteroid.estimated_diameter.meters.estimated_diameter_max.toFixed(1)} m</p>
                    <p><strong>Comparação:</strong> <span style={{ color: '#fbbf24' }}>Tamanho de um estádio de futebol</span></p>
                    <p><strong>Classe:</strong> <span style={{ color: '#dc2626' }}>MÉDIO-GRANDE</span></p>
                </div>

                <div style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(220, 38, 38, 0.3)'
                }}>
                    <h3 style={{ color: '#fca5a5', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Gauge size={20} />
                        Velocidade & Energia
                    </h3>
                    <p><strong>Velocidade:</strong> {velocity.toFixed(1)} km/s</p>
                    <p><strong>Energia:</strong> {megatonsTNT.toLocaleString()} MT TNT</p>
                    <p><strong>Comparação:</strong> <span style={{ color: '#dc2626' }}>{(megatonsTNT / 0.015).toFixed(0)}x bomba de Hiroshima</span></p>
                    <p><strong>Impacto:</strong> <span style={{ color: '#f59e0b' }}>DEVASTAÇÃO REGIONAL</span></p>
                </div>

                <div style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(220, 38, 38, 0.3)'
                }}>
                    <h3 style={{ color: '#fca5a5', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={20} />
                        Aproximação
                    </h3>
                    <p><strong>Data:</strong> {approach.close_approach_date}</p>
                    <p><strong>Horário:</strong> 06:08 UTC</p>
                    <p><strong>Distância:</strong> {parseInt(approach.miss_distance.kilometers).toLocaleString()} km</p>
                    <p><strong>Status:</strong> <span style={{ color: '#f59e0b' }}>PROXIMIDADE SEGURA</span></p>
                </div>
            </div>

            {/* Cenários de Impacto */}
            <div style={{
                background: 'rgba(220, 38, 38, 0.1)',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #dc2626',
                marginBottom: '20px'
            }}>
                <h3 style={{ color: '#fca5a5', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={24} />
                    CENÁRIOS DE IMPACTO REGIONAL
                </h3>

                <div style={{ display: 'grid', gap: '16px' }}>
                    <div style={{
                        background: 'rgba(0, 0, 0, 0.4)',
                        padding: '16px',
                        borderRadius: '8px',
                        borderLeft: '4px solid #dc2626'
                    }}>
                        <h4 style={{ color: '#fbbf24', margin: '0 0 8px 0' }}>🎯 Impacto Direto</h4>
                        <p style={{ margin: '4px 0' }}>• Cratera: {craterDiameterKm.toFixed(1)} km de diâmetro</p>
                        <p style={{ margin: '4px 0' }}>• Área devastada: {feltRadiusKm} km de raio</p>
                        <p style={{ margin: '4px 0' }}>• {impactData.buildingsAffected.toLocaleString()} edifícios destruídos</p>
                        <p style={{ margin: '4px 0' }}>• {impactData.populationAffected.toLocaleString()} pessoas potencialmente afetadas</p>
                    </div>

                    <div style={{
                        background: 'rgba(0, 0, 0, 0.4)',
                        padding: '16px',
                        borderRadius: '8px',
                        borderLeft: '4px solid #f59e0b'
                    }}>
                        <h4 style={{ color: '#fbbf24', margin: '0 0 8px 0' }}>�️ Efeitos Regionais</h4>
                        <p style={{ margin: '4px 0' }}>• Terremotos de magnitude {realImpactData.magnitude_estimate_range[1].toFixed(1)} localmente</p>
                        <p style={{ margin: '4px 0' }}>• Tremores perceptíveis em {realImpactData.felt_radius_km_est} km de raio</p>
                        <p style={{ margin: '4px 0' }}>• Chuva de detritos em área urbana</p>
                        <p style={{ margin: '4px 0' }}>• Incêndios secundários na região</p>
                    </div>

                    <div style={{
                        background: 'rgba(0, 0, 0, 0.4)',
                        padding: '16px',
                        borderRadius: '8px',
                        borderLeft: '4px solid #059669'
                    }}>
                        <h4 style={{ color: '#34d399', margin: '0 0 8px 0' }}>🌍 Impacto Global</h4>
                        <p style={{ margin: '4px 0' }}>• Sem efeitos climáticos globais significativos</p>
                        <p style={{ margin: '4px 0' }}>• Evento detectável globalmente</p>
                        <p style={{ margin: '4px 0' }}>• Comparável a grandes explosões industriais</p>
                        <p style={{ margin: '4px 0' }}>• Civilização global permanece intacta</p>
                    </div>
                </div>
            </div>

            {/* Timeline de Eventos */}
            <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(220, 38, 38, 0.3)'
            }}>
                <h3 style={{ color: '#fca5a5', margin: '0 0 16px 0' }}>⏰ TIMELINE DO IMPACTO REGIONAL</h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                    <div style={{ borderLeft: '3px solid #dc2626', paddingLeft: '12px' }}>
                        <strong style={{ color: '#fbbf24' }}>T-0:</strong> Impacto - Flash luminoso visível a centenas de km
                    </div>
                    <div style={{ borderLeft: '3px solid #f59e0b', paddingLeft: '12px' }}>
                        <strong style={{ color: '#fbbf24' }}>T+5s:</strong> Onda de choque - edifícios destruídos em {craterDiameterKm.toFixed(0)} km
                    </div>
                    <div style={{ borderLeft: '3px solid #7c3aed', paddingLeft: '12px' }}>
                        <strong style={{ color: '#a78bfa' }}>T+30s:</strong> Chuva de detritos na região metropolitana
                    </div>
                    <div style={{ borderLeft: '3px solid #059669', paddingLeft: '12px' }}>
                        <strong style={{ color: '#34d399' }}>T+2min:</strong> Tremores sentidos em {feltRadiusKm} km de raio
                    </div>
                    <div style={{ borderLeft: '3px solid #0284c7', paddingLeft: '12px' }}>
                        <strong style={{ color: '#38bdf8' }}>T+10min:</strong> Incêndios secundários se espalham
                    </div>
                    <div style={{ borderLeft: '3px solid #7c2d12', paddingLeft: '12px' }}>
                        <strong style={{ color: '#f97316' }}>T+1h:</strong> Operações de emergência mobilizadas
                    </div>
                </div>
            </div>

            {/* Nota Dramática */}
            <div style={{
                textAlign: 'center',
                marginTop: '24px',
                padding: '16px',
                background: 'rgba(220, 38, 38, 0.2)',
                borderRadius: '8px',
                border: '1px solid #dc2626'
            }}>
                <p style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#fca5a5'
                }}>
                    ⚠️ Este asteroide representa um impacto regional significativo ⚠️
                </p>
                <p style={{
                    margin: '8px 0 0 0',
                    fontSize: '14px',
                    opacity: 0.8
                }}>
                    Um evento devastador comparable ao evento de Tunguska de 1908, mas em área urbana
                </p>
            </div>
        </div>
    );
};

export default DangerousAsteroidProfile;