import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';

interface WorldMapProps {
  onMapClick?: (coordinates: [number, number]) => void;
  impactPoint?: [number, number] | null;
  impactRadiusKm?: number; // fallback: severe ring
  impactRingsKm?: { severe: number; moderate: number; light: number; thermal: number };
}

export function WorldMap({ onMapClick, impactPoint, impactRadiusKm, impactRingsKm }: WorldMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const rect = svgRef.current.parentElement?.getBoundingClientRect();
        if (rect) {
          setDimensions({ width: rect.width, height: rect.height });
        }
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;

    // Create projection
    const projection = d3.geoNaturalEarth1()
      .scale(width / 6)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString());
      });

    svg.call(zoom);

    // Main group for map elements
    const g = svg.append('g');

    // Add ocean background
    g.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#0a1929')
      .attr('opacity', 0.3);

    // Add graticules (grid lines)
    const graticule = d3.geoGraticule();
    g.append('path')
      .datum(graticule())
      .attr('d', (d: any) => path(d) as string)
      .attr('fill', 'none')
      .attr('stroke', '#334155')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.3);

    // Load and render world map
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(response => response.json())
      .then((world: any) => {
        const countries = feature(world, world.objects.countries) as unknown as GeoJSON.FeatureCollection;

        // Draw countries
        g.append('g')
          .selectAll('path')
          .data((countries as any).features)
          .enter()
          .append('path')
          .attr('d', (d: any) => path(d) as string)
          .attr('fill', '#1e293b')
          .attr('stroke', '#475569')
          .attr('stroke-width', 0.5)
          .attr('class', 'country')
          .style('cursor', 'pointer')
          .on('mouseover', function () {
            d3.select(this)
              .attr('fill', '#334155')
              .attr('stroke', '#64748b')
              .attr('stroke-width', 1);
          })
          .on('mouseout', function () {
            d3.select(this)
              .attr('fill', '#1e293b')
              .attr('stroke', '#475569')
              .attr('stroke-width', 0.5);
          })
          .on('click', function (event) {
            const [x, y] = d3.pointer(event, this);
            const coords = projection.invert?.([x, y]);
            if (coords && onMapClick) {
              onMapClick(coords as [number, number]);
            }
          });

        // Draw impact point and optional impact area if present
        if (impactPoint) {
          const coords = projection(impactPoint);
          if (coords) {
            // Draw multi-ring impact areas if provided; otherwise fallback to single radius
            const rings = impactRingsKm ?? (impactRadiusKm ? { severe: impactRadiusKm, moderate: 0, light: 0, thermal: 0 } : undefined);
            const earthRadiusKm = 6371; // mean Earth radius
            if (rings) {
              const drawRing = (km: number, fill: string, stroke: string, opacity: number, label?: string) => {
                if (!km || km <= 0) return;
                const angularRadiusDeg = (km / earthRadiusKm) * (180 / Math.PI);
                const circle = d3.geoCircle().center(impactPoint).radius(angularRadiusDeg)();
                g.append('path')
                  .datum(circle)
                  .attr('d', (d: any) => path(d) as string)
                  .attr('fill', fill)
                  .attr('opacity', opacity)
                  .attr('stroke', stroke)
                  .attr('stroke-width', 1.2)
                  .attr('stroke-dasharray', '4,4');
                if (label) {
                  g.append('text')
                    .attr('x', coords[0] + 8)
                    .attr('y', coords[1] - 8)
                    .attr('fill', stroke)
                    .style('font-size', '12px')
                    .style('font-family', 'ui-sans-serif, system-ui')
                    .text(label);
                }
              };

              drawRing(rings.thermal, '#fde68a', '#f59e0b', 0.08);
              drawRing(rings.light, '#fed7aa', '#fb923c', 0.10);
              drawRing(rings.moderate, '#fca5a5', '#f87171', 0.14);
              drawRing(rings.severe, '#ef4444', '#dc2626', 0.18, `${(rings.severe).toFixed(1)} km`);
            }

            // Outer pulse circle
            g.append('circle')
              .attr('cx', coords[0])
              .attr('cy', coords[1])
              .attr('r', 0)
              .attr('fill', 'none')
              .attr('stroke', '#ef4444')
              .attr('stroke-width', 2)
              .attr('opacity', 0.8)
              .transition()
              .duration(2000)
              .attr('r', 50)
              .attr('opacity', 0)
              .on('end', function repeat() {
                d3.select(this)
                  .attr('r', 0)
                  .attr('opacity', 0.8)
                  .transition()
                  .duration(2000)
                  .attr('r', 50)
                  .attr('opacity', 0)
                  .on('end', repeat);
              });

            // Impact core marker
            g.append('circle')
              .attr('cx', coords[0])
              .attr('cy', coords[1])
              .attr('r', 4)
              .attr('fill', '#ef4444')
              .attr('opacity', 0.9)
              .attr('stroke', '#dc2626')
              .attr('stroke-width', 1.5);

            // Center point
            g.append('circle')
              .attr('cx', coords[0])
              .attr('cy', coords[1])
              .attr('r', 2)
              .attr('fill', '#fef2f2')
              .attr('stroke', '#991b1b')
              .attr('stroke-width', 1);

            // Crosshair
            g.append('line')
              .attr('x1', coords[0] - 30)
              .attr('y1', coords[1])
              .attr('x2', coords[0] + 30)
              .attr('y2', coords[1])
              .attr('stroke', '#ef4444')
              .attr('stroke-width', 1.5);

            g.append('line')
              .attr('x1', coords[0])
              .attr('y1', coords[1] - 30)
              .attr('x2', coords[0])
              .attr('y2', coords[1] + 30)
              .attr('stroke', '#ef4444')
              .attr('stroke-width', 1.5);
          }
        }
      })
      .catch(error => console.error('Error loading world map:', error));

    // Click handler on ocean
    svg.on('click', function (event) {
      if (event.target === this || event.target.tagName === 'rect') {
        const [x, y] = d3.pointer(event);
        const coords = projection.invert?.([x, y]);
        if (coords && onMapClick) {
          onMapClick(coords as [number, number]);
        }
      }
    });

  }, [dimensions, impactPoint, onMapClick, impactRadiusKm]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full"
      style={{ background: '#0f172a' }}
    />
  );
}