import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";
import { UsersIcon, ZoomInIcon, ZoomOutIcon, HandIcon } from "lucide-react";
import { NASAAsteroid } from "../types/nasa";
import { MultiImpactLegend } from "./MultiImpactLegend";
import { ImpactApiResult } from "../utils/Api";

interface WorldMapProps {
  onMapClick?: (coordinates: [number, number]) => void;
  impactPoint?: [number, number] | null;
  selectedAsteroid?: NASAAsteroid | null;
  impactResults?: ImpactApiResult;
}

export function WorldMap({ onMapClick, impactPoint, selectedAsteroid, impactResults }: WorldMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [showPopLayer, setShowPopLayer] = useState(false);
  const [isHandToolActive, setIsHandToolActive] = useState(false);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const populationCacheRef = useRef<Record<string, number | null>>({});
  const fetchInProgressRef = useRef<Record<string, boolean>>({});
  // Ref para armazenar a função onMapClick e evitar re-renderizações desnecessárias
  const onMapClickRef = useRef(onMapClick);

  // Refs para manter referências aos elementos D3 sem precisar recriá-los
  const mainGroupRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const projectionRef = useRef<d3.GeoProjection | null>(null);
  const impactGroupRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const svgSelectionRef = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined> | null>(null);

  // Atualizamos a referência da função onMapClick sempre que ela mudar
  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  // useEffect separado para gerenciar o ponto de impacto
  useEffect(() => {
    if (!impactGroupRef.current || !projectionRef.current || dimensions.width === 0) return;

    // Limpa o grupo de impacto atual
    impactGroupRef.current.selectAll("*").remove();

    // Se não há ponto de impacto, simplesmente retorna
    if (!impactPoint) return;

    const projection = projectionRef.current;
    const coords = projection(impactPoint);
    if (!coords) return;

    const width = dimensions.width;

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

    // Desenha os círculos de impacto sem reconstruir o mapa inteiro
    impactGroupRef.current.append("circle")
      .attr("cx", coords[0])
      .attr("cy", coords[1])
      .attr("r", circleRadius)
      .attr("fill", "#ef4444")
      .attr("opacity", 0.3);
    impactGroupRef.current.append("circle")
      .attr("cx", coords[0])
      .attr("cy", coords[1])
      .attr("r", 4)
      .attr("fill", "#fef2f2")
      .attr("stroke", "#991b1b")
      .attr("stroke-width", 2);

  }, [impactPoint, selectedAsteroid, impactResults, dimensions.width]);

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

  // Effect to update hand tool behavior
  useEffect(() => {
    if (!svgSelectionRef.current || !zoomBehaviorRef.current) return;

    const svg = svgSelectionRef.current;

    if (isHandToolActive) {
      // Enable dragging when hand tool is active
      svg.style("cursor", "grab");

      // Re-configurar o comportamento de zoom para permitir arrasto
      svg.call(zoomBehaviorRef.current.filter((event: any) => {
        if (event.type === 'wheel') return false; // Ainda desabilita zoom por roda
        if (event.type === 'mousedown' || event.type === 'touchstart') return true; // Permite arrasto
        return !event.button;
      }));
    } else {
      // Disable dragging when hand tool is inactive
      svg.style("cursor", "default");

      // Re-configurar o comportamento de zoom para desabilitar arrasto
      svg.call(zoomBehaviorRef.current.filter((event: any) => {
        if (event.type === 'wheel') return false; // Ainda desabilita zoom por roda
        if (event.type === 'mousedown' || event.type === 'touchstart') return false; // Desabilita arrasto
        return !event.button;
      }));
    }

    // Atualizar handlers de mousedown/mouseup para cursor
    svg.on("mousedown.cursor", function () {
      if (isHandToolActive) d3.select(this).style("cursor", "grabbing");
    });

    svg.on("mouseup.cursor", function () {
      if (isHandToolActive) d3.select(this).style("cursor", "grab");
    });

  }, [isHandToolActive]);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svgSelectionRef.current = svg; // Armazena a seleção SVG para uso posterior
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

    // Create zoom behavior with full control over interactions
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8]) // Min/max zoom levels
      .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        g.attr("transform", event.transform.toString());
      })
      // Definir um comportamento inicial de zoom - será atualizado pelo useEffect dedicado para o handTool
      .filter((event: any) => {
        // Desabilitar zoom por roda do mouse
        if (event.type === 'wheel') return false;

        // Configuração inicial do comportamento de arrasto (será atualizado pelo useEffect específico)
        if (event.type === 'mousedown' || event.type === 'touchstart') {
          return false; // Inicialmente desabilitado
        }

        // Permitir zoom programático por botões
        return !event.button;
      });

    // Store the zoom behavior in the ref for access from buttons
    zoomBehaviorRef.current = zoom;

    // Apply zoom behavior
    svg.call(zoom)
      // Prevent text selection during drag
      .style("-webkit-user-select", "none")
      .style("user-select", "none")
      // Configurar cursor inicial (será atualizado pelo useEffect específico)
      .style("cursor", "default")
      // Disable double-click zoom behavior
      .on("dblclick.zoom", null);

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
            // Não permite gerar impactos quando a ferramenta de mão está ativa
            if (isHandToolActive) return;

            const [x, y] = d3.pointer(event, this);
            const coords = projection.invert?.([x, y]);
            if (coords && onMapClickRef.current) onMapClickRef.current(coords as [number, number]);
          });

        if (showPopLayer) drawPopulationLayer(popGroup, projection);
      })
      .catch((err) => console.error(err));

    // Impact point - Múltiplos círculos científicos baseados nos dados do backend
    if (impactPoint) {
      const coords = projection(impactPoint);
      if (coords) {
        console.log("🎯 IMPACTO DETECTADO:", {
          impactPoint,
          coords,
          hasResults: !!impactResults,
          craterDiameter: impactResults?.crater_diameter_km,
          energy: impactResults?.energy_megatons_tnt,
        });

        // Se temos resultados completos de impacto, desenhar círculos científicos
        if (impactResults && impactResults.crater_diameter_km && impactResults.energy_megatons_tnt &&
          impactResults.crater_diameter_km > 0 && impactResults.energy_megatons_tnt > 0) {

          // 🌍 CONVERSÃO CIENTÍFICA PRECISA: km para pixels (Natural Earth)
          const kmToPixels = (km: number): number => {
            // Natural Earth scale factor: escala do mapa / (2π × raio_terra_pixels)
            // Raio da Terra ≈ 6371 km
            const earthRadiusKm = 6371;
            const mapScale = projection.scale();
            // Conversão precisa baseada na escala da projeção D3
            // Para Natural Earth, usar fator de conversão mais generoso para visibilidade
            const conversionFactor = 1.0; // Aumentado para melhor visibilidade
            return (km / earthRadiusKm) * mapScale * conversionFactor;
          };

          // 📏 DADOS REAIS DO BACKEND
          const craterDiameterKm = impactResults.crater_diameter_km;
          const energyMegatons = impactResults.energy_megatons_tnt;
          const velocityKms = impactResults.velocity_kms;

          // 🎯 FÓRMULAS CIENTÍFICAS BASEADAS EM ESTUDOS REAIS

          // 1️⃣ CRATERA FÍSICA (dados diretos do backend - PRECISOS)
          const craterRadiusKm = craterDiameterKm / 2;
          const craterRadiusPx = kmToPixels(craterRadiusKm);

          // 2️⃣ ZONA DE EJECTA (baseada em Melosh, 1989 - Crater Scaling)
          // Material ejetado alcança ~3-5x o raio da cratera para impactos grandes
          const ejectaRadiusKm = craterRadiusKm * 3.5; // Reduzido de 2.5 para 3.5 (mais preciso)
          const ejectaRadiusPx = kmToPixels(ejectaRadiusKm);

          // 3️⃣ ZONA SÍSMICA (baseada em estudos de terremotos + nuclear tests)
          // Fórmula NASA: R_seismic = 2.5 × (energia_MT)^0.25 km (para magnitude 4+)
          const seismicRadiusKm = 2.5 * Math.pow(energyMegatons, 0.25);
          const seismicRadiusPx = kmToPixels(seismicRadiusKm);

          // 4️⃣ ZONA TÉRMICA (Glasstone & Dolan - Nuclear Weapon Effects)
          // Para queimaduras de 3º grau: R = 1.2 × (energia_MT)^0.4 km
          const thermalRadiusKm = 1.2 * Math.pow(energyMegatons, 0.4);
          const thermalRadiusPx = kmToPixels(thermalRadiusKm);

          // 5️⃣ ZONA DE ONDA DE CHOQUE (Collins et al., 2005 - Earth Impact Effects)
          // Para sobrepressão de 1 PSI (destruição de janelas): R = 0.73 × (energia_MT)^0.4 km
          const shockwaveRadiusKm = 0.73 * Math.pow(energyMegatons, 0.4);
          const shockwaveRadiusPx = kmToPixels(shockwaveRadiusKm);

          // 📐 LIMITES REALISTAS (sem exageros visuais)
          const minRadius = 3; // Mínimo para visibilidade
          const maxRadius = width / 2.5; // Máximo para evitar exagero

          // GARANTIR PROGRESSÃO VISUAL DIFERENCIADA (para debug)
          let finalCraterPx = Math.max(minRadius, Math.min(craterRadiusPx, maxRadius));
          let finalEjectaPx = Math.max(minRadius, Math.min(ejectaRadiusPx, maxRadius));
          let finalThermalPx = Math.max(minRadius, Math.min(thermalRadiusPx, maxRadius));
          let finalSeismicPx = Math.max(minRadius, Math.min(seismicRadiusPx, maxRadius));
          let finalShockwavePx = Math.max(minRadius, Math.min(shockwaveRadiusPx, maxRadius));

          // 🔧 VERIFICAÇÃO DE PROGRESSÃO VISUAL (forçar diferenças mínimas se estão muito próximos)
          const minDifference = 5; // pixels de diferença mínima
          if (finalEjectaPx - finalCraterPx < minDifference) {
            finalEjectaPx = finalCraterPx + minDifference;
          }
          if (finalThermalPx - finalEjectaPx < minDifference) {
            finalThermalPx = finalEjectaPx + minDifference;
          }
          if (finalSeismicPx - finalThermalPx < minDifference) {
            finalSeismicPx = finalThermalPx + minDifference;
          }
          if (finalShockwavePx - finalSeismicPx < minDifference) {
            finalShockwavePx = finalSeismicPx + minDifference;
          }

          // 🎨 DESENHAR CÍRCULOS CONCÊNTRICOS (do maior para o menor)

          // 5️⃣ Onda de choque atmosférica (mais externa - linha tracejada)
          g.append("circle")
            .attr("cx", coords[0])
            .attr("cy", coords[1])
            .attr("r", finalShockwavePx)
            .attr("fill", "none")
            .attr("stroke", "#fbbf24") // Amarelo
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "8,4")
            .attr("opacity", 0.7);

          // 4️⃣ Zona de destruição térmica
          g.append("circle")
            .attr("cx", coords[0])
            .attr("cy", coords[1])
            .attr("r", finalThermalPx)
            .attr("fill", "#f97316")
            .attr("opacity", 0.15)
            .attr("stroke", "#ea580c")
            .attr("stroke-width", 1.5);

          // 3️⃣ Zona sísmica (tremores)
          g.append("circle")
            .attr("cx", coords[0])
            .attr("cy", coords[1])
            .attr("r", finalSeismicPx)
            .attr("fill", "#92400e")
            .attr("opacity", 0.2)
            .attr("stroke", "#78350f")
            .attr("stroke-width", 1.5);

          // 2️⃣ Zona de ejecta (material ejetado)
          g.append("circle")
            .attr("cx", coords[0])
            .attr("cy", coords[1])
            .attr("r", finalEjectaPx)
            .attr("fill", "#dc2626")
            .attr("opacity", 0.3)
            .attr("stroke", "#b91c1c")
            .attr("stroke-width", 2);

          // 1️⃣ Cratera física (centro - mais escura)
          g.append("circle")
            .attr("cx", coords[0])
            .attr("cy", coords[1])
            .attr("r", finalCraterPx)
            .attr("fill", "#7f1d1d")
            .attr("opacity", 0.8)
            .attr("stroke", "#450a0a")
            .attr("stroke-width", 2);

          // 📊 ANÁLISE CIENTÍFICA DETALHADA NO CONSOLE
          console.log(`🔬 ANÁLISE CIENTÍFICA PRECISA DE IMPACTO:
=====================================
📏 DADOS DE ENTRADA:
   └─ Energia: ${energyMegatons.toFixed(2)} MT TNT
   └─ Velocidade: ${velocityKms.toFixed(2)} km/s
   └─ Diâmetro da cratera: ${craterDiameterKm.toFixed(2)} km
   └─ Escala do mapa: ${projection.scale().toFixed(1)}
   └─ Conversão: ${(1 / projection.scale() * 6371).toFixed(6)} km/pixel

� CÁLCULOS CIENTÍFICOS (raios em km):
   └─ CRATERA: ${craterRadiusKm.toFixed(2)} km
   └─ EJECTA: ${ejectaRadiusKm.toFixed(2)} km  
   └─ TÉRMICA: ${thermalRadiusKm.toFixed(2)} km
   └─ SÍSMICA: ${seismicRadiusKm.toFixed(2)} km
   └─ CHOQUE: ${shockwaveRadiusKm.toFixed(2)} km

📐 CONVERSÃO PARA PIXELS (antes dos limites):
   └─ CRATERA: ${craterRadiusPx.toFixed(1)}px
   └─ EJECTA: ${ejectaRadiusPx.toFixed(1)}px
   └─ TÉRMICA: ${thermalRadiusPx.toFixed(1)}px
   └─ SÍSMICA: ${seismicRadiusPx.toFixed(1)}px
   └─ CHOQUE: ${shockwaveRadiusPx.toFixed(1)}px

✅ VALORES FINAIS APLICADOS (após limites):
   └─ CRATERA: ${finalCraterPx.toFixed(1)}px
   └─ EJECTA: ${finalEjectaPx.toFixed(1)}px
   └─ TÉRMICA: ${finalThermalPx.toFixed(1)}px
   └─ SÍSMICA: ${finalSeismicPx.toFixed(1)}px
   └─ CHOQUE: ${finalShockwavePx.toFixed(1)}px

🎯 FONTES CIENTÍFICAS:
   └─ Crater: Dados diretos do backend
   └─ Ejecta: Melosh (1989)
   └─ Térmica: Glasstone & Dolan (1977)
   └─ Sísmica: NASA Impact Assessment
   └─ Choque: Collins et al. (2005)`);

          // 📝 TEXTO INFORMATIVO CIENTÍFICO
          const textY = coords[1] - Math.max(finalShockwavePx, finalSeismicPx, finalThermalPx, finalEjectaPx, finalCraterPx) - 30;

          g.append("text")
            .attr("x", coords[0])
            .attr("y", textY)
            .attr("text-anchor", "middle")
            .attr("fill", "#fef2f2")
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .style("text-shadow", "2px 2px 4px rgba(0,0,0,0.9)")
            .text(`🎯 Impacto: ${energyMegatons.toFixed(1)} MT TNT`);

          g.append("text")
            .attr("x", coords[0])
            .attr("y", textY + 18)
            .attr("text-anchor", "middle")
            .attr("fill", "#fef2f2")
            .attr("font-size", "12px")
            .attr("font-weight", "bold")
            .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.9)")
            .text(`Cratera: ⌀ ${craterDiameterKm.toFixed(1)} km`);

        }
        // Se não temos resultados completos, usar estimativa simples
        else {
          let circleRadius = 50;
          const scaleFactor = width / 50;
          const kmToPixelRatio = scaleFactor;

          if (impactResults && impactResults.crater_diameter_km) {
            const craterRadius = impactResults.crater_diameter_km / 2;
            circleRadius = craterRadius * kmToPixelRatio;
            circleRadius = Math.max(30, Math.min(circleRadius, width / 3));
          }
          else if (selectedAsteroid) {
            const asteroidDiameter = (selectedAsteroid.estimated_diameter.meters.estimated_diameter_min +
              selectedAsteroid.estimated_diameter.meters.estimated_diameter_max) / 2 / 1000;
            const velocity = parseFloat(selectedAsteroid.close_approach_data[0].relative_velocity.kilometers_per_second);
            const estimatedCraterRadius = asteroidDiameter * 15 * (velocity / 20);
            circleRadius = estimatedCraterRadius * kmToPixelRatio;
            circleRadius = Math.max(30, Math.min(circleRadius, width / 3));
          }

          // Círculo simples para casos sem dados completos
          g.append("circle")
            .attr("cx", coords[0])
            .attr("cy", coords[1])
            .attr("r", circleRadius)
            .attr("fill", "#ef4444")
            .attr("opacity", 0.3);
        }

        // 🎯 PONTO CENTRAL DE IMPACTO (sempre presente)
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
      // Não permite gerar impactos quando a ferramenta de mão está ativa
      if (isHandToolActive) return;

      if (event.target === this || event.target.tagName === "rect") {
        const [x, y] = d3.pointer(event);
        const coords = projection.invert?.([x, y]);
        if (coords && onMapClickRef.current) onMapClickRef.current(coords as [number, number]);
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
  }, [dimensions, showPopLayer]); // removemos impactPoint, onMapClick e isHandToolActive das dependências

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{
          background: "#0f172a",
          display: "block",
          touchAction: "none" // Prevent default touch behaviors
        }}
        onWheel={(e) => e.preventDefault()} // Prevent default scroll behavior
      />
      {/* Botão de camada de população no canto superior esquerdo */}
      <div style={{ position: "absolute", top: 12, left: 12, zIndex: 1000, display: "flex", gap: "8px" }}>
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

      {/* Legenda dos múltiplos círculos - aparece quando há simulação completa */}
      <MultiImpactLegend
        isVisible={!!(impactResults && impactResults.energy_megatons_tnt && impactResults.crater_diameter_km)}
      />

      {/* Botões de zoom e arrasto no canto inferior direito */}
      <div style={{ position: "absolute", bottom: 12, right: 12, zIndex: 1000, display: "flex", gap: "8px" }}>
        <button
          onClick={() => {
            if (zoomBehaviorRef.current && svgRef.current) {
              const svg = d3.select(svgRef.current);
              const currentTransform = d3.zoomTransform(svgRef.current);
              const newScale = currentTransform.k * 1.3; // Zoom in by 30%
              svg.transition().duration(300).call(zoomBehaviorRef.current.scaleTo, newScale);
            }
          }}
          style={{
            background: "#111827",
            color: "#fff",
            border: "none",
            padding: "8px 12px",
            borderRadius: 6,
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
          }}
          title="Zoom In"
        >
          <ZoomInIcon />
        </button>

        <button
          onClick={() => {
            if (zoomBehaviorRef.current && svgRef.current) {
              const svg = d3.select(svgRef.current);
              const currentTransform = d3.zoomTransform(svgRef.current);
              const newScale = currentTransform.k / 1.3; // Zoom out by 30%
              svg.transition().duration(300).call(zoomBehaviorRef.current.scaleTo, newScale);
            }
          }}
          style={{
            background: "#111827",
            color: "#fff",
            border: "none",
            padding: "8px 12px",
            borderRadius: 6,
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
          }}
          title="Zoom Out"
        >
          <ZoomOutIcon />
        </button>

        <button
          onClick={() => setIsHandToolActive((prev) => !prev)}
          style={{
            background: isHandToolActive ? "#0284c7" : "#111827",
            color: "#fff",
            border: "none",
            padding: "8px 12px",
            borderRadius: 6,
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
          }}
          title="Ativar/Desativar ferramenta mão para arrastar o mapa"
        >
          <HandIcon />
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
