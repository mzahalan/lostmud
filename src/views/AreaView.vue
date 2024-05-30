<template>
    <div>
        <h2>Areas</h2>
        <div v-if="error">{{ error }}</div>
        <div v-if="areas.length">
            <AreaList :areas="areas"></AreaList>
        </div>
        <div v-else>Loading...</div>
    </div>
</template>

<script setup>
import AreaList from '@/components/AreaList.vue'
import getAreas from '@/composables/getAreas'

const {areas, error, load} = getAreas()
load()
</script>

<style scoped>

</style>