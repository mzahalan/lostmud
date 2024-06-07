<template>
    <div>
      <h2>Mobs</h2>
      <div v-if="error">{{ error }}</div>
      <div v-if="mobs.length">
          <MobTable :mobs="mobs"></MobTable>
      </div>
    </div>
  </template>
  
  <script setup>
  import MobTable from '@/components/MobTable.vue'
  import getMobs from '@/composables/getMobs'
  
  
  const { mobs, error, load } = getMobs()
  load()
  </script>
  
  <style scoped></style>
  