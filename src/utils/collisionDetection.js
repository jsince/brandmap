/**
 * Collision detection and resolution for nodes and labels
 */

// Estimate label dimensions based on text
function estimateLabelBounds(node, fontSize = 12) {
  const label = node.label || node.id
  const padding = 8
  const maxLabelWidth = 280
  
  // Estimate text width (rough approximation: average char width * length)
  const avgCharWidth = fontSize * 0.6
  let labelWidth = Math.min(label.length * avgCharWidth, maxLabelWidth)
  
  // If label would be truncated, use max width
  if (label.length * avgCharWidth > maxLabelWidth) {
    labelWidth = maxLabelWidth
  }
  
  const labelHeight = fontSize + padding * 2
  const labelSpacing = 50 // Space from node center to label top
  
  const nodeRadius = node.nodeType === 'paid-media' ? 8 : 12
  
  return {
    width: labelWidth + padding * 2,
    height: labelHeight,
    nodeRadius: nodeRadius,
    totalHeight: nodeRadius + labelSpacing + labelHeight, // Total from node center to label bottom
    totalWidth: Math.max(nodeRadius * 2, labelWidth + padding * 2)
  }
}

/**
 * Check if a circle overlaps with a rectangle
 */
function circleRectOverlap(circle, rect, padding = 10) {
  const closestX = Math.max(rect.left, Math.min(circle.centerX, rect.right))
  const closestY = Math.max(rect.top, Math.min(circle.centerY, rect.bottom))
  
  const dx = circle.centerX - closestX
  const dy = circle.centerY - closestY
  const distance = Math.sqrt(dx * dx + dy * dy)
  
  return distance < circle.radius + padding
}

/**
 * Check if two bounding boxes overlap
 */
function boxesOverlap(box1, box2, padding = 10) {
  return !(
    box1.right + padding < box2.left ||
    box1.left - padding > box2.right ||
    box1.bottom + padding < box2.top ||
    box1.top - padding > box2.bottom
  )
}

/**
 * Single pass of node collision resolution
 */
function resolveNodeCollisionsOnce(nodes, nodeBounds, minNodeDistance, minPaidMediaDistance, minPaidMediaToOtherNodeDistance) {
  // Recalculate node bounds
  nodeBounds.length = 0
  nodes.forEach((node, index) => {
    const x = node.fx ?? node.x ?? 0
    const y = node.fy ?? node.y ?? 0
    
    if (!isFinite(x) || !isFinite(y)) return
    
    const nodeRadius = node.nodeType === 'paid-media' ? 8 : 12
    
    nodeBounds.push({
      node,
      index,
      centerX: x,
      centerY: y,
      radius: nodeRadius,
      left: x - nodeRadius,
      right: x + nodeRadius,
      top: y - nodeRadius,
      bottom: y + nodeRadius
    })
  })
  
  // Resolve node-to-node collisions
  for (let i = 0; i < nodeBounds.length; i++) {
    for (let j = i + 1; j < nodeBounds.length; j++) {
      const box1 = nodeBounds[i]
      const box2 = nodeBounds[j]
      
      const dx = box2.centerX - box1.centerX
      const dy = box2.centerY - box1.centerY
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      // Determine appropriate minimum distance
      let requiredMinDistance
      if (box1.node.nodeType === 'paid-media' && box2.node.nodeType === 'paid-media') {
        requiredMinDistance = minPaidMediaDistance
      } else if (box1.node.nodeType === 'page' && box2.node.nodeType === 'page') {
        requiredMinDistance = minNodeDistance
      } else {
        // Mixed types - check if paid media is targeting this page
        const paidMediaNode = box1.node.nodeType === 'paid-media' ? box1.node : box2.node
        const otherNode = box1.node.nodeType === 'paid-media' ? box2.node : box1.node
        
        const isTarget = paidMediaNode.targetPageId && otherNode.id === paidMediaNode.targetPageId
        requiredMinDistance = isTarget ? 50 : minPaidMediaToOtherNodeDistance
      }
      
      if (distance < requiredMinDistance && distance > 0) {
        const angle = Math.atan2(dy, dx)
        const pushDistance = (requiredMinDistance - distance) / 2
        
        box1.node.fx = (box1.node.fx ?? box1.node.x ?? 0) - Math.cos(angle) * pushDistance
        box1.node.fy = (box1.node.fy ?? box1.node.y ?? 0) - Math.sin(angle) * pushDistance
        box2.node.fx = (box2.node.fx ?? box2.node.x ?? 0) + Math.cos(angle) * pushDistance
        box2.node.fy = (box2.node.fy ?? box2.node.y ?? 0) + Math.sin(angle) * pushDistance
        
        box1.node.x = box1.node.fx
        box1.node.y = box1.node.fy
        box2.node.x = box2.node.fx
        box2.node.y = box2.node.fy
        
        // Update bounds
        box1.centerX = box1.node.fx
        box1.centerY = box1.node.fy
        box1.left = box1.centerX - box1.radius
        box1.right = box1.centerX + box1.radius
        box1.top = box1.centerY - box1.radius
        box1.bottom = box1.centerY + box1.radius
        
        box2.centerX = box2.node.fx
        box2.centerY = box2.node.fy
        box2.left = box2.centerX - box2.radius
        box2.right = box2.centerX + box2.radius
        box2.top = box2.centerY - box2.radius
        box2.bottom = box2.centerY + box2.radius
      }
    }
  }
}

