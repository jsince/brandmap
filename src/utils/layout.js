/**
 * Compute hierarchical layout positions for nodes based on URL structure
 */
export function computeHierarchicalLayout(nodes, links) {
  // Group nodes by URL depth and path
  const nodesByPath = {}
  const homeNode = nodes.find(n => n.url === '/' || n.url === '')
  
  nodes.forEach(node => {
    if (node.url === '/' || node.url === '') {
      nodesByPath['/'] = node
    } else {
      const pathParts = node.url.split('/').filter(p => p)
      const depth = pathParts.length
      const parentPath = '/' + pathParts.slice(0, -1).join('/')
      
      if (!nodesByPath[node.url]) {
        nodesByPath[node.url] = {
          node,
          depth,
          parentPath,
          pathParts
        }
      }
    }
  })

  // Sort nodes by depth and path
  const sortedNodes = Object.values(nodesByPath)
    .sort((a, b) => {
      if (a.depth !== b.depth) return a.depth - b.depth
      return a.node.url.localeCompare(b.node.url)
    })

  // Layout parameters
  const levelGap = 250  // Horizontal spacing between levels
  const nodeGap = 100   // Vertical spacing between nodes at same level
  const startX = 100    // Starting X position
  const startY = 100    // Starting Y position

  // Position nodes hierarchically
  const positionedNodes = []
  const nodesByLevel = {}
  
  // Group nodes by depth level
  sortedNodes.forEach(({ node, depth }) => {
    if (!nodesByLevel[depth]) {
      nodesByLevel[depth] = []
    }
    nodesByLevel[depth].push(node)
  })

  // Position each level
  Object.keys(nodesByLevel).sort((a, b) => a - b).forEach((depth, levelIndex) => {
    const levelNodes = nodesByLevel[depth]
    const totalHeight = levelNodes.length * nodeGap
    const startYPos = startY + (totalHeight / 2) - (levelNodes.length - 1) * nodeGap / 2

    levelNodes.forEach((node, index) => {
      node.x = startX + (levelIndex * levelGap)
      node.y = startYPos + (index * nodeGap)
      node.fx = node.x  // Fix position
      node.fy = node.y
      positionedNodes.push(node)
    })
  })

  // Position paid media items around their target pages
  const paidMediaNodes = nodes.filter(n => n.nodeType === 'paid-media')
  paidMediaNodes.forEach((mediaNode, index) => {
    const targetPage = nodes.find(n => n.id === mediaNode.targetPageId && n.nodeType === 'page')
    if (targetPage && targetPage.x !== undefined) {
      // Position paid media items to the right of their target page
      const angle = (index % 8) * (Math.PI * 2 / 8)  // Distribute in circle
      const radius = 80
      mediaNode.x = targetPage.x + Math.cos(angle) * radius
      mediaNode.y = targetPage.y + Math.sin(angle) * radius
      mediaNode.fx = mediaNode.x
      mediaNode.fy = mediaNode.y
    }
  })

  return { nodes: positionedNodes, links }
}

import { resolveCollisions } from './collisionDetection'

/**
 * Compute grid layout with parent nodes and branches in two horizontal rows
 * Branches alternate between top and bottom rows extending to the right
 */
export function computeForceLayout(nodes, links) {
  const pageNodes = nodes.filter(n => n.nodeType === 'page')
  const paidMediaNodes = nodes.filter(n => n.nodeType === 'paid-media')
  
  // Create a map for quick node lookup
  const nodeMap = new Map()
  nodes.forEach(node => nodeMap.set(node.id, node))
  
  // Group paid media by target
  const paidMediaByTarget = {}
  paidMediaNodes.forEach(mediaNode => {
    if (!paidMediaByTarget[mediaNode.targetPageId]) {
      paidMediaByTarget[mediaNode.targetPageId] = []
    }
    paidMediaByTarget[mediaNode.targetPageId].push(mediaNode)
  })
  
  // Find maximum branch count to calculate cell dimensions
  let maxBranchCount = 0
  Object.values(paidMediaByTarget).forEach(group => {
    maxBranchCount = Math.max(maxBranchCount, group.length)
  })
  
  // Branch layout parameters - increased spacing to prevent label overlap
  const branchStartOffset = 300 // Distance from parent to first branch
  const branchHorizontalSpacing = 220 // Horizontal spacing between branches (more room for labels)
  const rowVerticalOffset = 110 // Vertical offset for top/bottom rows from parent (more room for labels)
  
  // Calculate cell dimensions - larger for better viewport usage
  const maxBranchesPerRow = Math.ceil(maxBranchCount / 2) // Branches split into 2 rows
  const maxBranchExtension = branchStartOffset + (maxBranchesPerRow * branchHorizontalSpacing)
  const cellWidth = maxBranchExtension + 500 // Wider cells for better spacing
  const cellHeight = 600 // Taller cells for better spacing
  
  // Optimize grid for viewport - fewer columns means larger, more visible nodes
  const totalNodes = pageNodes.length
  const cols = Math.min(5, Math.max(3, Math.ceil(Math.sqrt(totalNodes)))) // 3-5 columns max
  const rows = Math.ceil(totalNodes / cols)
  
  // Center the grid
  const startX = -(cols * cellWidth) / 2
  const startY = -(rows * cellHeight) / 2
  
  // Position page nodes in a grid
  pageNodes.forEach((node, index) => {
    const col = index % cols
    const row = Math.floor(index / cols)
    
    node.x = startX + (col * cellWidth) + 100 // Offset from left edge of cell
    node.y = startY + (row * cellHeight) + (cellHeight / 2) // Center vertically in cell
    node.fx = node.x
    node.fy = node.y
  })
  
  // Position paid media branches in TWO horizontal rows (alternating top/bottom)
  Object.keys(paidMediaByTarget).forEach(targetPageId => {
    const mediaGroup = paidMediaByTarget[targetPageId]
    const targetPage = pageNodes.find(n => n.id === targetPageId)
    
    if (targetPage && targetPage.x !== undefined) {
      let topRowIndex = 0
      let bottomRowIndex = 0
      
      mediaGroup.forEach((mediaNode, index) => {
        // Alternate: even indices go to top row, odd indices go to bottom row
        if (index % 2 === 0) {
          // Top row
          mediaNode.x = targetPage.x + branchStartOffset + (topRowIndex * branchHorizontalSpacing)
          mediaNode.y = targetPage.y - rowVerticalOffset
          topRowIndex++
        } else {
          // Bottom row
          mediaNode.x = targetPage.x + branchStartOffset + (bottomRowIndex * branchHorizontalSpacing)
          mediaNode.y = targetPage.y + rowVerticalOffset
          bottomRowIndex++
        }
        
        mediaNode.fx = mediaNode.x
        mediaNode.fy = mediaNode.y
      })
    } else {
      // Fallback: position in a separate area
      mediaGroup.forEach((mediaNode, index) => {
        mediaNode.x = startX + cellWidth
        mediaNode.y = startY + (index * 80)
        mediaNode.fx = mediaNode.x
        mediaNode.fy = mediaNode.y
      })
    }
  })
  
  // Fix link references to point to actual node objects
  const fixedLinks = links.map(link => {
    const sourceNode = nodeMap.get(typeof link.source === 'string' ? link.source : link.source.id)
    const targetNode = nodeMap.get(typeof link.target === 'string' ? link.target : link.target.id)
    
    if (sourceNode && targetNode) {
      return {
        ...link,
        source: sourceNode,
        target: targetNode
      }
    }
    return link
  }).filter(link => link.source && link.target)

  return { nodes, links: fixedLinks }
}

