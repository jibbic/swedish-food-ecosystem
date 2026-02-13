'use client'

import { useEffect, useRef, useState } from 'react'
import cytoscape, { Core, NodeSingular, EdgeSingular } from 'cytoscape'
import fcose from 'cytoscape-fcose'
import type { GraphData } from '@/types/neo4j'

// Register layout algorithm
if (typeof window !== 'undefined') {
  cytoscape.use(fcose)
}

interface EcosystemGraphProps {
  data: GraphData
  onNodeClick?: (nodeId: string, nodeType: string) => void
}

export function EcosystemGraph({ data, onNodeClick }: EcosystemGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<Core | null>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current || !data) return

    // Clear previous instance
    if (cyRef.current) {
      cyRef.current.destroy()
    }

    // Node colors by type
    const nodeColors = {
      Verksamhetstyp: '#10b981', // green
      Uppgiftskrav: '#f97316',   // orange
      Myndighet: '#2563eb',      // blue
      Register: '#8b5cf6',       // purple
      Lag: '#ef4444',           // red
    }

    // Create cytoscape instance
    const cy = cytoscape({
      container: containerRef.current,
      elements: [
        // Nodes
        ...data.nodes.map(node => ({
          data: {
            id: node.id,
            label: node.label,
            type: node.type,
            ...node.properties,
          },
        })),
        // Edges
        ...data.edges.map(edge => ({
          data: {
            id: `${edge.source}-${edge.target}`,
            source: edge.source,
            target: edge.target,
            type: edge.type,
          },
        })),
      ],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': (ele: NodeSingular) => {
              const type = ele.data('type') as keyof typeof nodeColors
              return nodeColors[type] || '#94a3b8'
            },
            'label': 'data(label)',
            'color': '#1f2937',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '12px',
            'font-weight': '600',
            'text-wrap': 'wrap',
            'text-max-width': '100px',
            'width': (ele: NodeSingular) => {
              const type = ele.data('type')
              if (type === 'Myndighet') return 50
              if (type === 'Verksamhetstyp') return 45
              return 40
            },
            'height': (ele: NodeSingular) => {
              const type = ele.data('type')
              if (type === 'Myndighet') return 50
              if (type === 'Verksamhetstyp') return 45
              return 40
            },
          },
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 4,
            'border-color': '#1e40af',
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#cbd5e1',
            'target-arrow-color': '#cbd5e1',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'arrow-scale': 1.5,
          },
        },
        {
          selector: 'edge[type="MÅSTE_UPPFYLLA"]',
          style: {
            'line-color': '#f97316',
            'target-arrow-color': '#f97316',
          },
        },
        {
          selector: 'edge[type="STÄLLS_AV"]',
          style: {
            'line-color': '#2563eb',
            'target-arrow-color': '#2563eb',
          },
        },
        {
          selector: '.highlighted',
          style: {
            'background-color': '#fbbf24',
            'line-color': '#fbbf24',
            'target-arrow-color': '#fbbf24',
            'border-width': 4,
            'border-color': '#f59e0b',
          },
        },
      ],
      layout: {
        name: 'fcose',
        quality: 'proof',
        randomize: false,
        animate: true,
        animationDuration: 1000,
        nodeDimensionsIncludeLabels: true,
        idealEdgeLength: 100,
        edgeElasticity: 0.45,
        nestingFactor: 0.1,
        gravity: 0.25,
        numIter: 2500,
        tile: true,
        tilingPaddingVertical: 10,
        tilingPaddingHorizontal: 10,
      },
      minZoom: 0.3,
      maxZoom: 3,
    })

    // Click handler
    cy.on('tap', 'node', (event) => {
      const node = event.target
      const nodeId = node.id()
      const nodeType = node.data('type')
      
      // Highlight connected nodes
      cy.elements().removeClass('highlighted')
      node.addClass('highlighted')
      node.neighborhood().addClass('highlighted')
      
      setSelectedNode(nodeId)
      onNodeClick?.(nodeId, nodeType)
    })

    // Click on background to deselect
    cy.on('tap', (event) => {
      if (event.target === cy) {
        cy.elements().removeClass('highlighted')
        setSelectedNode(null)
      }
    })

    cyRef.current = cy

    return () => {
      cy.destroy()
    }
  }, [data, onNodeClick])

  // Reset view
  const resetView = () => {
    if (cyRef.current) {
      cyRef.current.elements().removeClass('highlighted')
      cyRef.current.fit(undefined, 50)
      setSelectedNode(null)
    }
  }

  // Zoom control
  const zoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.2)
  const zoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8)

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className="w-full h-full bg-gray-50 rounded-lg border border-gray-200"
        style={{ minHeight: '600px' }}
      />
      
      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={zoomIn}
          className="bg-white border border-gray-300 rounded-lg p-2 hover:bg-gray-50 shadow-lg"
          title="Zooma in"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button
          onClick={zoomOut}
          className="bg-white border border-gray-300 rounded-lg p-2 hover:bg-gray-50 shadow-lg"
          title="Zooma ut"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <button
          onClick={resetView}
          className="bg-white border border-gray-300 rounded-lg p-2 hover:bg-gray-50 shadow-lg"
          title="Återställ vy"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg">
        <h3 className="font-semibold text-sm mb-2">Nodtyper</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-verksamhet"></div>
            <span>Verksamhetstyp</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-uppgiftskrav"></div>
            <span>Uppgiftskrav</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-myndighet"></div>
            <span>Myndighet</span>
          </div>
        </div>
      </div>
    </div>
  )
}
