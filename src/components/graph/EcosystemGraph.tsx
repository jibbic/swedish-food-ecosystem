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
  const [tooltip, setTooltip] = useState<{ visible: boolean; content: string; x: number; y: number }>({
    visible: false,
    content: '',
    x: 0,
    y: 0,
  })

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
            'shape': 'roundrectangle',
            'background-color': (ele: NodeSingular) => {
              const type = ele.data('type') as keyof typeof nodeColors
              return nodeColors[type] || '#94a3b8'
            },
            'background-opacity': 0.95,
            'border-width': 2,
            'border-color': (ele: NodeSingular) => {
              const type = ele.data('type') as keyof typeof nodeColors
              const baseColor = nodeColors[type] || '#94a3b8'
              // Darker border
              return baseColor.replace(/[0-9a-f]{6}$/, (m) => 
                parseInt(m, 16).toString(16).padStart(6, '0').substring(0, 6)
              )
            },
            'label': (ele: NodeSingular) => {
              const type = ele.data('type')
              const namn = ele.data('namn') || ele.data('label')
              if (type === 'Verksamhetstyp') {
                const kod = ele.data('kod') || ''
                const risk = ele.data('riskKlass') || ''
                return `${kod}\n${namn}\n[Risk: ${risk}]`
              }
              if (type === 'Uppgiftskrav') {
                const lagrum = ele.data('lagrum') || ''
                const short = lagrum.split(' ').slice(0, 3).join(' ')
                return `${namn}\n${short}...`
              }
              return namn
            },
            'color': '#ffffff',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '11px',
            'font-weight': '600',
            'text-wrap': 'wrap',
            'text-max-width': '120px',
            'text-background-color': (ele: NodeSingular) => {
              const type = ele.data('type') as keyof typeof nodeColors
              return nodeColors[type] || '#94a3b8'
            },
            'text-background-opacity': 0.8,
            'text-background-padding': '4px',
            'text-background-shape': 'roundrectangle',
            'width': (ele: NodeSingular) => {
              const type = ele.data('type')
              if (type === 'Myndighet') return 100
              if (type === 'Verksamhetstyp') return 120
              if (type === 'Uppgiftskrav') return 140
              return 80
            },
            'height': (ele: NodeSingular) => {
              const type = ele.data('type')
              if (type === 'Myndighet') return 60
              if (type === 'Verksamhetstyp') return 70
              if (type === 'Uppgiftskrav') return 80
              return 50
            },
          },
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 4,
            'border-color': '#1e40af',
            'border-style': 'solid',
            'overlay-opacity': 0.2,
            'overlay-color': '#1e40af',
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#cbd5e1',
            'target-arrow-color': '#cbd5e1',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'arrow-scale': 1.8,
            'label': (ele: EdgeSingular) => ele.data('type'),
            'font-size': '10px',
            'text-rotation': 'autorotate',
            'text-margin-y': -10,
            'color': '#6b7280',
            'text-background-color': '#ffffff',
            'text-background-opacity': 0.9,
            'text-background-padding': '3px',
          },
        },
        {
          selector: 'edge[type="MÅSTE_UPPFYLLA"]',
          style: {
            'line-color': '#f97316',
            'target-arrow-color': '#f97316',
            'line-style': 'solid',
            'width': 3,
          },
        },
        {
          selector: 'edge[type="STÄLLS_AV"]',
          style: {
            'line-color': '#2563eb',
            'target-arrow-color': '#2563eb',
            'line-style': 'dashed',
            'width': 2.5,
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

    // Mouse hover for tooltips
    cy.on('mouseover', 'node', (event) => {
      const node = event.target
      const type = node.data('type')
      let content = `<strong>${node.data('namn') || node.data('label')}</strong><br/>`
      
      if (type === 'Verksamhetstyp') {
        content += `Kod: ${node.data('kod') || 'N/A'}<br/>`
        content += `Riskklass: ${node.data('riskKlass') || 'N/A'}<br/>`
        content += `Beskrivning: ${(node.data('beskrivning') || '').substring(0, 80)}...`
      } else if (type === 'Uppgiftskrav') {
        content += `Lagrum: ${node.data('lagrum') || 'N/A'}<br/>`
        content += `Beskrivning: ${(node.data('beskrivning') || '').substring(0, 100)}...`
      } else if (type === 'Myndighet') {
        content += `Typ: ${node.data('typ') || 'N/A'}<br/>`
        content += `Ansvar: ${(node.data('ansvar') || '').substring(0, 80)}...`
      }
      
      const position = node.renderedPosition()
      setTooltip({
        visible: true,
        content,
        x: position.x,
        y: position.y - 40,
      })
    })

    cy.on('mouseout', 'node', () => {
      setTooltip({ visible: false, content: '', x: 0, y: 0 })
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
        className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 shadow-inner"
        style={{ minHeight: '600px' }}
      />
      
      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="absolute pointer-events-none bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl max-w-xs z-50"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}

      {/* Selected Node Details Panel */}
      {selectedNode && data.nodes.find(n => n.id === selectedNode) && (
        <div className="absolute left-4 top-4 bg-white border-2 border-blue-500 rounded-lg p-4 shadow-xl max-w-sm z-40">
          {(() => {
            const node = data.nodes.find(n => n.id === selectedNode)!
            const type = node.type
            return (
              <>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ 
                        backgroundColor: type === 'Verksamhetstyp' ? '#10b981' : 
                                        type === 'Uppgiftskrav' ? '#f97316' : 
                                        type === 'Myndighet' ? '#2563eb' : '#94a3b8' 
                      }} 
                    />
                    <span className="text-xs font-semibold text-gray-600">{type}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedNode(null)} 
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <h3 className="font-bold text-lg mb-2">{node.properties.namn || node.label}</h3>
                <div className="space-y-2 text-sm">
                  {type === 'Verksamhetstyp' && (
                    <>
                      <div><strong>Kod:</strong> {node.properties.kod}</div>
                      <div><strong>Riskklass:</strong> {node.properties.riskKlass}/5</div>
                      <div><strong>Kategori:</strong> {node.properties.kategori}</div>
                      <div><strong>Beskrivning:</strong> {node.properties.beskrivning}</div>
                      <div className="pt-2 border-t">
                        <span className="text-xs">
                          {node.properties.kräverGodkännande ? '✓ Kräver godkännande' : '✓ Kräver registrering'}
                        </span>
                      </div>
                    </>
                  )}
                  {type === 'Uppgiftskrav' && (
                    <>
                      <div><strong>Lagrum:</strong> {node.properties.lagrum}</div>
                      <div><strong>Beskrivning:</strong> {node.properties.beskrivning}</div>
                      <div><strong>Områden:</strong> {Array.isArray(node.properties.verksamhetsområde) ? node.properties.verksamhetsområde.join(', ') : node.properties.verksamhetsområde}</div>
                      {node.properties.url && (
                        <a 
                          href={node.properties.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-xs"
                        >
                          Läs mer →
                        </a>
                      )}
                    </>
                  )}
                  {type === 'Myndighet' && (
                    <>
                      <div><strong>Typ:</strong> {node.properties.typ}</div>
                      <div><strong>Ansvar:</strong> {node.properties.ansvar}</div>
                      <div><strong>Sektor:</strong> {Array.isArray(node.properties.sektor) ? node.properties.sektor.join(', ') : node.properties.sektor}</div>
                      {node.properties.kontakt && typeof node.properties.kontakt === 'string' && (() => {
                        try {
                          const kontakt = JSON.parse(node.properties.kontakt)
                          return kontakt.url && (
                            <a 
                              href={kontakt.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-xs"
                            >
                              Besök webbplats →
                            </a>
                          )
                        } catch {
                          return null
                        }
                      })()}
                    </>
                  )}
                </div>
              </>
            )
          })()}
        </div>
      )}
      
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
        <h3 className="font-bold text-sm mb-3 text-gray-800">Nodtyper</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#10b981] border-2 border-[#059669]"></div>
            <span className="text-gray-700">Verksamhetstyp</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#f97316] border-2 border-[#ea580c]"></div>
            <span className="text-gray-700">Uppgiftskrav</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#2563eb] border-2 border-[#1d4ed8]"></div>
            <span className="text-gray-700">Myndighet</span>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-200">
          <h4 className="font-semibold text-xs mb-2 text-gray-800">Relationer</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <svg width="24" height="2" className="flex-shrink-0">
                <line x1="0" y1="1" x2="24" y2="1" stroke="#f97316" strokeWidth="3" />
              </svg>
              <span className="text-gray-700">Måste uppfylla</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="24" height="2" className="flex-shrink-0">
                <line x1="0" y1="1" x2="24" y2="1" stroke="#2563eb" strokeWidth="2.5" strokeDasharray="4" />
              </svg>
              <span className="text-gray-700">Ställs av</span>
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
          <div className="flex items-start gap-1">
            <span>💡</span>
            <span>Klicka på noder för detaljer. Dra för att flytta.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
