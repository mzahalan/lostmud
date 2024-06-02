<template>
  <div ref="graphBox" style="width: 800px; height: 600px; background: white"></div>
</template>

<script setup>
import Sigma from 'sigma'
import graphology from 'graphology'
import ForceSupervisor from 'graphology-layout-force/worker'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps(['areas'])

const graphBox = ref(null)
const graph = new graphology.Graph()
let layout = null
let renderer = null

for (const area of props.areas) {
  graph.addNode(area.name, { label: area.name, size: 10 + 2 * area.connections.length })
}

for (const area of props.areas) {
  for (const connection of area.connections) {
    graph.addEdge(area.name, connection, {})
  }
}

graph.nodes().forEach((node, i) => {
  const angle = (i * 2 * Math.PI) / graph.order
  graph.setNodeAttribute(node, 'x', 100 * Math.cos(angle))
  graph.setNodeAttribute(node, 'y', 100 * Math.sin(angle))
})

// Instantiate sigma.js and render the graph
onMounted(() => {
  renderer = new Sigma(graph, graphBox.value, {
    // We don't have to declare edgeProgramClasses here, because we only use the default ones ("line" and "arrow")
    nodeProgramClasses: {},
    renderEdgeLabels: true
  })
  layout = new ForceSupervisor(graph)
  layout.start()
})

onBeforeUnmount(() => {
  layout.kill()
  renderer.kill()
})
</script>

<style scoped></style>