/**
 * Resolve collisions by adjusting node positions
 * @param {Array} nodes - Array of node objects
 * @param {number} minNodeDistance - Minimum distance between page nodes (center to center)
 * @param {number} minPaidMediaDistance - Minimum distance between paid media nodes (center to center)
 * @param {number} minPaidMediaToOtherNodeDistance - Minimum distance from paid media to OTHER nodes (not their target)
 * @param {Object} paidMediaByTarget - Map of targetPageId to array of paid media nodes
 */
export function resolveCollisions(nodes, minNodeDistance = 200, minPaidMediaDistance = 200, minPaidMediaToOtherNodeDistance = 250, paidMediaByTarget = {}) {
  const nodeBounds = []
  const labelBounds = []
  
  // Ensure all nodes have x/y coordinates
  nodes.forEach(node => {
    if (node.x === undefined && node.fx !== undefined) node.x = node.fx
    if (node.y === undefined && node.fy !== undefined) node.y = node.fy
    if (node.x === undefined) node.x = 0
    if (node.y === undefined) node.y = 0
  })
  
  // Run node collision resolution multiple times for better convergence
  // Use more aggressive iterations to fully resolve all collisions
  for (let phase = 0; phase < 10; phase++) {
    resolveNodeCollisionsOnce(nodes, nodeBounds, minNodeDistance, minPaidMediaDistance, minPaidMediaToOtherNodeDistance)
  }
  
  // Calculate label bounds for all nodes
  nodes.forEach((node, index) => {
    const x = node.fx ?? node.x ?? 0
    const y = node.fy ?? node.y ?? 0
    
    if (!isFinite(x) || !isFinite(y)) return
    
    const labelInfo = estimateLabelBounds(node)
    const nodeRadius = labelInfo.nodeRadius
    
    // Label bounds (rectangle below node)
    const labelY = y + nodeRadius + 50 // Label spacing
    labelBounds.push({
      node,
      index,
      left: x - labelInfo.width / 2,
      right: x + labelInfo.width / 2,
      top: labelY - labelInfo.height / 2,
      bottom: labelY + labelInfo.height / 2,
      width: labelInfo.width,
      height: labelInfo.height
    })
  })
  
  // Resolve label-to-label and node-to-label collisions
  const maxIterations = 100 // Balanced iteration count
  let iterations = 0
  
  while (iterations < maxIterations) {
    let hasCollisions = false
    let collisionCount = 0
    
    // Recalculate all bounds after node movements
    nodeBounds.forEach((nodeBox, index) => {
      const node = nodeBox.node
      const x = node.fx ?? node.x ?? 0
      const y = node.fy ?? node.y ?? 0
      const nodeRadius = node.nodeType === 'paid-media' ? 8 : 12
      
      nodeBox.centerX = x
      nodeBox.centerY = y
      nodeBox.left = x - nodeRadius
      nodeBox.right = x + nodeRadius
      nodeBox.top = y - nodeRadius
      nodeBox.bottom = y + nodeRadius
    })
    
    labelBounds.forEach((labelBox, index) => {
      const node = labelBox.node
      const x = node.fx ?? node.x ?? 0
      const y = node.fy ?? node.y ?? 0
      const labelInfo = estimateLabelBounds(node)
      const nodeRadius = labelInfo.nodeRadius
      const labelY = y + nodeRadius + 50
      
      labelBox.left = x - labelInfo.width / 2
      labelBox.right = x + labelInfo.width / 2
      labelBox.top = labelY - labelInfo.height / 2
      labelBox.bottom = labelY + labelInfo.height / 2
      labelBox.width = labelInfo.width
      labelBox.height = labelInfo.height
    })
    
    // Check label-to-label collisions
    for (let i = 0; i < labelBounds.length; i++) {
      for (let j = i + 1; j < labelBounds.length; j++) {
        const label1 = labelBounds[i]
        const label2 = labelBounds[j]
        
        // Check if this is a paid media label near its target's label
        const node1 = label1.node
        const node2 = label2.node
        const isPaidMediaLabel1 = node1.nodeType === 'paid-media'
        const isPaidMediaLabel2 = node2.nodeType === 'paid-media'
        
        // Check if one is paid media and the other is its target
        let isTargetLabelPair = false
        if (isPaidMediaLabel1 && node1.targetPageId === node2.id) {
          isTargetLabelPair = true
        } else if (isPaidMediaLabel2 && node2.targetPageId === node1.id) {
          isTargetLabelPair = true
        }
        
        // Use appropriate padding - paid media can be closer to its target's label
        let labelPadding
        if (isTargetLabelPair) {
          labelPadding = 20 // Paid media can be closer to its target's label
        } else if (isPaidMediaLabel1 || isPaidMediaLabel2) {
          labelPadding = 50 // Paid media needs space from other labels
        } else {
          labelPadding = 20
        }
        
        if (boxesOverlap(label1, label2, labelPadding)) {
          hasCollisions = true
          collisionCount++
          
          // Calculate overlap
          const overlapX = Math.min(label1.right, label2.right) - Math.max(label1.left, label2.left)
          const overlapY = Math.min(label1.bottom, label2.bottom) - Math.max(label1.top, label2.top)
          
          const dx = (node2.fx ?? node2.x ?? 0) - (node1.fx ?? node1.x ?? 0)
          const dy = (node2.fy ?? node2.y ?? 0) - (node1.fy ?? node1.y ?? 0)
          const distance = Math.sqrt(dx * dx + dy * dy) || 1
          
          // Use appropriate push distance - more aggressive
          let basePush
          if (isTargetLabelPair) {
            basePush = 15 // Smaller push for target pairs
          } else if (isPaidMediaLabel1 || isPaidMediaLabel2) {
            basePush = 40 // Push for paid media with other labels
          } else {
            basePush = 25
          }
          
          // Push in direction of greater overlap
          if (Math.abs(overlapX) > Math.abs(overlapY)) {
            const pushX = (overlapX / 2 + basePush) * Math.sign(dx || 1)
            node1.fx = (node1.fx ?? node1.x ?? 0) - pushX * 0.5
            node2.fx = (node2.fx ?? node2.x ?? 0) + pushX * 0.5
            node1.x = node1.fx
            node2.x = node2.fx
          } else {
            const pushY = (overlapY / 2 + basePush) * Math.sign(dy || 1)
            node1.fy = (node1.fy ?? node1.y ?? 0) - pushY * 0.5
            node2.fy = (node2.fy ?? node2.y ?? 0) + pushY * 0.5
            node1.y = node1.fy
            node2.y = node2.fy
          }
        }
      }
    }
    
    // Check node-to-label collisions (nodes overlapping with other nodes' labels)
    for (let i = 0; i < nodeBounds.length; i++) {
      for (let j = 0; j < labelBounds.length; j++) {
        const nodeBox = nodeBounds[i]
        const labelBox = labelBounds[j]
        
        // Skip if this is the same node's label
        if (nodeBox.node === labelBox.node) continue
        
        // Check if node overlaps with label
        const node = nodeBox.node
        const labelNode = labelBox.node
        
        // Check if this is paid media near its target's label
        let isTargetLabel = false
        if (node.nodeType === 'paid-media' && node.targetPageId && labelNode.id === node.targetPageId) {
          isTargetLabel = true
        }
        
        // Use appropriate padding based on relationship
        let padding
        if (isTargetLabel) {
          padding = 25 // Paid media can be closer to its target's label
        } else if (node.nodeType === 'paid-media') {
          padding = 50 // Paid media needs space from other labels
        } else {
          padding = 25
        }
        
        if (circleRectOverlap(nodeBox, labelBox, padding)) {
          hasCollisions = true
          collisionCount++
          
          const dx = (labelNode.fx ?? labelNode.x ?? 0) - (node.fx ?? node.x ?? 0)
          const dy = (labelNode.fy ?? labelNode.y ?? 0) - (node.fy ?? node.y ?? 0)
          const distance = Math.sqrt(dx * dx + dy * dy) || 1
          
          // Calculate minimum distance needed
          let minDistance
          if (isTargetLabel) {
            minDistance = nodeBox.radius + 40 // Closer for target relationships
          } else if (node.nodeType === 'paid-media') {
            minDistance = nodeBox.radius + minPaidMediaToOtherNodeDistance / 3
          } else {
            minDistance = nodeBox.radius + 60
          }
          
          if (distance < minDistance) {
            const pushDistance = (minDistance - distance) * 0.5 // Gentler push
            const angle = Math.atan2(dy, dx)
            
            // Push the node away from the label
            node.fx = (node.fx ?? node.x ?? 0) - Math.cos(angle) * pushDistance
            node.fy = (node.fy ?? node.y ?? 0) - Math.sin(angle) * pushDistance
            node.x = node.fx
            node.y = node.fy
          }
        }
      }
    }
    
    if (!hasCollisions) break
    iterations++
  }
  
  // Ensure all nodes have x/y matching fx/fy
  nodes.forEach(node => {
    if (node.fx !== undefined) node.x = node.fx
    if (node.fy !== undefined) node.y = node.fy
  })
  
  return nodes
}

