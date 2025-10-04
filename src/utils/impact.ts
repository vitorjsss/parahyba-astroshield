// Simple impact physics utilities used across the app
// Units:
// - diameter: meters
// - velocity: km/s
// - density: kg/m^3
// - angle: degrees (from horizontal)

export type ImpactParams = {
    diameter: number;
    velocity: number; // km/s
    density: number; // kg/m^3
    angle: number; // degrees
};

export function computeEnergyJ({ diameter, velocity, density, angle }: ImpactParams): number {
    const radius = Math.max(diameter, 0) / 2; // m
    const volume = (4 / 3) * Math.PI * Math.pow(radius, 3); // m^3
    const mass = volume * Math.max(density, 0); // kg
    const v = Math.max(velocity, 0) * 1000; // m/s
    const kinetic = 0.5 * mass * v * v; // J
    // Effective deposited energy scales with sin(angle) (vertical hits deposit more)
    const angleRad = (Math.max(0, Math.min(90, angle)) * Math.PI) / 180;
    const depositionFactor = Math.max(Math.sin(angleRad), 0.3); // keep some floor
    return kinetic * depositionFactor;
}

export function joulesToMegatons(energyJ: number): number {
    return energyJ / (4.184e15);
}

// Basic model that ignores impact angle: depends only on diameter, velocity, density
export function computeEnergyJBasic({ diameter, velocity, density }: Omit<ImpactParams, 'angle'> & { angle?: number }): number {
    const radius = Math.max(diameter, 0) / 2; // m
    const volume = (4 / 3) * Math.PI * Math.pow(radius, 3); // m^3
    const mass = volume * Math.max(density, 0); // kg
    const v = Math.max(velocity, 0) * 1000; // m/s
    return 0.5 * mass * v * v; // J
}

// Very simplified devastation radius model based on nuclear scaling laws:
// R ~ k * E^(1/3). Calibrated so that ~1 Mt => ~4.5 km severe damage radius.
export function computeDamageRadiusKm(params: ImpactParams): number {
    const E_mt = joulesToMegatons(computeEnergyJ(params));
    if (!isFinite(E_mt) || E_mt <= 0) return 0;
    // Slightly increased for asteroid surface energy coupling vs. nominal nuclear scaling
    const k = 6.2; // km per Mt^(1/3) ~5 psi severe damage
    const radius = k * Math.cbrt(E_mt);
    // Clamp to reasonable bounds to avoid absurd UI artifacts
    return Math.max(0.5, Math.min(radius, 1000));
}

export function areaFromRadiusKm(radiusKm: number): number {
    return Math.PI * radiusKm * radiusKm;
}

// Multi-ring damage model with conservative coefficients (km per Mt^(1/3))
// severe ~5 psi (estruturas colapsam), moderate ~3 psi, light ~1 psi, thermal burns
export function computeDamageRingsKm(params: ImpactParams): {
    severe: number;
    moderate: number;
    light: number;
    thermal: number;
} {
    const E_mt = joulesToMegatons(computeEnergyJ(params));
    if (!isFinite(E_mt) || E_mt <= 0) {
        return { severe: 0, moderate: 0, light: 0, thermal: 0 };
    }
    const cbrt = Math.cbrt(E_mt);
    const ring = (k: number) => Math.max(0.5, Math.min(k * cbrt, 1500));
    return {
        severe: ring(6.2),     // ~5 psi
        moderate: ring(9.5),   // ~3 psi
        light: ring(16.0),     // ~1 psi
        thermal: ring(22.0),   // queimaduras severas
    };
}

// Angle-agnostic variants used when we want radius strictly from D, V, density
export function computeDamageRadiusBasicKm(params: Omit<ImpactParams, 'angle'> & { angle?: number }): number {
    const E_mt = joulesToMegatons(computeEnergyJBasic(params));
    if (!isFinite(E_mt) || E_mt <= 0) return 0;
    const k = 7.5; // slightly larger baseline for visibility
    const radius = k * Math.cbrt(E_mt);
    return Math.max(0.5, Math.min(radius, 1500));
}

export function computeDamageRingsBasicKm(params: Omit<ImpactParams, 'angle'> & { angle?: number }): {
    severe: number; moderate: number; light: number; thermal: number;
} {
    const E_mt = joulesToMegatons(computeEnergyJBasic(params));
    if (!isFinite(E_mt) || E_mt <= 0) {
        return { severe: 0, moderate: 0, light: 0, thermal: 0 };
    }
    const cbrt = Math.cbrt(E_mt);
    const ring = (k: number) => Math.max(0.5, Math.min(k * cbrt, 2000));
    return {
        severe: ring(7.5),
        moderate: ring(11.5),
        light: ring(19.0),
        thermal: ring(26.0),
    };
}