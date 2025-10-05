import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";
import { UsersIcon } from "lucide-react";
import { NASAAsteroid } from "../types/nasa";

interface WorldMapProps {
  onMapClick?: (coordinates: [number, number]) => void;
  impactPoint?: [number, number] | null;
  selectedAsteroid?: NASAAsteroid | null;
  impactResults?: {
    crater_diameter_km: number;
  };
}

export function WorldMap({ onMapClick, impactPoint, selectedAsteroid, impactResults }: WorldMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [showPopLayer, setShowPopLayer] = useState(false);
  const populationCacheRef = useRef<Record<string, number | null>>({});
  const fetchInProgressRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const rect = svgRef.current.parentElement?.getBoundingClientRect();
        if (rect) setDimensions({ width: rect.width, height: rect.height });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Tooltip
    let tooltip = tooltipRef.current;
    if (!tooltip) {
      const el = document.createElement("div");
      el.style.position = "absolute";
      el.style.pointerEvents = "none";
      el.style.background = "rgba(0,0,0,0.75)";
      el.style.color = "#fff";
      el.style.padding = "6px 8px";
      el.style.borderRadius = "4px";
      el.style.fontSize = "12px";
      el.style.display = "none";
      el.style.zIndex = "9999";
      document.body.appendChild(el);
      tooltipRef.current = el;
      tooltip = el;
    }

    const { width, height } = dimensions;
    const projection = d3
      .geoNaturalEarth1()
      .scale(width / 6)
      .translate([width / 2, height / 2]);
    const path = d3.geoPath().projection(projection);

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform.toString());
      });
    svg.call(zoom as any);

    const g = svg.append("g");
    g.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a1929")
      .attr("opacity", 0.3);

    const graticule = d3.geoGraticule();
    g.append("path")
      .datum(graticule)
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "#334155")
      .attr("stroke-width", 0.5)
      .attr("opacity", 0.3);

    const countriesGroup = g.append("g").attr("class", "countries-group");
    const popGroup = g.append("g").attr("class", "population-layer");

    // Load world map
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then((r) => r.json())
      .then((world: any) => {
        const countries = feature(world, world.objects.countries);
        countriesGroup
          .append("g")
          .selectAll("path")
          .data(countries.features)
          .enter()
          .append("path")
          .attr("d", path as any)
          .attr("fill", "#1e293b")
          .attr("stroke", "#475569")
          .attr("stroke-width", 0.5)
          .attr("class", "country")
          .style("cursor", "pointer")
          .on("mouseover", function () {
            d3.select(this)
              .attr("fill", "#334155")
              .attr("stroke", "#64748b")
              .attr("stroke-width", 1);
          })
          .on("mouseout", function () {
            d3.select(this)
              .attr("fill", "#1e293b")
              .attr("stroke", "#475569")
              .attr("stroke-width", 0.5);
          })
          .on("click", function (event, d: any) {
            const [x, y] = d3.pointer(event, this);
            const coords = projection.invert?.([x, y]);
            if (coords && onMapClick) onMapClick(coords as [number, number]);
          });

        if (showPopLayer) drawPopulationLayer(popGroup, projection);
      })
      .catch((err) => console.error(err));

    // Impact point
    if (impactPoint) {
      const coords = projection(impactPoint);
      if (coords) {
        // Determinar o raio do círculo com base no crater_diameter_km
        // Valor padrão de 50 se não houver seleção ou valor de raio
        let circleRadius = 50;

        // Fator de escala - multiplica o valor em km para obter pixels no mapa
        // Este fator pode ser ajustado conforme necessário para melhor visualização
        const scaleFactor = width / 50;
        const kmToPixelRatio = scaleFactor;

        // Se temos resultados de impacto com diâmetro da cratera, usamos esse valor
        if (impactResults && impactResults.crater_diameter_km) {
          // crater_diameter_km já é o diâmetro completo, precisamos do raio
          const craterRadius = impactResults.crater_diameter_km / 2;

          // Convertemos km para pixels na escala do mapa
          circleRadius = craterRadius * kmToPixelRatio;

          // Garantir um mínimo visível e um máximo razoável
          circleRadius = Math.max(30, Math.min(circleRadius, width / 3));
        }
        // Se não temos os resultados mas temos um asteroide selecionado, fazemos uma estimativa
        else if (selectedAsteroid) {
          // Pegamos o diâmetro médio em metros e convertemos para km
          const asteroidDiameter = (selectedAsteroid.estimated_diameter.meters.estimated_diameter_min +
            selectedAsteroid.estimated_diameter.meters.estimated_diameter_max) / 2 / 1000;

          // Velocidade aproximada em km/s
          const velocity = parseFloat(selectedAsteroid.close_approach_data[0].relative_velocity.kilometers_per_second);

          // Estimativa simples de raio da cratera: 10-20x o diâmetro do asteroide
          // Esta é uma aproximação muito básica
          const estimatedCraterRadius = asteroidDiameter * 15 * (velocity / 20); // Fator de escala com velocidade

          // Ajuste final para pixels no mapa
          circleRadius = estimatedCraterRadius * kmToPixelRatio;

          // Garantir um mínimo visível e um máximo razoável
          circleRadius = Math.max(30, Math.min(circleRadius, width / 3));
        }

        g.append("circle")
          .attr("cx", coords[0])
          .attr("cy", coords[1])
          .attr("r", circleRadius)
          .attr("fill", "#ef4444")
          .attr("opacity", 0.3);
        g.append("circle")
          .attr("cx", coords[0])
          .attr("cy", coords[1])
          .attr("r", 4)
          .attr("fill", "#fef2f2")
          .attr("stroke", "#991b1b")
          .attr("stroke-width", 2);
      }
    }

    svg.on("click", function (event) {
      if (event.target === this || event.target.tagName === "rect") {
        const [x, y] = d3.pointer(event);
        const coords = projection.invert?.([x, y]);
        if (coords && onMapClick) onMapClick(coords as [number, number]);
      }
    });

    // -------------------- Population Layer --------------------
    function drawPopulationLayer(
      popLayerG: d3.Selection<SVGGElement, unknown, null, undefined>,
      proj: any
    ) {
      popLayerG.selectAll("*").remove();

      fetch("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json")
        .then((res) => res.json())
        .then((usTopo: any) => {
          const states = feature(usTopo, usTopo.objects.states) as any;

          // ✨ Adicionar as linhas de fronteira dos estados
          popLayerG
            .append("g")
            .attr("class", "us-states-boundaries")
            .selectAll("path")
            .data(states.features)
            .enter()
            .append("path")
            .attr("d", path as any)
            .attr("fill", "none")
            .attr("stroke", "#ef4444")
            .attr("stroke-width", 0.2)
            .attr("stroke-opacity", 0.4)

          const statePoints = states.features
            .map((f: any) => {
              const c = d3.geoCentroid(f);
              const p = proj(c);
              return {
                id: f.id,
                name:
                  f.properties?.name || f.properties?.NAME || `State ${f.id}`,
                lonlat: c,
                screen: p,
              };
            })
            .filter(
              (d) => d.screen && isFinite(d.screen[0]) && isFinite(d.screen[1])
            );

          const circles = popLayerG
            .selectAll<SVGCircleElement, any>("circle.pop-circle")
            .data(statePoints)
            .enter()
            .append("circle")
            .attr("class", "pop-circle")
            .attr(
              "cx",
              (d) => d.screen[0] + (Math.random() - 0.5) * 4 // jitter X ±2px
            )
            .attr(
              "cy",
              (d) => d.screen[1] + (Math.random() - 0.5) * 4 // jitter Y ±2px
            )
            .attr("r", 2) // círculo pequeno
            .attr("fill", "rgba(239,68,68,0.6)")
            .attr("stroke", "rgba(220,38,38,0.9)")
            .attr("stroke-width", 0.8)
            .attr("opacity", 0.7)
            .style("cursor", "pointer")
            .on("mouseover", async function (event, d: any) {
              d3.select(this).attr("opacity", 1).attr("stroke-width", 1.2);

              const key = `state-${d.id}`;

              if (
                populationCacheRef.current[key] == null &&
                !fetchInProgressRef.current[key]
              ) {
                fetchInProgressRef.current[key] = true;
                try {
                  const res = await fetch(
                    `https://backend-challenge-nasa-space-apps-2025-dark-tree-2941.fly.dev/impact/population?state=${d.id}`
                  );
                  const data = await res.json();
                  populationCacheRef.current[key] = data.population ?? 0;
                } catch (err) {
                  console.error("Erro ao buscar população do estado", err);
                  populationCacheRef.current[key] = 0;
                } finally {
                  fetchInProgressRef.current[key] = false;
                }
              }

              if (tooltipRef.current) {
                const pop = populationCacheRef.current[key];
                tooltipRef.current.innerHTML = `<div style="font-weight:600">${d.name
                  }</div>
                  <div style="margin-top:4px">População (estado): ${pop == null ? "Carregando..." : pop.toLocaleString()
                  }</div>`;
                tooltipRef.current.style.display = "block";
              }
            })
            .on("mousemove", function (event) {
              if (tooltipRef.current) {
                tooltipRef.current.style.left = `${event.pageX + 12}px`;
                tooltipRef.current.style.top = `${event.pageY + 12}px`;
              }
            })
            .on("mouseout", function () {
              d3.select(this).attr("opacity", 0.7).attr("stroke-width", 0.8);
              if (tooltipRef.current) tooltipRef.current.style.display = "none";
            });
        })
        .catch((err) => console.error("Erro camada população:", err));
    }
  }, [dimensions, impactPoint, onMapClick, showPopLayer]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ background: "#0f172a", display: "block" }}
      />
      <div style={{ position: "absolute", top: 12, left: 12, zIndex: 1000 }}>
        <button
          onClick={() => setShowPopLayer((prev) => !prev)}
          style={{
            background: showPopLayer ? "#dc2626" : "#111827",
            color: "#fff",
            border: "none",
            padding: "8px 12px",
            borderRadius: 6,
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
          }}
          title="Ativar/Desativar camada de densidade populacional (EUA - aproximação)"
        >
          <UsersIcon />
        </button>
      </div>

      {/* Asteroid Information Panel
      {selectedAsteroid && (
        <div style={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 1000,
          background: "rgba(17, 24, 39, 0.95)",
          backdropFilter: "blur(8px)",
          color: "#fff",
          padding: "16px",
          borderRadius: 12,
          border: "1px solid rgba(75, 85, 99, 0.3)",
          boxShadow: "0 8px 25px rgba(0,0,0,0.4)",
          minWidth: "280px",
          maxWidth: "320px"
        }}>
          <div style={{ marginBottom: "12px" }}>
            <h3 style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: 600,
              color: selectedAsteroid.is_potentially_hazardous_asteroid ? "#ef4444" : "#60a5fa"
            }}>
              {selectedAsteroid.name}
            </h3>
            {selectedAsteroid.is_potentially_hazardous_asteroid && (
              <div style={{
                marginTop: "4px",
                padding: "2px 8px",
                background: "rgba(239, 68, 68, 0.2)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: 4,
                fontSize: "12px",
                display: "inline-block",
                color: "#fecaca"
              }}>
                ⚠️ Potentially Hazardous
              </div>
            )}
          </div>

          <div style={{ fontSize: "14px", lineHeight: "1.4", opacity: 0.9 }}>
            <div style={{ marginBottom: "8px" }}>
              <strong>Diameter:</strong> {selectedAsteroid.estimated_diameter.meters.estimated_diameter_min.toFixed(0)} - {selectedAsteroid.estimated_diameter.meters.estimated_diameter_max.toFixed(0)} m
            </div>
            <div style={{ marginBottom: "8px" }}>
              <strong>Velocity:</strong> {parseFloat(selectedAsteroid.close_approach_data[0].relative_velocity.kilometers_per_second).toFixed(2)} km/s
            </div>
            <div style={{ marginBottom: "8px" }}>
              <strong>Miss Distance:</strong> {parseFloat(selectedAsteroid.close_approach_data[0].miss_distance.kilometers).toLocaleString()} km
            </div>
            <div style={{ marginBottom: "8px" }}>
              <strong>Close Approach:</strong> {new Date(selectedAsteroid.close_approach_data[0].close_approach_date).toLocaleDateString()}
            </div>
            <div style={{ marginTop: "12px", paddingTop: "8px", borderTop: "1px solid rgba(75, 85, 99, 0.3)" }}>
              <div style={{ fontSize: "12px", opacity: 0.8 }}>
                <div>Magnitude: {selectedAsteroid.absolute_magnitude_h.toFixed(2)} H</div>
                <div>JPL ID: {selectedAsteroid.neo_reference_id}</div>
              </div>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}
