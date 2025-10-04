import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';

interface WorldMapProps {
  onMapClick?: (coordinates: [number, number]) => void;
  impactPoint?: [number, number] | null;
}

export function WorldMap({ onMapClick, impactPoint }: WorldMapProps) {
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
      .datum(graticule)
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke', '#334155')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.3);

    // Load and render world map
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(response => response.json())
      .then((world: any) => {
        const countries = feature(world, world.objects.countries);

        // Draw countries
        g.append('g')
          .selectAll('path')
          .data(countries.features)
          .enter()
          .append('path')
          .attr('d', path)
          .attr('fill', '#1e293b')
          .attr('stroke', '#475569')
          .attr('stroke-width', 0.5)
          .attr('class', 'country')
          .style('cursor', 'pointer')
          .on('mouseover', function() {
            d3.select(this)
              .attr('fill', '#334155')
              .attr('stroke', '#64748b')
              .attr('stroke-width', 1);
          })
          .on('mouseout', function() {
            d3.select(this)
              .attr('fill', '#1e293b')
              .attr('stroke', '#475569')
              .attr('stroke-width', 0.5);
          })
          .on('click', function(event, d: any) {
            const [x, y] = d3.pointer(event, this);
            const coords = projection.invert?.([x, y]);
            if (coords && onMapClick) {
              onMapClick(coords as [number, number]);
            }
          });

        // Draw impact point if it exists
        if (impactPoint) {
          const coords = projection(impactPoint);
          if (coords) {
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

            // Impact zone circle
            g.append('circle')
              .attr('cx', coords[0])
              .attr('cy', coords[1])
              .attr('r', 20)
              .attr('fill', '#ef4444')
              .attr('opacity', 0.4)
              .attr('stroke', '#dc2626')
              .attr('stroke-width', 2);

            // Center point
            g.append('circle')
              .attr('cx', coords[0])
              .attr('cy', coords[1])
              .attr('r', 4)
              .attr('fill', '#fef2f2')
              .attr('stroke', '#991b1b')
              .attr('stroke-width', 2);

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
    svg.on('click', function(event) {
      if (event.target === this || event.target.tagName === 'rect') {
        const [x, y] = d3.pointer(event);
        const coords = projection.invert?.([x, y]);
        if (coords && onMapClick) {
          onMapClick(coords as [number, number]);
        }
      }
    });

  }, [dimensions, impactPoint, onMapClick]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full"
      style={{ background: '#0f172a' }}
    />
  );
}
