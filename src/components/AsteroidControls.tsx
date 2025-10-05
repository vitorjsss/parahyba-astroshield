import { useState } from "react";
import { AsteroidParams } from "../types/AsteroidTypes";
import { Target, Zap, Globe2 } from "lucide-react";
import { InfoTooltip } from "./InfoTooltip";
import "../styles/AsteroidControls.css";

interface AsteroidControlsProps {
  onSimulate: (params: AsteroidParams) => void;
  impactPoint: [number, number] | null;
}

export function AsteroidControls({
  onSimulate,
  impactPoint,
}: AsteroidControlsProps) {
  const [diameter, setDiameter] = useState([100]);
  const [velocity, setVelocity] = useState([20]);
  const [density, setDensity] = useState([3000]);
  const [activeTab, setActiveTab] = useState<
    "asteroid" | "impact" | "mitigation"
  >("asteroid");

  // Mitigation states
  const [leadTime, setLeadTime] = useState(10);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [mitigationData, setMitigationData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = () => {
    const params = {
      diameter: diameter[0],
      velocity: velocity[0],
      density: density[0],
    } as const;
    onSimulate(params);
  };

  // Calculate impact energy (simplified)
  const mass = (4 / 3) * Math.PI * Math.pow(diameter[0] / 2, 3) * density[0];
  const energyJoules = 0.5 * mass * Math.pow(velocity[0] * 1000, 2);
  const energyMegatons = energyJoules / (4.184 * Math.pow(10, 15));

  const tabs = [
    { key: "asteroid", label: "Asteroid", icon: Globe2 },
    { key: "impact", label: "Impact", icon: Zap },
    { key: "mitigation", label: "Mitigation", icon: Target },
  ];

  // --- FETCH DATA FROM BACKEND ---
  const fetchMitigationData = async (strategy: string) => {
    if (!impactPoint) {
      alert("Select an impact location first in 2D Map!");
      return;
    }

    setLoading(true);
    setSelectedStrategy(strategy);

    try {
      const [lon, lat] = impactPoint;

      const response = await fetch(
        `https://backend-challenge-nasa-space-apps-2025-dark-tree-2941.fly.dev/impact/${leadTime}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            diameter_m: diameter[0],
            velocity_kms: velocity[0],
            density_kg_m3: density[0],
            lat,
            lon,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();
      setMitigationData(data);
    } catch (err) {
      console.error("Error fetching mitigation data:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ac-card">
      <h2 className="ac-title">Asteroid Impact Simulator</h2>

      {/* Tabs */}
      <div className="ac-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`ac-tab ${activeTab === tab.key ? "active" : ""}`}
            >
              <Icon className="ac-tab-icon" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="ac-content" style={{ paddingTop: "10px" }}>
        {activeTab === "asteroid" && (
          <div className="ac-section">
            {[
              {
                label: "Diameter (m)",
                value: diameter,
                setter: setDiameter,
                min: 10,
                max: 1000,
                step: 10,
                tooltip:
                  "Asteroid's diameter in meters — larger means more impact energy.",
              },
              {
                label: "Velocity (km/s)",
                value: velocity,
                setter: setVelocity,
                min: 5,
                max: 70,
                step: 1,
                tooltip: "Entry speed of the asteroid in Earth's atmosphere.",
              },
              {
                label: "Density (kg/m³)",
                value: density,
                setter: setDensity,
                min: 1000,
                max: 8000,
                step: 100,
                tooltip: "Material density (rock, iron, ice, etc.).",
              },
            ].map((item, idx) => (
              <div className="ac-slider-group" key={idx}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    verticalAlign: "middle",
                  }}
                >
                  <InfoTooltip
                    content={item.tooltip}
                    size="md"
                    position="right"
                  />
                  {item.label}: {item.value}
                </label>
                <input
                  type="range"
                  min={item.min}
                  max={item.max}
                  step={item.step}
                  value={item.value[0]}
                  onChange={(e) => item.setter([Number(e.target.value)])}
                  className="ac-slider"
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === "impact" && (
          <div className="ac-section">
            <div className="ac-box">
              <h3>Impact Energy</h3>
              <p>{energyMegatons.toFixed(2)} megatons TNT</p>
              <p>
                {energyMegatons < 1
                  ? "Small local impact"
                  : energyMegatons < 100
                  ? "Regional devastation"
                  : "Global catastrophe"}
              </p>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  verticalAlign: "middle",
                }}
              >
                <InfoTooltip
                  content="Energy released upon collision, expressed in megatons of TNT."
                  size="md"
                  position="right"
                />
                Impact Energy
              </label>
              <p>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    verticalAlign: "middle",
                  }}
                >
                  <InfoTooltip
                    content="Converts released energy into megatons of TNT for easier understanding."
                    size="md"
                    position="right"
                  />
                  {energyMegatons.toFixed(2)} megatons TNT
                </label>
              </p>
              <p>
                {energyMegatons < 1
                  ? "Small local impact"
                  : energyMegatons < 100
                  ? "Regional devastation"
                  : "Global catastrophe"}
              </p>
            </div>

            <div className="ac-box">
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  verticalAlign: "middle",
                }}
              >
                <InfoTooltip
                  content="Latitude and longitude of the impact center."
                  size="md"
                  position="right"
                />
                Impact Location
              </label>
              {impactPoint ? (
                <p>
                  Lat: {impactPoint[1].toFixed(4)}, Lon:{" "}
                  {impactPoint[0].toFixed(4)}
                </p>
              ) : (
                <p>Click on the map to set impact location</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "mitigation" && (
          <div className="ac-section">
            <h3>
              Deflection Strategies
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  verticalAlign: "middle",
                }}
              >
                <InfoTooltip
                  content="Techniques to deflect the asteroid and prevent impact."
                  size="lg"
                  position="bottom"
                />
              </label>
            </h3>
            <p>Simulate methods to alter trajectory and prevent impact.</p>

            <div className="ac-slider-group">
              <label>Lead Time (years): {leadTime}</label>
              <input
                type="range"
                min={1}
                max={50}
                step={1}
                value={leadTime}
                onChange={(e) => setLeadTime(Number(e.target.value))}
                className="ac-slider"
              />
            </div>

            <div className="ac-button-group">
              {["kinetic", "gravity_tractor", "nuclear"].map((strategy) => (
                <button
                  key={strategy}
                  onClick={() => fetchMitigationData(strategy)}
                  className={`ac-strategy-btn ${
                    selectedStrategy === strategy ? "active" : ""
                  }`}
                  disabled={loading}
                >
                  {strategy === "kinetic"
                    ? "Kinetic Impactor"
                    : strategy === "gravity_tractor"
                    ? "Gravity Tractor"
                    : "Nuclear Deflection"}
                </button>
              ))}
            </div>

            {loading && <p>Loading mitigation data...</p>}

            {mitigationData && selectedStrategy === "kinetic" && (
              <div className="ac-box">
                <h3>Kinetic Impactor Results</h3>
                <p>
                  To deflect the asteroid ({diameter[0]}m, {velocity[0]} km/s),
                  a total of{" "}
                  <strong>
                    {mitigationData.kinetic.impactors_needed_for_req}
                  </strong>{" "}
                  impactors would be required, each with a mass of{" "}
                  {mitigationData.kinetic.impactor_mass_fixed_kg} kg traveling
                  at {mitigationData.kinetic.impactor_speed_kms} km/s.
                </p>
                <p>
                  This strategy works by colliding spacecraft into the asteroid
                  to change its velocity by
                  <strong>
                    {" "}
                    {mitigationData.kinetic.delta_v_per_impactor_mps.toFixed(
                      6
                    )}{" "}
                    m/s
                  </strong>{" "}
                  per impactor.
                </p>
              </div>
            )}

            {mitigationData && selectedStrategy === "gravity_tractor" && (
              <div className="ac-box">
                <h3>Gravity Tractor Results</h3>
                <p>
                  Using a spacecraft of{" "}
                  {mitigationData.gravity_tractor.spacecraft_mass_fixed_kg} kg
                  hovering near the asteroid, the total delta-v achieved would
                  be{" "}
                  <strong>
                    {mitigationData.gravity_tractor.delta_v_with_fixed_mps.toFixed(
                      6
                    )}{" "}
                    m/s
                  </strong>
                  .
                </p>
                <p>
                  {mitigationData.gravity_tractor.meets_requirement
                    ? "This approach is sufficient for the required deflection."
                    : "This approach would not achieve the required deflection with the current parameters."}
                </p>
              </div>
            )}

            {mitigationData && selectedStrategy === "nuclear" && (
              <div className="ac-box">
                <h3>Nuclear Deflection Results</h3>
                <p>
                  A standoff explosion at{" "}
                  {mitigationData.nuclear.standoff_R_factor} asteroid radii
                  would require a nuclear yield of approximately{" "}
                  <strong>
                    {mitigationData.nuclear.yield_required_megatons.toFixed(2)}{" "}
                    megatons
                  </strong>
                  to meet the deflection target.
                </p>
                <p>
                  This method uses the momentum from a nuclear explosion to push
                  the asteroid off its impact trajectory.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      {activeTab !== "mitigation" && (
        <button
          onClick={handleSimulate}
          disabled={!impactPoint}
          className={`ac-simulate-btn ${!impactPoint ? "disabled" : ""}`}
        >
          {impactPoint ? "Calculate Impact Effects" : "Select Impact Location"}
        </button>
      )}
    </div>
  );
}

export type { AsteroidParams };
