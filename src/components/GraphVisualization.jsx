import React, { useRef, useCallback, useMemo, useEffect } from 'react'
import { Network } from 'vis-network'
import { DataSet } from 'vis-data'
import { computeForceLayout } from '../utils/layout'
import './GraphVisualization.css'

function GraphVisualization({ graphData, sidebarVisible = true, onNodeFocus, onZoomControlsReady }) {
  const networkRef = useRef(null)
  const containerRef = useRef(null)
  
  // Expose focusNode function to parent via ref callback
  const focusNode = useCallback((nodeId) => {
    console.log('focusNode called with:', nodeId, 'networkRef:', networkRef.current)
    if (networkRef.current && nodeId) {
      try {
        // Get all nodes from the network
        const nodesData = networkRef.current.body.data.nodes
        const allNodes = nodesData ? nodesData.get() : []
        
        // Find the parent node and all its branch nodes
        const parentNode = allNodes.find(n => n.id === nodeId)
        if (!parentNode) {
          console.warn('Node not found:', nodeId)
          return
        }
        
        // Find all branch nodes (paid media) connected to this parent
        // Links go FROM paid media TO parent page
        const branchNodes = allNodes.filter(n => {
          if (n.nodeType !== 'paid-media') return false
          
          // Check if this paid media node connects to our parent
          return graphData.links.some(link => {
            const sourceId = typeof link.source === 'string' ? link.source : link.source?.id
            const targetId = typeof link.target === 'string' ? link.target : link.target?.id
            
            // Paid media is source, parent is target
            return sourceId === n.id && targetId === nodeId
          })
        })
        
        console.log('Found', branchNodes.length, 'branch nodes for parent:', nodeId)
        
        // Get positions of parent and all branches
        const positions = networkRef.current.getPositions([parentNode.id, ...branchNodes.map(n => n.id)])
        const nodePositions = Object.values(positions)
        
        if (nodePositions.length > 0) {
          // Calculate bounding box
          const xs = nodePositions.map(p => p.x)
          const ys = nodePositions.map(p => p.y)
          const minX = Math.min(...xs)
          const maxX = Math.max(...xs)
          const minY = Math.min(...ys)
          const maxY = Math.max(...ys)
          
          // Add padding around the group
          const padding = 200
          
          // Fit to the bounding box that includes parent + all branches
          networkRef.current.fit({
            nodes: [parentNode.id, ...branchNodes.map(n => n.id)],
            animation: {
              duration: 1000,
              easingFunction: 'easeInOutQuad'
            }
          })
          console.log('Focused on parent and', branchNodes.length, 'branch nodes')
        }
      } catch (err) {
        console.error('Error focusing node group:', err)
      }
    } else {
      console.warn('Cannot focus: networkRef or nodeId missing', { networkRef: networkRef.current, nodeId })
    }
  }, [graphData])
  
  // Expose focusNode to parent component
  useEffect(() => {
    if (onNodeFocus) {
      onNodeFocus(focusNode)
    }
  }, [focusNode, onNodeFocus])

  // Pre-calculate layout with collision detection to ensure no overlaps
  const layoutData = useMemo(() => {
    if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
      return graphData
    }
    
    // Create a copy of nodes to avoid mutating original
    const nodesCopy = graphData.nodes.map(n => ({ ...n }))
    const linksCopy = graphData.links.map(l => ({ ...l }))
    
    // Apply force-directed layout with collision detection
    return computeForceLayout(nodesCopy, linksCopy)
  }, [graphData])

  // Convert graph data to vis-network format with pre-calculated positions
  const visData = useMemo(() => {
    if (!layoutData || !layoutData.nodes || layoutData.nodes.length === 0) {
      return { nodes: new DataSet([]), edges: new DataSet([]) }
    }

    // Convert nodes with fixed positions from layout calculation
    const nodes = layoutData.nodes.map(node => ({
      id: node.id,
      label: node.label || node.id,
      x: node.fx ?? node.x ?? undefined, // Use fixed position
      y: node.fy ?? node.y ?? undefined, // Use fixed position
      fixed: true, // Fix nodes in place - no movement
      color: node.nodeType === 'paid-media' 
        ? { background: '#f59e0b', border: '#d97706' }
        : { background: '#3b82f6', border: '#2563eb' },
      shape: 'dot',
      size: node.nodeType === 'paid-media' ? 12 : 16,
      font: {
        size: node.nodeType === 'paid-media' ? 9 : 12, // Smaller fonts
        color: '#333',
        face: 'Arial, sans-serif'
      },
      // Store node type for custom rendering if needed
      nodeType: node.nodeType
    }))

    // Convert edges - use thin, semi-transparent lines for less clutter
    const edges = layoutData.links.map((link, index) => {
      const from = typeof link.source === 'string' ? link.source : link.source.id
      const to = typeof link.target === 'string' ? link.target : link.target.id
      
      const isPaidMediaLink = link.type === 'paid-media-link'
      
      return {
        id: link.id || `${from}-${to}-${index}`,
        from: from,
        to: to,
        color: isPaidMediaLink 
          ? { color: 'rgba(245, 158, 11, 0.4)', highlight: 'rgba(217, 119, 6, 0.7)' }
          : { color: 'rgba(148, 163, 184, 0.3)', highlight: 'rgba(100, 116, 139, 0.6)' },
        width: isPaidMediaLink ? 1 : 0.8,
        // Inherit smooth settings from global options
        smooth: undefined
      }
    })

    return {
      nodes: new DataSet(nodes),
      edges: new DataSet(edges)
    }
  }, [graphData])

  // Initialize network
  useEffect(() => {
    if (!containerRef.current) return
    
    // Check if we have data
    if (!visData.nodes || visData.nodes.length === 0) {
      return
    }

    const options = {
      nodes: {
        borderWidth: 2,
        shadow: {
          enabled: true,
          size: 4,
          x: 1,
          y: 1
        },
        font: {
          size: 11,
          face: 'Arial, sans-serif',
          align: 'center',
          multi: false,
          bold: {
            face: 'Arial, sans-serif'
          }
        },
        labelHighlightBold: false,
        // Larger margin to keep labels away from nodes
        margin: {
          top: 10,
          right: 10,
          bottom: 10,
          left: 10
        },
        // Better label positioning
        scaling: {
          label: {
            enabled: false // Disable scaling for consistent label sizes
          }
        },
        // Fixed node sizes
        size: undefined // Let individual node sizes be used
      },
      edges: {
        arrows: {
          to: {
            enabled: false
          }
        },
        // Use horizontal smooth curves for tree-like connections
        smooth: {
          enabled: true,
          type: 'cubicBezier', // Cubic bezier for smooth curves
          forceDirection: 'horizontal', // Force horizontal routing (left to right)
          roundness: 0.2 // Gentle curvature for clean lines
        },
        shadow: {
          enabled: false
        },
        width: 1.5, // Slightly thicker for visibility
        color: {
          inherit: false
        },
        hoverWidth: 3
      },
      physics: {
        enabled: false // Disable physics - nodes are pre-positioned and fixed
      },
      layout: {
        improvedLayout: false // Don't use improved layout - positions are pre-calculated
      },
      interaction: {
        zoomView: true,
        dragView: true,
        dragNodes: true,
        selectConnectedEdges: true
      }
    }

    // Destroy existing network if it exists
    if (networkRef.current) {
      networkRef.current.destroy()
      networkRef.current = null
    }

    try {
      // Create network
      const network = new Network(containerRef.current, visData, options)
      networkRef.current = network
      
      // Fit to screen immediately since nodes are already positioned
      setTimeout(() => {
        if (networkRef.current) {
          networkRef.current.fit({
            animation: {
              duration: 0 // No animation, instant fit
            }
          })
        }
      }, 0)

      // Handle node clicks
      network.on('click', (params) => {
        if (params.nodes && params.nodes.length > 0) {
          const nodeId = params.nodes[0]
          try {
            network.focus(nodeId, {
              scale: 1.5,
              animation: {
                duration: 1000,
                easingFunction: 'easeInOutQuad'
              }
            })
          } catch (err) {
            console.warn('Error focusing node:', err)
          }
        }
      })
    } catch (err) {
      console.error('Error creating network:', err)
    }

    return () => {
      if (networkRef.current) {
        try {
          networkRef.current.destroy()
        } catch (err) {
          console.warn('Error destroying network:', err)
        }
        networkRef.current = null
      }
    }
  }, [visData])

  const fitAllNodesToScreen = useCallback(() => {
    if (networkRef.current) {
      networkRef.current.fit({
        animation: {
          duration: 500,
          easingFunction: 'easeInOutQuad'
        }
      })
    }
  }, [])

  const zoomIn = useCallback(() => {
    if (networkRef.current) {
      const scale = networkRef.current.getScale()
      networkRef.current.moveTo({
        scale: scale * 1.2,
        animation: {
          duration: 300,
          easingFunction: 'easeInOutQuad'
        }
      })
    }
  }, [])

  const zoomOut = useCallback(() => {
    if (networkRef.current) {
      const scale = networkRef.current.getScale()
      networkRef.current.moveTo({
        scale: scale * 0.8,
        animation: {
          duration: 300,
          easingFunction: 'easeInOutQuad'
        }
      })
    }
  }, [])

  // Provide zoom controls to parent component
  useEffect(() => {
    if (onZoomControlsReady) {
      const controls = (
        <div className="graph-controls">
          <button onClick={fitAllNodesToScreen} title="Fit all nodes to screen">
            Fit to Screen
          </button>
          <button onClick={zoomIn} title="Zoom in">
            Zoom In
          </button>
          <button onClick={zoomOut} title="Zoom out">
            Zoom Out
          </button>
        </div>
      )
      onZoomControlsReady(controls)
    }
  }, [fitAllNodesToScreen, zoomIn, zoomOut, onZoomControlsReady])

  // Safety check for empty data
  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return (
      <div className="graph-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>No data to display. Loading sitemap...</p>
      </div>
    )
  }

  return (
    <div className="graph-container">
      <div 
        ref={containerRef}
        style={{ 
          width: '100%', 
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0
        }}
      />
    </div>
  )
}

export default GraphVisualization
