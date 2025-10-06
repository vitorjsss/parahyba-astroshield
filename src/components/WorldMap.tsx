import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";
import { UsersIcon, XIcon } from "lucide-react";
import { NASAAsteroid } from "../types/nasa";
import { MultiImpactLegend } from "./MultiImpactLegend";
import { ImpactApiResult } from "../utils/api";

interface WorldMapProps {
  onMapClick?: (coordinates: [number, number]) => void;
  impactPoint?: [number, number] | null;
  selectedAsteroid?: NASAAsteroid | null;
  impactResults?: ImpactApiResult;
  onClearSimulation?: () => void;
}

export function WorldMap({ onMapClick, impactPoint, selectedAsteroid, impactResults, onClearSimulation }: WorldMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [showPopLayer, setShowPopLayer] = useState(false);
  // removed hand tool state - right-click drag will be used for panning
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const populationCacheRef = useRef<Record<string, number | null>>({});
  const fetchInProgressRef = useRef<Record<string, boolean>>({});
  // Ref para armazenar a função onMapClick e evitar re-renderizações desnecessárias
  const onMapClickRef = useRef(onMapClick);

  // Refs para manter referências aos elementos D3 sem precisar recriá-los
  const mainGroupRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const svgSelectionRef = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined> | null>(null);
  const impactGroupRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const projectionRef = useRef<d3.GeoProjection | null>(null);
  // store last click client position to resolve dateline wrap selection
  const lastClickScreenRef = useRef<{ clientX: number; clientY: number } | null>(null);

  // Atualizamos a referência da função onMapClick sempre que ela mudar
  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  // useEffect separado para gerenciar APENAS os círculos de impacto (sem redesenhar o mapa)
  useEffect(() => {
    if (!impactGroupRef.current || !projectionRef.current || dimensions.width === 0) return;

    // Limpa apenas os círculos de impacto existentes
    impactGroupRef.current.selectAll("*").remove();

    // Se não há ponto de impacto, retorna
    if (!impactPoint) return;

    const projection = projectionRef.current;

    // Handle dateline wrap: choose lon + k*360 that projects to the visible area
    const [lon, lat] = impactPoint;
    const svgNode = svgRef.current!;
    const transform = d3.zoomTransform(svgNode);
    const width = dimensions.width;

    let coords: [number, number] | null = null;
    try {
      let best: { p: [number, number]; score: number } | null = null;
      const shifts = [0, -360, 360];
      // prefer the click x position if we have it, otherwise fallback to center
      const clickX = lastClickScreenRef.current ? lastClickScreenRef.current.clientX : width / 2;
      for (const s of shifts) {
        const candidate = projection([lon + s, lat]);
        if (!candidate) continue;
        const screenX = candidate[0] * transform.k + transform.x;
        const score = Math.abs(screenX - clickX); // closeness to where user clicked
        if (!best || score < best.score) best = { p: candidate as [number, number], score };
      }
      if (best) coords = best.p;
    } catch (e) {
      // fallback
      coords = projection(impactPoint);
    }
    if (!coords) return;

    console.log("🎯 IMPACTO DETECTADO:", {
      impactPoint,
      coords,
      hasResults: !!impactResults,
      craterDiameter: impactResults?.crater_diameter_km,
      energy: impactResults?.energy_megatons_tnt,
      velocity: impactResults?.velocity_kms,
      mass: impactResults?.mass_kg,
    });

    // Se temos resultados completos de impacto, desenhar círculos científicos
    if (impactResults && impactResults.crater_diameter_km && impactResults.energy_megatons_tnt &&
      impactResults.crater_diameter_km > 0 && impactResults.energy_megatons_tnt > 0) {

      console.log("✅ ENTRANDO NA LÓGICA DE CÍRCULOS CIENTÍFICOS");

      // 🌍 CONVERSÃO SIMPLES E DIRETA: km para pixels (SEM LIMITES)
      const kmToPixels = (km: number): number => {
        const mapScale = projection.scale();
        // Fator de conversão direto para visibilidade
        const pixelsPerKm = mapScale / 100; // Fator simples e direto
        const result = km * pixelsPerKm;

        console.log(`🔄 kmToPixels DIRETO: ${km} km → ${result.toFixed(2)} px (escala: ${mapScale})`);
        return result;
      };

      // 📏 DADOS DIRETOS DO BACKEND
      const craterDiameterKm = impactResults.crater_diameter_km;
      const energyMegatons = impactResults.energy_megatons_tnt;

      console.log("📊 DADOS DO BACKEND:", {
        craterDiameterKm,
        energyMegatons,
        mapScale: projection.scale()
      });

      // 🎯 FÓRMULAS CIENTÍFICAS BASEADAS EM ESTUDOS REAIS DE IMPACTOS

      // 1️⃣ CRATERA FÍSICA (dados diretos do backend)
      const craterRadiusKm = craterDiameterKm / 2;
      const craterRadiusPx = kmToPixels(craterRadiusKm);

      // 2️⃣ ZONA DE EJECTA - Baseada em Melosh (1989) "Impact Cratering"
      // Ejecta se estende tipicamente 2-4 raios da cratera para impactos grandes
      const ejectaRadiusKm = craterRadiusKm * 3.5;
      const ejectaRadiusPx = kmToPixels(ejectaRadiusKm);

      // 3️⃣ RADIAÇÃO TÉRMICA - Glasstone & Dolan (1977) "Nuclear Weapon Effects"
      // R_thermal = 1.2 * (energia_MT)^0.4 km
      const thermalRadiusKm = 1.2 * Math.pow(energyMegatons, 0.4);
      const thermalRadiusPx = kmToPixels(thermalRadiusKm);

      // 4️⃣ ONDA SÍSMICA - Baseada em estudos sísmicos de explosões nucleares
      // R_seismic = 2.5 * (energia_MT)^0.25 km (magnitude perceptível)
      const seismicRadiusKm = 2.5 * Math.pow(energyMegatons, 0.25);
      const seismicRadiusPx = kmToPixels(seismicRadiusKm);

      // 5️⃣ ONDA DE CHOQUE ATMOSFÉRICA - Collins et al. (2005)
      // R_blast = 0.73 * (energia_MT)^0.4 km (sobrepressão de 1 psi)
      const shockwaveRadiusKm = 0.73 * Math.pow(energyMegatons, 0.4);
      const shockwaveRadiusPx = kmToPixels(shockwaveRadiusKm);

      console.log("🎯 CÁLCULOS CIENTÍFICOS REAIS:", {
        crater: { radiusKm: craterRadiusKm, radiusPx: craterRadiusPx },
        ejecta: { radiusKm: ejectaRadiusKm, radiusPx: ejectaRadiusPx, formula: "cratera × 3.5 (Melosh 1989)" },
        thermal: { radiusKm: thermalRadiusKm, radiusPx: thermalRadiusPx, formula: "1.2 × energia^0.4 (Glasstone)" },
        seismic: { radiusKm: seismicRadiusKm, radiusPx: seismicRadiusPx, formula: "2.5 × energia^0.25 (Nuclear)" },
        shockwave: { radiusKm: shockwaveRadiusKm, radiusPx: shockwaveRadiusPx, formula: "0.73 × energia^0.4 (Collins)" },
        energyMT: energyMegatons
      });

      // 🎨 DESENHAR CÍRCULOS (do maior para o menor)

      // Onda de choque (mais externa)
      impactGroupRef.current.append("circle")
        .attr("cx", coords[0])
        .attr("cy", coords[1])
        .attr("r", shockwaveRadiusPx)
        .attr("fill", "none")
        .attr("stroke", "#fbbf24")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "8,4")
        .attr("opacity", 0.8);

      // Zona térmica
      impactGroupRef.current.append("circle")
        .attr("cx", coords[0])
        .attr("cy", coords[1])
        .attr("r", thermalRadiusPx)
        .attr("fill", "#f97316")
        .attr("opacity", 0.15)
        .attr("stroke", "#ea580c")
        .attr("stroke-width", 2);

      // Zona sísmica
      impactGroupRef.current.append("circle")
        .attr("cx", coords[0])
        .attr("cy", coords[1])
        .attr("r", seismicRadiusPx)
        .attr("fill", "#92400e")
        .attr("opacity", 0.2)
        .attr("stroke", "#78350f")
        .attr("stroke-width", 2);

      // Zona de ejecta
      impactGroupRef.current.append("circle")
        .attr("cx", coords[0])
        .attr("cy", coords[1])
        .attr("r", ejectaRadiusPx)
        .attr("fill", "#dc2626")
        .attr("opacity", 0.3)
        .attr("stroke", "#b91c1c")
        .attr("stroke-width", 2);

      // Cratera física (centro)
      impactGroupRef.current.append("circle")
        .attr("cx", coords[0])
        .attr("cy", coords[1])
        .attr("r", craterRadiusPx)
        .attr("fill", "#7f1d1d")
        .attr("opacity", 0.9)
        .attr("stroke", "#450a0a")
        .attr("stroke-width", 2);

      // Texto informativo científico
      impactGroupRef.current.append("text")
        .attr("x", coords[0])
        .attr("y", coords[1] - Math.max(shockwaveRadiusPx, thermalRadiusPx, seismicRadiusPx) - 30)
        .attr("text-anchor", "middle")
        .attr("fill", "#fef2f2")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .style("text-shadow", "2px 2px 4px rgba(0,0,0,0.9)")
        .text(`Impacto: ${energyMegatons.toFixed(1)} MT TNT`);

      impactGroupRef.current.append("text")
        .attr("x", coords[0])
        .attr("y", coords[1] - Math.max(shockwaveRadiusPx, thermalRadiusPx, seismicRadiusPx) - 12)
        .attr("text-anchor", "middle")
        .attr("fill", "#fef2f2")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.9)")
        .text(`Cratera: ⌀ ${craterDiameterKm.toFixed(1)} km | Térmico: ${thermalRadiusKm.toFixed(1)} km`);

      // 🔍 ZOOM AUTOMÁTICO PARA A ÁREA DO IMPACTO
      if (svgSelectionRef.current && zoomBehaviorRef.current) {
        // Encontrar o maior raio para calcular o zoom necessário
        const maxRadiusPx = Math.max(shockwaveRadiusPx, thermalRadiusPx, seismicRadiusPx, ejectaRadiusPx);

        // Calcular o zoom necessário para que toda a área caiba na tela com margem maior
        const { width, height } = dimensions;
        const margin = 120; // Margem maior para zoom mais suave
        const availableSpace = Math.min(width, height) / 2 - margin;

        // Calcular o fator de zoom baseado no raio mais externo (mais conservador)
        const currentTransform = d3.zoomTransform(svgSelectionRef.current.node()!);
        const targetScale = Math.min(availableSpace / maxRadiusPx, 2.5); // Limite máximo reduzido para 2.5x
        const finalScale = Math.max(targetScale * 0.7, 1.1); // Reduz 30% e zoom mínimo de 1.1x

        console.log("🔍 ZOOM AUTOMÁTICO:", {
          maxRadiusPx,
          availableSpace,
          targetScale,
          finalScale,
          currentScale: currentTransform.k
        });

        // Aplicar zoom suave focando no ponto de impacto
        svgSelectionRef.current
          .transition()
          .duration(1000)
          .call(
            zoomBehaviorRef.current.transform,
            d3.zoomIdentity
              .translate(width / 2, height / 2)
              .scale(finalScale)
              .translate(-coords[0], -coords[1])
          );
      }

    }
    // Fallback simples se não há dados completos
    else {
      const defaultRadius = 20;
      impactGroupRef.current.append("circle")
        .attr("cx", coords[0])
        .attr("cy", coords[1])
        .attr("r", defaultRadius)
        .attr("fill", "#ef4444")
        .attr("opacity", 0.5)
        .attr("stroke", "#dc2626")
        .attr("stroke-width", 2);
    }

    // 🎯 PONTO CENTRAL DE IMPACTO (sempre presente)
    impactGroupRef.current.append("circle")
      .attr("cx", coords[0])
      .attr("cy", coords[1])
      .attr("r", 4)
      .attr("fill", "#fef2f2")
      .attr("stroke", "#991b1b")
      .attr("stroke-width", 2);

  }, [impactPoint, selectedAsteroid, impactResults, dimensions]);

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
  // Hand-tool removed; right-click drag will be used for panning. Cursor will be managed by CSS/D3 default.

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

    // Armazenar a projeção na ref para uso no useEffect de impacto
    projectionRef.current = projection;

    // Create zoom behavior with full control over interactions
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8]) // Min/max zoom levels
      .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        g.attr("transform", event.transform.toString());
      })
      // Definir um comportamento inicial de zoom - será atualizado pelo useEffect dedicado para o handTool
      .filter((event: any) => {
        // Allow wheel zoom
        if (event.type === 'wheel') return true;

        // Allow panning on mousedown/touchstart for any button (we will restrict impact creation to left button)
        if (event.type === 'mousedown' || event.type === 'touchstart' || event.type === 'pointerdown') {
          return true;
        }

        // Allow programmatic zooming
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

    // Prevent default context menu on right-click so we can use right-button drag
    svg.on("contextmenu", function (event: any) {
      event.preventDefault();
    });

    // Ensure right-click drags are handled by d3.zoom: listen for pointerdown and call native handler
    // (d3.zoom already handles pointerdown if filter allows it)
    // We also make sure left-clicks still create impacts via the svg.on('click') handler which checks event.button

    const g = svg.append("g");
    // Helper: convert a mouse event to geographic coordinates (lon, lat),
    // accounting for the current zoom transform and any SVG CTM.
    function screenToGeo(event: MouseEvent) {
      const svgNode = svgRef.current!;
      const gNode = g.node() as SVGGElement | null;

      try {
        // Create an SVGPoint at the client (screen) coordinates
        // Use the SVG API for precise transformation handling
        // @ts-ignore DOMPoint creation on SVG
        const pt = (svgNode as any).createSVGPoint();
        pt.x = (event as MouseEvent).clientX;
        pt.y = (event as MouseEvent).clientY;

        // Convert screen point to SVG coordinates
        const svgCTM = svgNode.getScreenCTM();
        if (!svgCTM) throw new Error('No svg CTM');
        // @ts-ignore
        const svgP = pt.matrixTransform(svgCTM.inverse());

        if (gNode) {
          const gCTM = gNode.getCTM();
          if (gCTM) {
            // Transform SVG coords into g's local coordinates by inverting g's CTM
            // @ts-ignore
            const local = svgP.matrixTransform(gCTM.inverse());
            const coords = projection.invert?.([local.x, local.y]);
            // Save the client click position for later (impact placement)
            lastClickScreenRef.current = { clientX: (event as MouseEvent).clientX, clientY: (event as MouseEvent).clientY };
            // eslint-disable-next-line no-console
            console.log('screenToGeo(svg->gCTM) ->', { client: { x: pt.x, y: pt.y }, svgP, local, coords });
            return coords;
          }
        }

        // Fallback to d3.zoom transform inversion if CTM approach fails
        const pt2 = d3.pointer(event, svgNode);
        const transform = d3.zoomTransform(svgNode);
        const untransformed = transform.invert(pt2);
        const coordsFallback = projection.invert?.(untransformed as [number, number]);
  // Save click position
  lastClickScreenRef.current = { clientX: (event as MouseEvent).clientX, clientY: (event as MouseEvent).clientY };
  // eslint-disable-next-line no-console
  console.log('screenToGeo(fallback) ->', { pt2, untransformed, transform: { k: transform.k, x: transform.x, y: transform.y }, coordsFallback });
  return coordsFallback;
      } catch (err) {
        // final fallback
        const pt2 = d3.pointer(event, svgNode);
        const transform = d3.zoomTransform(svgNode);
        const untransformed = transform.invert(pt2);
        // Save an approximate click position if available
        lastClickScreenRef.current = { clientX: (event as MouseEvent).clientX, clientY: (event as MouseEvent).clientY };
        // eslint-disable-next-line no-console
        console.warn('screenToGeo error, using fallback', err, { pt2, untransformed });
        return projection.invert?.(untransformed as [number, number]);
      }
    }
    // Variant that accepts raw client coordinates (useful when an overlay intercepts the event)
    function screenToGeoFromClient(clientX: number, clientY: number) {
      const svgNode = svgRef.current!;
      const gNode = g.node() as SVGGElement | null;
      try {
        // @ts-ignore
        const pt = (svgNode as any).createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        const svgCTM = svgNode.getScreenCTM();
        if (!svgCTM) throw new Error('No svg CTM');
        // @ts-ignore
        const svgP = pt.matrixTransform(svgCTM.inverse());
        if (gNode) {
          const gCTM = gNode.getCTM();
          if (gCTM) {
            // @ts-ignore
            const local = svgP.matrixTransform(gCTM.inverse());
            const coords = projection.invert?.([local.x, local.y]);
            lastClickScreenRef.current = { clientX, clientY };
            return coords;
          }
        }
        // fallback
  const transform = d3.zoomTransform(svgNode);
  // convert client to svg pointer coords
  const svgPoint = d3.pointer({ clientX, clientY } as any, svgNode);
        const untransformed = transform.invert(svgPoint as [number, number]);
        const coordsFallback = projection.invert?.(untransformed as [number, number]);
        lastClickScreenRef.current = { clientX, clientY };
        return coordsFallback;
      } catch (err) {
        const pt2 = d3.pointer({ clientX, clientY } as any, svgNode);
        const transform = d3.zoomTransform(svgNode);
        const untransformed = transform.invert(pt2 as [number, number]);
        lastClickScreenRef.current = { clientX, clientY };
        return projection.invert?.(untransformed as [number, number]);
      }
    }
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
    const impactGroup = g.append("g").attr("class", "impact-layer");

    // Armazenar o grupo de impacto na ref para uso no useEffect de impacto
    impactGroupRef.current = impactGroup;

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
          .on("mouseover", function (this: SVGPathElement) {
            d3.select(this)
              .attr("fill", "#334155")
              .attr("stroke", "#64748b")
              .attr("stroke-width", 1);
          })
          .on("mouseout", function (this: SVGPathElement) {
            d3.select(this)
              .attr("fill", "#1e293b")
              .attr("stroke", "#475569")
              .attr("stroke-width", 0.5);
          })
          .on("click", function (this: SVGPathElement, event: MouseEvent) {
            // Only allow left-button clicks to create impacts
            // (event.button === 0) ensures right-clicks are used for panning
            // Note: Some browsers' synthetic events may differ; this is standard.
            // @ts-ignore - event.button exists on MouseEvent
            if ((event as any).button !== 0) return;
            const coords = screenToGeo(event);
            if (coords && onMapClickRef.current) onMapClickRef.current(coords as [number, number]);
          });

        if (showPopLayer) drawPopulationLayer(popGroup, projection);
      })
      .catch((err) => console.error(err));



    // Left-click on empty SVG creates impacts. Right-click will be used for panning.
    svg.on("click", function (this: SVGSVGElement, event: MouseEvent) {
      // Only left-click should create an impact
      if ((event as any).button !== 0) return;

      if (event.target === this || (event.target as Element)?.tagName === "rect") {
        const coords = screenToGeo(event);
        if (coords && onMapClickRef.current) onMapClickRef.current(coords as [number, number]);
      }
    });

    // If an overlay (e.g. RightPanel) is intercepting pointer events but the user clicked
    // over the visible area of the map, capture pointerdown in the capture phase on document
    // and translate it into a map click. We skip events whose target is inside the SVG
    // so the normal handlers run.
    function onDocPointerDown(e: PointerEvent) {
      try {
        // only left button
        if (e.button !== 0) return;
        const svgNode = svgRef.current;
        if (!svgNode) return;
        const rect = svgNode.getBoundingClientRect();
        const cx = e.clientX;
        const cy = e.clientY;
        if (cx < rect.left || cx > rect.right || cy < rect.top || cy > rect.bottom) return;
        // if the target is inside the svg, let existing handlers handle it
        if (svgNode.contains(e.target as Node)) return;
        const coords = screenToGeoFromClient(cx, cy);
        if (coords && onMapClickRef.current) onMapClickRef.current(coords as [number, number]);
      } catch (err) {
        // ignore
      }
    }
    document.addEventListener('pointerdown', onDocPointerDown, true);

    // cleanup
    return () => {
      document.removeEventListener('pointerdown', onDocPointerDown, true);
    };

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
              (d: any) => d.screen && isFinite(d.screen[0]) && isFinite(d.screen[1])
            );

          popLayerG
            .selectAll<SVGCircleElement, any>("circle.pop-circle")
            .data(statePoints)
            .enter()
            .append("circle")
            .attr("class", "pop-circle")
            .attr(
              "cx",
              (d: any) => d.screen[0] + (Math.random() - 0.5) * 4 // jitter X ±2px
            )
            .attr(
              "cy",
              (d: any) => d.screen[1] + (Math.random() - 0.5) * 4 // jitter Y ±2px
            )
            .attr("r", 2) // círculo pequeno
            .attr("fill", "rgba(239,68,68,0.6)")
            .attr("stroke", "rgba(220,38,38,0.9)")
            .attr("stroke-width", 0.8)
            .attr("opacity", 0.7)
            .style("cursor", "pointer")
            .on("mouseover", async function (this: SVGCircleElement, _event: MouseEvent, d: any) {
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
            .on("mousemove", function (_event: MouseEvent) {
              if (tooltipRef.current) {
                tooltipRef.current.style.left = `${_event.pageX + 12}px`;
                tooltipRef.current.style.top = `${_event.pageY + 12}px`;
              }
            })
            .on("mouseout", function (this: SVGCircleElement) {
              d3.select(this).attr("opacity", 0.7).attr("stroke-width", 0.8);
              if (tooltipRef.current) tooltipRef.current.style.display = "none";
            });
        })
        .catch((err) => console.error("Erro camada população:", err));
    }
  }, [dimensions, showPopLayer]); // useEffect principal apenas para mapa base

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
      />
      {/* Botões no canto superior esquerdo */}
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

      {/* Zoom buttons and hand tool removed; wheel zoom and right-click drag are enabled */}
    </div>
  );
}