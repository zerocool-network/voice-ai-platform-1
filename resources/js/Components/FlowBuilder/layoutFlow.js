const LAYER_X = 280
const BASE_Y = 40
const NODE_GAP_Y = 48
const NODE_WIDTH = 220

const ESTIMATED_HEIGHT = {
  say: 150,
  ask: 160,
  llm: 140,
  condition: 150,
  goto: 110,
  transfer: 120,
  webhook: 130,
  mcp_tool: 130,
  knowledge: 140,
  hangup: 100,
  voice_agent: 160,
  analyze: 130,
  memory: 120,
}

function getOutgoingTargets(step) {
  const targets = []
  if (!step) return targets
  if (step.next) targets.push(step.next)
  if (step.type === 'condition' && step.config) {
    step.config.branches?.forEach((b) => {
      if (b.next) targets.push(b.next)
    })
    if (step.config.elseNext) targets.push(step.config.elseNext)
  }
  if (step.type === 'goto' && step.config?.target) {
    targets.push(step.config.target)
  }
  return targets
}

function estimatedHeight(type) {
  return ESTIMATED_HEIGHT[type] || 120
}

/**
 * Layered left-to-right layout from start step following next/condition edges.
 * Returns Map<id, { x, y }>.
 */
function computeAutoLayout(steps, startStepId) {
  const ids = Object.keys(steps || {})
  if (ids.length === 0) return new Map()

  const incoming = Object.fromEntries(ids.map((id) => [id, 0]))
  ids.forEach((id) => {
    getOutgoingTargets(steps[id]).forEach((t) => {
      if (incoming[t] !== undefined) incoming[t] += 1
    })
  })

  let start = startStepId && steps[startStepId] ? startStepId : null
  if (!start) {
    start = ids.find((id) => incoming[id] === 0) || ids[0]
  }

  const layerOf = {}
  const queue = [start]
  layerOf[start] = 0
  const visited = new Set([start])

  while (queue.length) {
    const id = queue.shift()
    const layer = layerOf[id]
    getOutgoingTargets(steps[id]).forEach((t) => {
      if (!steps[t]) return
      const nextLayer = layer + 1
      if (layerOf[t] === undefined || nextLayer > layerOf[t]) {
        layerOf[t] = nextLayer
      }
      if (!visited.has(t)) {
        visited.add(t)
        queue.push(t)
      }
    })
  }

  // orphans (disconnected) → append after max layer
  let maxLayer = Math.max(0, ...Object.values(layerOf), 0)
  ids.forEach((id) => {
    if (layerOf[id] === undefined) {
      maxLayer += 1
      layerOf[id] = maxLayer
    }
  })

  const byLayer = {}
  ids.forEach((id) => {
    const L = layerOf[id]
    if (!byLayer[L]) byLayer[L] = []
    byLayer[L].push(id)
  })

  // Stable order within layer: prefer start chain order, else alpha
  Object.keys(byLayer).forEach((L) => {
    byLayer[L].sort((a, b) => a.localeCompare(b))
  })

  const positions = new Map()
  Object.keys(byLayer)
    .map(Number)
    .sort((a, b) => a - b)
    .forEach((L) => {
      let y = BASE_Y
      byLayer[L].forEach((id) => {
        positions.set(id, { x: 40 + L * LAYER_X, y })
        y += estimatedHeight(steps[id].type) + NODE_GAP_Y
      })
    })

  return positions
}

function applyLayoutToNodes(nodes, positions) {
  return nodes.map((n) => {
    const pos = positions.get(n.id)
    return pos ? { ...n, position: { ...pos } } : n
  })
}

export {
  LAYER_X,
  NODE_WIDTH,
  computeAutoLayout,
  applyLayoutToNodes,
  estimatedHeight,
  getOutgoingTargets,
}
