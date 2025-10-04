export type ImpactApiContext = {
    population_estimated_affected: number;
    buildings_within_m: number;
    buildings_count: number;
};

export type ImpactApiResult = {
    velocity_kms: number;
    mass_kg: number;
    energy_megatons_tnt: number;
    crater_diameter_km: number;
    seismic_magnitude: number;
    context?: ImpactApiContext;
};

const BASE = 'https://backend-challenge-nasa-space-apps-2025-dark-tree-2941.fly.dev';

export async function simulateCustomImpact(input: {
    diameter_m: number;
    velocity_kms: number;
    density_kg_m3: number;
    lat: number;
    lon: number;
}): Promise<ImpactApiResult> {
    const res = await fetch(`${BASE}/impact/custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`API error ${res.status}: ${text}`);
    }
    const rawResult = await res.json() as Omit<ImpactApiResult, 'seismic_magnitude'>;
    // Calculate seismic magnitude based on energy (simplified formula)
    const seismic_magnitude = Math.log10(rawResult.energy_megatons_tnt * 4.184e15) / 1.5 - 6.07;
    const result: ImpactApiResult = {
        ...rawResult,
        seismic_magnitude: Math.max(0, seismic_magnitude) // Ensure positive
    };
    console.log(result);
    return result;
}

export async function simulateAsteroidImpact(params: {
    asteroidId: string | number;
    lat: number;
    lon: number;
}): Promise<ImpactApiResult> {
    const { asteroidId, lat, lon } = params;
    const url = `${BASE}/impact/simulate/${asteroidId}?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
    const res = await fetch(url);
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`API error ${res.status}: ${text}`);
    }
    const rawResult = await res.json() as Omit<ImpactApiResult, 'seismic_magnitude'>;
    // Calculate seismic magnitude based on energy (simplified formula)
    const seismic_magnitude = Math.log10(rawResult.energy_megatons_tnt * 4.184e15) / 1.5 - 6.07;
    const result: ImpactApiResult = {
        ...rawResult,
        seismic_magnitude: Math.max(0, seismic_magnitude) // Ensure positive
    };
    console.log(result);
    return result;
}