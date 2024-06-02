<template>
  <div>
    <h2>Areas</h2>
    <div><v-switch v-model="graphMode" label="Graph Mode"></v-switch></div>
    <div v-if="error">{{ error }}</div>
    <div v-if="areas.length">
      <template v-if="graphMode">
        <AreaGraph :areas="areas"></AreaGraph>
      </template>
      <template v-else>
        <AreaList :areas="areas"></AreaList>
      </template>
    </div>
    <div v-else>Loading...</div>
  </div>
</template>

<script setup>
import AreaGraph from '@/components/AreaGraph.vue'
import AreaList from '@/components/AreaList.vue'
import getAreas from '@/composables/getAreas'
import { ref } from 'vue'

const graphMode = ref(false)

const { areas, error, load } = getAreas()
load()
</script>

<style scoped></style>
